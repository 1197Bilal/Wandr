export const SEARCH_EXAMPLES = [
  '6 días en Cagliari, playa chill y buena comida con mi chica',
  'Ruta por la Toscana en pareja, vino y atardeceres',
  'Japón en la época de los cerezos, cultura e izakayas',
  'Islandia, auroras boreales y paisajes únicos',
  'Costa Rica, naturaleza y aventura',
];

// ─── SEMANTIC PARSER ──────────────────────────────────────────────────────────
// Extracts {destination, days, mood} from raw natural language before calling AI.
// This runs client-side so there is zero risk of confusing budget words with places.
const BUDGET_WORDS = /\b(dinero|barato|caro|económico|asequible|lujo|presupuesto|gasto|euros?|libre|ahorro|gratis)\b/gi;
const STOP_WORDS = new Set([
  'quiero','viajar','ir','visitar','conocer','ver','hacer','días','dia','dias','semanas','semana',
  'noche','noches','con','para','en','de','que','por','a','el','la','los','las','un','una','al',
  'del','mi','mis','su','sus','hay','muy','mas','más','poco','mucho','mucho','pero','donde',
  'cuanto','si','no','porque','dinero','barato','caro','lujo','económico','presupuesto','gasto',
  'chill','relax','aventura','romance','romántico','romántica','amigo','amiga','familia','pareja',
  'novia','novio','solo','sola','juntos','viaje','plan','vuelo','vuelos','hotel','hoteles',
]);

export function extractDestination(rawInput) {
  // Strip budget/mood noise first
  let clean = rawInput.replace(BUDGET_WORDS, ' ').trim();

  // Pattern 1: explicit "X días en DEST" or "a DEST" or "en DEST"
  const explicit = clean.match(
    /(?:\d+\s+d[ií]as?\s+(?:en|a)\s+|(?:viajar|ir|visitar)\s+(?:a|en)\s+|(?:^|\s)en\s+)([A-ZÁÉÍÓÚÑÀ-Ÿa-záéíóúñ][a-zA-ZÁÉÍÓÚÑÀ-Ÿa-záéíóúñ\s]{2,20}?)(?:\s*,|\s+\d|\s+con|\s+en|\s+de|\s+para|$)/i
  );
  if (explicit?.[1]) return explicit[1].trim().replace(/\s+/g, ' ');

  // Pattern 2: any capitalized word/phrase not in stopwords
  const words = clean.split(/[\s,]+/);
  const candidates = words.filter(w =>
    w.length > 2 &&
    !STOP_WORDS.has(w.toLowerCase()) &&
    !/^\d+$/.test(w)
  );
  const capitalized = candidates.find(w => /^[A-ZÁÉÍÓÚÑÀ-Ÿ]/.test(w));
  if (capitalized) return capitalized.charAt(0).toUpperCase() + capitalized.slice(1);

  // Pattern 3: any non-stopword
  if (candidates[0]) return candidates[0].charAt(0).toUpperCase() + candidates[0].slice(1);

  return 'tu destino';
}

function extractMood(rawInput) {
  const moods = [];
  if (/chill|relax|tranquil|descanso|playa/i.test(rawInput)) moods.push('chill y relajado');
  if (/romant|novia|novio|pareja|cena especial|sorpresa/i.test(rawInput)) moods.push('romántico');
  if (/aventur|trekking|senderismo|activo|deporte/i.test(rawInput)) moods.push('aventura y naturaleza');
  if (/cultura|museo|historia|arte/i.test(rawInput)) moods.push('cultural');
  if (/fiesta|noche|club|bar|discoteca/i.test(rawInput)) moods.push('vida nocturna');
  if (/gastronomia|comida|restaurante|food/i.test(rawInput)) moods.push('gastronomía');
  return moods.length ? moods.join(', ') : 'exploración general';
}

// ─── GENERATE QUESTIONS ───────────────────────────────────────────────────────
export async function generateQuestions(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hasContext = userInput.trim().length > 50 &&
    /novia|chica|pareja|amigo|familia|solo\b|noche|d[ií]a|semana/i.test(userInput);
  if (hasContext || !apiKey) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `El usuario quiere viajar: "${userInput}". Devuelve 1 o 2 preguntas MUY cortas sobre lo que NO mencionó (compañía, duración o presupuesto). Si todo está claro, devuelve []. Solo JSON array de strings, sin markdown.` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 120, responseMimeType: 'application/json' }
        })
      }
    );
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(text);
  } catch { return []; }
}

// ─── GENERATE TRIP PLAN ───────────────────────────────────────────────────────
export async function generateTripPlan(rawInput, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const days = calculateDays(dates.start, dates.end);

  // Step 1: Extract destination client-side BEFORE calling AI
  const destination = extractDestination(rawInput);
  const mood = extractMood(rawInput);
  const destEncoded = encodeURIComponent(destination);

  if (!apiKey) return buildGenericFallback(destination, days, mood);

  const extras = (questions || []).map((q, i) => `${q}: ${answers[i] || ''}`).filter(Boolean).join('. ');

  // Step 2: Pass destination and mood EXPLICITLY — AI cannot confuse them
  const prompt = `Eres un experto planificador de viajes de lujo. Estos son los datos CONFIRMADOS del viaje:

DESTINO CONFIRMADO: "${destination}"
PETICIÓN COMPLETA: "${rawInput}"
MOOD DEL VIAJE: ${mood}
FECHAS: ${dates.start} hasta ${dates.end} (EXACTAMENTE ${days} días)${extras ? `\nINFO ADICIONAL: ${extras}` : ''}

REGLAS ABSOLUTAS (ninguna es opcional):
1. El destino es "${destination}". TODO el contenido (vuelos, hoteles, restaurantes, playas, monumentos) debe ser de "${destination}" y sus alrededores. PROHIBIDO mezclar países o continentes.
2. Genera EXACTAMENTE ${days} días, ni uno más ni uno menos.
3. Cada día: mínimo 7 slots desde las 08:00 hasta las 23:00+. Cronograma hora a hora.
4. Nombres REALES y verificables de cada lugar (restaurante, playa, museo, bar). Sin inventar.
5. Adapta TODO al mood "${mood}": si es chill, planes tranquilos; si es romántico, cenas con vistas.
6. Si el usuario pide algo especial (cena sorpresa, excursión concreta), ponlo en el día exacto con "isSpecial": true.
7. "destination" en el JSON = título corto del viaje (máx 5 palabras), no la petición literal.
8. Links de Google Maps: https://www.google.com/maps/search/?api=1&query=NOMBRE+${destEncoded} (reemplaza espacios por +)
9. Links Booking: https://www.booking.com/searchresults.html?ss=NOMBRE_HOTEL&checkin=${dates.start}&checkout=${dates.end}&group_adults=2 (ss = nombre exacto del hotel en el destino real)
10. Links Skyscanner: https://www.skyscanner.es/vuelos/IATA_ORIGEN/IATA_DESTINO_REAL/ con las siglas IATA reales del aeropuerto de "${destination}"

Devuelve ÚNICAMENTE JSON válido (sin markdown ni texto extra):
{
  "destination": "Título corto del viaje",
  "flag": "🇨🇴",
  "cover": "https://images.unsplash.com/photo-XXXXXXXXXX?w=1200&q=80",
  "days": ${days},
  "companions": "Con quién viaja",
  "vibe": "${mood}",
  "budget": { "total": "X.XXX€", "flights": "XXX€", "hotel": "XX€/noche", "daily": "XX€/día" },
  "weather": { "temp": "XX°C", "icon": "☀️", "text": "Descripción clima real" },
  "bestTime": "Meses ideales para ${destination}",
  "flights": [
    { "airline": "Aerolínea real", "price": "~XXX€/persona", "route": "MAD → IATA_${destination.toUpperCase().slice(0,3)}", "duration": "Xh Xm", "link": "https://www.skyscanner.es/vuelos/mad/IATA_REAL_DEL_AEROPUERTO/" }
  ],
  "hotels": [
    { "name": "Nombre Hotel Real en ${destination}", "stars": "X★", "price": "$$", "vibe": "Descripción del hotel", "link": "https://www.booking.com/searchresults.html?ss=Nombre+Hotel+Real&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" }
  ],
  "itinerary": [
    {
      "day": 1,
      "place": "Ciudad en ${destination} – Tema del día",
      "emoji": "✈️",
      "isSpecial": false,
      "slots": [
        { "type": "🥐 Desayuno", "time": "08:30", "title": "Nombre Cafetería Real en ${destination}", "desc": "Descripción real.", "link": "https://www.google.com/maps/search/?api=1&query=Nombre+Cafeteria+${destEncoded}" },
        { "type": "📸 Mañana", "time": "10:00", "title": "Lugar Real en ${destination}", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Lugar+Real+${destEncoded}" },
        { "type": "☕ Café", "time": "12:00", "title": "Café Real", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Cafe+Real+${destEncoded}" },
        { "type": "🍽️ Comida", "time": "14:00", "title": "Restaurante Real", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Restaurante+Real+${destEncoded}" },
        { "type": "🌆 Tarde", "time": "16:30", "title": "Actividad Real", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Actividad+Real+${destEncoded}" },
        { "type": "🍷 Cena", "time": "20:30", "title": "Restaurante Noche Real", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Restaurante+Noche+Real+${destEncoded}" },
        { "type": "🍹 Copas", "time": "23:00", "title": "Bar Real", "desc": "Descripción.", "link": "https://www.google.com/maps/search/?api=1&query=Bar+Real+${destEncoded}" }
      ],
      "tip": "Consejo real para este día en ${destination}."
    }
  ],
  "secretItinerary": [
    { "day": "2", "place": "Lugar secreto real en ${destination}", "emoji": "🤫", "highlight": "Por qué es especial y cómo llegar.", "link": "https://www.google.com/maps/search/?api=1&query=Lugar+Secreto+${destEncoded}" }
  ]
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 16000, responseMimeType: 'application/json' }
        })
      }
    );
    if (!res.ok) {
      console.error('Gemini API error:', res.status);
      return buildGenericFallback(destination, days, mood);
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Robust JSON extraction: find first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

    const parsed = JSON.parse(text);
    if (!parsed.itinerary?.length) throw new Error('Empty itinerary');
    return parsed;
  } catch (err) {
    console.error('Plan generation failed:', err.message);
    return buildGenericFallback(destination, days, mood);
  }
}

// ─── EDIT TRIP PLAN (Chat IA) ──────────────────────────────────────────────────
export async function editTripPlan(currentPlanJSON, userEditRequest) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return currentPlanJSON; // Graceful: return original if no key

  try {
    // Send only itinerary + key fields to reduce token load
    const slim = {
      destination: currentPlanJSON.destination,
      vibe: currentPlanJSON.vibe,
      itinerary: currentPlanJSON.itinerary,
      secretItinerary: currentPlanJSON.secretItinerary,
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres un editor de itinerarios de viaje. Tienes este JSON de un viaje a "${currentPlanJSON.destination}":
${JSON.stringify(slim)}

El usuario pide: "${userEditRequest}"

Aplica el cambio SOLO en los campos relevantes. REGLAS:
- Mantén la estructura exacta del JSON
- No cambies el destino ni el número de días
- Solo JSON de respuesta (sin markdown, sin texto extra)
- El JSON devuelto debe ser 100% parseable

Devuelve el JSON completo modificado.`
            }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 10000, responseMimeType: 'application/json' }
        })
      }
    );

    if (!res.ok) return currentPlanJSON; // Graceful fallback

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

    const updated = JSON.parse(text);

    // Merge: keep flights/hotels/budget from original, update only itinerary/vibe
    return {
      ...currentPlanJSON,
      vibe: updated.vibe || currentPlanJSON.vibe,
      itinerary: updated.itinerary || currentPlanJSON.itinerary,
      secretItinerary: updated.secretItinerary || currentPlanJSON.secretItinerary,
    };
  } catch (err) {
    console.error('Edit failed, returning original plan:', err.message);
    return currentPlanJSON; // NEVER throw — return original plan silently
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function calculateDays(start, end) {
  if (!start || !end) return 7;
  const diff = Math.abs(new Date(end) - new Date(start));
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return d > 0 ? d : 7;
}

// ─── GENERIC FALLBACK (when AI fails) ─────────────────────────────────────────
function buildGenericFallback(destination, days, mood = '') {
  const cleanDest = (destination || 'tu destino')
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const cap = cleanDest.charAt(0).toUpperCase() + cleanDest.slice(1);
  const destEncoded = encodeURIComponent(cap);
  const hotelName = `Hotel Boutique ${cap}`;

  const themes = [
    { label: 'Llegada e inmersión', emoji: '✈️', slots: [
      { type: '✈️ Llegada', time: '13:00', title: 'Aeropuerto y traslado', desc: `Aterriza en ${cap}. Coge taxi o shuttle al hotel. Guarda el equipaje y sal a explorar.`, link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${destEncoded}` },
      { type: '☕ Café', time: '15:00', title: 'Primera parada local', desc: `Primer café en un bar del barrio. Observa, absorbe y siéntete parte de ${cap}.`, link: `https://www.google.com/maps/search/?api=1&query=cafe+${destEncoded}` },
      { type: '🚶 Paseo', time: '16:30', title: 'Barrio histórico a pie', desc: `Paseo sin mapa por el centro. Primer contacto con la arquitectura y el ambiente local.`, link: `https://www.google.com/maps/search/?api=1&query=centro+historico+${destEncoded}` },
      { type: '🍽️ Cena', time: '20:30', title: 'Restaurante de bienvenida', desc: `Primera cena en ${cap}. Pide la especialidad local, sin pensar mucho. Bienvenida oficial.`, link: `https://www.google.com/maps/search/?api=1&query=restaurante+tipico+${destEncoded}` },
      { type: '🍹 Copas', time: '23:00', title: 'Bar del barrio', desc: `Una copa para celebrar la llegada. Pregunta al camarero qué bebe la gente de aquí.`, link: `https://www.google.com/maps/search/?api=1&query=bar+local+${destEncoded}` },
    ]},
    { label: 'Cultura y monumentos', emoji: '🏛️', slots: [
      { type: '🥐 Desayuno', time: '08:30', title: 'Desayuno de mercado', desc: `Desayuna en el mercado local. El más auténtico de ${cap}.`, link: `https://www.google.com/maps/search/?api=1&query=mercado+${destEncoded}` },
      { type: '🏛️ Visita', time: '10:00', title: 'Monumento principal', desc: `El lugar más emblemático de ${cap}. Llega antes de las 11h para evitar las colas.`, link: `https://www.google.com/maps/search/?api=1&query=monumento+principal+${destEncoded}` },
      { type: '🍽️ Comida', time: '14:00', title: 'Restaurante histórico', desc: `Restaurante clásico con historia cerca del casco antiguo de ${cap}.`, link: `https://www.google.com/maps/search/?api=1&query=restaurante+historico+${destEncoded}` },
      { type: '🎨 Tarde', time: '16:00', title: 'Museo o galería', desc: `Elige el museo más representativo de la cultura de ${cap}. Máximo 2h para no saturarte.`, link: `https://www.google.com/maps/search/?api=1&query=museo+${destEncoded}` },
      { type: '🍷 Cena', time: '20:30', title: 'Taberna con historia', desc: `Cena en un local antiguo con décadas de historia en ${cap}. Sin reserva: llega antes de las 21h.`, link: `https://www.google.com/maps/search/?api=1&query=taberna+tradicional+${destEncoded}` },
    ]},
    { label: 'Excursión y naturaleza', emoji: '🚗', slots: [
      { type: '🥐 Desayuno', time: '08:00', title: 'Desayuno rápido', desc: 'Desayuno en el hotel. Hoy madrugas para aprovechar el día de excursión.', link: `https://www.google.com/maps/search/?api=1&query=desayuno+${destEncoded}` },
      { type: '🚗 Excursión', time: '09:00', title: `Ruta desde ${cap}`, desc: `Alquila coche o únete a una excursión organizada. El campo/costa cerca de ${cap} es impresionante.`, link: `https://www.google.com/maps/search/?api=1&query=excursion+${destEncoded}` },
      { type: '📸 Parada', time: '11:00', title: 'Punto panorámico', desc: 'Primera parada con vistas. Aquí es obligatorio salir del coche y hacer fotos.', link: `https://www.google.com/maps/search/?api=1&query=mirador+${destEncoded}` },
      { type: '🍽️ Comida', time: '13:30', title: 'Restaurante de pueblo', desc: 'Comida en un pueblo cercano. Pedid lo que tienen hoy, no la carta. Así se come bien.', link: `https://www.google.com/maps/search/?api=1&query=restaurante+rural+${destEncoded}` },
      { type: '🍷 Cena', time: '21:00', title: 'Cena merecida', desc: `Después de la excursión, una buena cena en ${cap}. Pide recomendación al hotel.`, link: `https://www.google.com/maps/search/?api=1&query=cena+${destEncoded}` },
    ]},
    { label: 'Despedida', emoji: '🏠', slots: [
      { type: '🥐 Desayuno', time: '09:00', title: 'Último desayuno', desc: `El último desayuno en ${cap}. Saboréalo. Pide lo que más te haya gustado de la semana.`, link: `https://www.google.com/maps/search/?api=1&query=desayuno+${destEncoded}` },
      { type: '🚶 Paseo', time: '10:30', title: 'Último paseo', desc: `Recorre los lugares que más te han gustado de ${cap}. La despedida merece un paseo tranquilo.`, link: `https://www.google.com/maps/search/?api=1&query=${destEncoded}` },
      { type: '🍽️ Comida', time: '13:30', title: 'La cena de despedida', desc: `Cena de despedida de ${cap}. Elige tu restaurante favorito del viaje o uno nuevo.`, link: `https://www.google.com/maps/search/?api=1&query=restaurante+${destEncoded}` },
      { type: '✈️ Vuelo', time: '17:00', title: 'Traslado al aeropuerto', desc: 'Traslado con tiempo. Los recuerdos van contigo, el equipaje también.', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${destEncoded}` },
    ]},
  ];

  const itinerary = Array.from({ length: Math.min(days, 12) }, (_, i) => {
    let t = themes[1]; // default culture
    if (i === 0) t = themes[0];
    else if (i === days - 1 && days > 1) t = themes[3];
    else if (i % 2 === 0) t = themes[2];

    return {
      day: i + 1,
      place: `${cap} – ${t.label}`,
      emoji: t.emoji,
      isSpecial: i === Math.floor(days / 2),
      slots: t.slots,
      tip: `Explora ${cap} con calma.`
    };
  });

  return {
    destination: `${days} días en ${cap}`,
    flag: '🌍',
    cover: `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80`,
    days,
    companions: 'Viajero',
    vibe: mood || 'Exploración y relax',
    budget: { total: '1.500€', flights: '300€', hotel: '90€/noche', daily: '60€/día' },
    weather: { temp: '25°C', icon: '🌤️', text: 'Clima agradable' },
    bestTime: 'Consulta temporada local',
    flights: [
      { airline: 'Busca vuelos', price: 'Ver precios', route: `MAD → ${cap.toUpperCase().slice(0,3)}`, duration: '-', link: `https://www.skyscanner.es/vuelos/mad/?destination=${destEncoded}` }
    ],
    hotels: [
      { name: hotelName, stars: '4★', price: '$$', vibe: 'Céntrico y moderno', link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName)}&group_adults=2` }
    ],
    itinerary,
    secretItinerary: [
      { day: '2', place: `Rincón especial en ${cap}`, emoji: '🤫', highlight: `El lugar que los locales no comparten con turistas en ${cap}.`, link: `https://www.google.com/maps/search/?api=1&query=lugares+secretos+${destEncoded}` }
    ]
  };
}
