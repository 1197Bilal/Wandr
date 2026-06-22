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
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
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
Eres un asesor de viajes experto. Genera un viaje hiper-optimizado (pocas palabras, máximo valor) para "${destination}".
Fechas: ${dates.start} a ${dates.end} (${days} días).
Filtros: ${answers.join(', ')}.

REGLAS ESTRICTAS (AHORRA TOKENS):
1. Cero descripciones largas. Usa 3-5 palabras máx por descripción.
2. Nombres REALES de restaurantes, cafés y bares obligatorios.
3. Link Maps: "https://www.google.com/maps/search/?api=1&query=[Lugar+[Ciudad]"
4. Vuelos/Booking: Usa las fechas exactas proporcionadas.

Devuelve ESTE JSON EXACTO (sin markdown, solo JSON raw):
{
  "destination": "Ciudad/País",
  "flag": "Emoji",
  "cover": "URL Unsplash HD",
  "days": ${days},
  "companions": "Extraído",
  "vibe": "Extraído",
  "budget": { "total": "1200€", "flights": "250€", "hotel": "80€/n", "daily": "60€/d" },
  "weather": { "temp": "22°C", "icon": "☀️", "text": "Sol" },
  "bestTime": "Meses",
  "flights": [
     { "airline": "Google Flights", "price": "Ver", "route": "Ida y Vuelta", "duration": "-", "link": "https://www.google.com/travel/flights?q=Flights+to+[Dest]+from+${dates.start}+to+${dates.end}" }
  ],
  "hotels": [
     { "name": "Hotel Lujo", "stars": "5★", "price": "$$$", "vibe": "Premium", "link": "https://www.booking.com/searchresults.es.html?ss=[Dest]&checkin=${dates.start}&checkout=${dates.end}" },
     { "name": "Hotel Medio", "stars": "4★", "price": "$$", "vibe": "Boutique", "link": "https://www.booking.com/searchresults.es.html?ss=[Dest]&checkin=${dates.start}&checkout=${dates.end}" }
  ],
  "itinerary": [
    // Array de ${days} días EXACTOS. Cada día debe tener estas claves:
    {
      "day": 1,
      "place": "Zona",
      "emoji": "📍",
      "slots": [
        { "type": "🥐 Desayuno", "title": "Café en [Local Real]", "desc": "Especialidad local", "link": "URL Maps" },
        { "type": "📸 Mañana", "title": "[Monumento]", "desc": "Visita principal", "link": "URL Maps" },
        { "type": "☕ Café", "title": "Descanso en [Cafetería]", "desc": "Café de especialidad", "link": "URL Maps" },
        { "type": "🍝 Comida", "title": "[Restaurante]", "desc": "Plato típico", "link": "URL Maps" },
        { "type": "🚶 Tarde", "title": "[Lugar/Barrio]", "desc": "Paseo", "link": "URL Maps" },
        { "type": "🍷 Cena", "title": "[Restaurante/Trattoria]", "desc": "Cena top", "link": "URL Maps" },
        { "type": "🍹 Copas", "title": "Cócteles en [Bar]", "desc": "Vida nocturna", "link": "URL Maps" }
      ],
      "tip": "Tip"
    }
  ],
  "secretItinerary": [ { "day": "1", "place": "Lugar Oculto", "emoji": "🤫", "highlight": "Secreto" } ]
}`;

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
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating final plan:", error);
    return buildGenericFallback(destination, days);
  }
}

export async function editTripPlan(currentPlanJSON, userEditRequest) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("No API key available for editing.");

  const prompt = `
Eres un agente de viajes premium editando un itinerario existente.
A continuación tienes el JSON del itinerario actual:
${JSON.stringify(currentPlanJSON)}

El usuario ha pedido este cambio: "${userEditRequest}"

INSTRUCCIONES CRÍTICAS:
1. Aplica el cambio solicitado de forma inteligente y coherente.
2. Si el cambio afecta a los días o fechas, mantenlas consistentes.
3. Devuelve EXCLUSIVAMENTE el objeto JSON completo y actualizado con la misma estructura exacta que te he dado. No devuelvas markdown, solo el JSON raw.
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
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error editing plan:", error);
    throw error;
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
        slots: [
          { type: '🥐 Desayuno', title: 'Llegada y café', desc: 'Aterrizaje', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${destName}` },
          { type: '📸 Mañana', title: 'Check-in', desc: 'Instálate', link: '#' },
          { type: '🍝 Comida', title: 'Restaurante Local', desc: 'Gastronomía típica', link: `https://www.google.com/maps/search/?api=1&query=restaurantes+${destName}` },
          { type: '🚶 Tarde', title: 'Paseo inicial', desc: 'Toma el pulso', link: `https://www.google.com/maps/search/?api=1&query=centro+${destName}` },
          { type: '🍷 Cena', title: 'Primera Cena', desc: 'Platos típicos', link: `https://www.google.com/maps/search/?api=1&query=cenar+${destName}` },
          { type: '🍹 Copas', title: 'Bar Local', desc: 'Relájate', link: `https://www.google.com/maps/search/?api=1&query=bares+${destName}` }
        ],
        tip: 'Tómatelo con calma.'
      });
    } else {
      generatedItinerary.push({
        day: i, place: `Explorando ${destName}`, emoji: '🗺️',
        slots: [
          { type: '🥐 Desayuno', title: 'Café histórico', desc: 'Desayuno', link: `https://www.google.com/maps/search/?api=1&query=cafe+${destName}` },
          { type: '📸 Mañana', title: 'Visita principal', desc: 'Monumentos', link: `https://www.google.com/maps/search/?api=1&query=monumentos+${destName}` },
          { type: '☕ Café', title: 'Parada dulce', desc: 'Descanso', link: `https://www.google.com/maps/search/?api=1&query=dulces+${destName}` },
          { type: '🍝 Comida', title: 'Sitio recomendado', desc: 'Auténtico', link: `https://www.google.com/maps/search/?api=1&query=restaurantes+${destName}` },
          { type: '🚶 Tarde', title: 'Barrio secreto', desc: 'Cultura', link: `https://www.google.com/maps/search/?api=1&query=museos+${destName}` },
          { type: '🍷 Cena', title: 'Trattoria / Taberna', desc: 'Cena top', link: `https://www.google.com/maps/search/?api=1&query=cenar+${destName}` },
          { type: '🍹 Copas', title: 'Coctelería', desc: 'Vistas', link: `https://www.google.com/maps/search/?api=1&query=bares+${destName}` }
        ],
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
