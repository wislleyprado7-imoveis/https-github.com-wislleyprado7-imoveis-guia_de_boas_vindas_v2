export interface FishSpecies {
  name: string;
  description: string;
  bestBait: string;
  season: string;
}

export interface Recommendation {
  name: string;
  description: string;
  address: string;
  mapLink: string;
  type?: string; // Categoria opcional, ex: Mercado, Pesca, Restaurante
}

export interface EmergencyContact {
  name: string;
  phone: string;
  role: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GuideContent {
  // Capa (Hero)
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;

  // Boas-vindas
  welcomeMessage: string;
  welcomePhotoUrl: string;

  // Check-in/Out
  checkInTime: string;
  checkOutTime: string;
  checkInInstructions: string;
  doorCode: string;
  videoInstructionsUrl: string;

  // Localização
  googleMapsLink: string;
  arrivalInstructions: string;
  latitude?: string;
  longitude?: string;

  // Wi-Fi
  wifiSsid: string;
  wifiPassword: string;
  wifiTips: string;

  // Normas e Itens
  rules: string[];
  equipments: string[];

  // Dicas de Pesca
  bestFishingTimes: string;
  fishSpecies: FishSpecies[];
  fishingTips: string;

  // Recomendações
  restaurants: Recommendation[];
  shops: Recommendation[];

  // Emergência
  emergencyContacts: EmergencyContact[];
  hospitalInfo: string;

  // FAQ
  faqs: FAQItem[];
}

export interface Ranch {
  id: string;
  name: string;
  guideContent: GuideContent;
}

export interface Guest {
  id: string;
  name: string;
  slug: string;
  ranchId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  isAlwaysUnlocked: boolean; // Liberar Acesso Total
}
