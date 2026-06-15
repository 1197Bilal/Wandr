export const SEARCH_EXAMPLES = [
  'Japón en cerezos',
  'Ruta por la Toscana',
  'Cerdeña 10 días relax',
  'Islandia auroras boreales',
  'Costa Rica aventura',
];

export async function generateQuestions(destination) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return [
      "¿Viajas en pareja, familia, amigos o solo?",
      "¿Prefieres lujo relajado o aventura y descubrir rincones?",
      "¿Qué tipo de comida te gustaría probar más?"
    ];
  }

  const prompt = `
Eres un agente de viajes premium. El usuario te ha pedido un viaje con esta descripción inicial: "${destination}".
Necesitas hacerle 3 preguntas cortas, directas y atractivas para poder diseñarle el itinerario perfecto y 100% a medida.
Devuelve EXCLUSIVAMENTE un JSON con un array de 3 strings.
Ejemplo: ["¿Viajas en pareja o con amigos?", "¿Prefieres relax o ruta intensa?", "¿Presupuesto mochilero o lujo?"]
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
      })
    });
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error(err);
    return [
      "¿Viajas en pareja, familia o solo?",
      "¿Prefieres lujo relajado o aventura?",
      "¿Qué presupuesto aproximado tienes?"
    ];
  }
}

export async function generateTripPlan(destination, dates, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const days = calculateDays(dates.start, dates.end) || 7;

  if (!apiKey) {
    console.warn("No API key, falling back.");
    return buildGenericFallback(destination, days);
  }

  const prompt = `
Eres el mejor asesor de viajes de lujo del mundo. Diseña el viaje de los sueños.
Petición inicial: "${destination}"
Fechas exactas: ${dates.start} al ${dates.end} (${days} días)
Respuestas del usuario para personalizar el plan:
1. ${answers[0]}
2. ${answers[1]}
3. ${answers[2]}

INSTRUCCIONES CRÍTICAS DE ENLACES:
1. Usa nombres de RESTAURANTES Y LUGARES REALES.
2. Link Google Maps para lugares: "https://www.google.com/maps/search/?api=1&query=[Lugar+[Ciudad]"
3. Link Vuelos (DEBE incluir fechas exactas YYYY-MM-DD): "https://www.google.com/travel/flights?q=Flights+to+[Ciudad]+from+${dates.start}+to+${dates.end}"
4. Link Booking (DEBE incluir fechas exactas YYYY-MM-DD): "https://www.booking.com/searchresults.es.html?ss=[Ciudad]&checkin=${dates.start}&checkout=${dates.end}"

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta:
{
  "destination": "Nombre comercial del viaje",
  "flag": "Emoji",
  "cover": "URL Unsplash (ej. https://images.unsplash.com/photo-...)",
  "days": ${days},
  "companions": "Extraído de sus respuestas",
  "vibe": "Extraído de sus respuestas",
  "budget": { "total": "Ej. 1.200€", "flights": "Ej. 250€", "hotel": "Ej. 80€/noche", "daily": "Ej. 60€/día" },
  "weather": { "temp": "Ej. 22°C - 28°C", "icon": "☀️", "text": "Soleado" },
  "bestTime": "Fechas elegidas",
  "flights": [
     { "airline": "Google Flights (Recomendado)", "price": "Ver opciones", "route": "Fechas exactas", "duration": "Vuelos a destino", "link": "https://www.google.com/travel/flights?q=Flights+to+[Ciudad]+from+${dates.start}+to+${dates.end}" },
     { "airline": "Skyscanner", "price": "Comparar", "route": "Otras opciones", "duration": "Buscador", "link": "https://www.skyscanner.es/" },
     { "airline": "Kiwi", "price": "Rutas baratas", "route": "Low-cost", "duration": "Buscador", "link": "https://www.kiwi.com/" }
  ],
  "hotels": [
     { "name": "Nombre de Hotel Premium Real", "stars": "★★★★★", "price": "Precio aprox", "vibe": "Lujo", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]&checkin=${dates.start}&checkout=${dates.end}" },
     { "name": "Nombre Hotel Boutique Real", "stars": "★★★★", "price": "Precio aprox", "vibe": "Boutique", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]&checkin=${dates.start}&checkout=${dates.end}" },
     { "name": "Alojamiento Económico Real", "stars": "★★★", "price": "Precio aprox", "vibe": "Económico", "link": "https://www.booking.com/searchresults.es.html?ss=[Ciudad]&checkin=${dates.start}&checkout=${dates.end}" }
  ],
  "itinerary": [
    // EXACTAMENTE ${days} objetos (días 1 al ${days}).
    {
      "day": 1,
      "place": "Zona específica",
      "emoji": "Emoji",
      "morning": { "title": "Desayuno en [Cafetería Real] y visita", "desc": "Detalles", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "afternoon": { "title": "Comida en [Restaurante Real]", "desc": "Detalles", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "evening": { "title": "Cena en [Restaurante Real]", "desc": "Detalles", "link": "https://www.google.com/maps/search/?api=1&query=[Lugar]" },
      "tip": "Consejo local"
    }
  ],
  "secretItinerary": [
    { "day": "1-2", "place": "Secreto local", "emoji": "🤫", "highlight": "Algo increíble" }
  ]
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
      })
    });
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Error generating final plan:", error);
    return buildGenericFallback(destination, days);
  }
}

function calculateDays(start, end) {
  if (!start || !end) return 7;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 7;
}

// ─── FALLBACK GENÉRICO ────────────────────────────────────────────────────────
function buildGenericFallback(destination, days) {
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
        morning:   { title: 'Llegada y check-in', desc: 'Instálate.', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${destName}` },
        afternoon: { title: 'Paseo de reconocimiento', desc: 'Explora.', link: `https://www.google.com/maps/search/?api=1&query=centro+${destName}` },
        evening:   { title: 'Primera cena local', desc: 'Gastronomía típica.', link: `https://www.google.com/maps/search/?api=1&query=restaurantes+tradicionales+${destName}` },
        tip: 'Tómatelo con calma.'
      });
    } else {
      generatedItinerary.push({
        day: i, place: `Explorando ${destName}`, emoji: '🗺️',
        morning:   { title: 'Visita principal', desc: 'Monumentos.', link: `https://www.google.com/maps/search/?api=1&query=monumentos+${destName}` },
        afternoon: { title: 'Experiencia cultural', desc: 'Museos.', link: `https://www.google.com/maps/search/?api=1&query=museos+${destName}` },
        evening:   { title: 'Noche en la ciudad', desc: 'Cena tradicional.', link: `https://www.google.com/maps/search/?api=1&query=bares+${destName}` },
        tip: 'Usa transporte público.'
      });
    }
  }

  return {
    destination: destName, flag: '🌍', cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    days, companions: 'Tu grupo', vibe: 'Aventura',
    budget: { total: '800–1.500€', flights: '~400€', hotel: '~60€/noche', daily: '~40€/día' },
    weather: { temp: '20°C - 26°C', icon: '🌤️', text: 'Agradable' },
    bestTime: 'Primavera u Otoño',
    flights: [
      { airline: 'Google Flights', price: 'Ver', route: `Hacia ${destName}`, duration: '-', link: `https://www.google.com/travel/flights?q=vuelos+a+${destName}` }
    ],
    hotels: [
      { name: `Hoteles en ${destName}`, stars: '★★★★★', price: 'Ver', vibe: 'Lujo', link: `https://www.booking.com/searchresults.es.html?ss=${destName}` }
    ],
    itinerary: generatedItinerary,
    secretItinerary: [ { day: '1-2', place: 'Ruta Secreta', emoji: '🔒', highlight: 'Exclusivo Plus' } ]
  };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
