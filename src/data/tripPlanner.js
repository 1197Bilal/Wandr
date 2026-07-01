export const SEARCH_EXAMPLES = [
  '6 días en Cagliari, playa chill y buena comida con mi chica',
  'Ruta por la Toscana en pareja, vino y atardeceres',
  'Japón en la época de los cerezos, cultura e izakayas',
  'Islandia, auroras boreales y paisajes únicos',
  'Costa Rica, naturaleza y aventura',
];

export async function generateQuestions(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Skip if input already has enough context
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

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const days = calculateDays(dates.start, dates.end);
  if (!apiKey) return buildGenericFallback(destination, days);

  const extras = (questions || []).map((q, i) => `${q}: ${answers[i] || ''}`).filter(Boolean).join('. ');

  const prompt = `Eres un planificador de viajes de lujo con conocimiento enciclopédico de destinos. El usuario pide:

PETICIÓN: "${destination}"
FECHAS: ${dates.start} a ${dates.end} (${days} días total)${extras ? `\nINFO EXTRA: ${extras}` : ''}

REGLAS CRÍTICAS:
1. Analiza la petición: identifica destinos, días en cada uno, actividades específicas pedidas (cena romántica, playa, coche, ferry, etc.)
2. Distribuye los días EXACTAMENTE como pide (ej: "6 días Cagliari + 3 Nápoles" = días 1-6 en Cagliari, 7-9 en Nápoles)
3. CRONOGRAMA HORA A HORA: cada día debe cubrir desde el desayuno (08:00) hasta las copas de noche (23:00+). Mínimo 7 slots por día.
4. Nombres REALES de cada sitio (restaurante, playa, bar, monumento). NADA genérico.
5. Adapta el MOOD: si pide "chill", el itinerario es relajado (playitas, aperitivos, no masas). Si pide "romantico", reserva restaurantes con vistas/atardecer.
6. Si hay una petición especial (cena romántica de sorpresa, excursión específica), ponla en el día concreto con campo "isSpecial: true" en ese día.
7. "destination": título corto (máx 5 palabras, NUNCA la petición literal del usuario).
8. Links Maps: https://www.google.com/maps/search/?api=1&query=NOMBRE+CIUDAD (espacios → +)
9. Links vuelos Skyscanner: https://www.skyscanner.es/vuelos/IATA_ORIGEN/IATA_DESTINO/ (ej: /mad/cag/)
10. Links Booking: https://www.booking.com/searchresults.html?ss=CIUDAD&checkin=${dates.start}&checkout=${dates.end}&group_adults=2

Devuelve ÚNICAMENTE este JSON (sin markdown, sin texto antes ni después):
{
  "destination": "Cerdeña y Nápoles",
  "flag": "🇮🇹",
  "cover": "https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=1200&q=80",
  "days": ${days},
  "companions": "En pareja",
  "vibe": "Playa chill y gastronomía",
  "budget": { "total": "2.200€", "flights": "380€", "hotel": "95€/noche", "daily": "75€/día" },
  "weather": { "temp": "29°C", "icon": "☀️", "text": "Mediterráneo soleado" },
  "bestTime": "Junio - Septiembre",
  "flights": [
    { "airline": "Vueling", "price": "~160€/persona", "route": "MAD → CAG", "duration": "2h30", "link": "https://www.skyscanner.es/vuelos/mad/cag/" },
    { "airline": "Ryanair", "price": "~70€/persona", "route": "CAG → NAP", "duration": "1h10", "link": "https://www.skyscanner.es/vuelos/cag/nap/" },
    { "airline": "Vueling", "price": "~140€/persona", "route": "NAP → MAD", "duration": "2h50", "link": "https://www.skyscanner.es/vuelos/nap/mad/" }
  ],
  "hotels": [
    { "name": "T Hotel Cagliari", "stars": "4★", "price": "$$", "vibe": "Diseño, piscina, romántico", "link": "https://www.booking.com/searchresults.html?ss=Cagliari&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" },
    { "name": "Grand Hotel Vesuvio", "stars": "5★", "price": "$$$", "vibe": "Lujo frente al mar", "link": "https://www.booking.com/searchresults.html?ss=Napoles&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" }
  ],
  "itinerary": [
    {
      "day": 1,
      "place": "Cagliari – Llegada y primera playa",
      "emoji": "🌴",
      "isSpecial": false,
      "slots": [
        { "type": "🥐 Desayuno", "time": "08:30", "title": "Caffè Svizzero", "desc": "Cornetto integrale y cappuccino cremoso. El más antiguo de la ciudad.", "link": "https://www.google.com/maps/search/?api=1&query=Caffe+Svizzero+Cagliari" },
        { "type": "📸 Mañana", "time": "10:00", "title": "Bastione di San Remy", "desc": "Vistas panorámicas al golfo de Cagliari. Ideal para fotos.", "link": "https://www.google.com/maps/search/?api=1&query=Bastione+San+Remy+Cagliari" },
        { "type": "☕ Café", "time": "11:30", "title": "Antico Caffè", "desc": "Pausa en la terraza. El favorito de los locales desde 1855.", "link": "https://www.google.com/maps/search/?api=1&query=Antico+Caffe+Cagliari" },
        { "type": "🍝 Comida", "time": "13:30", "title": "Trattoria Lillicu", "desc": "Malloreddus al ragù, culurgiones. Cocina sarda auténtica y sin masas.", "link": "https://www.google.com/maps/search/?api=1&query=Trattoria+Lillicu+Cagliari" },
        { "type": "🏖️ Playa", "time": "15:30", "title": "Spiaggia del Poetto", "desc": "8km de arena fina blanca. Alquila hamacas en el Lido. Agua turquesa.", "link": "https://www.google.com/maps/search/?api=1&query=Spiaggia+del+Poetto+Cagliari" },
        { "type": "🍷 Cena", "time": "20:30", "title": "Ristorante Dal Corsaro", "desc": "El mejor de Cagliari. Pasta fresca, pescado del día. Pide la bottarga.", "link": "https://www.google.com/maps/search/?api=1&query=Ristorante+Dal+Corsaro+Cagliari" },
        { "type": "🍹 Copas", "time": "23:00", "title": "Caffè Letterario", "desc": "Cócteles en terraza con vistas al mar. Aperol Spritz obligatorio.", "link": "https://www.google.com/maps/search/?api=1&query=Caffe+Letterario+Cagliari" }
      ],
      "tip": "Reserva Dal Corsaro con 2 días de antelación. Se llena siempre."
    }
  ],
  "secretItinerary": [
    { "day": "3", "place": "Cala Goloritzé", "emoji": "🤫", "highlight": "La cala más espectacular de Cerdeña y de las más bellas de Europa. Solo accesible a pie (2h de ruta entre encinas) o en barco desde Santa Maria Navarrese. Agua turquesa imposible. Ve temprano para evitar los 15 turistas que saben de ella.", "link": "https://www.google.com/maps/search/?api=1&query=Cala+Goloritze+Baunei" }
  ]
}

RECUERDA: el JSON de arriba es solo el FORMATO. Genera el contenido REAL para la petición del usuario: "${destination}". Genera los ${days} días completos con lugares específicos y reales de los destinos correctos.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 16000, responseMimeType: 'application/json' }
        })
      }
    );
    if (!res.ok) {
      console.error('Gemini API error:', res.status, await res.text());
      return buildGenericFallback(destination, days);
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(text);
    if (!parsed.itinerary?.length) throw new Error('Empty itinerary from AI');
    return parsed;
  } catch (err) {
    console.error('Plan generation failed:', err.message);
    return buildGenericFallback(destination, days);
  }
}

export async function editTripPlan(currentPlanJSON, userEditRequest) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Edita este itinerario JSON según la petición. Mantén todos los campos, solo cambia lo solicitado.\nJSON: ${JSON.stringify(currentPlanJSON)}\nCambio: "${userEditRequest}"\nDevuelve SOLO el JSON completo sin markdown.` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 16000, responseMimeType: 'application/json' }
      })
    }
  );
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  let text = data.candidates[0].content.parts[0].text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(text);
}

function calculateDays(start, end) {
  if (!start || !end) return 7;
  const diff = Math.abs(new Date(end) - new Date(start));
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return d > 0 ? d : 7;
}

// ─── FALLBACK DETALLADO ────────────────────────────────────────────────────────
function buildGenericFallback(destination, days) {
  const cityMatch = destination.match(/(?:en\s+|a\s+|para\s+|en\s)([A-ZÀ-ÿa-záéíóúñ]{4,})/i);
  const destName = cityMatch?.[1] || 'Cagliari';

  const dayTemplates = [
    {
      place: `${destName} – Llegada y primera inmersión`, emoji: '✈️',
      slots: [
        { type: '🥐 Desayuno', time: '09:00', title: 'Bar local del barrio', desc: 'Cappuccino y brioche. Siéntate en la barra como los locales.' },
        { type: '📸 Mañana', time: '10:30', title: 'Barrio histórico', desc: 'Primera paseo por el centro. Oriéntate sin prisa.' },
        { type: '☕ Café', time: '12:00', title: 'Café histórico de la plaza', desc: 'Pausa con vistas. El favorito de los locales.' },
        { type: '🍝 Comida', time: '13:30', title: 'Trattoria del mercado', desc: 'Menú del día con productos frescos locales.' },
        { type: '🏖️ Playa', time: '15:30', title: 'Playa principal', desc: 'Primer chapuzón. Alquila hamaca y desconecta.' },
        { type: '🍷 Cena', time: '20:30', title: 'Restaurante con terraza', desc: 'Pescado fresco con vistas al mar. Reserva imprescindible.' },
        { type: '🍹 Copas', time: '23:00', title: 'Bar de moda local', desc: 'Spritz o vino local. Pregunta al camarero qué bebes.' }
      ],
      tip: 'El primer día es para orientarse. No te agotes, que quedan muchos más.'
    },
    {
      place: `${destName} – Playas y relax total`, emoji: '🌴',
      slots: [
        { type: '🥐 Desayuno', time: '09:00', title: 'Café en la playa', desc: 'Desayuno con vistas al mar. La mejor forma de empezar.' },
        { type: '🏖️ Mañana', time: '10:00', title: 'Cala secreta', desc: 'A 20 min en coche. Agua turquesa sin masas de turistas.' },
        { type: '🍝 Comida', time: '14:00', title: 'Restaurante chiringuito', desc: 'Frittura di pesce y ensalada. Fresco y local.' },
        { type: '☕ Café', time: '16:00', title: 'Helado artesano', desc: 'Gelateria local. Pide el sabor de temporada.' },
        { type: '🚶 Tarde', time: '17:30', title: 'Paseo por el puerto', desc: 'Aperitivo viendo los barcos. Sin prisa.' },
        { type: '🍷 Cena', time: '20:30', title: 'Cocina sarda auténtica', desc: 'Malloreddus y queso pecorino. Pide el vino Vermentino.' },
        { type: '🍹 Copas', time: '22:30', title: 'Terraza con atardecer tardío', desc: 'Limoncello de digestivo. El cielo se pone rojo.' }
      ],
      tip: 'Las mejores calas se llenan a las 11h. Sal antes para coger sitio.'
    }
  ];

  const itinerary = Array.from({ length: Math.min(days, 9) }, (_, i) => ({
    day: i + 1,
    ...dayTemplates[i % dayTemplates.length],
    place: i < 6 ? dayTemplates[i % 2].place : `Nápoles – Día ${i - 5}`,
    emoji: i < 6 ? (i === 0 ? '✈️' : '🌴') : '🏛️',
    isSpecial: i === 4, // day 5 as special romantic dinner
    slots: dayTemplates[i % dayTemplates.length].slots.map(s => ({
      ...s,
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.title + ' ' + (i < 6 ? destName : 'Napoles'))}`
    }))
  }));

  if (itinerary[4]) {
    itinerary[4].place = `${destName} – Noche especial romántica`;
    itinerary[4].slots[5] = {
      type: '🍷 Cena especial', time: '20:30',
      title: 'Restaurante con vistas al atardecer',
      desc: 'Mesa reservada con vista al mar. La noche de la viaje. Lleva flores.',
      link: `https://www.google.com/maps/search/?api=1&query=restaurante+romantico+${destName}`
    };
  }

  return {
    destination: `${days} días en ${destName} e Italia`,
    flag: '🇮🇹',
    cover: 'https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=1200&q=80',
    days, companions: 'En pareja', vibe: 'Playa chill y gastronomía',
    budget: { total: '2.000€', flights: '380€', hotel: '90€/noche', daily: '70€/día' },
    weather: { temp: '29°C', icon: '☀️', text: 'Mediterráneo soleado' },
    bestTime: 'Junio - Septiembre',
    flights: [
      { airline: 'Vueling / Ryanair', price: '~160€', route: `MAD → ${destName}`, duration: '~2h30', link: 'https://www.skyscanner.es/vuelos/mad/cag/' }
    ],
    hotels: [
      { name: `T Hotel ${destName}`, stars: '4★', price: '$$', vibe: 'Diseño y piscina', link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destName)}&group_adults=2` }
    ],
    itinerary,
    secretItinerary: [
      { day: '3', place: 'Cala Goloritzé', emoji: '🤫', highlight: 'La cala más espectacular de Cerdeña. Solo accesible a pie (2h) o en barco desde Santa Maria Navarrese. Ve a las 8h para llegar solos.', link: 'https://www.google.com/maps/search/?api=1&query=Cala+Goloritze+Baunei' },
      { day: '7', place: 'Spaccanapoli de noche', emoji: '🕯️', highlight: 'La calle más auténtica de Nápoles vacía de turistas. A las 22h el barrio es de los napolitanos. Pizza en Da Michele, la más antigua de la ciudad.', link: 'https://www.google.com/maps/search/?api=1&query=Spaccanapoli+Napoli' }
    ]
  };
}
