// Mock trip plan generator with enhanced "Pro" data
export function generateTripPlan(query) {
  const q = query.toLowerCase();

  const plans = {
    tailandia: {
      destination: 'Tailandia',
      flag: '🇹🇭',
      cover: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80',
      days: extractDays(q) || 10,
      budget: { total: '1.200–1.800€', flights: '800€', hotel: '40€/noche', daily: '30€/día' },
      weather: { temp: '28°C - 33°C', icon: '☀️', text: 'Seco y soleado' },
      bestTime: 'Noviembre a Marzo',
      vibe: ['Templos', 'Playa', 'Street food', 'Naturaleza'],
      itinerary: [
        { day: '1–2', place: 'Bangkok', emoji: '🏙️', highlight: 'Templo Wat Pho, mercado flotante de Damnoen Saduak y cena en Chinatown.', tip: 'Usa el barco en el río Chao Phraya, es más rápido que el taxi.', lat: 13.75, lng: 100.50 },
        { day: '3–4', place: 'Chiang Mai', emoji: '🐘', highlight: 'Santuario de elefantes éticos, templo Doi Suthep y clase de cocina thai.', tip: 'Reserva el santuario de elefantes con al menos 3 días de antelación.', lat: 18.78, lng: 98.98 },
        { day: '5–7', place: 'Islas Phi Phi', emoji: '🏝️', highlight: 'Snorkel en Maya Bay, kayak por las lagunas esmeralda y atardecer desde el mirador.', tip: 'Llega a Maya Bay antes de las 8am para evitar las multitudes.', lat: 7.74, lng: 98.77 },
        { day: '8–10', place: 'Koh Lanta', emoji: '🌴', highlight: 'Playas tranquilas, manglares en kayak y la mejor comida del sur de Tailandia.', tip: 'Alquila una moto, es la mejor forma de recorrer la isla.', lat: 7.53, lng: 99.04 },
      ],
    },
    japon: {
      destination: 'Japón',
      flag: '🇯🇵',
      cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      days: extractDays(q) || 14,
      budget: { total: '2.500–3.500€', flights: '1.100€', hotel: '80€/noche', daily: '50€/día' },
      weather: { temp: '15°C - 22°C', icon: '🌸', text: 'Primavera templada' },
      bestTime: 'Marzo-Abril / Oct-Nov',
      vibe: ['Cultura', 'Gastronomía', 'Naturaleza', 'Tecnología'],
      itinerary: [
        { day: '1–3', place: 'Tokio', emoji: '🗼', highlight: 'Shibuya, Shinjuku, Harajuku y un concierto en un izakaya local.', tip: 'Compra el JR Pass antes de salir, te ahorrará mucho dinero.', lat: 35.67, lng: 139.65 },
        { day: '4–5', place: 'Nikko', emoji: '⛩️', highlight: 'Templos Toshogu, cascadas y monos en el parque nacional.', tip: 'Una excursión de día desde Tokio perfecta.', lat: 36.74, lng: 139.60 },
        { day: '6–8', place: 'Kioto', emoji: '🎎', highlight: 'Fushimi Inari al amanecer, geishas en Gion y el bambú de Arashiyama.', tip: 'Fushimi Inari a las 5am: magia pura, sin turistas.', lat: 35.01, lng: 135.76 },
        { day: '9–10', place: 'Osaka', emoji: '🍜', highlight: 'Dotonbori, takoyaki, ramen y el castillo de Osaka.', tip: 'Osaka es la capital gastronómica de Japón. Come todo.', lat: 34.69, lng: 135.50 },
        { day: '11–14', place: 'Hiroshima & Miyajima', emoji: '🏯', highlight: 'Memorial de la Paz, torii flotante de Miyajima y ostras locales.', tip: 'El torii al atardecer con marea alta: una de las mejores vistas de Japón.', lat: 34.38, lng: 132.45 },
      ],
    },
    default: {
      destination: capitalizeFirst(query.split(' ')[0] || 'Destino Mágico'),
      flag: '🌍',
      cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
      days: extractDays(q) || 7,
      budget: { total: '1.000–2.000€', flights: '500€', hotel: '60€/noche', daily: '40€/día' },
      weather: { temp: '20°C - 25°C', icon: '🌤️', text: 'Clima agradable' },
      bestTime: 'Todo el año',
      vibe: ['Aventura', 'Cultura', 'Gastronomía'],
      itinerary: [
        { day: '1–2', place: 'Llegada & adaptación', emoji: '✈️', highlight: 'Paseo por el barrio histórico, mercado local y primera cena.', tip: 'El primer día hazlo tranquilo para adaptarte al cambio horario.' },
        { day: '3–5', place: 'Exploración central', emoji: '🗺️', highlight: 'Los principales puntos de interés y experiencias locales auténticas.', tip: 'Alterna visitas culturales con tiempo libre para perderte.' },
        { day: '6–7', place: 'Naturaleza & relax', emoji: '🌿', highlight: 'Excursión a la naturaleza y último día tranquilo en la ciudad.', tip: 'El último día guárdalo para compras y despedida sin prisas.' },
      ],
    },
  };

  if (q.includes('tailandia') || q.includes('thailand') || q.includes('bangkok')) return plans.tailandia;
  if (q.includes('japon') || q.includes('japón') || q.includes('japan') || q.includes('tokio')) return plans.japon;
  return plans.default;
}

function extractDays(q) {
  const match = q.match(/(\d+)\s*d[ií]as?/);
  return match ? parseInt(match[1]) : null;
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const SEARCH_EXAMPLES = [
  'Tailandia 10 días',
  'Japón 14 días',
  'Bali 7 días',
  'Costa Rica 12 días',
  'Islandia 8 días',
];
