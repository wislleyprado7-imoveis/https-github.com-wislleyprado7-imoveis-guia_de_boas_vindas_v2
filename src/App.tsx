import { useState, useEffect } from "react";
import { Ranch, Guest, GuideContent } from "./types";
import { INITIAL_RANCHES, INITIAL_GUESTS } from "./defaultData";
import AdminPanel from "./components/AdminPanel";
import GuestGuide from "./components/GuestGuide";
import { Sparkles, FileText, Compass, AlertCircle, RefreshCw, Database, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function App() {
  // --- Persistent Storage State ---
  const [ranches, setRanches] = useState<Ranch[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "offline">("connecting");

  // Load from Supabase with localStorage backup fallback
  useEffect(() => {
    async function loadData() {
      try {
        setConnectionStatus("connecting");
        
        // Fetch Ranches
        const { data: sbRanches, error: rError } = await supabase
          .from("ranches")
          .select("*");
        
        // Fetch Guests
        const { data: sbGuests, error: gError } = await supabase
          .from("guests")
          .select("*");

        if (rError || gError) {
          throw new Error(rError?.message || gError?.message || "Erro na conexão com Supabase");
        }

        if (sbRanches && sbRanches.length > 0) {
          const loadedRanches: Ranch[] = sbRanches.map(r => ({
            id: r.id,
            name: r.name,
            guideContent: r.guide_content as unknown as GuideContent
          }));

          const loadedGuests: Guest[] = (sbGuests || []).map(g => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            ranchId: g.ranch_id,
            checkInDate: g.check_in_date,
            checkOutDate: g.check_out_date,
            isAlwaysUnlocked: g.is_always_unlocked
          }));

          setRanches(loadedRanches);
          setGuests(loadedGuests);
          localStorage.setItem("rancho_ranches", JSON.stringify(loadedRanches));
          localStorage.setItem("rancho_guests", JSON.stringify(loadedGuests));
          setConnectionStatus("connected");
        } else {
          // Table is empty, seed initial data to Supabase!
          console.log("Supabase vazio! Semeando dados padrão...");
          
          await supabase.from("ranches").insert(
            INITIAL_RANCHES.map(r => ({
              id: r.id,
              name: r.name,
              guide_content: r.guideContent
            }))
          );

          await supabase.from("guests").insert(
            INITIAL_GUESTS.map(g => ({
              id: g.id,
              name: g.name,
              slug: g.slug,
              ranch_id: g.ranchId,
              check_in_date: g.checkInDate,
              check_out_date: g.checkOutDate,
              is_always_unlocked: g.isAlwaysUnlocked
            }))
          );

          setRanches(INITIAL_RANCHES);
          setGuests(INITIAL_GUESTS);
          localStorage.setItem("rancho_ranches", JSON.stringify(INITIAL_RANCHES));
          localStorage.setItem("rancho_guests", JSON.stringify(INITIAL_GUESTS));
          setConnectionStatus("connected");
        }
      } catch (err) {
        console.warn("Falha ao conectar ao Supabase (tabelas podem não ter sido criadas ainda). Usando LocalStorage...", err);
        setConnectionStatus("offline");
        
        const storedRanches = localStorage.getItem("rancho_ranches");
        const storedGuests = localStorage.getItem("rancho_guests");

        if (storedRanches && storedGuests) {
          setRanches(JSON.parse(storedRanches));
          setGuests(JSON.parse(storedGuests));
        } else {
          localStorage.setItem("rancho_ranches", JSON.stringify(INITIAL_RANCHES));
          localStorage.setItem("rancho_guests", JSON.stringify(INITIAL_GUESTS));
          setRanches(INITIAL_RANCHES);
          setGuests(INITIAL_GUESTS);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Update handlers with sync to localStorage and Supabase
  const handleUpdateRanches = async (newRanches: Ranch[]) => {
    setRanches(newRanches);
    localStorage.setItem("rancho_ranches", JSON.stringify(newRanches));
    
    if (connectionStatus === "connected") {
      try {
        const existingRanchesIds = newRanches.map(r => r.id);
        const { data: dbRanches } = await supabase.from("ranches").select("id");
        if (dbRanches) {
          const deletedIds = dbRanches.filter(r => !existingRanchesIds.includes(r.id)).map(r => r.id);
          if (deletedIds.length > 0) {
            await supabase.from("ranches").delete().in("id", deletedIds);
          }
        }
        
        if (newRanches.length > 0) {
          await supabase.from("ranches").upsert(
            newRanches.map(r => ({
              id: r.id,
              name: r.name,
              guide_content: r.guideContent
            }))
          );
        }
      } catch (err) {
        console.error("Erro ao sincronizar ranchos no Supabase:", err);
      }
    }
  };

  const handleUpdateGuests = async (newGuests: Guest[]) => {
    setGuests(newGuests);
    localStorage.setItem("rancho_guests", JSON.stringify(newGuests));
    
    if (connectionStatus === "connected") {
      try {
        const existingGuestsIds = newGuests.map(g => g.id);
        const { data: dbGuests } = await supabase.from("guests").select("id");
        if (dbGuests) {
          const deletedIds = dbGuests.filter(g => !existingGuestsIds.includes(g.id)).map(g => g.id);
          if (deletedIds.length > 0) {
            await supabase.from("guests").delete().in("id", deletedIds);
          }
        }
        
        if (newGuests.length > 0) {
          await supabase.from("guests").upsert(
            newGuests.map(g => ({
              id: g.id,
              name: g.name,
              slug: g.slug,
              ranch_id: g.ranchId,
              check_in_date: g.checkInDate,
              check_out_date: g.checkOutDate,
              is_always_unlocked: g.isAlwaysUnlocked
            }))
          );
        }
      } catch (err) {
        console.error("Erro ao sincronizar hóspedes no Supabase:", err);
      }
    }
  };

  // Reset database back to default seed data
  const handleResetDatabase = async () => {
    if (confirm("Deseja redefinir o banco de dados para os valores padrão do Rancho Dourado? Suas alterações atuais serão perdidas no local e na nuvem.")) {
      localStorage.setItem("rancho_ranches", JSON.stringify(INITIAL_RANCHES));
      localStorage.setItem("rancho_guests", JSON.stringify(INITIAL_GUESTS));
      setRanches(INITIAL_RANCHES);
      setGuests(INITIAL_GUESTS);
      window.location.hash = ""; // Clear active guest route

      if (connectionStatus === "connected") {
        try {
          setIsLoading(true);
          // Clean existing records
          await supabase.from("guests").delete().neq("id", "");
          await supabase.from("ranches").delete().neq("id", "");

          // Seed
          await supabase.from("ranches").insert(
            INITIAL_RANCHES.map(r => ({
              id: r.id,
              name: r.name,
              guide_content: r.guideContent
            }))
          );

          await supabase.from("guests").insert(
            INITIAL_GUESTS.map(g => ({
              id: g.id,
              name: g.name,
              slug: g.slug,
              ranch_id: g.ranchId,
              check_in_date: g.checkInDate,
              check_out_date: g.checkOutDate,
              is_always_unlocked: g.isAlwaysUnlocked
            }))
          );
        } catch (err) {
          console.error("Erro ao resetar banco no Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // --- Hash-based Router System ---
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Helper to change URL hash programmatically
  const navigateToGuest = (guest: Guest) => {
    window.location.hash = `#/g/${guest.slug}`;
  };

  const navigateToAdmin = () => {
    window.location.hash = "";
  };

  // Extract slug from hash: #/g/joao-silva -> joao-silva
  const getRouteInfo = () => {
    if (currentHash.startsWith("#/g/")) {
      const slug = currentHash.replace("#/g/", "");
      return { type: "guest", slug };
    }
    return { type: "admin", slug: "" };
  };

  const route = getRouteInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-custom flex flex-col items-center justify-center text-navy font-sans">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500">Sincronizando com Supabase Cloud...</p>
      </div>
    );
  }

  // --- ROUTE: GUEST VIEW ---
  if (route.type === "guest" && route.slug) {
    const activeGuest = guests.find(g => g.slug === route.slug);
    const activeRanch = activeGuest ? ranches.find(r => r.id === activeGuest.ranchId) : null;

    if (activeGuest && activeRanch) {
      return (
        <GuestGuide
          guest={activeGuest}
          ranch={activeRanch}
          onBackToAdmin={navigateToAdmin}
        />
      );
    }

    // Guest slug not found fallback
    return (
      <div className="min-h-screen bg-slate-custom flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-200 shadow-sm">
          <AlertCircle size={32} strokeWidth={2.3} />
        </div>
        <h2 className="text-xl font-bold text-navy mb-2 font-sans">Guia Não Encontrado</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          O link de boas-vindas acessado expirou, está incorreto ou foi removido pelo anfitrião. Por favor, verifique com o proprietário do rancho.
        </p>
        <button
          onClick={navigateToAdmin}
          className="py-2.5 px-6 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-gold text-xs font-semibold font-sans transition-colors"
        >
          Ir para Painel Administrativo
        </button>
      </div>
    );
  }

  // --- ROUTE: ADMIN VIEW ---
  return (
    <div className="relative">
      {/* Dev/Reset toolbar helper inside iframe */}
      <div className="bg-white border-b border-slate-200 text-[11px] py-2.5 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Database size={14} className={connectionStatus === "connected" ? "text-gold" : connectionStatus === "connecting" ? "text-slate-400 animate-pulse" : "text-red-500"} />
          {connectionStatus === "connected" ? (
            <span className="text-slate-600 flex items-center gap-1.5">
              Conectado ao <strong className="text-gold font-bold">Supabase Cloud</strong> ⚡ (Sincronização em Tempo Real Ativa)
            </span>
          ) : connectionStatus === "connecting" ? (
            <span className="text-slate-500 animate-pulse">Conectando ao banco de dados Supabase...</span>
          ) : (
            <span className="text-red-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={12} /> Modo Offline (LocalStorage) 💾. Execute o script SQL fornecido no seu console do Supabase para ativar a sincronização em nuvem.
            </span>
          )}
        </div>
        <button
          onClick={handleResetDatabase}
          className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all bg-white py-1 px-3 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>Resetar Padrão</span>
        </button>
      </div>

      <AdminPanel
        ranches={ranches}
        guests={guests}
        onUpdateRanches={handleUpdateRanches}
        onUpdateGuests={handleUpdateGuests}
        onViewGuest={navigateToGuest}
      />
    </div>
  );
}
