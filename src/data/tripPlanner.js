// Mock trip plan generator with enhanced "Pro" data
export function generateTripPlan(destination, days, companions) {
  const q = destination.toLowerCase();

  const plans = {
    japon: {
      destination: 'Japón', flag: '🇯🇵',
      cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      days: days || 14,
      budget: { total: '2.500–3.500€', flights: '1.100€', hotel: '80€/noche', daily: '50€/día' },
      weather: { temp: '15°C - 22°C', icon: '🌸', text: 'Primavera templada' },
      bestTime: 'Mar-Abr / Oct-Nov',
      vibe: ['Cultura', 'Gastronomía', 'Naturaleza'],
      bookingUrl: 'https://www.booking.com/searchresults.es.html?ss=Japón',
      flightsUrl: 'https://www.google.com/travel/flights?q=vuelos+a+Tokyo',
      itinerary: [
        { day: '1–2', place: 'Tokio', emoji: '🗼', highlight: 'Shibuya, Shinjuku, Harajuku y un concierto en un izakaya local.', tip: 'Compra el JR Pass antes de salir, te ahorrará mucho dinero.' },
        { day: '3–4', place: 'Nikko', emoji: '⛩️', highlight: 'Templos Toshogu, cascadas y monos en el parque nacional.', tip: 'Una excursión de día desde Tokio perfecta.' },
        { day: '5–7', place: 'Kioto', emoji: '🎎', highlight: 'Fushimi Inari al amanecer, geishas en Gion y el bambú de Arashiyama.', tip: 'Fushimi Inari a las 5am: magia pura, sin turistas.' },
        { day: '8–10', place: 'Osaka', emoji: '🍜', highlight: 'Dotonbori, takoyaki, ramen y el castillo de Osaka.', tip: 'Osaka es la capital gastronómica de Japón. Come todo.' },
        { day: '11–14', place: 'Hiroshima & Miyajima', emoji: '🏯', highlight: 'Memorial de la Paz, torii flotante de Miyajima y ostras locales.', tip: 'El torii al atardecer con marea alta: una de las mejores vistas de Japón.' },
      ],
      secretItinerary: [
        { day: '1–2', place: 'Hakone', emoji: '🗻', highlight: 'Vistas al Fuji, onsen privado y arte Kusama en el museo Pola.' },
        { day: '3–5', place: 'Kanazawa', emoji: '🏮', highlight: 'El Kioto sin turistas. Geishas reales, mercado Omicho y jardín Kenroku-en.' },
        { day: '6–8', place: 'Naoshima', emoji: '🎨', highlight: 'La isla del arte contemporáneo. Museos bajo tierra y ciclismo al atardecer.' },
      ]
    },
    tailandia: {
      destination: 'Tailandia', flag: '🇹🇭',
      cover: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80',
      days: days || 10,
      budget: { total: '1.200–1.800€', flights: '800€', hotel: '40€/noche', daily: '30€/día' },
      weather: { temp: '28°C - 33°C', icon: '☀️', text: 'Seco y soleado' },
      bestTime: 'Nov – Mar',
      vibe: ['Templos', 'Playa', 'Street food'],
      bookingUrl: 'https://www.booking.com/searchresults.es.html?ss=Bangkok',
      flightsUrl: 'https://www.google.com/travel/flights?q=vuelos+a+Bangkok',
      itinerary: [
        { day: '1–2', place: 'Bangkok', emoji: '🏙️', highlight: 'Templo Wat Pho, mercado flotante y cena en Chinatown.', tip: 'Usa el barco en el río Chao Phraya, más rápido que el taxi.' },
        { day: '3–4', place: 'Chiang Mai', emoji: '🐘', highlight: 'Santuario de elefantes éticos, Doi Suthep y clase de cocina thai.', tip: 'Reserva el santuario con 3 días de antelación.' },
        { day: '5–7', place: 'Islas Phi Phi', emoji: '🏝️', highlight: 'Snorkel en Maya Bay, kayak y atardecer desde el mirador.', tip: 'Llega a Maya Bay antes de las 8am.' },
        { day: '8–10', place: 'Koh Lanta', emoji: '🌴', highlight: 'Playas tranquilas, manglares y la mejor comida del sur.', tip: 'Alquila una moto para recorrer la isla.' },
      ],
      secretItinerary: [
        { day: '1–3', place: 'Chiang Rai & Triángulo Dorado', emoji: '🛕', highlight: 'El Templo Blanco, el Templo Azul y la frontera Myanmar-Laos.' },
        { day: '4–6', place: 'Pai', emoji: '🏔️', highlight: 'El Valle de Pai: cascadas, aguas termales y mercado nocturno bohemio.' },
      ]
    },
    default: {
      destination: capitalizeFirst(destination),
      flag: '🌍',
      cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
      days: days || 7,
      budget: { total: '1.000–2.000€', flights: '500€', hotel: '60€/noche', daily: '40€/día' },
      weather: { temp: '20°C - 25°C', icon: '🌤️', text: 'Clima agradable' },
      bestTime: 'Todo el año',
      vibe: ['Aventura', 'Cultura', 'Gastronomía'],
      bookingUrl: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destination)}`,
      flightsUrl: `https://www.google.com/travel/flights?q=vuelos+a+${encodeURIComponent(destination)}`,
      itinerary: [
        { day: '1–2', place: 'Llegada & adaptación', emoji: '✈️', highlight: 'Paseo por el barrio histórico, mercado local y primera cena.', tip: 'El primer día hazlo tranquilo para adaptarte.' },
        { day: '3–5', place: 'Exploración central', emoji: '🗺️', highlight: 'Los principales puntos de interés y experiencias locales auténticas.', tip: 'Alterna visitas culturales con tiempo libre.' },
        { day: '6–7', place: 'Naturaleza & relax', emoji: '🌿', highlight: 'Excursión a la naturaleza y último día tranquilo.', tip: 'Guarda el último día para despedirte sin prisas.' },
      ],
      secretItinerary: [
        { day: '1–3', place: 'Ruta Alternativa Secreta', emoji: '🔒', highlight: 'Los lugares que los locales no cuentan a los turistas.' },
      ]
    }
  };

  if (q.includes('japon') || q.includes('japón') || q.includes('japan') || q.includes('tokio') || q.includes('tokyo')) return plans.japon;
  if (q.includes('tailandia') || q.includes('thailand') || q.includes('bangkok') || q.includes('bali')) return plans.tailandia;
  return { ...plans.default, destination: capitalizeFirst(destination) };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const SEARCH_EXAMPLES = [
  'Japón 14 días',
  'Tailandia 10 días',
  'Islandia 8 días',
  'Costa Rica 12 días',
  'Marruecos 7 días',
];
