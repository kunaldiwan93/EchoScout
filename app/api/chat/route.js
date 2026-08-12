import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { cohere } from '@ai-sdk/cohere';
import { embed, streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { extractVideoId } from '../../../lib/utils';

function formatTimestamp(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `[${pad(mins)}:${pad(secs)}]`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, videoId } = body;

    console.log('1. Chat Video ID requested:', videoId);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty messages array in request body' },
        { status: 400 }
      );
    }

    // Sanitize messages array into strictly typed { role: string, content: string } objects
    const sanitizedMessages = messages
      .map((msg) => {
        let contentStr = '';
        if (typeof msg.content === 'string') {
          contentStr = msg.content;
        } else if (Array.isArray(msg.content)) {
          contentStr = msg.content
            .filter((p) => p.type === 'text' && p.text)
            .map((p) => p.text)
            .join(' ');
        } else if (Array.isArray(msg.parts)) {
          contentStr = msg.parts
            .filter((p) => p.type === 'text' && p.text)
            .map((p) => p.text)
            .join(' ');
        }
        return {
          role: msg.role || 'user',
          content: contentStr,
        };
      })
      .filter((msg) => msg.content.trim().length > 0);

    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1];
    const userQuery = lastMessage?.content || '';

    if (!userQuery.trim()) {
      return NextResponse.json(
        { error: 'User message content is empty' },
        { status: 400 }
      );
    }

    // Embed user query using Cohere with 1024 outputDimensionality
    let userEmbedding;
    try {
      const { embedding } = await embed({
        model: cohere.textEmbeddingModel('embed-english-v3.0'),
        value: userQuery,
        providerOptions: {
          cohere: {
            outputDimensionality: 1024,
          },
        },
      });
      userEmbedding = embedding;
    } catch (e) {
      console.error('Cohere embedding generation failed:', e);
      return NextResponse.json(
        { error: `Embedding generation failed: ${e.message}` },
        { status: 500 }
      );
    }

    console.log('2. Cohere Vector Generated. Dimensions:', userEmbedding?.length);

    // Query Supabase match_documents RPC for top 15 most relevant chunks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured in environment' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let sanitizedId = null;
    if (videoId) {
      sanitizedId = extractVideoId(videoId);
    }

    const rpcParams = {
      query_embedding: userEmbedding,
      match_threshold: 0.1,
      match_count: 15,
      filter_video_id: sanitizedId,
    };

    const { data: documents, error: rpcError } = await supabase.rpc(
      'match_documents',
      rpcParams
    );

    console.log('3. Supabase Error (if any):', rpcError);
    console.log('4. Supabase Chunks Found:', documents?.length);

    if (rpcError) {
      console.error('Supabase RPC match_documents error:', rpcError);
    } else {
      console.log('Match documents result length:', documents?.length || 0);
      console.log('Match documents top match ID:', documents?.[0]?.video_id);
    }

    // Sort documents chronologically by start_time
    const sortedDocuments = (documents || [])
      .slice()
      .sort((a, b) => (a.start_time || 0) - (b.start_time || 0));

    // Construct formatted context with timestamps
    let contextText = '';
    if (sortedDocuments.length > 0) {
      contextText = sortedDocuments
        .map((doc) => {
          const timestampStr = formatTimestamp(doc.start_time);
          return `Timestamp ${timestampStr}:\n"${doc.content}"`;
        })
        .join('\n\n');
    } else {
      contextText = 'No relevant transcript context found for this query.';
    }

    console.log('Injected Context Length:', contextText.length);

    const systemPrompt = `You are an expert senior software engineer and coding instructor.
You are EchoScout, an intelligent YouTube video assistant.

The provided context is a raw, auto-generated YouTube video transcript. It contains severe transcription errors, especially regarding JavaScript syntax and programming terminology (e.g., it might transcribe async/await as 'number weight' or literal bracket notation as words).
You must intelligently infer the correct programming concepts being discussed, ignore the phonetic typos, and format your response using proper Markdown code blocks and correct syntax.
Maintain an educational, clear, and professional tone.
Always include clickable timestamp citations like [02:15].

RETRIEVED TRANSCRIPT CONTEXT:
${contextText}

INSTRUCTIONS:
1. Answer the user's question based strictly on the context provided above.
2. If the context does not contain enough information to answer the question, state that clearly.
3. Include clickable timestamp citations in the exact format [mm:ss] (e.g. [01:23] or [00:45]) whenever referencing specific parts of the video.`;

    const result = streamText({
      model: google('gemini-3.5-flash'),
      system: systemPrompt,
      messages: sanitizedMessages,
    });

    console.log('Stream started');
    return new Response(result.textStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Chat API route error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
