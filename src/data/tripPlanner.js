export const SEARCH_EXAMPLES = [
  'Japón en cerezos',
  'Ruta por la Toscana',
  'Cerdeña 10 días relax',
  'Islandia auroras boreales',
  'Costa Rica aventura',
];

// Parses what the user wrote and returns smart contextual questions
export async function generateQuestions(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return [
      "¿Viajas en pareja, familia, amigos o solo?",
      "¿Prefieres relax total o mezcla con algo de turismo?",
      "¿Qué presupuesto aproximado tienes?"
    ];
  }

  const prompt = `El usuario ha descrito este viaje: "${userInput}"

Analiza lo que ya sabe (destinos, duración, actividades mencionadas) y devuelve SOLO un JSON con array de 3 preguntas cortas para completar lo que NO mencionó.
No preguntes lo que ya dijo. Si mencionó pareja, no preguntes compañía. Si mencionó playa, no preguntes estilo.
Sé específico y útil. Ej: si menciona Capri, pregunta "¿Prefieres alquilar barco privado en Capri o ir en ferry normal?"
Formato: ["pregunta1", "pregunta2", "pregunta3"]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200, responseMimeType: "application/json" }
      })
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return [
      "¿Viajas en pareja, familia o solo?",
      "¿Prefieres relax total o algo de turismo/cultura?",
      "¿Qué presupuesto aproximado tienes?"
    ];
  }
}

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return buildGenericFallback(destination, calculateDays(dates.start, dates.end));
  }
  const days = calculateDays(dates.start, dates.end);

  const qaPairs = questions.map((q, i) => `- PREGUNTA: "${q}" -> RESPUESTA DEL USUARIO: "${answers[i]}"`).join('\n');

  const prompt = `Eres un experto planificador de viajes. Genera un itinerario JSON para este viaje.

DESCRIPCIÓN COMPLETA DEL USUARIO: "${destination}"
Fechas: ${dates.start} → ${dates.end} (${days} días en total)

RESPUESTAS A PREGUNTAS:
${qaPairs}

REGLAS:
- Entiende si el usuario describe una RUTA MULTI-DESTINO (ej: "Cagliari 6 días, Nápoles 1 día, Capri") y distribuye los días correctamente entre destinos.
- Si menciona actividades concretas ("restaurante romántico", "alquilar coche", "playa chill"), incorpóralas en los días exactos.
- Nombres REALES de sitios. Descripciones de 3-5 palabras máx.
- Link Maps: https://www.google.com/maps/search/?api=1&query=NOMBRE+LUGAR+CIUDAD (reemplaza espacios con +)
- Booking: https://www.booking.com/hotel/es/[nombre-hotel-slug].es.html?checkin=${dates.start}&checkout=${dates.end} (usa el slug real del hotel en minúsculas con guiones)
- Adáptate al presupuesto y vibe mencionados.

JSON EXACTO (sin markdown):
{
  "destination": "Título del viaje completo",
  "flag": "🇮🇹",
  "cover": "https://images.unsplash.com/photo-REAL_PHOTO_ID?w=1200&q=80",
  "days": ${days},
  "companions": "Con quién viaja",
  "vibe": "Estilo del viaje",
  "budget": { "total": "X€", "flights": "X€", "hotel": "X€/noche", "daily": "X€/día" },
  "weather": { "temp": "22°C", "icon": "☀️", "text": "Descripción" },
  "bestTime": "Meses ideales",
  "flights": [
    { "airline": "Vueling / Ryanair", "price": "~150€", "route": "MAD → CAG", "duration": "2h30", "link": "https://www.google.com/travel/flights?q=vuelos+madrid+cagliari+${dates.start}" }
  ],
  "hotels": [
    { "name": "Nombre Hotel Real", "stars": "4★", "price": "$$", "vibe": "Romántico", "link": "https://www.booking.com/hotel/es/nombre-hotel-slug.es.html?checkin=${dates.start}&checkout=${dates.end}" }
  ],
  "itinerary": [
    { "day": 1, "place": "Ciudad - Descripción", "emoji": "📍",
      "slots": [
        { "type": "🥐 Desayuno", "title": "Café Real", "desc": "3-5 palabras", "link": "URL Maps real" },
        { "type": "📸 Mañana", "title": "Lugar Real", "desc": "3-5 palabras", "link": "URL Maps" },
        { "type": "☕ Café", "title": "Cafetería Real", "desc": "3-5 palabras", "link": "URL Maps" },
        { "type": "🍝 Comida", "title": "Restaurante Real", "desc": "3-5 palabras", "link": "URL Maps" },
        { "type": "🚶 Tarde", "title": "Actividad Real", "desc": "3-5 palabras", "link": "URL Maps" },
        { "type": "🍷 Cena", "title": "Restaurante Real", "desc": "3-5 palabras", "link": "URL Maps" },
        { "type": "🍹 Copas", "title": "Bar Real", "desc": "3-5 palabras", "link": "URL Maps" }
      ], "tip": "Consejo breve y útil" }
  ],
  "secretItinerary": [ { "day": "2-3", "place": "Lugar Secreto Real", "emoji": "🤫", "highlight": "Por qué es especial" } ]
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

// ─── FALLBACK GENÉRICO (VIAJE DE LUJO A PLAYA EXÓTICA) ──────────────────────────────────
function buildGenericFallback(destination, days) {
  let destName = destination.trim() || 'Bali';

  const generatedItinerary = [];
  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      generatedItinerary.push({
        day: 1, place: `Llegada a ${destName} y Relax`, emoji: '🌴',
        slots: [
          { type: '🥐 Desayuno', title: 'Bowl Tropical en la playa', desc: 'Acai y coco fresco', link: '#' },
          { type: '📸 Mañana', title: 'Check-in Resort 5★', desc: 'Instálate en tu villa', link: '#' },
          { type: '☕ Café', title: 'Café frente al mar', desc: 'Relájate escuchando las olas', link: '#' },
          { type: '🍝 Comida', title: 'Beach Club Local', desc: 'Pescado fresco y vistas', link: '#' },
          { type: '🚶 Tarde', title: 'Primer baño en el mar', desc: 'Aguas cristalinas', link: '#' },
          { type: '🍷 Cena', title: 'Cena a la luz de las velas', desc: 'Restaurante en la arena', link: '#' },
          { type: '🍹 Copas', title: 'Sunset Lounge', desc: 'Cócteles de autor', link: '#' }
        ],
        tip: 'Tómatelo con calma el primer día, hidrátate bien y disfruta de la brisa marina.'
      });
    } else {
      generatedItinerary.push({
        day: i, place: `Explorando el Paraíso`, emoji: '🌊',
        slots: [
          { type: '🥐 Desayuno', title: 'Desayuno Flotante', desc: 'En la piscina privada', link: '#' },
          { type: '📸 Mañana', title: 'Excursión en Catamarán', desc: 'Snorkel en arrecifes', link: '#' },
          { type: '☕ Café', title: 'Parada en Isla Virgen', desc: 'Coco loco en la arena', link: '#' },
          { type: '🍝 Comida', title: 'Barbacoa de marisco', desc: 'Directo del pescador', link: '#' },
          { type: '🚶 Tarde', title: 'Masaje Balinés', desc: 'Spa con vistas al mar', link: '#' },
          { type: '🍷 Cena', title: 'Fine Dining Exótico', desc: 'Fusión asiática-local', link: '#' },
          { type: '🍹 Copas', title: 'Fiesta en la playa', desc: 'Música en directo', link: '#' }
        ],
        tip: 'No olvides crema solar biodegradable y tu mejor bañador.'
      });
    }
  }

  return {
    destination: destName, flag: '🥥', cover: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80',
    days, companions: 'Tu pareja o amigos', vibe: 'Lujo y Relax',
    budget: { total: '2.500€', flights: '~800€', hotel: '~150€/noche', daily: '~100€/día' },
    weather: { temp: '28°C - 32°C', icon: '☀️', text: 'Tropical' },
    bestTime: 'Todo el año',
    flights: [
      { airline: 'Emirates / Qatar', price: 'Ver options', route: `Hacia ${destName}`, duration: '14h', link: `https://www.google.com/travel/flights?q=vuelos+a+${destName}` }
    ],
    hotels: [
      { name: `Resort & Spa en ${destName}`, stars: '★★★★★', price: 'Ver', vibe: 'Luxury', link: `https://www.booking.com/searchresults.es.html?ss=${destName}` }
    ],
    itinerary: generatedItinerary,
    secretItinerary: [ { day: '1-3', place: 'Playa Secreta Privada', emoji: '🤫', highlight: 'Solo accesible en barco. Paraíso virgen sin turistas.' } ]
  };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
