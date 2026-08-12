import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { cohere } from '@ai-sdk/cohere';
import { embedMany } from 'ai';
import { createClient } from '@supabase/supabase-js';

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'Missing youtubeUrl in request body' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or Video ID' },
        { status: 400 }
      );
    }

    // Initialize Supabase early for cache check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured in environment' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Supabase caching check: Prevent duplicate indexing
    const { data: existingChunks, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .eq('video_id', videoId)
      .limit(1);

    if (checkError) {
      console.error('Supabase cache check error:', checkError);
      return NextResponse.json(
        { error: `Database check failed: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existingChunks && existingChunks.length > 0) {
      return NextResponse.json(
        { success: true, message: 'Video already indexed.', chunkCount: 0 },
        { status: 200 }
      );
    }

    // Fetch video transcript
    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (err) {
      return NextResponse.json(
        { error: `Could not fetch transcript for video: ${err.message}` },
        { status: 400 }
      );
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript found for this video' },
        { status: 404 }
      );
    }

    // Group transcript into chunks of 4000 characters with a 200 character overlap
    const CHUNK_SIZE = 4000;
    const CHUNK_OVERLAP = 200;
    const chunks = [];
    let currentChunkText = '';
    let currentStartTime = null;
    let overlapText = '';

    for (const item of transcript) {
      const text = item.text ? item.text.trim() : '';
      if (!text) continue;

      const seconds = typeof item.offset === 'number'
        ? (item.offset > 10000 || item.duration > 100 ? Math.floor(item.offset / 1000) : Math.floor(item.offset))
        : 0;

      if (currentStartTime === null) {
        currentStartTime = seconds;
      }

      currentChunkText += (currentChunkText ? ' ' : '') + text;

      if (currentChunkText.length >= CHUNK_SIZE) {
        chunks.push({
          content: currentChunkText,
          start_time: currentStartTime,
        });
        
        const rawOverlap = currentChunkText.slice(-CHUNK_OVERLAP);
        const spaceIndex = rawOverlap.indexOf(' ');
        overlapText = spaceIndex !== -1 ? rawOverlap.slice(spaceIndex + 1) : rawOverlap;
        
        currentChunkText = overlapText;
        currentStartTime = null;
      }
    }

    if (currentChunkText.trim().length > 0 && currentChunkText !== overlapText) {
      chunks.push({
        content: currentChunkText,
        start_time: currentStartTime ?? 0,
      });
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'Transcript resulted in no usable chunks' },
        { status: 400 }
      );
    }

    // Generate embeddings in batch using the Vercel AI SDK
    const chunkContents = chunks.map(chunk => chunk.content);
    let embeddings = [];
    
    try {
      const result = await embedMany({
        model: cohere.textEmbeddingModel('embed-english-v3.0'),
        values: chunkContents,
        maxRetries: 5,
        providerOptions: {
          cohere: {
            outputDimensionality: 1024,
          },
        },
      });
      embeddings = result.embeddings;
    } catch (embeddingError) {
      console.error('Embedding generation failed:', embeddingError);
      return NextResponse.json(
        { error: `Embedding generation failed: ${embeddingError.message}` },
        { status: 500 }
      );
    }

    // Insert into Supabase documents table
    const rowsToInsert = chunks.map((chunk, index) => ({
      video_id: videoId,
      content: chunk.content,
      start_time: chunk.start_time,
      embedding: embeddings[index],
    }));

    const { data, error: insertError } = await supabase
      .from('documents')
      .insert(rowsToInsert)
      .select('id, video_id, start_time');

    if (insertError) {
      console.error('Supabase insertion error:', insertError);
      return NextResponse.json(
        { error: `Database insertion failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video transcript successfully ingested and embedded.',
      videoId,
      chunkCount: chunks.length,
      insertedIds: data ? data.map((d) => d.id) : [],
    });
  } catch (error) {
    console.error('Ingest route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
