export const SEARCH_EXAMPLES = [
  'Japón en cerezos',
  'Ruta por la Toscana',
  'Cerdeña 10 días relax',
  'Islandia auroras boreales',
  'Costa Rica aventura',
];

// Returns [] if the user already gave enough info, or 1-2 targeted questions if not
export async function generateQuestions(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // If the input is detailed enough (>50 chars), skip questions entirely
  const seemsDetailed = userInput.trim().length > 60 && (
    userInput.includes('día') || userInput.includes('dia') || userInput.includes('noche') ||
    userInput.includes('novia') || userInput.includes('amigo') || userInput.includes('familia') ||
    userInput.includes('solo') || userInput.includes('pareja')
  );
  if (seemsDetailed || !apiKey) return [];

  const prompt = `El usuario escribió: "${userInput}"

Si la descripción ya incluye: destino, estilo (relax/aventura), compañía (pareja/amigos/solo), devuelve [].
Si falta algo esencial, devuelve SOLO 1-2 preguntas muy cortas y específicas.
Formato JSON: [] o ["pregunta1"] o ["pregunta1", "pregunta2"]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 100, responseMimeType: "application/json" }
      })
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return buildGenericFallback(destination, calculateDays(dates.start, dates.end));
  }
  const days = calculateDays(dates.start, dates.end);

  const qaPairs = questions.map((q, i) => `- PREGUNTA: "${q}" -> RESPUESTA DEL USUARIO: "${answers[i]}"`).join('\n');

  const prompt = `Planificador de viajes experto. Genera itinerario JSON estrictamente basado en la descripción del usuario.

USUARIO ESCRIBIÓ: "${destination}"
FECHAS: ${dates.start} → ${dates.end} (${days} días)
${qaPairs ? `\nINFO ADICIONAL:\n${qaPairs}` : ''}

REGLAS CRÍTICAS:
1. Lee bien la descripción. Si el usuario menciona rutas (ej: "Cagliari 6 días luego Nápoles 3 días"), distribuye los días exactamente como pide.
2. Si menciona actividades concretas ("cena romántica", "alquilar coche", "playa chill", "ferry a Capri"), ponlas en el día concreto.
3. Nombres REALES de lugares, restaurantes y bares. Máx 5 palabras en desc.
4. Links Maps: https://www.google.com/maps/search/?api=1&query=NOMBRE+CIUDAD
5. Links vuelos: https://www.google.com/travel/flights?q=vuelos+ORIGEN+DESTINO&hl=es (pon ciudad de origen y destino reales)
6. Links hotel Booking: https://www.booking.com/searchresults.html?ss=CIUDAD&checkin=${dates.start}&checkout=${dates.end}&lang=es (ss = nombre de ciudad, NO slug de hotel, porque no puedes saber el slug exacto)
7. Adáptate al presupuesto y estilo mencionados.

JSON (sin markdown):
{
  "destination": "Título descriptivo del viaje",
  "flag": "Emoji país",
  "cover": "https://images.unsplash.com/photo-[ID_REAL]?w=1200&q=80",
  "days": ${days},
  "companions": "Extraído de la descripción",
  "vibe": "Estilo extraído",
  "budget": { "total": "X€", "flights": "X€", "hotel": "X€/noche", "daily": "X€/día" },
  "weather": { "temp": "X°C", "icon": "☀️", "text": "Clima" },
  "bestTime": "Meses ideales",
  "flights": [
    { "airline": "Vueling/Ryanair", "price": "~X€", "route": "MAD → CAG", "duration": "2h30", "link": "https://www.google.com/travel/flights?q=vuelos+madrid+cagliari+${dates.start}&hl=es" }
  ],
  "hotels": [
    { "name": "Nombre Hotel Real", "stars": "4★", "price": "$$", "vibe": "Romántico", "link": "https://www.booking.com/searchresults.html?ss=Cagliari&checkin=${dates.start}&checkout=${dates.end}&lang=es" }
  ],
  "itinerary": [
    { "day": 1, "place": "Ciudad - Descripción breve", "emoji": "📍",
      "slots": [
        { "type": "🥐 Desayuno", "title": "Nombre Café Real", "desc": "Qué pedir", "link": "https://www.google.com/maps/search/?api=1&query=Nombre+Cafe+Ciudad" },
        { "type": "📸 Mañana", "title": "Lugar/Actividad Real", "desc": "3-5 palabras", "link": "https://www.google.com/maps/search/?api=1&query=Lugar+Ciudad" },
        { "type": "☕ Café", "title": "Cafetería Real", "desc": "3-5 palabras", "link": "https://www.google.com/maps/search/?api=1&query=Cafeteria+Ciudad" },
        { "type": "🍝 Comida", "title": "Restaurante Real", "desc": "Especialidad", "link": "https://www.google.com/maps/search/?api=1&query=Restaurante+Ciudad" },
        { "type": "🚶 Tarde", "title": "Actividad/Lugar Real", "desc": "3-5 palabras", "link": "https://www.google.com/maps/search/?api=1&query=Lugar+Ciudad" },
        { "type": "🍷 Cena", "title": "Restaurante Real", "desc": "3-5 palabras", "link": "https://www.google.com/maps/search/?api=1&query=Restaurante+Ciudad" },
        { "type": "🍹 Copas", "title": "Bar/Coctelería Real", "desc": "3-5 palabras", "link": "https://www.google.com/maps/search/?api=1&query=Bar+Ciudad" }
      ], "tip": "Consejo práctico breve" }
  ],
  "secretItinerary": [ { "day": "X", "place": "Lugar Secreto Real", "emoji": "🤫", "highlight": "Por qué es especial (1 frase)" } ]
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
