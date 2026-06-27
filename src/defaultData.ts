import { Ranch, Guest, GuideContent } from "./types";

export const DEFAULT_GUIDE_CONTENT: GuideContent = {
  heroTitle: "Rancho Dourado",
  heroSubtitle: "Seu refúgio premium de pesca e lazer no Rio Grande",
  heroImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  
  welcomeMessage: "Olá! É uma honra receber você no Rancho Dourado. Preparamos este espaço com muito carinho para que você, sua família e amigos tenham momentos inesquecíveis. Aqui o ritmo é ditado pela natureza. Aproveite a pescaria, curta o pôr do sol na beira do rio e descanse! Se precisar de qualquer coisa, estou à disposição.",
  welcomePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  
  checkInTime: "14:00",
  checkOutTime: "11:00",
  checkInInstructions: "O portão principal do condomínio abre automaticamente via reconhecimento de placa (que cadastramos previamente) ou digitando o código na portaria. Ao chegar na casa, a fechadura eletrônica da porta da frente estará ativa.",
  doorCode: "2026#",
  videoInstructionsUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Exemplo clássico ou instrutivo
  
  googleMapsLink: "https://maps.google.com/?q=Rio+Grande+Fronteira+MG",
  arrivalInstructions: "Siga pela Rodovia BR-364 sentido Fronteira-MG. Após a ponte do Rio Grande, vire à direita na primeira saída de terra (estrada do Condomínio Porto Real). Siga por 4km acompanhando as placas indicando 'Porto Real'. O Rancho Dourado é a casa número 12, logo após a guarita.",
  latitude: "-20.2819",
  longitude: "-49.2001",
  
  wifiSsid: "Rancho_Dourado_5G",
  wifiPassword: "pesca_esportiva_2026",
  wifiTips: "O roteador principal fica na sala de TV. Caso esteja na área gourmet perto do rio e o sinal oscilar, conecte-se à rede 'Rancho_Gourmet_EXT' que usa o mesmo padrão de senha.",
  
  rules: [
    "Silêncio obrigatório após as 22:00 (respeito aos ranchos vizinhos).",
    "Proibido descartar lixo, linhas de pesca ou anzóis na beira do rio.",
    "Uso obrigatório de colete salva-vidas ao utilizar os barcos do rancho.",
    "Mantenha a área gourmet limpa e recolha restos de iscas após o uso.",
    "Não limpe peixes dentro da cozinha da casa principal (utilize a bancada de limpeza externa)."
  ],
  equipments: [
    "Cervejeira vertical na área gourmet (regulada para -2°C).",
    "Churrasqueira a carvão rotativa + kit de espetos premium.",
    "Bancada profissional para limpeza de peixes à beira-rio com pia.",
    "2 Barcos de alumínio de 6 metros (motor opcional sob agendamento).",
    "Piscina aquecida com hidromassagem e iluminação noturna."
  ],
  
  bestFishingTimes: "O melhor horário é no início da manhã (das 05:30 às 08:00) e no final da tarde (das 17:00 às 19:30). Durante a noite, a pescaria de peixes de couro (como Pintado e Jaú) nas proximidades da ilha de pedras é excelente.",
  fishSpecies: [
    {
      name: "Tucunaré Azul",
      description: "Extremamente combativo, habita as estruturas de galhadas e margens com vegetação.",
      bestBait: "Iscas artificiais de superfície (hélices e zaras) ou lambari vivo.",
      season: "De Setembro a Fevereiro (águas quentes e limpas)."
    },
    {
      name: "Dourado",
      description: "O 'rei do rio'. Salta muito ao ser fisgado. Prefere águas rápidas e corredeiras.",
      bestBait: "Iscas artificiais de meia-água ou tuvira viva.",
      season: "De Outubro a Janeiro."
    },
    {
      name: "Pintado / Surubim",
      description: "Peixe de couro gigante que habita poços profundos do canal do rio.",
      bestBait: "Tuvira grande, cascudo ou salsicha.",
      season: "Ano todo, melhor no período de noites quentes."
    }
  ],
  fishingTips: "Evite barulho excessivo no barco. O uso de cabo de aço (empate) é indispensável para os Dourados devido aos dentes afiados. Para Tucunarés, arremesse o mais próximo possível das estruturas de madeira e faça um trabalho rápido com a isca.",
  
  restaurants: [
    {
      name: "Restaurante Beira-Rio",
      description: "Especializado em peixes na telha e rodízio de pescados locais. Vista incrível para o pôr do sol.",
      address: "Av. Marginal do Rio, Centro, Fronteira - MG",
      mapLink: "https://maps.google.com/?q=Restaurante+Beira-Rio+Fronteira"
    },
    {
      name: "Churrascaria do Gaúcho",
      description: "Excelente churrasco com cortes nobres e buffet completo de saladas.",
      address: "Rodovia BR-364, KM 15, Fronteira - MG",
      mapLink: "https://maps.google.com/?q=Churrascaria+Fronteira"
    }
  ],
  shops: [
    {
      name: "Mercado Central & Conveniência",
      description: "Padaria completa, carnes nobres para churrasco, gelo e carvão.",
      address: "Rua São Paulo, 450, Centro",
      mapLink: "https://maps.google.com/?q=Supermercado+Fronteira"
    },
    {
      name: "Toca da Pesca",
      description: "Artigos de pesca, iscas vivas (lambari, tuvira, minhocoçu) e gelo moído.",
      address: "Marginal da BR-364, ao lado do posto de gasolina",
      mapLink: "https://maps.google.com/?q=Artigos+de+Pesca+Fronteira"
    }
  ],
  
  emergencyContacts: [
    {
      name: "Anfitrião (Wislley)",
      phone: "+55 (17) 99999-1234",
      role: "Suporte geral e emergências da propriedade"
    },
    {
      name: "Caseiro (Sr. Sebastião)",
      phone: "+55 (17) 98888-5678",
      role: "Manutenção física, barcos e apoio local"
    },
    {
      name: "Polícia Militar",
      phone: "190",
      role: "Segurança Pública"
    },
    {
      name: "SAMU / Ambulância",
      phone: "192",
      role: "Emergência Médica"
    }
  ],
  hospitalInfo: "O Hospital Municipal de Fronteira fica a 12 minutos do rancho. Endereço: Av. Alagoas, 210, Centro. Funciona 24 horas para urgências.",
  
  faqs: [
    {
      question: "Posso levar animais de estimação?",
      answer: "Sim! Somos pet-friendly. Pedimos apenas que mantenha seu pet sob supervisão nas áreas comuns e recolha os dejetos."
    },
    {
      question: "Há coletes salva-vidas disponíveis para todos?",
      answer: "Sim, temos 6 coletes de tamanhos variados (incluindo infantis) guardados no armário da bancada gourmet. O uso é obrigatório por lei na represa."
    },
    {
      question: "O rancho tem energia bifásica ou trifásica?",
      answer: "A voltagem padrão das tomadas é 220V. Temos duas tomadas de 110V devidamente sinalizadas na cozinha."
    },
    {
      question: "Como funciona o descarte de lixo?",
      answer: "Por favor, deposite o lixo ensacado na lixeira alta de metal instalada do lado de fora do portão social da propriedade. A coleta passa às segundas, quartas e sextas pela manhã."
    }
  ]
};

export const INITIAL_RANCHES: Ranch[] = [
  {
    id: "rancho-dourado",
    name: "Rancho Dourado",
    guideContent: DEFAULT_GUIDE_CONTENT
  },
  {
    id: "rancho-tucunare",
    name: "Rancho Tucunaré",
    guideContent: {
      ...DEFAULT_GUIDE_CONTENT,
      heroTitle: "Rancho Tucunaré",
      heroSubtitle: "Aventuras de pesca esportiva e conforto com vista panorâmica",
      heroImageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    }
  }
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "guest-1",
    name: "João Silva",
    slug: "joao-silva",
    ranchId: "rancho-dourado",
    checkInDate: new Date().toISOString().split('T')[0], // Hoje
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias a partir de hoje
    isAlwaysUnlocked: false
  },
  {
    id: "guest-2",
    name: "Família Oliveira",
    slug: "familia-oliveira",
    ranchId: "rancho-tucunare",
    checkInDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Daqui a 5 dias (Acesso Antecipado)
    checkOutDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isAlwaysUnlocked: false
  },
  {
    id: "guest-3",
    name: "Carlos Mendes",
    slug: "carlos-mendes",
    ranchId: "rancho-dourado",
    checkInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Já fez checkout
    checkOutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isAlwaysUnlocked: false
  }
];
