import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  MapPin,
  Lock,
  Unlock,
  Calendar,
  Phone,
  HelpCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Utensils,
  ShoppingBag,
  Home,
  Copy,
  Check,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Guest, Ranch } from "../types";
import { getStayStatus, formatDateBr, StayStatus } from "../utils";
import RanchImageCarousel from "./RanchImageCarousel";

interface GuestGuideProps {
  guest: Guest;
  ranch: Ranch;
  onBackToAdmin?: () => void;
}

export default function GuestGuide({ guest, ranch, onBackToAdmin }: GuestGuideProps) {
  const content = ranch.guideContent;
  
  // Check if we are in preview mode
  const isPreview = window.location.href.includes("preview=true");

  // Real status based on dates
  const realStatus = getStayStatus(guest);
  
  // Simulation state to allow easy testing of all 3 security modes!
  const [simulatedStatus, setSimulatedStatus] = useState<StayStatus | "REAL">("REAL");
  const currentStatus = isPreview && simulatedStatus !== "REAL" ? simulatedStatus : realStatus;

  // Tab State
  const [activeTab, setActiveTab] = useState<"inicio" | "guia" | "pesca" | "recomendacoes" | "emergencia">("inicio");
  
  // Accordion for FAQs & Fish Species
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedFish, setExpandedFish] = useState<number | null>(null);

  // Copy helpers
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedDoor, setCopiedDoor] = useState(false);

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe Whatsapp link generator
  const getHostContact = () => {
    const host = content.emergencyContacts.find(c => c.role.toLowerCase().includes("anfitrião") || c.role.toLowerCase().includes("host"));
    return host || content.emergencyContacts[0];
  };
  
  const hostContact = getHostContact();
  const cleanPhone = hostContact?.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Olá%20${encodeURIComponent(hostContact?.name || "")},%20sou%20o(a)%20hóspede%20${encodeURIComponent(guest.name)}%20do%20${encodeURIComponent(ranch.name)}!`;

  return (
    <div className="min-h-screen bg-slate-custom text-slate-800 flex flex-col font-sans pb-24 selection:bg-gold selection:text-white sleek-guest-guide">
      
      {/* State Override / Simulation Bar */}
      {isPreview && (
        <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs py-2.5 px-4 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-300">Modo de Visualização do Hóspede</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Simular Estado:</span>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex">
              <button
                onClick={() => setSimulatedStatus("REAL")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  simulatedStatus === "REAL"
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Real ({realStatus})
              </button>
              <button
                onClick={() => setSimulatedStatus("BEFORE")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  simulatedStatus === "BEFORE"
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Antes do Check-In
              </button>
              <button
                onClick={() => setSimulatedStatus("DURING")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  simulatedStatus === "DURING"
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Durante Estadia
              </button>
              <button
                onClick={() => setSimulatedStatus("AFTER")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  simulatedStatus === "AFTER"
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Após Check-Out
              </button>
            </div>

            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="ml-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-amber-500 font-medium transition-colors"
              >
                Painel Admin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-md w-full mx-auto px-4 flex-1 flex flex-col">
        
        {/* Banner Status Overlay if restricted */}
        {currentStatus === "BEFORE" && (
          <div className="my-4 bg-amber-950/40 border border-amber-900/60 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5 animate-bounce" size={20} strokeWidth={2.3} />
            <div>
              <h4 className="text-sm font-semibold text-amber-400">Acesso Antecipado Ativo</h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Olá, <strong className="text-amber-200">{guest.name}</strong>! Faltam alguns dias para sua chegada em {formatDateBr(guest.checkInDate)}. 
                As informações confidenciais do rancho (senhas, códigos de portas) serão liberadas automaticamente no dia do seu check-in.
              </p>
            </div>
          </div>
        )}

        {currentStatus === "AFTER" && (
          <div className="my-4 bg-red-950/30 border border-red-900/40 rounded-2xl p-4 flex gap-3 items-start">
            <Lock className="text-red-400 shrink-0 mt-0.5" size={20} strokeWidth={2.3} />
            <div>
              <h4 className="text-sm font-semibold text-red-400 font-sans">Sua Estadia Foi Concluída</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Esperamos que tenha aproveitado sua estadia no <strong className="text-slate-100">{ranch.name}</strong>! 
                Por razões de segurança, o acesso aos códigos e redes do imóvel expiraram no checkout ({formatDateBr(guest.checkOutDate)} às {content.checkOutTime}). Obrigado pela visita!
              </p>
            </div>
          </div>
        )}

        {/* Tab-driven layouts inside GuestGuide */}
        <AnimatePresence mode="wait">
          {activeTab === "inicio" && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-4 flex-1"
            >
              {/* Cover Card with dynamic image carousel */}
              <RanchImageCarousel 
                images={content.galleryImages || (content.heroImageUrl ? [content.heroImageUrl] : [])} 
                title={content.heroTitle} 
                subtitle={content.heroSubtitle} 
              />

              {/* Stay Duration Widget */}
              <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Sua Estadia</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-amber-500" />
                    <span className="text-xs font-semibold text-slate-200">
                      {formatDateBr(guest.checkInDate)} a {formatDateBr(guest.checkOutDate)}
                    </span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Ranch ID</span>
                  <span className="text-xs font-mono text-amber-500 font-medium">#{ranch.id}</span>
                </div>
              </div>

              {/* Host welcome profile */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/30 shrink-0 shadow-lg">
                    <img
                      src={content.welcomePhotoUrl}
                      alt="Anfitrião"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-base text-slate-100">Mensagem do Seu Anfitrião</h3>
                    <p className="text-xs text-amber-500">Pronto para apoiar você</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 italic">
                  "{content.welcomeMessage}"
                </p>
              </div>

              {/* Checkin / Checkout schedules */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-500">Check-in</span>
                    <Clock size={16} className="text-slate-500" />
                  </div>
                  <div className="font-sans text-xl font-bold text-white">
                    {content.checkInTime}h
                  </div>
                  <p className="text-[10px] text-slate-400">Entrada liberada neste horário</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Check-out</span>
                    <Clock size={16} className="text-slate-500" />
                  </div>
                  <div className="font-sans text-xl font-bold text-white">
                    {content.checkOutTime}h
                  </div>
                  <p className="text-[10px] text-slate-400">Saída e encerramento de códigos</p>
                </div>
              </div>

              {/* Secure Check-in Information */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Unlock size={16} className="text-amber-500" />
                    <span>Instruções de Acesso</span>
                  </h3>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">Portão & Porta</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {content.checkInInstructions}
                </p>

                {/* Door Code conditional access */}
                <div className="pt-2">
                  {currentStatus === "DURING" ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-amber-500 block">Código da Porta</span>
                        <span className="font-mono text-lg font-bold tracking-widest text-slate-100">
                          {content.doorCode}
                        </span>
                      </div>
                      <button
                        onClick={() => copyText(content.doorCode, setCopiedDoor)}
                        className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
                      >
                        {copiedDoor ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedDoor ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-4 flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-slate-600" />
                        <div>
                          <span className="text-[9px] uppercase tracking-wider block">Código da Porta</span>
                          <span className="text-xs italic font-medium">Bloqueado temporariamente</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">Liberado no Check-in</span>
                    </div>
                  )}
                </div>

                {/* Video tutorial */}
                {content.videoInstructionsUrl && (
                  <a
                    href={content.videoInstructionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3.5 bg-amber-500 hover:bg-amber-600 rounded-2xl text-slate-950 transition-all font-sans font-medium text-xs shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={16} className="animate-spin-slow" />
                      Ver Vídeo Explicativo de Chegada
                    </span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "guia" && (
            <motion.div
              key="guia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-4 flex-1"
            >
              {/* Wifi Section */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Wifi size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-slate-100 text-sm">Acesso Wi-Fi</h3>
                      <p className="text-[10px] text-slate-400">Rede ultrarrápida no rancho</p>
                    </div>
                  </div>
                </div>

                {currentStatus === "DURING" ? (
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Rede (SSID)</span>
                        <span className="font-sans text-xs font-semibold text-slate-200">{content.wifiSsid}</span>
                      </div>
                      <button
                        onClick={() => copyText(content.wifiSsid, setCopiedWifi)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        {copiedWifi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Senha de Conexão</span>
                        <span className="font-sans text-xs font-semibold text-slate-200">{content.wifiPassword}</span>
                      </div>
                      <button
                        onClick={() => copyText(content.wifiPassword, setCopiedPass)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        {copiedPass ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 italic leading-relaxed pt-1">
                      💡 <strong>Dica:</strong> {content.wifiTips}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-4 flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-slate-600" />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block">Rede & Senha</span>
                        <span className="text-xs italic font-medium">Bloqueado temporariamente</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">Durante Estadia</span>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <MapPin size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-slate-100 text-sm">Como Chegar</h3>
                      <p className="text-[10px] text-slate-400">Localização e rota sugerida</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {content.arrivalInstructions}
                </p>

                {content.latitude && content.longitude && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 relative shadow-inner">
                    <iframe
                      title="Mapa Interativo do Rancho"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${content.latitude.trim()},${content.longitude.trim()}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full filter invert brightness-90 contrast-100"
                    ></iframe>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {content.latitude && content.longitude && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${content.latitude.trim()},${content.longitude.trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold text-xs rounded-2xl transition-all shadow active:scale-[0.98] cursor-pointer"
                      >
                        <MapPin size={14} />
                        <span>Traçar Rota (Google Maps)</span>
                        <ExternalLink size={12} />
                      </a>
                      <a
                        href={`https://waze.com/ul?ll=${content.latitude.trim()},${content.longitude.trim()}&navigate=yes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-sans font-bold text-xs rounded-2xl transition-all shadow active:scale-[0.98] cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                          <path d="M19.344 11.5c.047-.417.078-.84.078-1.266 0-4.823-3.922-8.734-8.734-8.734-4.822 0-8.734 3.911-8.734 8.734 0 .911.144 1.785.405 2.607-.11.458-.291 1.259-.516 2.193-.243 1.011-.479 1.99-.452 2.213.067.551.52.971 1.077.971a1.2 1.2 0 00.324-.047c.604-.176 1.776-.566 2.871-.925a8.625 8.625 0 003.5 1.229 3.09 3.09 0 005.812-.008 8.618 8.618 0 003.738-1.423c1.078.353 2.222.723 2.808.89.1.028.204.043.308.043.557 0 1.01-.42 1.077-.971.027-.223-.209-1.202-.452-2.213a52.122 52.122 0 00-.516-2.193 8.683 8.683 0 00.784-2.105zm-14.734-.334c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm6.5 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm.39 3.868c-.147.218-.396.345-.658.345a.784.784 0 01-.43-.129 3.238 3.238 0 01-1.225-1.637.781.781 0 011.472-.514c.154.44.407.728.641.728.234 0 .487-.288.641-.728a.781.781 0 011.472.514 3.238 3.238 0 01-1.225 1.637l-.116.115z" />
                        </svg>
                        <span>Traçar Rota (Waze)</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <a
                    href={content.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-slate-950 hover:bg-slate-800 text-amber-500 font-sans font-medium text-xs rounded-2xl border border-slate-800 transition-colors cursor-pointer"
                  >
                    <MapPin size={14} />
                    <span>Visualizar Link de Localização Completo</span>
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>

              {/* Normas da Casa (Rules) & Equipment List */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-sm mb-3">Normas de Convivência</h3>
                  <ul className="space-y-2.5">
                    {content.rules.map((rule, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                        <span className="text-amber-500 shrink-0 mt-1">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-px bg-slate-800"></div>

                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-sm mb-3">Equipamentos Disponíveis</h3>
                  <ul className="space-y-2.5">
                    {content.equipments.map((equip, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                        <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
                        <span>{equip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "pesca" && (
            <motion.div
              key="pesca"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-4 flex-1"
            >
              {/* Fishing Header */}
              <div className="bg-gradient-to-r from-amber-600/20 to-slate-900 border border-amber-500/20 rounded-3xl p-6 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold block">Dicas dos Mestres</span>
                <h3 className="font-sans font-bold text-slate-100 text-lg">Segredos do Pescador</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Confira as melhores táticas coletadas pelo anfitrião para dominar o Rio Grande e fisgar grandes espécies.
                </p>
              </div>

              {/* Best Fishing Times */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-2">
                <h4 className="font-sans font-bold text-amber-500 text-sm">Melhores Horários de Pesca</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{content.bestFishingTimes}</p>
              </div>

              {/* Fish Species Accordion */}
              <div className="space-y-3">
                <h4 className="font-sans font-bold text-slate-200 text-sm px-1">Guia de Espécies Locais</h4>
                {content.fishSpecies.map((species, idx) => {
                  const isExpanded = expandedFish === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFish(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="font-sans font-semibold text-xs text-slate-100">{species.name}</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-amber-500" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-slate-950/40 border-t border-slate-800"
                          >
                            <div className="p-4 space-y-3 text-xs">
                              <p className="text-slate-300 leading-relaxed">{species.description}</p>
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                                  <span className="text-[9px] uppercase text-amber-500 block font-medium">Melhor Isca</span>
                                  <span className="text-xs font-semibold text-slate-200">{species.bestBait}</span>
                                </div>
                                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                                  <span className="text-[9px] uppercase text-amber-500 block font-medium">Temporada</span>
                                  <span className="text-xs font-semibold text-slate-200">{species.season}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* General Fishing Advice */}
              <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-2">
                <h4 className="font-sans font-bold text-amber-500 text-sm">Dicas Técnicas Gerais</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{content.fishingTips}</p>
              </div>
            </motion.div>
          )}

          {activeTab === "recomendacoes" && (
            <motion.div
              key="recomendacoes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-4 flex-1"
            >
              {/* Restaurants List */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-slate-100 text-sm flex items-center gap-2 px-1">
                  <Utensils size={16} className="text-amber-500" />
                  <span>Onde Comer (Restaurantes)</span>
                </h3>
                <div className="space-y-3">
                  {content.restaurants.map((rest, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-900 rounded-2xl p-4 space-y-3">
                      <div>
                        <h4 className="font-sans font-semibold text-xs text-slate-100">{rest.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{rest.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{rest.address}</span>
                        <a
                          href={rest.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-600 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                        >
                          <span>Como Ir</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shops (Mercado e Artigos de Pesca) */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-slate-100 text-sm flex items-center gap-2 px-1">
                  <ShoppingBag size={16} className="text-amber-500" />
                  <span>Abastecimento e Pesca</span>
                </h3>
                <div className="space-y-3">
                  {content.shops.map((shop, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-900 rounded-2xl p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-sans font-semibold text-xs text-slate-100">{shop.name}</h4>
                          <span className="text-[9px] uppercase tracking-wider bg-slate-950 text-amber-500 px-2 py-0.5 rounded-md border border-slate-800 font-medium">
                            {shop.type || "Comércio"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{shop.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{shop.address}</span>
                        <a
                          href={shop.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-600 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                        >
                          <span>Como Ir</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-slate-100 text-sm flex items-center gap-2 px-1">
                  <HelpCircle size={16} className="text-amber-500" />
                  <span>Perguntas Frequentes (FAQ)</span>
                </h3>
                <div className="space-y-3.5">
                  {content.faqs.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="font-sans font-semibold text-xs text-slate-100 leading-snug">{faq.question}</span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${isExpanded ? "rotate-180 text-amber-500" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden bg-slate-950/40 border-t border-slate-800"
                            >
                              <p className="p-4 text-xs text-slate-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "emergencia" && (
            <motion.div
              key="emergencia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-4 flex-1"
            >
              {/* WhatsApp Host Button */}
              <div className="bg-slate-900 border-2 border-amber-500/20 rounded-3xl p-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone size={28} strokeWidth={2.3} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-sm">Precisa de Suporte Direto?</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Clique abaixo para iniciar uma conversa no WhatsApp com o seu anfitrião <strong className="text-slate-100">{hostContact?.name}</strong>.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-bold text-xs transition-colors shadow-lg"
                >
                  <Phone size={14} />
                  <span>Falar com o Anfitrião no WhatsApp</span>
                </a>
              </div>

              {/* Emergency Contacts List */}
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-slate-200 text-sm px-1">Telefones e Contatos Úteis</h4>
                <div className="space-y-3">
                  {content.emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-900 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-sans font-semibold text-xs text-slate-100">{contact.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-1">{contact.role}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-amber-500 transition-colors font-sans text-xs font-semibold"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearest Hospital Info */}
              <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-red-400 shrink-0" size={18} strokeWidth={2.3} />
                  <h4 className="font-sans font-bold text-red-400 text-sm">Hospital Próximo</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {content.hospitalInfo}
                </p>
                <div className="pt-1">
                  <a
                    href="https://maps.google.com/?q=Hospital+Municipal+Fronteira+MG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    <span>Como chegar no hospital</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tabs Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-900">
        <div className="max-w-md mx-auto grid grid-cols-5 p-2 gap-1">
          <button
            onClick={() => setActiveTab("inicio")}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "inicio" ? "text-amber-500 bg-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home size={18} strokeWidth={2.3} />
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">Início</span>
          </button>

          <button
            onClick={() => setActiveTab("guia")}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "guia" ? "text-amber-500 bg-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wifi size={18} strokeWidth={2.3} />
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">Acesso</span>
          </button>

          <button
            onClick={() => setActiveTab("pesca")}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "pesca" ? "text-amber-500 bg-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={18} strokeWidth={2.3} />
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">Pesca</span>
          </button>

          <button
            onClick={() => setActiveTab("recomendacoes")}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "recomendacoes" ? "text-amber-500 bg-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Utensils size={18} strokeWidth={2.3} />
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">Dicas</span>
          </button>

          <button
            onClick={() => setActiveTab("emergencia")}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "emergencia" ? "text-amber-500 bg-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Phone size={18} strokeWidth={2.3} />
            <span className="text-[9px] font-sans font-medium mt-1 leading-none">SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
