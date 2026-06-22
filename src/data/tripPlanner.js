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

  // Skip questions if input is detailed enough
  const seemsDetailed = userInput.trim().length > 60 && (
    userInput.includes('día') || userInput.includes('dia') || userInput.includes('noche') ||
    userInput.includes('novia') || userInput.includes('amigo') || userInput.includes('familia') ||
    userInput.includes('solo') || userInput.includes('pareja')
  );
  if (seemsDetailed || !apiKey) return [];

  const prompt = `El usuario escribió: "${userInput}"

Si la descripción ya incluye destino, estilo y compañía, devuelve [].
Si falta algo esencial, devuelve SOLO 1-2 preguntas muy cortas.
Formato JSON: [] o ["pregunta1"] o ["pregunta1", "pregunta2"]`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 100, responseMimeType: 'application/json' }
      })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const days = calculateDays(dates.start, dates.end);

  if (!apiKey) return buildGenericFallback(destination, days);

  const qaPairs = (questions || []).map((q, i) => `${q}: ${answers[i]}`).filter(s => s).join(' | ');

  const prompt = `Eres un experto planificador de viajes. Genera un itinerario JSON para esta petición.

PETICIÓN DEL USUARIO: "${destination}"
FECHAS: ${dates.start} → ${dates.end} (${days} días)${qaPairs ? `\nINFO EXTRA: ${qaPairs}` : ''}

⚠️ REGLAS ESTRICTAS — LEE ANTES DE GENERAR:
- "destination": título CORTO y LIMPIO (máx 5 palabras). Ej: "Cerdeña & Nápoles". NUNCA copies la petición del usuario.
- "companions": máx 3 palabras. Ej: "En pareja".
- "vibe": máx 4 palabras. Ej: "Playa y relax".
- "name" de hotel: nombre REAL del hotel. NUNCA la petición del usuario.
- "place" de cada día: ciudad + descripción breve (ej: "Cagliari - Llegada"). NUNCA la petición.
- Rutas multi-destino: distribuye días exactamente como pide (ej: 6 días Cagliari, 3 Nápoles).
- Actividades mencionadas (cena romántica, alquilar coche, ferry, playa chill): ponlas en el día correcto.
- Nombres REALES de restaurantes, cafés y bares. Descripciones ≤5 palabras.
- Links Maps: https://www.google.com/maps/search/?api=1&query=NOMBRE+CIUDAD (espacios → +)
- Links vuelos Skyscanner (funcionan con fechas): https://www.skyscanner.es/vuelos/mad/cag/${dates.start.replace(/-/g, '')}/${dates.end.replace(/-/g, '')}/ (sustituye cag por el IATA de 3 letras del destino)
- Links hotel Booking (funcionan con fechas y ciudad): https://www.booking.com/searchresults.html?ss=CIUDAD&checkin=${dates.start}&checkout=${dates.end}&group_adults=2 (CIUDAD = solo nombre sin acentos, ej: ss=Cagliari)

JSON sin markdown:
{
  "destination": "Título corto limpio",
  "flag": "🇮🇹",
  "cover": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
  "days": ${days},
  "companions": "En pareja",
  "vibe": "Playa y relax",
  "budget": { "total": "1.800€", "flights": "350€", "hotel": "90€/noche", "daily": "60€/día" },
  "weather": { "temp": "28°C", "icon": "☀️", "text": "Mediterráneo soleado" },
  "bestTime": "Junio - Septiembre",
  "flights": [
    { "airline": "Vueling", "price": "~150€", "route": "MAD → CAG", "duration": "2h30", "link": "https://www.skyscanner.es/vuelos/mad/cag/${dates.start.replace(/-/g, '')}/${dates.end.replace(/-/g, '')}/" },
    { "airline": "Ryanair", "price": "~80€", "route": "CAG → NAP", "duration": "1h15", "link": "https://www.skyscanner.es/vuelos/cag/nap/" }
  ],
  "hotels": [
    { "name": "T Hotel Cagliari", "stars": "4★", "price": "$$", "vibe": "Romántico con piscina", "link": "https://www.booking.com/searchresults.html?ss=Cagliari&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" },
    { "name": "Hotel Royal Continental Napoli", "stars": "4★", "price": "$$", "vibe": "Vistas al mar", "link": "https://www.booking.com/searchresults.html?ss=Napoles&checkin=${dates.start}&checkout=${dates.end}&group_adults=2" }
  ],
  "itinerary": [
    { "day": 1, "place": "Cagliari - Llegada y relax", "emoji": "🌴",
      "slots": [
        { "type": "🥐 Desayuno", "title": "Caffè Torino", "desc": "Cornetto y cappuccino", "link": "https://www.google.com/maps/search/?api=1&query=Caffe+Torino+Cagliari" },
        { "type": "📸 Mañana", "title": "Bastione di San Remy", "desc": "Vistas panorámicas", "link": "https://www.google.com/maps/search/?api=1&query=Bastione+San+Remy+Cagliari" },
        { "type": "☕ Café", "title": "Antico Caffè", "desc": "El más histórico de Cagliari", "link": "https://www.google.com/maps/search/?api=1&query=Antico+Caffe+Cagliari" },
        { "type": "🍝 Comida", "title": "Ristorante Dal Corsaro", "desc": "Pasta fresca sarda", "link": "https://www.google.com/maps/search/?api=1&query=Ristorante+Dal+Corsaro+Cagliari" },
        { "type": "🚶 Tarde", "title": "Playa Poetto", "desc": "8km de arena blanca", "link": "https://www.google.com/maps/search/?api=1&query=Spiaggia+del+Poetto+Cagliari" },
        { "type": "🍷 Cena", "title": "Su Tzilleri e Su Bundu", "desc": "Gastronomía sarda auténtica", "link": "https://www.google.com/maps/search/?api=1&query=Su+Tzilleri+e+Su+Bundu+Cagliari" },
        { "type": "🍹 Copas", "title": "Caffè Letterario", "desc": "Cócteles con vistas al mar", "link": "https://www.google.com/maps/search/?api=1&query=Caffe+Letterario+Cagliari" }
      ], "tip": "Reserva mesa para cenar, se llena siempre." }
  ],
  "secretItinerary": [ { "day": "3", "place": "Cala Goloritzé", "emoji": "🤫", "highlight": "La cala más bella de Italia, solo accesible a pie o en barco." } ]
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
      })
    });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating plan:', error);
    return buildGenericFallback(destination, days);
  }
}

export async function editTripPlan(currentPlanJSON, userEditRequest) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const prompt = `Edita este itinerario JSON según lo que pide el usuario.
JSON actual: ${JSON.stringify(currentPlanJSON)}
Cambio solicitado: "${userEditRequest}"
Devuelve SOLO el JSON completo actualizado, sin markdown.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  let text = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

function calculateDays(start, end) {
  if (!start || !end) return 7;
  const diff = Math.abs(new Date(end) - new Date(start));
  const d = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return d > 0 ? d : 7;
}

function buildGenericFallback(destination, days) {
  const destName = destination.trim().split(' ').slice(0, 3).join(' ') || 'Italia';
  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      day: i,
      place: i === 1 ? `${destName} - Llegada` : `Día ${i} en ${destName}`,
      emoji: i === 1 ? '✈️' : '🗺️',
      slots: [
        { type: '🥐 Desayuno', title: 'Café local', desc: 'Desayuno tradicional', link: `https://www.google.com/maps/search/?api=1&query=cafe+${destName}` },
        { type: '📸 Mañana', title: 'Visita principal', desc: 'Monumento o playa', link: `https://www.google.com/maps/search/?api=1&query=que+ver+${destName}` },
        { type: '🍝 Comida', title: 'Restaurante local', desc: 'Cocina típica', link: `https://www.google.com/maps/search/?api=1&query=restaurantes+${destName}` },
        { type: '🚶 Tarde', title: 'Explorar barrio', desc: 'Paseo y tiendas', link: `https://www.google.com/maps/search/?api=1&query=centro+${destName}` },
        { type: '🍷 Cena', title: 'Cena con vistas', desc: 'Cocina italiana', link: `https://www.google.com/maps/search/?api=1&query=cenar+${destName}` },
        { type: '🍹 Copas', title: 'Bar de moda', desc: 'Ambiente nocturno', link: `https://www.google.com/maps/search/?api=1&query=bares+${destName}` }
      ],
      tip: i === 1 ? 'Tómatelo con calma el primer día.' : 'Usa transporte público o alquila bici.'
    });
  }
  return {
    destination: destName, flag: '🇮🇹',
    cover: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
    days, companions: 'En pareja', vibe: 'Cultura y relax',
    budget: { total: '1.500€', flights: '300€', hotel: '80€/noche', daily: '60€/día' },
    weather: { temp: '26°C', icon: '☀️', text: 'Mediterráneo' },
    bestTime: 'Primavera y verano',
    flights: [{ airline: 'Skyscanner', price: 'Ver precios', route: `Vuelos a ${destName}`, duration: '-', link: `https://www.skyscanner.es/` }],
    hotels: [{ name: `Hoteles en ${destName}`, stars: '4★', price: '$$', vibe: 'Céntrico', link: `https://www.booking.com/searchresults.html?ss=${destName}&group_adults=2` }],
    itinerary,
    secretItinerary: [{ day: '2', place: 'Rincón secreto local', emoji: '🤫', highlight: 'Pregunta en el hotel, los locales saben.' }]
  };
}
