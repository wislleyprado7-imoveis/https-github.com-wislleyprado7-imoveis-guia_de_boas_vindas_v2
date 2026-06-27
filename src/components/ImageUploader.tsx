import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Upload, Loader2, AlertCircle, Check } from "lucide-react";

interface ImageUploaderProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  bucketName?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onUploadSuccess,
  bucketName = "ranch-images",
  label = "Selecionar Imagem"
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);

      if (!file.type.startsWith("image/")) {
        throw new Error("O arquivo deve ser uma imagem (PNG, JPG, JPEG, WEBP, etc.)");
      }

      // Criar um nome de arquivo único
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Tentar fazer o upload para o bucket do Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes("not found") || uploadError.message.includes("bucket")) {
          throw new Error(`O bucket "${bucketName}" não foi encontrado no Supabase. Crie-o como público no painel do Supabase antes de fazer o upload.`);
        }
        throw uploadError;
      }

      // Obter a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUploadSuccess(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro de upload:", err);
      setError(err.message || "Erro desconhecido ao fazer o upload.");
    } finally {
      setUploading(false);
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
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? "border-amber-500 bg-amber-500/10"
            : "border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700"
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
            <span className="text-xs text-slate-400">Enviando imagem...</span>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center py-2 text-emerald-500">
            <Check className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">Imagem enviada com sucesso!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-1">
            <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-amber-500 transition-colors" />
            <span className="text-xs text-slate-300 font-medium">{label}</span>
            <span className="text-[10px] text-slate-500 mt-1">Arrastar e soltar ou clique para escolher</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <p className="font-semibold mb-0.5">Falha no Upload</p>
            <p>{error}</p>
            <p className="text-slate-400 mt-1.5">
              Certifique-se de criar o bucket público <code className="bg-slate-950 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">ranch-images</code> no painel do Supabase com políticas de acesso de leitura e escrita públicas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
