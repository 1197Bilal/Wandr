// Mock trip plan generator
export function generateTripPlan(query) {
  const q = query.toLowerCase();

  const plans = {
    tailandia: {
      destination: 'Tailandia',
      flag: '🇹🇭',
      cover: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80',
      days: extractDays(q) || 10,
      budget: '1.200–1.800€',
      bestTime: 'Nov – Mar',
      vibe: ['Templos', 'Playa', 'Street food', 'Naturaleza'],
      itinerary: [
        { day: '1–2', place: 'Bangkok', emoji: '🏙️', highlight: 'Templo Wat Pho, mercado flotante de Damnoen Saduak y cena en Chinatown.', tip: 'Usa el barco en el río Chao Phraya, es más rápido que el taxi.' },
        { day: '3–4', place: 'Chiang Mai', emoji: '🐘', highlight: 'Santuario de elefantes éticos, templo Doi Suthep y clase de cocina thai.', tip: 'Reserva el santuario de elefantes con al menos 3 días de antelación.' },
        { day: '5–7', place: 'Islas Phi Phi', emoji: '🏝️', highlight: 'Snorkel en Maya Bay, kayak por las lagunas esmeralda y atardecer desde el mirador.', tip: 'Llega a Maya Bay antes de las 8am para evitar las multitudes.' },
        { day: '8–10', place: 'Koh Lanta', emoji: '🌴', highlight: 'Playas tranquilas, manglares en kayak y la mejor comida del sur de Tailandia.', tip: 'Alquila una moto, es la mejor forma de recorrer la isla.' },
      ],
    },
    japon: {
      destination: 'Japón',
      flag: '🇯🇵',
      cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      days: extractDays(q) || 14,
      budget: '2.500–3.500€',
      bestTime: 'Mar–Abr / Oct–Nov',
      vibe: ['Cultura', 'Gastronomía', 'Naturaleza', 'Tecnología'],
      itinerary: [
        { day: '1–3', place: 'Tokio', emoji: '🗼', highlight: 'Shibuya, Shinjuku, Harajuku y un concierto en un izakaya local.', tip: 'Compra el JR Pass antes de salir, te ahorrará mucho dinero.' },
        { day: '4–5', place: 'Nikko', emoji: '⛩️', highlight: 'Templos Toshogu, cascadas y monos en el parque nacional.', tip: 'Una excursión de día desde Tokio perfecta.' },
        { day: '6–8', place: 'Kioto', emoji: '🎎', highlight: 'Fushimi Inari al amanecer, geishas en Gion y el bambú de Arashiyama.', tip: 'Fushimi Inari a las 5am: magia pura, sin turistas.' },
        { day: '9–10', place: 'Osaka', emoji: '🍜', highlight: 'Dotonbori, takoyaki, ramen y el castillo de Osaka.', tip: 'Osaka es la capital gastronómica de Japón. Come todo.' },
        { day: '11–14', place: 'Hiroshima & Miyajima', emoji: '🏯', highlight: 'Memorial de la Paz, torii flotante de Miyajima y ostras locales.', tip: 'El torii al atardecer con marea alta: una de las mejores vistas de Japón.' },
      ],
    },
    cerdeña: {
      destination: 'Cerdeña',
      flag: '🇮🇹',
      cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      days: extractDays(q) || 7,
      budget: '900–1.400€',
      bestTime: 'Jun – Sep',
      vibe: ['Playa', 'Naturaleza', 'Gastronomía', 'Relax'],
      itinerary: [
        { day: '1–2', place: 'Cagliari', emoji: '🏛️', highlight: 'Barrio de Castello, mercado de San Benedetto y flamingos en el lago.', tip: 'Alquila coche desde el aeropuerto, es imprescindible para moverse.' },
        { day: '3–4', place: 'Costa Verde', emoji: '🏜️', highlight: 'Dunas de Piscinas, playas vírgenes y ruinas de Tharros.', tip: 'Lleva comida y agua, hay muy pocos servicios en la zona.' },
        { day: '5–6', place: 'Dorgali & Cala Gonone', emoji: '⛵', highlight: 'Alquila un barco para las calas secretas, snorkel y porceddu al atardecer.', tip: 'Reserva el barco el día anterior en el puerto de Cala Gonone.' },
        { day: '7', place: 'Alghero', emoji: '🦞', highlight: 'Murallas medievales, la Gruta de Neptuno y langosta a la catalana.', tip: 'Último día perfecto para ir tranquilo antes del vuelo.' },
      ],
    },
    napoles: {
      destination: 'Nápoles & Capri',
      flag: '🇮🇹',
      cover: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=1200&q=80',
      days: extractDays(q) || 5,
      budget: '700–1.100€',
      bestTime: 'Abr – Jun / Sep – Oct',
      vibe: ['Gastronomía', 'Historia', 'Playa', 'Cultura'],
      itinerary: [
        { day: '1', place: 'Nápoles', emoji: '🍕', highlight: 'Spaccanapoli, Da Michele para la pizza y el Museo Arqueológico.', tip: 'Solo margherita o marinara en Da Michele. Nada más.' },
        { day: '2', place: 'Pompeya', emoji: '🌋', highlight: 'Ruinas de Pompeya por la mañana y el Vesubio por la tarde.', tip: 'Madruga para Pompeya (9am), el calor de mediodía es brutal.' },
        { day: '3', place: 'Capri', emoji: '⛵', highlight: 'Barco de las 7am, Gruta Azul, Anacapri y cena con vista al Faraglioni.', tip: 'Teleférico hasta Anacapri, no el taxi: mucho más barato y vistas increíbles.' },
        { day: '4–5', place: 'Amalfi & Positano', emoji: '🌊', highlight: 'Conducción épica por la costa, limoncello en cada curva y playas de guijarro.', tip: 'Toma el ferry entre pueblos: la carretera de la costa es difícil de aparcar.' },
      ],
    },
    default: {
      destination: 'Tu destino',
      flag: '🌍',
      cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
      days: extractDays(q) || 7,
      budget: '1.000–2.000€',
      bestTime: 'Todo el año',
      vibe: ['Aventura', 'Cultura', 'Gastronomía'],
      itinerary: [
        { day: '1–2', place: 'Llegada & adaptación', emoji: '✈️', highlight: 'Paseo por el barrio histórico, mercado local y primera cena.', tip: 'El primer día hazlo tranquilo para adaptarte al cambio horario.' },
        { day: '3–5', place: 'Exploración central', emoji: '🗺️', highlight: 'Los principales puntos de interés y experiencias locales auténticas.', tip: 'Alterna visitas culturales con tiempo libre para perderte.' },
        { day: '6–7', place: 'Naturaleza & relax', emoji: '🌿', highlight: 'Excursión a la naturaleza y último día tranquilo en la ciudad.', tip: 'El último día guárdalo para compras y despedida sin prisas.' },
      ],
    },
  };

  // Match query to plan
  if (q.includes('tailandia') || q.includes('thailand') || q.includes('bangkok')) return plans.tailandia;
  if (q.includes('japon') || q.includes('japón') || q.includes('japan') || q.includes('tokio')) return plans.japon;
  if (q.includes('cerdeña') || q.includes('sardinia') || q.includes('sardegna')) return plans.cerdeña;
  if (q.includes('napoles') || q.includes('nápoles') || q.includes('capri') || q.includes('amalfi')) return plans.napoles;
  return { ...plans.default, destination: capitalizeFirst(query.split(' ')[0]) };
}

function extractDays(q) {
  const match = q.match(/(\d+)\s*d[ií]as?/);
  return match ? parseInt(match[1]) : null;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const SEARCH_EXAMPLES = [
  'Tailandia 10 días',
  'Japón 2 semanas',
  'Cerdeña 7 días',
  'Nápoles y Capri 5 días',
  'Costa Rica naturaleza',
];
