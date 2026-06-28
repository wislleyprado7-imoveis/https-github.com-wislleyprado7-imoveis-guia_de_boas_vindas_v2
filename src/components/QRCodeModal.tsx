import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  guestName: string;
}

export default function QRCodeModal({ isOpen, onClose, url, guestName }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0f172a&data=${encodeURIComponent(url)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans font-semibold text-lg text-amber-500">QR Code de Acesso</h3>
                <p className="text-xs text-slate-400">Hóspede: {guestName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={20} strokeWidth={2.3} />
              </button>
            </div>

            {/* QR Content */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl mb-4 shadow-inner">
              <img
                src={qrImageUrl}
                alt={`QR Code para ${guestName}`}
                className="w-48 h-48 border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] text-slate-400 mt-2 text-center select-all break-all">
                {url}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-sans text-sm font-medium bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.3} className="text-emerald-400" />
                    <span>Copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2.3} className="text-amber-500" />
                    <span>Copiar Link do Guia</span>
                  </>
                )}
              </button>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-sans text-sm font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
              >
                <ExternalLink size={16} strokeWidth={2.3} />
                <span>Testar Guia na Web</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
