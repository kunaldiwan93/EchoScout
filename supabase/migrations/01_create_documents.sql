-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for storing video transcripts and embeddings
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  content TEXT NOT NULL,
  start_time INT NOT NULL,
  embedding VECTOR(768)
);

-- Index for vector similarity search using cosine distance
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops);

-- PostgreSQL function for matching document embeddings using cosine similarity (<=>)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 10,
  filter_video_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  video_id TEXT,
  content TEXT,
  start_time INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.video_id,
    documents.content,
    documents.start_time,
    (1 - (documents.embedding <=> query_embedding))::FLOAT AS similarity
  FROM documents
  WHERE (filter_video_id IS NULL OR documents.video_id = filter_video_id)
    AND (1 - (documents.embedding <=> query_embedding)) >= match_threshold
  ORDER BY documents.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
