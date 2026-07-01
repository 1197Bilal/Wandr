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
7. FILTRO SEMÁNTICO: Identifica el destino real (país o ciudad) introducido. Ignora palabras como "dinero", "barato", "lujo" a la hora de nombrar el destino.
8. COHERENCIA GEOGRÁFICA Y CULTURAL ABSOLUTA: Prohibido mezclar ciudades, países o continentes. Todo el contenido (hoteles, playas, comida, vuelos) debe ser estrictamente del destino elegido y logísticamente posible.
9. CRÍTICO: Debes generar exactamente el número de días solicitados: ${days} días. Ni uno menos ni uno más.
10. Links Booking directos al hotel: https://www.booking.com/searchresults.html?ss=NOMBRE+HOTEL&checkin=${dates.start}&checkout=${dates.end}&group_adults=2 (usa SOLO el nombre del hotel en el parámetro ss, reemplazando espacios por +)
11. Vuelos multi-destino: si hay vuelos intermedios, calcula la fecha exacta sumando los días correspondientes desde el inicio (${dates.start}) para ponerla en la descripción o enlace del vuelo.

Devuelve ÚNICAMENTE este JSON (sin markdown, sin texto antes ni después). El JSON de abajo es SOLO UN EJEMPLO DE ESTRUCTURA. DEBES rellenarlo con datos reales del destino:
{
  "destination": "Nombre del Destino Real",
  "flag": "🌍",
  "cover": "https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=1200&q=80",
  "days": ${days},
  "companions": "En pareja",
  "vibe": "El ambiente del viaje",
  "budget": { "total": "2.200€", "flights": "380€", "hotel": "95€/noche", "daily": "75€/día" },
  "weather": { "temp": "29°C", "icon": "☀️", "text": "Clima típico" },
  "bestTime": "Meses ideales",
  "flights": [
    { "airline": "Aerolínea Real", "price": "~160€/persona", "route": "MAD → IATA_DEST", "duration": "xhxx", "link": "https://www.skyscanner.es/vuelos/mad/iata/" }
  ],
  "hotels": [
    { "name": "Nombre Hotel Real 1", "stars": "4★", "price": "$$", "vibe": "Céntrico", "link": "https://www.booking.com/searchresults.html?ss=Nombre+Hotel+Real+1&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" }
  ],
  "itinerary": [
    {
      "day": 1,
      "place": "Nombre de la ciudad – Llegada",
      "emoji": "🌴",
      "isSpecial": false,
      "slots": [
        { "type": "🥐 Desayuno", "time": "08:30", "title": "Nombre de Cafetería Real", "desc": "Descripción real.", "link": "https://www.google.com/maps/search/?api=1&query=Cafeteria+Real+Ciudad" },
        { "type": "📸 Mañana", "time": "10:00", "title": "Monumento Real", "desc": "Descripción de la visita.", "link": "https://www.google.com/maps/search/?api=1&query=Monumento+Real+Ciudad" }
      ],
      "tip": "Consejo real para este día."
    }
  ],
  "secretItinerary": [
    { "day": "3", "place": "Lugar Secreto Real", "emoji": "🤫", "highlight": "Por qué es secreto.", "link": "https://www.google.com/maps/search/?api=1&query=Lugar+Secreto+Ciudad" }
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
    
    // Robust JSON extraction
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }
    
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
        contents: [{ parts: [{ text: `Edita este itinerario JSON según la petición. Mantén TODOS los campos y la estructura exacta, solo cambia lo solicitado en el interior.\nJSON original: ${JSON.stringify(currentPlanJSON)}\nCambio solicitado: "${userEditRequest}"\nCRÍTICO: Devuelve ÚNICAMENTE el JSON actualizado sin bloques de código markdown (\`\`\`), sin comentarios, y que sea 100% válido para JSON.parse().` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 16000, responseMimeType: 'application/json' }
      })
    }
  );
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Robust JSON extraction
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  if (startIndex !== -1 && endIndex !== -1) {
    text = text.substring(startIndex, endIndex + 1);
  } else {
    text = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```\n?/g, '').trim();
  }
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse edited JSON:", text);
    throw err;
  }
}

function calculateDays(start, end) {
  if (!start || !end) return 7;
  const diff = Math.abs(new Date(end) - new Date(start));
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return d > 0 ? d : 7;
}

function buildGenericFallback(destination, days) {
  // Extract a clean destination name from user input
  const words = destination.trim().split(/\s+/);
  const stopWords = ['quiero','viajar','dias','dinero','barato','caro','poco','mucho','con','para','en','a','el','la','los','las','un','una','muy','ir','visitar'];
  const possibleDests = words.filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2 && !/\d/.test(w));
  
  // Pick capitalized word, or first non-stopword, or fallback
  let destName = possibleDests.find(w => /^[A-ZÀ-Ÿ]/.test(w)) || possibleDests[0] || 'tu destino';
  let cleanDest = destName.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  cleanDest = cleanDest.charAt(0).toUpperCase() + cleanDest.slice(1).toLowerCase();

  const hotelName = `Hotel Boutique ${cleanDest}`;

  const dayTemplates = [
    {
      place: `${cleanDest} – Llegada y primera inmersión`, emoji: '✈️',
      slots: [
        { type: '🥐 Desayuno', time: '09:00', title: 'Bar local', desc: 'Desayuno típico de la zona para empezar bien el día.' },
        { type: '📸 Mañana', time: '10:30', title: 'Centro histórico', desc: 'Paseo de reconocimiento por los lugares principales.' },
        { type: '☕ Café', time: '12:00', title: 'Café histórico', desc: 'Pausa en una plaza céntrica con mucho ambiente.' },
        { type: '🍝 Comida', time: '13:30', title: 'Restaurante tradicional', desc: 'Prueba la especialidad local del lugar.' },
        { type: '🏖️ Tarde', time: '15:30', title: 'Punto panorámico', desc: 'Las mejores vistas de la ciudad al caer la tarde.' },
        { type: '🍷 Cena', time: '20:30', title: 'Cena con vistas', desc: 'Restaurante recomendado para una noche perfecta.' },
        { type: '🍹 Copas', time: '23:00', title: 'Bar de moda', desc: 'El mejor ambiente nocturno para terminar el día.' }
      ],
      tip: 'El primer día es para orientarse. Toma las cosas con calma.'
    },
    {
      place: `Explorando ${cleanDest}`, emoji: '🗺️',
      slots: [
        { type: '🥐 Desayuno', time: '09:00', title: 'Cafetería de especialidad', desc: 'Un buen café antes de la aventura.' },
        { type: '📸 Mañana', time: '10:00', title: 'Excursión o Visita clave', desc: 'Actividad principal recomendada de la zona.' },
        { type: '🍝 Comida', time: '14:00', title: 'Comida local', desc: 'Restaurante alejado de las zonas más turísticas.' },
        { type: '☕ Café', time: '16:00', title: 'Dulce local', desc: 'Prueba el postre típico del destino.' },
        { type: '🚶 Tarde', time: '17:30', title: 'Paseo y compras', desc: 'Recorrido por las calles más comerciales o artesanales.' },
        { type: '🍷 Cena', time: '20:30', title: 'Cena auténtica', desc: 'Gastronomía pura en un local familiar.' },
        { type: '🍹 Copas', time: '22:30', title: 'Terraza o Rooftop', desc: 'Vistas nocturnas de la ciudad.' }
      ],
      tip: 'Madruga para visitar los puntos más populares sin multitudes.'
    }
  ];

  const itinerary = Array.from({ length: Math.min(days, 12) }, (_, i) => ({
    day: i + 1,
    ...dayTemplates[i % dayTemplates.length],
    place: i === 0 ? dayTemplates[0].place : `Día ${i + 1} en ${cleanDest}`,
    emoji: i === 0 ? '✈️' : '🗺️',
    isSpecial: i === Math.floor(days / 2), 
    slots: dayTemplates[i % dayTemplates.length].slots.map(s => ({
      ...s,
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.title + ' ' + cleanDest)}`
    }))
  }));

  if (itinerary.length > 2) {
    const specialDay = Math.floor(days / 2);
    itinerary[specialDay].place = `${cleanDest} – Día especial`;
    itinerary[specialDay].slots[5] = {
      type: '🍷 Cena especial', time: '20:30',
      title: 'Restaurante TOP',
      desc: 'El mejor lugar para una cena inolvidable.',
      link: `https://www.google.com/maps/search/?api=1&query=mejor+restaurante+${encodeURIComponent(cleanDest)}`
    };
  }

  return {
    destination: `${days} días en ${cleanDest}`,
    flag: '🌍',
    cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    days, companions: 'En pareja / Amigos', vibe: 'Exploración y Relax',
    budget: { total: '1.500€', flights: '300€', hotel: '90€/noche', daily: '60€/día' },
    weather: { temp: '25°C', icon: '🌤️', text: 'Clima agradable' },
    bestTime: 'Todo el año',
    flights: [
      { airline: 'Buscador de vuelos', price: 'Ver precios', route: `Vuelos a ${cleanDest}`, duration: '-', link: `https://www.skyscanner.es/` }
    ],
    hotels: [
      { name: hotelName, stars: '4★', price: '$$', vibe: 'Céntrico y moderno', link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName)}&group_adults=2` }
    ],
    itinerary,
    secretItinerary: [
      { day: '2', place: `Rincón secreto en ${cleanDest}`, emoji: '🤫', highlight: 'Ese lugar especial que no sale en las guías turísticas pero que los locales aman.', link: `https://www.google.com/maps/search/?api=1&query=rincon+secreto+${encodeURIComponent(cleanDest)}` }
    ]
  };
}
