import React, { useState, useRef } from "react";
import { supabase, deleteRanchImage } from "../supabaseClient";
import { Upload, Loader2, AlertCircle, Check, Database as DbIcon, Cloud, HelpCircle, Trash2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  bucketName?: string;
  label?: string;
}

// Compress and resize image using HTML5 Canvas to keep Base64 size very small (approx 30KB - 80KB)
const compressAndResizeImage = (file: File, maxWidth = 900, maxHeight = 700): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate responsive dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG with 0.7 quality for excellent compression ratio and good visual quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onUploadSuccess,
  bucketName = "ranch-images",
  label = "Selecionar Imagem"
}) => {
  const [storageMethod, setStorageMethod] = useState<"db" | "storage">("db");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastCompressedBase64, setLastCompressedBase64] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      setLastCompressedBase64(null);

      if (!file.type.startsWith("image/")) {
        throw new Error("O arquivo deve ser uma imagem válida (PNG, JPG, JPEG, WEBP, etc.)");
      }

      // Guard the old URL to delete it if it is a Supabase Storage URL
      const oldUrl = currentUrl;

      // 1. Process client-side compression/resize first for either method
      const base64Url = await compressAndResizeImage(file);

      if (storageMethod === "db") {
        // Direct Base64 database injection (no Supabase Storage config required)
        onUploadSuccess(base64Url);
        setSuccess(true);
        
        // Try to delete old image from storage if it was a Supabase Storage image
        if (oldUrl && oldUrl.includes(`/public/${bucketName}/`)) {
          await deleteRanchImage(oldUrl);
        }

        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Supabase Cloud Storage Upload
        // Create unique name
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Keep a copy of base64 in case storage upload fails so they can fallback instantly
        setLastCompressedBase64(base64Url);

        const { data, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true
          });

        if (uploadError) {
          if (uploadError.message.includes("not found") || uploadError.message.includes("bucket")) {
            throw new Error(`O bucket "${bucketName}" não foi localizado no Supabase Cloud.`);
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // Success! Save new URL
        onUploadSuccess(publicUrl);
        setSuccess(true);

        // Delete old image from storage to keep the bucket clean and prevent orphan files
        if (oldUrl && oldUrl.includes(`/public/${bucketName}/`)) {
          await deleteRanchImage(oldUrl);
        }

        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error("Erro de upload:", err);
      setError(err.message || "Erro desconhecido ao fazer o upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleFallbackToDb = async () => {
    if (lastCompressedBase64) {
      const oldUrl = currentUrl;
      onUploadSuccess(lastCompressedBase64);
      setSuccess(true);
      setError(null);
      setLastCompressedBase64(null);

      // Clean up old storage image if applicable
      if (oldUrl && oldUrl.includes(`/public/${bucketName}/`)) {
        await deleteRanchImage(oldUrl);
      }

      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering file selection dialog
    if (window.confirm("Deseja mesmo remover a imagem atual?")) {
      try {
        setUploading(true);
        const oldUrl = currentUrl;
        
        // 1. Clear database field
        onUploadSuccess("");
        
        // 2. If it was stored in Supabase Storage, delete the file from the bucket
        if (oldUrl && oldUrl.includes(`/public/${bucketName}/`)) {
          await deleteRanchImage(oldUrl);
        }
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        console.error("Erro ao remover imagem:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Current Image Preview & Quick Actions */}
      {currentUrl && (
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-1">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 relative group">
            <img 
              src={currentUrl} 
              alt="Miniatura atual" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest block">Imagem Configurada</span>
            <span className="text-xs text-slate-300 font-mono block truncate mt-0.5" title={currentUrl}>
              {currentUrl.startsWith("data:") ? "Texto Comprimido (Banco)" : currentUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all cursor-pointer group shrink-0"
            title="Deletar imagem atual e limpar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      {/* Method selector tab */}
      <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px] font-sans">
        <button
          type="button"
          onClick={() => {
            setStorageMethod("db");
            setError(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            storageMethod === "db"
              ? "bg-amber-500 text-slate-950 font-semibold shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <DbIcon size={12} />
          <span>Direto no Banco (Fácil)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setStorageMethod("storage");
            setError(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            storageMethod === "storage"
              ? "bg-amber-500 text-slate-950 font-semibold shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cloud size={12} />
          <span>Supabase Storage (Nuvem)</span>
        </button>
      </div>

      {/* Description info based on selected method */}
      <div className="text-[10px] text-slate-400 leading-normal px-1 flex items-start gap-1">
        <HelpCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
        {storageMethod === "db" ? (
          <span>
            <strong>Recomendado:</strong> A imagem é redimensionada e salva como texto comprimido na própria tabela do banco. Funciona de imediato sem precisar de nenhuma configuração adicional de buckets.
          </span>
        ) : (
          <span>
            Envia o arquivo para o Storage do Supabase. Requer a criação de um bucket público chamado <strong>{bucketName}</strong> nas configurações do seu projeto Supabase.
          </span>
        )}
      </div>

      {/* Main Drag & Drop / Click Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? "border-amber-500 bg-amber-500/10"
            : "border-slate-800 bg-slate-950 hover:bg-slate-900/80 hover:border-slate-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <span className="text-xs text-slate-400">Processando e enviando imagem...</span>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center py-2 text-emerald-400">
            <Check className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-semibold">Salvo com sucesso!</span>
            <span className="text-[9px] text-slate-500 mt-0.5">O guia foi atualizado com a nova imagem</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-2">
            <Upload className="w-7 h-7 text-slate-500 mb-2 hover:text-amber-500 transition-colors" />
            <span className="text-xs text-slate-300 font-medium">{label}</span>
            <span className="text-[10px] text-slate-500 mt-1">Arrastar e soltar ou clique para escolher</span>
          </div>
        )}
      </div>

      {/* Error and Fallback Assistant */}
      {error && (
        <div className="flex flex-col gap-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 text-rose-300">
          <div className="flex items-start gap-2 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Falha no Upload do Storage</p>
              <p className="text-rose-300/90">{error}</p>
            </div>
          </div>

          {/* Quick Fallback to Database Injection Button */}
          {lastCompressedBase64 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 mt-1 flex flex-col gap-2 text-[11px]">
              <p className="text-slate-300 leading-normal">
                Dica: Evite configurações extras do Supabase! Como já processamos sua imagem localmente, você pode salvá-la de imediato diretamente no banco de dados.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFallbackToDb();
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DbIcon size={13} />
                <span>Salvar Direto no Banco (Resolver Agora)</span>
              </button>
            </div>
          )}

          {storageMethod === "storage" && !lastCompressedBase64 && (
            <p className="text-[10px] text-slate-400 mt-1 pl-6 leading-normal">
              Selecione o método <strong className="text-amber-500">"Direto no Banco (Fácil)"</strong> no seletor acima para fazer o upload sem precisar de configurações de bucket no Supabase.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
