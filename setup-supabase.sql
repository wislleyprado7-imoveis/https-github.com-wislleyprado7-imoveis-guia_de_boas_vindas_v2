-- ==========================================================
-- SCRIPT DE AJUSTE DO BANCO DE DADOS E STORAGE (SUPABASE)
-- Execute este script no SQL Editor do seu console Supabase
-- ==========================================================

-- 1. ADICIONAR COLUNA 'phone' NA TABELA 'guests' SE NÃO EXISTIR
ALTER TABLE guests ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. CRIAR BUCKET 'ranch-images' SE NÃO EXISTIR
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ranch-images', 
  'ranch-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 3. REMOVER POLÍTICAS ANTIGAS SE EXISTIREM (Para evitar conflitos)
DROP POLICY IF EXISTS "Permitir leitura publica de ranch-images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir insercao publica de ranch-images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizacao publica de ranch-images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delecao publica de ranch-images" ON storage.objects;

-- 4. CRIAR POLÍTICAS RLS PARA O STORAGE BUCKET 'ranch-images'

-- Permitir leitura pública (SELECT) de imagens
CREATE POLICY "Permitir leitura publica de ranch-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ranch-images');

-- Permitir inserção (INSERT) de imagens
CREATE POLICY "Permitir insercao publica de ranch-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'ranch-images');

-- Permitir atualização (UPDATE) de imagens (necessário para o recurso de substituição/upsert de imagem)
CREATE POLICY "Permitir atualizacao publica de ranch-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'ranch-images')
WITH CHECK (bucket_id = 'ranch-images');

-- Permitir exclusão (DELETE) de imagens (necessário para excluir imagens antigas e órfãs)
CREATE POLICY "Permitir delecao publica de ranch-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'ranch-images');
