import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || "https://fkjqpuqyxkvbhlagvfvo.supabase.co";
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZranFwdXF5eGt2YmhsYWd2ZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTUwOTMsImV4cCI6MjA5ODEzMTA5M30.WObxMXRy2UEPllzv6S7CEYRzoA_wWVDEGJM3yumt1xo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET_NAME = "ranch-images";

/**
 * Inicializa e cria o bucket público no Supabase Storage se não existir.
 * Nota: Pode falhar caso o usuário anon/autenticado não possua políticas de admin de Storage,
 * o que é normal, por isso capturamos o erro amigavelmente.
 */
export async function initializeStorageBucket() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
      });
      if (createError) {
        console.warn("Aviso ao criar bucket via código (pode requerer configuração manual no painel do Supabase):", createError.message);
      } else {
        console.log(`Bucket público "${BUCKET_NAME}" criado com sucesso!`);
      }
    }
  } catch (err) {
    console.warn("Não foi possível verificar/criar o bucket automaticamente (isso é comum se as chaves forem limitadas). Certifique-se de que o bucket 'ranch-images' esteja criado no painel do Supabase:", err);
  }
}

/**
 * Faz o upload de um arquivo de imagem para o Supabase Storage.
 * Retorna a URL pública da imagem em caso de sucesso.
 */
export async function uploadRanchImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) {
    throw new Error(`Falha no upload do arquivo: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Remove uma imagem do Supabase Storage com base na URL completa da imagem.
 */
export async function deleteRanchImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  
  try {
    // Extrai o nome do arquivo da URL pública
    // Exemplo: https://.../storage/v1/object/public/ranch-images/171294812-abc.jpg -> 171294812-abc.jpg
    const parts = imageUrl.split(`/public/${BUCKET_NAME}/`);
    if (parts.length < 2) return false;
    
    const fileName = parts[1];
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error(`Erro ao deletar imagem do storage: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Falha ao analisar e deletar arquivo de imagem:", err);
    return false;
  }
}

/**
 * Substitui uma imagem antiga enviando uma nova e excluindo a antiga para não acumular arquivos órfãos.
 */
export async function replaceRanchImage(oldImageUrl: string | undefined, newFile: File): Promise<string> {
  // 1. Faz o upload do novo arquivo
  const newUrl = await uploadRanchImage(newFile);
  
  // 2. Se o upload foi bem sucedido e havia uma imagem antiga válida no storage, tenta apagá-la
  if (oldImageUrl && oldImageUrl.includes(`/public/${BUCKET_NAME}/`)) {
    await deleteRanchImage(oldImageUrl);
  }
  
  return newUrl;
}

// Tenta inicializar o bucket em background ao carregar o app
initializeStorageBucket();

