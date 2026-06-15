export const VIBES = [
  { val: 'chill',   label: 'Chill & Relax', emoji: '🌴' },
  { val: 'playa',   label: 'Sol & Playa',   emoji: '🏖️' },
  { val: 'cultura', label: 'Cultura & Arte', emoji: '🏛️' },
  { val: 'paseos',  label: 'Paseos & Naturaleza', emoji: '🥾' },
  { val: 'fiesta',  label: 'Fiesta & Noche', emoji: '🎉' },
];

export const SEARCH_EXAMPLES = [
  'Japón 14 días',
  'Tailandia 10 días',
  'Marruecos 7 días',
  'Islandia 8 días',
  'Costa Rica 12 días',
];

export async function generateTripPlan(destination, days, companions, vibe) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No VITE_GEMINI_API_KEY found, falling back to generic generator.");
    return buildGenericFallback(destination, days, companions, vibe);
  }

  const prompt = `
Eres el mejor asesor de viajes de lujo del mundo. Diseña el viaje de los sueños del usuario.
Destino/s: "${destination}"
Duración: ${days} días
Compañía: ${companions}
Estilo (Vibe): ${vibe}

INSTRUCCIONES CRÍTICAS:
1. Usa nombres de LUGARES, RESTAURANTES, CAFETERÍAS Y BARES REALES que existan en ese destino. Nada de nombres genéricos.
2. Los enlaces de 'link' en el itinerario deben buscar ese lugar real en Google Maps: "https://www.google.com/maps/search/?api=1&query=[Nombre+del+Lugar+[Ciudad]"
3. Para vuelos, usa este formato exacto: "https://www.google.com/travel/flights?q=vuelos+a+[Ciudad_Principal]"
4. Para hoteles, usa este formato exacto: "https://www.booking.com/searchresults.es.html?ss=[Ciudad_Principal]"

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta:
{
  "destination": "El nombre más bonito y comercial para este viaje (ej. 'Toda la magia de Cerdeña')",
  "flag": "Emoji",
  "cover": "URL de Unsplash sobre el destino (ej. https://images.unsplash.com/photo-...)",
  "days": ${days},
  "companions": "${companions}",
  "vibe": "${vibe}",
  "budget": { "total": "Ej. 1.200€", "flights": "Ej. 250€", "hotel": "Ej. 80€/noche", "daily": "Ej. 60€/día" },
  "weather": { "temp": "Ej. 22°C - 28°C", "icon": "☀️", "text": "Soleado" },
  "bestTime": "Mejor mes o época",
  "flights": [
     { "airline": "Google Flights", "price": "Ver opciones", "route": "Vuelos a destino", "duration": "Buscador", "link": "https://www.google.com/travel/flights?q=vuelos+a+[Ciudad]" },
     { "airline": "Skyscanner", "price": "Comparar", "route": "Todas las aerolíneas", "duration": "Buscador", "link": "https://www.skyscanner.es/" },
     { "airline": "Kiwi", "price": "Rutas baratas", "route": "Opciones low-cost", "duration": "Buscador", "link": "https://www.kiwi.com/" }
  ],
  "hotels": [
     { "name": "Nombre real de un Hotel 5 estrellas allí", "stars": "★★★★★", "price": "Precio aprox", "vibe": "Lujo supremo", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]" },
     { "name": "Nombre real de un Hotel Boutique chulo", "stars": "★★★★", "price": "Precio aprox", "vibe": "Boutique & Diseño", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]" },
     { "name": "Nombre real de un alojamiento top relación calidad/precio", "stars": "★★★", "price": "Precio aprox", "vibe": "Económico pero top", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]" }
  ],
  "itinerary": [
    // EXACTAMENTE ${days} objetos. Cada día debe ser detallado, desde el desayuno hasta la copa por la noche.
    {
      "day": 1,
      "place": "Zona o ciudad específica",
      "emoji": "Emoji",
      "morning": { "title": "Desayuno en [Cafetería Real] y visita a [Lugar]", "desc": "Descripción atractiva de qué pedir y qué ver.", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "afternoon": { "title": "Comida en [Restaurante Real] y [Actividad]", "desc": "Descripción detallada", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "evening": { "title": "Cena en [Restaurante] y copas en [Bar/Club]", "desc": "Descripción de la vibra nocturna", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "tip": "Un consejo muy local"
    }
  ],
  "secretItinerary": [
    { "day": "1-2", "place": "Un secreto local de la zona", "emoji": "🤫", "highlight": "Algo increíble que no sale en las guías turísticas" }
  ]
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const jsonString = data.candidates[0].content.parts[0].text;
    const plan = JSON.parse(jsonString);
    return plan;
  } catch (error) {
    console.error("Error generating trip plan with Gemini:", error);
    // Fallback if API fails
    return buildGenericFallback(destination, days, companions, vibe);
  }
}

// ─── FALLBACK GENÉRICO SI LA API FALLA ──────────────────────────────────────────
function buildGenericFallback(destination, days, companions, vibe) {
  let destName = destination.trim();
  if (destName.length > 20) {
    const match = destName.match(/^[a-zA-ZÀ-ÿ]+/);
    destName = match ? match[0] : 'Europa';
    destName = capitalizeFirst(destName) + ' y alrededores';
  } else {
    destName = capitalizeFirst(destName);
  }

  const generatedItinerary = [];
  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      generatedItinerary.push({
        day: 1, place: `${destName} - Llegada`, emoji: '✈️',
        morning:   { title: 'Llegada y check-in', desc: 'Instálate en el alojamiento y descansa del viaje.', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${destName}` },
        afternoon: { title: 'Paseo de reconocimiento', desc: 'Explora los alrededores sin rumbo fijo para tomarle el pulso al lugar.', link: `https://www.google.com/maps/search/?api=1&query=centro+${destName}` },
        evening:   { title: 'Primera cena local', desc: 'Prueba la gastronomía típica en un restaurante cercano.', link: `https://www.google.com/maps/search/?api=1&query=restaurantes+tradicionales+${destName}` },
        tip: 'Tómatelo con calma el primer día para adaptarte.'
      });
    } else {
      generatedItinerary.push({
        day: i, place: `Explorando ${destName}`, emoji: '🗺️',
        morning:   { title: 'Visita principal del día', desc: 'Descubre los lugares más emblemáticos y fotogénicos.', link: `https://www.google.com/maps/search/?api=1&query=monumentos+${destName}` },
        afternoon: { title: 'Experiencia cultural', desc: 'Sumérgete en la cultura local, museos o actividades únicas.', link: `https://www.google.com/maps/search/?api=1&query=museos+${destName}` },
        evening:   { title: 'Noche en la ciudad', desc: 'Disfruta del ambiente nocturno y la cena tradicional.', link: `https://www.google.com/maps/search/?api=1&query=bares+${destName}` },
        tip: 'Usa transporte público para moverte como un local.'
      });
    }
  }

  return {
    destination: destName, flag: '🌍',
    cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    days, companions, vibe,
    budget: { total: '800–1.500€', flights: '~400€', hotel: '~60€/noche', daily: '~40€/día' },
    weather: { temp: '20°C - 26°C', icon: '🌤️', text: 'Clima agradable' },
    bestTime: 'Primavera u Otoño',
    flights: [
      { airline: 'Google Flights', price: 'Ver opciones', route: `Origen → ${destName}`, duration: 'Variable', link: `https://www.google.com/travel/flights?q=vuelos+a+${encodeURIComponent(destName)}` },
      { airline: 'Skyscanner', price: 'Comparar', route: `Origen → ${destName}`, duration: 'Variable', link: `https://www.skyscanner.es/` },
      { airline: 'Kiwi.com', price: 'Rutas baratas', route: `Hacia ${destName}`, duration: 'Variable', link: `https://www.kiwi.com/` },
    ],
    hotels: [
      { name: `Hoteles en ${destName}`, stars: '★★★★★', price: 'Ver precios', vibe: 'Lujo', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destName)}` },
      { name: `Boutique Hotels`, stars: '★★★★', price: 'Ver precios', vibe: 'Boutique', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destName)}` },
      { name: `Hostels & Budget`, stars: '★★★', price: 'Ver precios', vibe: 'Económico', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(destName)}` },
    ],
    itinerary: generatedItinerary,
    secretItinerary: [
      { day: '1-2', place: 'Ruta Alternativa Secreta', emoji: '🔒', highlight: 'Los rincones que no salen en TripAdvisor. Solo para usuarios Plus.' },
      { day: '3-4', place: 'Restaurantes Escondidos', emoji: '🍷', highlight: 'Donde comen los locales de verdad. Sin menús en inglés.' },
    ]
  };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
