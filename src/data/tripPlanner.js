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
Eres un experto diseñador de viajes premium. Diseña un itinerario hora a hora para el siguiente viaje:
Destino solicitado: "${destination}"
Duración: ${days} días
Acompañantes: ${companions}
Estilo de viaje (Vibe): ${vibe}

Debes devolver EXCLUSIVAMENTE un objeto JSON válido (sin markdown, sin bloques de código, empieza con '{' y termina con '}') con exactamente la siguiente estructura:
{
  "destination": "Nombre limpio del destino principal",
  "flag": "Emoji de la bandera",
  "cover": "URL de Unsplash sobre el destino (ej. https://images.unsplash.com/photo-...)",
  "days": ${days},
  "companions": "${companions}",
  "vibe": "${vibe}",
  "budget": { "total": "Presupuesto total estimado", "flights": "Coste estimado vuelos", "hotel": "Coste por noche estimado", "daily": "Coste diario estimado" },
  "weather": { "temp": "Temperatura media ej. 20°C - 26°C", "icon": "Emoji del clima", "text": "Texto breve" },
  "bestTime": "Mejor época para viajar",
  "flights": [
     { "airline": "Nombre aerolínea", "price": "Precio ej. ~400€", "route": "Ruta ej. MAD → BKK", "duration": "Duración ej. 13h", "link": "https://www.google.com/travel/flights?q=vuelos+a+[DESTINO]" },
     { "airline": "Otra aerolínea", "price": "Precio", "route": "Ruta", "duration": "Duración", "link": "https://www.skyscanner.es/" },
     { "airline": "Otra opción", "price": "Precio", "route": "Ruta", "duration": "Duración", "link": "https://www.kiwi.com/" }
  ],
  "hotels": [
     { "name": "Nombre real de un hotel premium en el destino", "stars": "★★★★★", "price": "Precio ej. ~200€", "vibe": "Lujo", "link": "https://www.booking.com/searchresults.es.html?ss=[DESTINO]" },
     { "name": "Nombre real de un hotel boutique", "stars": "★★★★", "price": "Precio", "vibe": "Boutique", "link": "https://www.booking.com/searchresults.es.html?ss=[DESTINO]" },
     { "name": "Nombre real de un alojamiento económico/hostel", "stars": "★★★", "price": "Precio", "vibe": "Económico", "link": "https://www.booking.com/searchresults.es.html?ss=[DESTINO]" }
  ],
  "itinerary": [
    // EXACTAMENTE ${days} objetos en este array, uno por cada día del viaje. Usa RESTAURANTES Y LUGARES REALES que existan.
    {
      "day": 1,
      "place": "Nombre de la zona/barrio",
      "emoji": "Emoji",
      "morning": { "title": "Qué hacer", "desc": "Descripción detallada", "link": "Enlace a Google Maps de este lugar" },
      "afternoon": { "title": "Qué hacer", "desc": "Descripción detallada", "link": "Enlace a Google Maps" },
      "evening": { "title": "Restaurante real para cenar", "desc": "Por qué ir ahí y qué pedir", "link": "Enlace a Google Maps del restaurante" },
      "tip": "Un consejo muy útil de un local"
    }
  ],
  "secretItinerary": [
    // 2 objetos con lugares poco conocidos o fuera de las guías típicas
    { "day": "1-2", "place": "Lugar oculto", "emoji": "🔒", "highlight": "Explicación breve de por qué vale la pena" },
    { "day": "3-4", "place": "Lugar oculto 2", "emoji": "🍷", "highlight": "Explicación breve" }
  ]
}
No incluyas NADA MÁS que el JSON crudo en tu respuesta. Si hay error de parsing fallará, así que asegúrate de que es un JSON perfecto.
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
        morning:   { title: 'Llegada y check-in', desc: 'Instálate en el alojamiento y descansa del viaje.', link: '#' },
        afternoon: { title: 'Paseo de reconocimiento', desc: 'Explora los alrededores sin rumbo fijo para tomarle el pulso al lugar.', link: '#' },
        evening:   { title: 'Primera cena local', desc: 'Prueba la gastronomía típica en un restaurante cercano.', link: '#' },
        tip: 'Tómatelo con calma el primer día para adaptarte.'
      });
    } else {
      generatedItinerary.push({
        day: i, place: `Explorando ${destName}`, emoji: '🗺️',
        morning:   { title: 'Visita principal del día', desc: 'Descubre los lugares más emblemáticos y fotogénicos.', link: '#' },
        afternoon: { title: 'Experiencia cultural', desc: 'Sumérgete en la cultura local, museos o actividades únicas.', link: '#' },
        evening:   { title: 'Noche en la ciudad', desc: 'Disfruta del ambiente nocturno y la cena tradicional.', link: '#' },
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
