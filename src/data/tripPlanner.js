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

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return buildGenericFallback(destination, calculateDays(dates.start, dates.end));
  }
  const days = calculateDays(dates.start, dates.end);

  const qaPairs = questions.map((q, i) => `- PREGUNTA: "${q}" -> RESPUESTA DEL USUARIO: "${answers[i]}"`).join('\n');

  const prompt = `
Eres un asesor de viajes experto. Tu objetivo es generar un viaje hiper-optimizado y ESTRICTAMENTE ADAPTADO a lo que pide el usuario.
Destino: "${destination}".
Fechas: ${dates.start} a ${dates.end} (${days} días).

RESPUESTAS DEL USUARIO (¡SÚPER IMPORTANTE, ADÁPTATE A ESTO!):
${qaPairs}

REGLAS ESTRICTAS (AHORRA TOKENS Y ADÁPTATE):
1. Cero descripciones largas. Usa 3-5 palabras máx por descripción.
2. Nombres REALES de restaurantes, hoteles y lugares.
3. SI EL PRESUPUESTO ES BAJO: Pon hostales, comida callejera o sitios baratos. NO pongas hoteles 5 estrellas ni restaurantes caros.
4. SI PIDEN PLAYA/CHILL: Enfoca el itinerario en relax, no los satures a monumentos.
5. Vuelos/Booking: Usa las fechas exactas proporcionadas.

Devuelve ESTE JSON EXACTO (sin markdown, solo JSON raw) con los valores adaptados al usuario:
{
  "destination": "Ciudad/País",
  "flag": "Emoji",
  "cover": "URL Unsplash HD que encaje con el destino y vibe",
  "days": ${days},
  "companions": "Resumen de con quién viaja (ej: Pareja)",
  "vibe": "Resumen del estilo (ej: Chill y Barato)",
  "budget": { "total": "[Presupuesto total estimado]", "flights": "[€ vuelos]", "hotel": "[€/noche adaptado]", "daily": "[€/día adaptado]" },
  "weather": { "temp": "22°C", "icon": "☀️", "text": "Sol" },
  "bestTime": "Meses ideales",
  "flights": [
     { "airline": "Google Flights", "price": "Ver", "route": "Ida y Vuelta", "duration": "-", "link": "https://www.google.com/travel/flights?q=Flights+to+[Dest]+from+${dates.start}+to+${dates.end}" }
  ],
  "hotels": [
     { "name": "[Nombre Hotel Real Adaptado al Presupuesto 1]", "stars": "[Ej: 3★ o Hostal]", "price": "[Ej: $ o $$]", "vibe": "[Ej: Mochilero o Romántico]", "link": "https://www.booking.com/searchresults.es.html?ss=[Dest]&checkin=${dates.start}&checkout=${dates.end}" },
     { "name": "[Nombre Hotel Real Adaptado al Presupuesto 2]", "stars": "[Ej: 4★ o Apartamento]", "price": "[Ej: $$]", "vibe": "[Ej: Céntrico]", "link": "https://www.booking.com/searchresults.es.html?ss=[Dest]&checkin=${dates.start}&checkout=${dates.end}" }
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
