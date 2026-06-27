import React, { useState } from "react";
import {
  Ranch,
  Guest,
  GuideContent,
  FishSpecies,
  Recommendation,
  EmergencyContact,
  FAQItem
} from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Wifi,
  MapPin,
  Lock,
  Clock,
  HelpCircle,
  FileText,
  AlertTriangle,
  UserPlus,
  Compass,
  ArrowLeft
} from "lucide-react";
import QRCodeModal from "./QRCodeModal";
import { formatDateBr } from "../utils";
import { ImageUploader } from "./ImageUploader";

interface AdminPanelProps {
  ranches: Ranch[];
  guests: Guest[];
  onUpdateRanches: (ranches: Ranch[]) => void;
  onUpdateGuests: (guests: Guest[]) => void;
  onViewGuest: (guest: Guest) => void;
}

export default function AdminPanel({
  ranches,
  guests,
  onUpdateRanches,
  onUpdateGuests,
  onViewGuest
}: AdminPanelProps) {
  // Manage Tabs in Admin Screen
  const [adminTab, setAdminTab] = useState<"ranches" | "guests">("ranches");

  // Selected Ranch for editing
  const [editingRanchId, setEditingRanchId] = useState<string | null>(ranches[0]?.id || null);
  const selectedRanch = ranches.find(r => r.id === editingRanchId) || ranches[0];

  // Selected Section inside the selected Ranch editor (10 sections)
  const [editorSection, setEditorSection] = useState<
    "capa" | "welcome" | "checkin" | "location" | "wifi" | "rules" | "fishing" | "recom" | "emergency" | "faq"
  >("capa");

  // QR Code Modal
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [qrModalGuestName, setQrModalGuestName] = useState("");

  // Create Guest Form State
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestSlug, setNewGuestSlug] = useState("");
  const [newGuestRanchId, setNewGuestRanchId] = useState(ranches[0]?.id || "");
  const [newGuestCheckIn, setNewGuestCheckIn] = useState(new Date().toISOString().split("T")[0]);
  const [newGuestCheckOut, setNewGuestCheckOut] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [newGuestAlwaysUnlocked, setNewGuestAlwaysUnlocked] = useState(false);
  const [guestEditId, setGuestEditId] = useState<string | null>(null);

  // Ranch Creation Form State
  const [isAddingRanch, setIsAddingRanch] = useState(false);
  const [newRanchName, setNewRanchName] = useState("");

  // Copy success indicator
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  // Helper to generate slug from name
  const handleNameChangeForSlug = (name: string) => {
    setNewGuestName(name);
    if (!guestEditId) {
      const generated = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9\s-]/g, "") // remove invalid characters
        .trim()
        .replace(/\s+/g, "-"); // replace spaces with hyphens
      setNewGuestSlug(generated);
    }
  };

  // Create/Edit Guest submission
  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !newGuestSlug.trim() || !newGuestRanchId) return;

    if (guestEditId) {
      // Editing
      const updated = guests.map(g =>
        g.id === guestEditId
          ? {
              ...g,
              name: newGuestName,
              slug: newGuestSlug,
              ranchId: newGuestRanchId,
              checkInDate: newGuestCheckIn,
              checkOutDate: newGuestCheckOut,
              isAlwaysUnlocked: newGuestAlwaysUnlocked
            }
          : g
      );
      onUpdateGuests(updated);
    } else {
      // New Guest
      const newG: Guest = {
        id: `guest-${Date.now()}`,
        name: newGuestName,
        slug: newGuestSlug,
        ranchId: newGuestRanchId,
        checkInDate: newGuestCheckIn,
        checkOutDate: newGuestCheckOut,
        isAlwaysUnlocked: newGuestAlwaysUnlocked
      };
      onUpdateGuests([...guests, newG]);
    }

    // Reset Form
    setIsAddingGuest(false);
    setGuestEditId(null);
    setNewGuestName("");
    setNewGuestSlug("");
    setNewGuestAlwaysUnlocked(false);
  };

  const startEditGuest = (g: Guest) => {
    setGuestEditId(g.id);
    setNewGuestName(g.name);
    setNewGuestSlug(g.slug);
    setNewGuestRanchId(g.ranchId);
    setNewGuestCheckIn(g.checkInDate);
    setNewGuestCheckOut(g.checkOutDate);
    setNewGuestAlwaysUnlocked(g.isAlwaysUnlocked);
    setIsAddingGuest(true);
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm("Tem certeza que deseja remover este hóspede?")) {
      onUpdateGuests(guests.filter(g => g.id !== id));
    }
  };

  // Ranch Actions
  const handleAddRanch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRanchName.trim()) return;

    const defaultContent: GuideContent = {
      heroTitle: newRanchName,
      heroSubtitle: "Bem-vindo ao nosso maravilhoso rancho",
      heroImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      welcomeMessage: "Olá! É um grande prazer ter você por aqui. Sinta-se em casa!",
      welcomePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      checkInInstructions: "A fechadura é digital.",
      doorCode: "1234#",
      videoInstructionsUrl: "",
      googleMapsLink: "",
      arrivalInstructions: "",
      wifiSsid: "Rancho_WiFi",
      wifiPassword: "senha_do_rancho",
      wifiTips: "Mantenha o roteador ligado.",
      rules: ["Cuidado com o fogo", "Não jogue lixo no rio"],
      equipments: ["Churrasqueira", "Geladeira"],
      bestFishingTimes: "Início do dia",
      fishSpecies: [{ name: "Tucunaré", description: "Esportivo", bestBait: "Artificial", season: "Outono" }],
      fishingTips: "Use carretilha ou molinete rápido.",
      restaurants: [{ name: "Restaurante Local", description: "Pratos típicos", address: "Rua do Porto, s/n", mapLink: "" }],
      shops: [{ name: "Mercado do Porto", type: "Mercado", description: "Mercado local e artigos gerais", address: "Av. Beira-Rio, 100", mapLink: "" }],
      emergencyContacts: [{ name: "Anfitrião", phone: "+5511999999999", role: "Geral" }],
      hospitalInfo: "Hospital local a 10km.",
      faqs: [{ question: "Tem barcos?", answer: "Sim, sob consulta." }]
    };

    const newR: Ranch = {
      id: `ranch-${Date.now()}`,
      name: newRanchName,
      guideContent: defaultContent
    };

    const updated = [...ranches, newR];
    onUpdateRanches(updated);
    setEditingRanchId(newR.id);
    setNewRanchName("");
    setIsAddingRanch(false);
  };

  const handleDeleteRanch = (id: string) => {
    if (ranches.length <= 1) {
      alert("Você deve manter pelo menos uma propriedade cadastrada.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta propriedade e todos os guias associados?")) {
      const remaining = ranches.filter(r => r.id !== id);
      onUpdateRanches(remaining);
      onUpdateGuests(guests.filter(g => g.ranchId !== id)); // Clean guests referring to it
      if (editingRanchId === id) {
        setEditingRanchId(remaining[0].id);
      }
    }
  };

  // Guide Content update helpers
  const updateGuideField = (field: keyof GuideContent, value: any) => {
    if (!selectedRanch) return;
    const updatedContent = {
      ...selectedRanch.guideContent,
      [field]: value
    };
    const updatedRanches = ranches.map(r =>
      r.id === selectedRanch.id ? { ...r, guideContent: updatedContent } : r
    );
    onUpdateRanches(updatedRanches);
  };

  // Helper to get absolute guest preview link
  const getGuestLink = (slug: string) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#/g/${slug}`;
  };

  const copyGuestLink = (slug: string, id: string) => {
    const link = getGuestLink(slug);
    navigator.clipboard.writeText(link);
    setCopiedGuestId(id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

  const triggerQrModal = (slug: string, name: string) => {
    setQrModalUrl(getGuestLink(slug));
    setQrModalGuestName(name);
  };

  return (
    <div className="min-h-screen bg-slate-custom text-slate-800 font-sans p-6 md:p-8 lg:p-12 pb-24 selection:bg-gold selection:text-white">
      
      {/* Header Banner - Swiss Modern Branding */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <span className="text-xs tracking-widest text-gold font-semibold uppercase mb-1 block">Plataforma do Anfitrião</span>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-navy tracking-tight">
            Guia de Boas-Vindas Rancho
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie múltiplos ranchos, cadastre estadias e forneça guias interativos premium aos hóspedes.
          </p>
        </div>

        {/* Global Tab Selector */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1 self-stretch md:self-auto shadow-inner">
          <button
            onClick={() => setAdminTab("ranches")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              adminTab === "ranches" ? "bg-gold text-white font-semibold shadow-sm" : "text-slate-500 hover:text-navy hover:bg-slate-50"
            }`}
          >
            Configurar Rancho
          </button>
          <button
            onClick={() => setAdminTab("guests")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              adminTab === "guests" ? "bg-gold text-white font-semibold shadow-sm" : "text-slate-500 hover:text-navy hover:bg-slate-50"
            }`}
          >
            Gerenciar Hóspedes ({guests.length})
          </button>
        </div>
      </header>

      {/* RANCHES CONFIGURATION VIEW */}
      {adminTab === "ranches" && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Properties list */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-navy text-sm">Minhas Propriedades</h3>
                <button
                  onClick={() => setIsAddingRanch(true)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gold hover:text-gold/90 transition-colors"
                >
                  <Plus size={16} strokeWidth={2.3} />
                </button>
              </div>

              {/* Add ranch quick form */}
              {isAddingRanch && (
                <form onSubmit={handleAddRanch} className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Nome do Rancho</label>
                    <input
                      type="text"
                      placeholder="Ex: Rancho Rio Belo"
                      value={newRanchName}
                      onChange={e => setNewRanchName(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 bg-gold hover:bg-gold/90 text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingRanch(false)}
                      className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Ranches selection list */}
              <div className="space-y-2">
                {ranches.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setEditingRanchId(r.id)}
                    className={`group w-full text-left p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      editingRanchId === r.id
                        ? "bg-gold/10 border-gold/40 text-gold font-semibold"
                        : "bg-white border-slate-200/80 text-slate-600 hover:text-navy hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold">{r.name}</span>
                    </div>
                    
                    {/* Delete option only if more than 1 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRanch(r.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing Ranch Header Info Card */}
            {selectedRanch && (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-2">
                <span className="text-[10px] text-gold font-semibold uppercase">Editando Guia</span>
                <h4 className="font-sans font-bold text-navy text-base">{selectedRanch.name}</h4>
                <p className="text-xs text-slate-500">
                  Preencha as seções ao lado. Todas as modificações são salvas instantaneamente em seu navegador.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Editor sections for selected property */}
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Editor Sections Tabs Navigation */}
            <div className="md:w-52 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-3 px-2">Seções do Guia</span>
              
              <button
                onClick={() => setEditorSection("capa")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "capa" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Compass size={14} />
                <span>1. Capa (Hero)</span>
              </button>

              <button
                onClick={() => setEditorSection("welcome")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "welcome" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <FileText size={14} />
                <span>2. Boas-vindas</span>
              </button>

              <button
                onClick={() => setEditorSection("checkin")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "checkin" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Clock size={14} />
                <span>3. Check-in/Out</span>
              </button>

              <button
                onClick={() => setEditorSection("location")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "location" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <MapPin size={14} />
                <span>4. Localização</span>
              </button>

              <button
                onClick={() => setEditorSection("wifi")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "wifi" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Wifi size={14} />
                <span>5. Wi-Fi</span>
              </button>

              <button
                onClick={() => setEditorSection("rules")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "rules" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Lock size={14} />
                <span>6. Normas e Itens</span>
              </button>

              <button
                onClick={() => setEditorSection("fishing")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "fishing" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Sparkles size={14} />
                <span>7. Dicas de Pesca</span>
              </button>

              <button
                onClick={() => setEditorSection("recom")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "recom" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <Compass size={14} />
                <span>8. Recomendações</span>
              </button>

              <button
                onClick={() => setEditorSection("emergency")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "emergency" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <AlertTriangle size={14} />
                <span>9. Emergência</span>
              </button>

              <button
                onClick={() => setEditorSection("faq")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  editorSection === "faq" ? "bg-gold text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                }`}
              >
                <HelpCircle size={14} />
                <span>10. FAQ</span>
              </button>
            </div>

            {/* Active section editing panels */}
            <div className="flex-1 p-6 md:p-8 space-y-6">
              
              {/* SECTION: CAPA */}
              {editorSection === "capa" && (
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-white text-base">Capa (Página Inicial do Guia)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Título Principal</label>
                      <input
                        type="text"
                        value={selectedRanch.guideContent.heroTitle}
                        onChange={e => updateGuideField("heroTitle", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Subtítulo / Descrição Curta</label>
                      <input
                        type="text"
                        value={selectedRanch.guideContent.heroSubtitle}
                        onChange={e => updateGuideField("heroSubtitle", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">URL da Imagem da Capa</label>
                        <input
                          type="text"
                          value={selectedRanch.guideContent.heroImageUrl}
                          onChange={e => updateGuideField("heroImageUrl", e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">Insira um link direto de imagem do Unsplash ou faça o upload abaixo.</p>
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <label className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider block mb-1.5">Fazer Upload da Imagem da Capa</label>
                        <ImageUploader
                          currentUrl={selectedRanch.guideContent.heroImageUrl}
                          onUploadSuccess={(url) => updateGuideField("heroImageUrl", url)}
                          bucketName="ranch-images"
                          label="Enviar Imagem de Capa"
                        />
                      </div>
                    </div>

                    {/* Preview banner */}
                    <div className="border border-slate-800 rounded-2xl overflow-hidden aspect-video relative max-w-sm mt-4 shadow-lg">
                      <img
                        src={selectedRanch.guideContent.heroImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 p-4 flex flex-col justify-end">
                        <span className="text-amber-500 text-[9px] font-bold uppercase">{selectedRanch.name}</span>
                        <h4 className="text-sm font-bold text-white">{selectedRanch.guideContent.heroTitle}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: BOAS VINDAS */}
              {editorSection === "welcome" && (
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-white text-base">Boas-vindas do Anfitrião</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Mensagem de Boas-vindas</label>
                      <textarea
                        rows={6}
                        value={selectedRanch.guideContent.welcomeMessage}
                        onChange={e => updateGuideField("welcomeMessage", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                        placeholder="Escreva uma mensagem acolhedora..."
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Foto do Anfitrião (URL)</label>
                        <input
                          type="text"
                          value={selectedRanch.guideContent.welcomePhotoUrl}
                          onChange={e => updateGuideField("welcomePhotoUrl", e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <label className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider block mb-1.5">Fazer Upload da Foto do Anfitrião</label>
                        <ImageUploader
                          currentUrl={selectedRanch.guideContent.welcomePhotoUrl}
                          onUploadSuccess={(url) => updateGuideField("welcomePhotoUrl", url)}
                          bucketName="ranch-images"
                          label="Enviar Foto do Anfitrião"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CHECK-IN / CHECK-OUT */}
              {editorSection === "checkin" && (
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-white text-base">Check-in, Check-out e Instruções de Entrada</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Horário Check-in</label>
                      <input
                        type="text"
                        placeholder="Ex: 14:00"
                        value={selectedRanch.guideContent.checkInTime}
                        onChange={e => updateGuideField("checkInTime", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Horário Check-out</label>
                      <input
                        type="text"
                        placeholder="Ex: 11:00"
                        value={selectedRanch.guideContent.checkOutTime}
                        onChange={e => updateGuideField("checkOutTime", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Código de Segurança da Porta</label>
                      <input
                        type="text"
                        placeholder="Ex: 2026#"
                        value={selectedRanch.guideContent.doorCode}
                        onChange={e => updateGuideField("doorCode", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Instruções Detalhadas de Acesso</label>
                      <textarea
                        rows={4}
                        value={selectedRanch.guideContent.checkInInstructions}
                        onChange={e => updateGuideField("checkInInstructions", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                        placeholder="Descreva onde pegar chaves, como abrir portão principal, etc."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Vídeo de Instruções (Link YouTube/Drive)</label>
                      <input
                        type="text"
                        placeholder="Ex: https://youtube.com/..."
                        value={selectedRanch.guideContent.videoInstructionsUrl}
                        onChange={e => updateGuideField("videoInstructionsUrl", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: LOCALIZACAO */}
              {editorSection === "location" && (
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-white text-base">Localização e Chegada</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Link do Google Maps (GPS)</label>
                      <input
                        type="text"
                        placeholder="Ex: https://maps.google.com/..."
                        value={selectedRanch.guideContent.googleMapsLink}
                        onChange={e => updateGuideField("googleMapsLink", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Latitude (Coordenada Gps)</label>
                        <input
                          type="text"
                          placeholder="Ex: -20.2819"
                          value={selectedRanch.guideContent.latitude || ""}
                          onChange={e => updateGuideField("latitude", e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Longitude (Coordenada Gps)</label>
                        <input
                          type="text"
                          placeholder="Ex: -49.2001"
                          value={selectedRanch.guideContent.longitude || ""}
                          onChange={e => updateGuideField("longitude", e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Instruções de Rota / Como Chegar</label>
                      <textarea
                        rows={5}
                        value={selectedRanch.guideContent.arrivalInstructions}
                        onChange={e => updateGuideField("arrivalInstructions", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                        placeholder="Indique as referências, rodovias ou bifurcações na estrada de terra..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: WIFI */}
              {editorSection === "wifi" && (
                <div className="space-y-4">
                  <h3 className="font-sans font-bold text-white text-base">Rede Wi-Fi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Nome da Rede (SSID)</label>
                      <input
                        type="text"
                        value={selectedRanch.guideContent.wifiSsid}
                        onChange={e => updateGuideField("wifiSsid", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Senha</label>
                      <input
                        type="text"
                        value={selectedRanch.guideContent.wifiPassword}
                        onChange={e => updateGuideField("wifiPassword", e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Dicas ou Instruções de Wi-Fi</label>
                    <textarea
                      rows={3}
                      value={selectedRanch.guideContent.wifiTips}
                      onChange={e => updateGuideField("wifiTips", e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                      placeholder="Ex: O sinal na piscina necessita do repetidor de sinal..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION: NORMAS E ITENS */}
              {editorSection === "rules" && (
                <div className="space-y-6">
                  {/* House Rules */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Regras da Casa</h4>
                      <button
                        onClick={() => {
                          const updated = [...selectedRanch.guideContent.rules, "Nova regra da casa"];
                          updateGuideField("rules", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Regra</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedRanch.guideContent.rules.map((rule, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={rule}
                            onChange={e => {
                              const updated = [...selectedRanch.guideContent.rules];
                              updated[idx] = e.target.value;
                              updateGuideField("rules", updated);
                            }}
                            className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.rules.filter((_, rIdx) => rIdx !== idx);
                              updateGuideField("rules", updated);
                            }}
                            className="p-2.5 text-slate-500 hover:text-red-400 rounded-lg bg-slate-950 border border-slate-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  {/* Equipments list */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Equipamentos Disponíveis</h4>
                      <button
                        onClick={() => {
                          const updated = [...selectedRanch.guideContent.equipments, "Novo equipamento disponível"];
                          updateGuideField("equipments", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Item</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedRanch.guideContent.equipments.map((equip, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={equip}
                            onChange={e => {
                              const updated = [...selectedRanch.guideContent.equipments];
                              updated[idx] = e.target.value;
                              updateGuideField("equipments", updated);
                            }}
                            className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.equipments.filter((_, eIdx) => eIdx !== idx);
                              updateGuideField("equipments", updated);
                            }}
                            className="p-2.5 text-slate-500 hover:text-red-400 rounded-lg bg-slate-950 border border-slate-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DICAS DE PESCA */}
              {editorSection === "fishing" && (
                <div className="space-y-6">
                  <h3 className="font-sans font-bold text-white text-base">Guia e Dicas de Pesca do Rancho</h3>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Melhores Horários de Pesca</label>
                    <input
                      type="text"
                      value={selectedRanch.guideContent.bestFishingTimes}
                      onChange={e => updateGuideField("bestFishingTimes", e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Dicas e Técnicas Gerais</label>
                    <textarea
                      rows={3}
                      value={selectedRanch.guideContent.fishingTips}
                      onChange={e => updateGuideField("fishingTips", e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  {/* Species List */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Espécies Locais de Peixes</h4>
                      <button
                        onClick={() => {
                          const newSpecies: FishSpecies = {
                            name: "Nova Espécie",
                            description: "Descrição rápida",
                            bestBait: "Iscas vivas ou artificiais",
                            season: "Ano todo"
                          };
                          const updated = [...selectedRanch.guideContent.fishSpecies, newSpecies];
                          updateGuideField("fishSpecies", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Espécie</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedRanch.guideContent.fishSpecies.map((species, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.fishSpecies.filter((_, sIdx) => sIdx !== idx);
                              updateGuideField("fishSpecies", updated);
                            }}
                            className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Nome do Peixe</label>
                              <input
                                type="text"
                                value={species.name}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.fishSpecies];
                                  updated[idx].name = e.target.value;
                                  updateGuideField("fishSpecies", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Temporada Ideal</label>
                              <input
                                type="text"
                                value={species.season}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.fishSpecies];
                                  updated[idx].season = e.target.value;
                                  updateGuideField("fishSpecies", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Iscas Recomendadas</label>
                            <input
                              type="text"
                              value={species.bestBait}
                              onChange={e => {
                                  const updated = [...selectedRanch.guideContent.fishSpecies];
                                  updated[idx].bestBait = e.target.value;
                                  updateGuideField("fishSpecies", updated);
                              }}
                              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Comportamento / Detalhes</label>
                            <textarea
                              rows={2}
                              value={species.description}
                              onChange={e => {
                                  const updated = [...selectedRanch.guideContent.fishSpecies];
                                  updated[idx].description = e.target.value;
                                  updateGuideField("fishSpecies", updated);
                              }}
                              className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 leading-normal"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: RECOMENDACOES */}
              {editorSection === "recom" && (
                <div className="space-y-6">
                  {/* Restaurants */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Restaurantes de Apoio</h4>
                      <button
                        onClick={() => {
                          const newRest: Recommendation = {
                            name: "Novo Restaurante",
                            description: "Descrição curta",
                            address: "Endereço fictício",
                            mapLink: ""
                          };
                          const updated = [...selectedRanch.guideContent.restaurants, newRest];
                          updateGuideField("restaurants", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Local</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedRanch.guideContent.restaurants.map((rest, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.restaurants.filter((_, rIdx) => rIdx !== idx);
                              updateGuideField("restaurants", updated);
                            }}
                            className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Nome do Restaurante</label>
                              <input
                                type="text"
                                value={rest.name}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.restaurants];
                                  updated[idx].name = e.target.value;
                                  updateGuideField("restaurants", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Link Google Maps (GPS)</label>
                              <input
                                type="text"
                                value={rest.mapLink}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.restaurants];
                                  updated[idx].mapLink = e.target.value;
                                  updateGuideField("restaurants", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Endereço Completo</label>
                              <input
                                type="text"
                                value={rest.address}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.restaurants];
                                  updated[idx].address = e.target.value;
                                  updateGuideField("restaurants", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Descrição do Cardápio / Diferenciais</label>
                              <input
                                type="text"
                                value={rest.description}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.restaurants];
                                  updated[idx].description = e.target.value;
                                  updateGuideField("restaurants", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  {/* Shops & Supplies */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Abastecimento / Artigos de Pesca</h4>
                      <button
                        onClick={() => {
                          const newShop = {
                            name: "Novo Comércio",
                            type: "Mercado",
                            description: "Descrição rápida",
                            address: "Av. Principal",
                            mapLink: ""
                          };
                          const updated = [...selectedRanch.guideContent.shops, newShop];
                          updateGuideField("shops", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Comércio</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedRanch.guideContent.shops.map((shop, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.shops.filter((_, sIdx) => sIdx !== idx);
                              updateGuideField("shops", updated);
                            }}
                            className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="text-[9px] text-slate-400 block mb-0.5">Nome do Comércio</label>
                              <input
                                type="text"
                                value={shop.name}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.shops];
                                  updated[idx].name = e.target.value;
                                  updateGuideField("shops", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Categoria / Tipo</label>
                              <input
                                type="text"
                                placeholder="Ex: Pesca / Mercado"
                                value={shop.type}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.shops];
                                  updated[idx].type = e.target.value;
                                  updateGuideField("shops", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Endereço</label>
                              <input
                                type="text"
                                value={shop.address}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.shops];
                                  updated[idx].address = e.target.value;
                                  updateGuideField("shops", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Descrição</label>
                              <input
                                type="text"
                                value={shop.description}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.shops];
                                  updated[idx].description = e.target.value;
                                  updateGuideField("shops", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Link Google Maps (GPS)</label>
                              <input
                                type="text"
                                value={shop.mapLink}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.shops];
                                  updated[idx].mapLink = e.target.value;
                                  updateGuideField("shops", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: EMERGENCIA */}
              {editorSection === "emergency" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-sans font-semibold text-white text-sm">Contatos Úteis e de Emergência</h4>
                      <button
                        onClick={() => {
                          const newC: EmergencyContact = {
                            name: "Nome do Contato",
                            phone: "+55 (17) 99999-0000",
                            role: "Cargo / Função"
                          };
                          const updated = [...selectedRanch.guideContent.emergencyContacts, newC];
                          updateGuideField("emergencyContacts", updated);
                        }}
                        className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} />
                        <span>Adicionar Contato</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedRanch.guideContent.emergencyContacts.map((contact, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 relative">
                          <button
                            onClick={() => {
                              const updated = selectedRanch.guideContent.emergencyContacts.filter((_, cIdx) => cIdx !== idx);
                              updateGuideField("emergencyContacts", updated);
                            }}
                            className="absolute top-4 right-4 text-slate-600 hover:text-red-400 animate-fade-in"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Nome</label>
                              <input
                                type="text"
                                value={contact.name}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.emergencyContacts];
                                  updated[idx].name = e.target.value;
                                  updateGuideField("emergencyContacts", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Cargo / Papel</label>
                              <input
                                type="text"
                                placeholder="Ex: Anfitrião / Caseiro"
                                value={contact.role}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.emergencyContacts];
                                  updated[idx].role = e.target.value;
                                  updateGuideField("emergencyContacts", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Telefone</label>
                              <input
                                type="text"
                                value={contact.phone}
                                onChange={e => {
                                  const updated = [...selectedRanch.guideContent.emergencyContacts];
                                  updated[idx].phone = e.target.value;
                                  updateGuideField("emergencyContacts", updated);
                                }}
                                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold text-white">Informações do Hospital Mais Próximo</label>
                    <textarea
                      rows={3}
                      value={selectedRanch.guideContent.hospitalInfo}
                      onChange={e => updateGuideField("hospitalInfo", e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                      placeholder="Indique o nome do hospital, telefone, distância em minutos, etc."
                    />
                  </div>
                </div>
              )}

              {/* SECTION: FAQ */}
              {editorSection === "faq" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-sans font-bold text-white text-base">Perguntas Frequentes (FAQ)</h3>
                    <button
                      onClick={() => {
                        const newFaq: FAQItem = { question: "Nova Pergunta?", answer: "Resposta explicativa" };
                        const updated = [...selectedRanch.guideContent.faqs, newFaq];
                        updateGuideField("faqs", updated);
                      }}
                      className="text-xs bg-slate-950 border border-slate-800 text-amber-500 hover:text-white hover:bg-slate-800 py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                    >
                      <Plus size={12} />
                      <span>Adicionar Pergunta</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedRanch.guideContent.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const updated = selectedRanch.guideContent.faqs.filter((_, fIdx) => fIdx !== idx);
                            updateGuideField("faqs", updated);
                          }}
                          className="absolute top-4 right-4 text-slate-600 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5 font-semibold">Pergunta</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={e => {
                              const updated = [...selectedRanch.guideContent.faqs];
                              updated[idx].question = e.target.value;
                              updateGuideField("faqs", updated);
                            }}
                            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5 font-semibold">Resposta</label>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={e => {
                              const updated = [...selectedRanch.guideContent.faqs];
                              updated[idx].answer = e.target.value;
                              updateGuideField("faqs", updated);
                            }}
                            className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* GUEST MANAGEMENT VIEW */}
      {adminTab === "guests" && (
        <main className="max-w-6xl mx-auto space-y-8 sleek-guests-panel">
          
          {/* Top Actions: Title and Form trigger */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-sans font-bold text-navy text-lg">Cadastro de Hóspedes e Links de Acesso</h3>
              <p className="text-xs text-slate-500">Configure as datas de entrada/saída de cada hóspede e gere links inteligentes.</p>
            </div>
            {!isAddingGuest && (
              <button
                onClick={() => {
                  setGuestEditId(null);
                  setNewGuestName("");
                  setNewGuestSlug("");
                  setNewGuestRanchId(ranches[0]?.id || "");
                  setNewGuestCheckIn(new Date().toISOString().split("T")[0]);
                  setNewGuestCheckOut(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
                  setNewGuestAlwaysUnlocked(false);
                  setIsAddingGuest(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <UserPlus size={16} strokeWidth={2.3} />
                <span>Registrar Novo Hóspede</span>
              </button>
            )}
          </div>

          {/* Form Create/Edit Guest */}
          {isAddingGuest && (
            <form onSubmit={handleSaveGuest} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h4 className="font-sans font-bold text-white text-base">
                {guestEditId ? "Editar Informações do Hóspede" : "Registrar Nova Estadia"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1 font-semibold">Nome Completo do Hóspede</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newGuestName}
                    onChange={e => handleNameChangeForSlug(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1 font-semibold">Código da URL (Slug exclusivo)</label>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-amber-500">
                    <span className="text-[10px] text-slate-500 p-3 bg-slate-900 border-r border-slate-800 select-none">/g/</span>
                    <input
                      type="text"
                      required
                      placeholder="joao-silva"
                      value={newGuestSlug}
                      onChange={e => setNewGuestSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1 text-xs bg-transparent p-3 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1 font-semibold">Rancho de Hospedagem</label>
                  <select
                    value={newGuestRanchId}
                    onChange={e => setNewGuestRanchId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {ranches.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1 font-semibold">Data de Check-in</label>
                    <input
                      type="date"
                      required
                      value={newGuestCheckIn}
                      onChange={e => setNewGuestCheckIn(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1 font-semibold">Data de Check-out</label>
                    <input
                      type="date"
                      required
                      value={newGuestCheckOut}
                      onChange={e => setNewGuestCheckOut(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-4 gap-4">
                  <input
                    type="checkbox"
                    id="isAlwaysUnlocked"
                    checked={newGuestAlwaysUnlocked}
                    onChange={e => setNewGuestAlwaysUnlocked(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <label htmlFor="isAlwaysUnlocked" className="text-xs font-semibold text-slate-200 cursor-pointer select-none">
                      Liberar Acesso Total Antecipadamente
                    </label>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                      Ignora as travas de data e exibe as senhas e códigos confidenciais antes do dia oficial do Check-in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  {guestEditId ? "Salvar Alterações" : "Gerar Link de Boas-Vindas"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGuest(false);
                    setGuestEditId(null);
                  }}
                  className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Guests Table/Card list */}
          <div className="space-y-4">
            <h4 className="font-sans font-bold text-slate-200 text-sm px-1">Links de Acesso Ativos ({guests.length})</h4>
            
            {guests.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 text-center text-slate-500 space-y-2">
                <p>Nenhum hóspede cadastrado.</p>
                <p className="text-xs">Clique em "Registrar Novo Hóspede" acima para começar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guests.map(g => {
                  const r = ranches.find(ranch => ranch.id === g.ranchId) || ranches[0];
                  
                  // Stay status helper calculation
                  const todayStr = new Date().toISOString().split("T")[0];
                  let statusLabel = "Durante Estadia";
                  let statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                  
                  if (g.isAlwaysUnlocked) {
                    statusLabel = "Liberado Geral";
                    statusBg = "bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse";
                  } else if (todayStr < g.checkInDate) {
                    statusLabel = "Acesso Antecipado";
                    statusBg = "bg-blue-500/10 text-blue-400 border-blue-500/25";
                  } else if (todayStr > g.checkOutDate) {
                    statusLabel = "Estadia Concluída";
                    statusBg = "bg-red-500/10 text-red-400 border-red-500/25";
                  }

                  const guestLink = getGuestLink(g.slug);

                  return (
                    <div
                      key={g.id}
                      className="bg-slate-900 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg group hover:border-slate-800 transition-all"
                    >
                      {/* Name & Badge */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-sans font-bold text-white text-sm leading-tight">{g.name}</h5>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${statusBg}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Dates and Property */}
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Propriedade:</span>
                            <strong className="text-slate-200">{r?.name || "Desconhecido"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Período:</span>
                            <span className="text-slate-200">
                              {formatDateBr(g.checkInDate)} a {formatDateBr(g.checkOutDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slug de Acesso:</span>
                            <span className="font-mono text-amber-500">/g/{g.slug}</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-800"></div>

                      {/* Interactive Sharing Drawer/Buttons */}
                      <div className="space-y-2">
                        {/* URL copy/share input line */}
                        <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden p-1">
                          <input
                            type="text"
                            readOnly
                            value={guestLink}
                            className="flex-1 text-[10px] bg-transparent px-2 text-slate-400 outline-none select-all font-mono"
                          />
                          <button
                            onClick={() => copyGuestLink(g.slug, g.id)}
                            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-900 transition-colors shrink-0"
                            title="Copiar Link"
                          >
                            {copiedGuestId === g.id ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>

                        {/* Trigger buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => triggerQrModal(g.slug, g.name)}
                            className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors text-[11px] font-medium flex items-center justify-center gap-1.5"
                          >
                            <QrCode size={13} strokeWidth={2.3} className="text-amber-500" />
                            <span>QR Code</span>
                          </button>

                          <button
                            onClick={() => onViewGuest(g)}
                            className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors text-[11px] font-medium flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink size={13} strokeWidth={2.3} className="text-amber-500" />
                            <span>Visualizar</span>
                          </button>

                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => startEditGuest(g)}
                              className="flex-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs flex items-center justify-center"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(g.id)}
                              className="flex-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-colors text-xs flex items-center justify-center"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* QR Code Modal rendering */}
      {qrModalUrl && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setQrModalUrl(null)}
          url={qrModalUrl}
          guestName={qrModalGuestName}
        />
      )}
    </div>
  );
}
