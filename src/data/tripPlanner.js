export const SEARCH_EXAMPLES = [
  '6 días en Cagliari, playa y buena comida',
  'Ruta por la Toscana con mi pareja',
  'Japón en la época de los cerezos',
  'Islandia auroras boreales',
  'Costa Rica aventura y naturaleza',
];

export async function generateQuestions(userInput) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Skip questions if the input already has enough context
  const hasContext = userInput.trim().length > 50 && (
    /novia|chica|pareja|amigo|familia|solo\b|noche|día|dia/i.test(userInput)
  );
  if (hasContext || !apiKey) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `El usuario quiere viajar: "${userInput}". Genera 1 o 2 preguntas CORTAS sobre lo que NO mencionó (compañía, presupuesto o estilo). Si ya está todo claro, devuelve []. Solo JSON array de strings, sin markdown.` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150, responseMimeType: 'application/json' }
        })
      }
    );
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function generateTripPlan(destination, dates, questions, answers) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const days = calculateDays(dates.start, dates.end);

  if (!apiKey) return buildGenericFallback(destination, days);

  const extras = (questions || []).map((q, i) => `${q}: ${answers[i] || ''}`).filter(Boolean).join('. ');

  const prompt = `Eres un experto planificador de viajes. El usuario pide:
"${destination}"
Fechas: ${dates.start} a ${dates.end} (${days} días total)${extras ? `\nInfo extra: ${extras}` : ''}

Genera un itinerario JSON completo y detallado con lugares REALES. Sigue estas reglas:
- Si menciona ruta multi-destino (ej: "Cagliari 6 días, Nápoles 3 días"), distribuye los días exactamente así.
- Incorpora actividades específicas mencionadas (cena romántica al atardecer, alquilar coche, playa chill, ferry, etc.) en el día correcto.
- Cada slot debe tener nombre REAL del lugar/restaurante/bar. Descripción ≤5 palabras.
- "destination": título corto limpio, máx 5 palabras (ej: "Cerdeña y Nápoles"). NUNCA copies la petición.
- "companions": 2-3 palabras (ej: "En pareja").
- "vibe": 2-4 palabras (ej: "Playa y relax").
- Hotel "name": nombre REAL de hotel, no la petición del usuario.
- Link Maps: https://www.google.com/maps/search/?api=1&query=NombreLugar+Ciudad (sustituye espacios por +)
- Link vuelos: https://www.skyscanner.es/vuelos/mad/IATA3LETRAS/ (ej: /mad/cag/ para Cagliari, /mad/nap/ para Nápoles)
- Link hotel Booking: https://www.booking.com/searchresults.html?ss=Ciudad&checkin=${dates.start}&checkout=${dates.end}&group_adults=2

Devuelve SOLO este JSON (sin markdown, sin comentarios, comillas dobles en todos los campos):
{"destination":"${days} días en Italia","flag":"🇮🇹","cover":"https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=1200&q=80","days":${days},"companions":"En pareja","vibe":"Playa y relax","budget":{"total":"2.000€","flights":"350€","hotel":"90€/noche","daily":"70€/día"},"weather":{"temp":"28°C","icon":"☀️","text":"Mediterráneo soleado"},"bestTime":"Junio - Septiembre","flights":[{"airline":"Vueling","price":"~150€","route":"MAD → CAG","duration":"2h30","link":"https://www.skyscanner.es/vuelos/mad/cag/"},{"airline":"Ryanair","price":"~80€","route":"CAG → NAP","duration":"1h15","link":"https://www.skyscanner.es/vuelos/cag/nap/"}],"hotels":[{"name":"T Hotel Cagliari","stars":"4★","price":"$$","vibe":"Diseño y piscina","link":"https://www.booking.com/searchresults.html?ss=Cagliari&checkin=${dates.start}&checkout=${dates.end}&group_adults=2"},{"name":"Grand Hotel Vesuvio","stars":"5★","price":"$$$","vibe":"Lujo frente al mar","link":"https://www.booking.com/searchresults.html?ss=Napoles&checkin=${dates.start}&checkout=${dates.end}&group_adults=2"}],"itinerary":[{"day":1,"place":"Cagliari - Llegada y primera playa","emoji":"🌴","slots":[{"type":"🥐 Desayuno","title":"Caffè Svizzero","desc":"Croissant y cappuccino","link":"https://www.google.com/maps/search/?api=1&query=Caffe+Svizzero+Cagliari"},{"type":"📸 Mañana","title":"Bastione di San Remy","desc":"Vistas al mar y la ciudad","link":"https://www.google.com/maps/search/?api=1&query=Bastione+San+Remy+Cagliari"},{"type":"☕ Café","title":"Antico Caffè","desc":"El más histórico de Cagliari","link":"https://www.google.com/maps/search/?api=1&query=Antico+Caffe+Cagliari"},{"type":"🍝 Comida","title":"Ristorante Dal Corsaro","desc":"Pasta sarda auténtica","link":"https://www.google.com/maps/search/?api=1&query=Dal+Corsaro+Cagliari"},{"type":"🏖️ Tarde","title":"Playa Poetto","desc":"8km de arena blanca","link":"https://www.google.com/maps/search/?api=1&query=Spiaggia+Poetto+Cagliari"},{"type":"🍷 Cena","title":"Ristorante Lillicu","desc":"Cocina sarda con vistas","link":"https://www.google.com/maps/search/?api=1&query=Ristorante+Lillicu+Cagliari"},{"type":"🍹 Copas","title":"Caffè Letterario","desc":"Cócteles frente al mar","link":"https://www.google.com/maps/search/?api=1&query=Caffe+Letterario+Cagliari"}],"tip":"Reserva Dal Corsaro con antelación, es el mejor de la ciudad."}],"secretItinerary":[{"day":"3","place":"Cala Goloritzé","emoji":"🤫","highlight":"La cala más bella de Italia. Solo a pie (2h) o en barco desde Santa Maria Navarrese."}]}

IMPORTANTE: El JSON de arriba es un EJEMPLO de estructura y formato. Genera el contenido REAL basado en la petición del usuario, no copies estos valores. Genera los ${days} días completos con lugares reales de Cagliari y Nápoles.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' }
        })
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error('API Error:', res.status, errText);
      return buildGenericFallback(destination, days);
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(text);
    // Ensure days count is correct
    if (!parsed.itinerary || parsed.itinerary.length === 0) throw new Error('Empty itinerary');
    return parsed;
  } catch (error) {
    console.error('Plan generation error:', error);
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
        contents: [{ parts: [{ text: `Edita este itinerario JSON: ${JSON.stringify(currentPlanJSON)}\n\nCambio: "${userEditRequest}"\n\nDevuelve SOLO el JSON completo actualizado sin markdown.` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' }
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

// ─── FALLBACK (only used if API fails) ───────────────────────────────────────
function buildGenericFallback(destination, days) {
  // Extract clean destination name (first recognizable city/place)
  const cityMatch = destination.match(/(?:en\s+|a\s+|para\s+)([A-ZÀ-ÿa-záéíóúñ]+)/i);
  const destName = cityMatch ? cityMatch[1] : destination.trim().split(/\s+/).find(w => w.length > 3) || 'Italia';

  const itinerary = [];
  for (let i = 1; i <= Math.min(days, 10); i++) {
    itinerary.push({
      day: i,
      place: i === 1 ? `${destName} - Llegada` : i <= 6 ? `${destName} - Día ${i}` : `Nápoles - Día ${i - 6}`,
      emoji: i === 1 ? '✈️' : i <= 6 ? '🌴' : '🏛️',
      slots: [
        { type: '🥐 Desayuno', title: 'Café local de barrio', desc: 'Cornetto y cappuccino', link: `https://www.google.com/maps/search/?api=1&query=bar+colazione+${destName}` },
        { type: '📸 Mañana', title: 'Visita o playa', desc: 'Explorar la zona', link: `https://www.google.com/maps/search/?api=1&query=playas+${destName}` },
        { type: '☕ Café', title: 'Pausa café', desc: 'Descanso a la sombra', link: `https://www.google.com/maps/search/?api=1&query=cafe+${destName}` },
        { type: '🍝 Comida', title: 'Restaurante local', desc: 'Gastronomía sarda/italiana', link: `https://www.google.com/maps/search/?api=1&query=restaurante+${destName}` },
        { type: '🏖️ Tarde', title: 'Playa o paseo', desc: 'Relax junto al mar', link: `https://www.google.com/maps/search/?api=1&query=playa+${destName}` },
        { type: '🍷 Cena', title: 'Cena romántica', desc: 'Con vistas al atardecer', link: `https://www.google.com/maps/search/?api=1&query=restaurante+romantico+${destName}` },
        { type: '🍹 Copas', title: 'Bar con ambiente', desc: 'Cócteles al fresco', link: `https://www.google.com/maps/search/?api=1&query=cocktail+bar+${destName}` }
      ],
      tip: i === 1 ? 'Descansa y aclimatate al ritmo mediterráneo.' : 'Busca restaurantes de menú del día, son más baratos y auténticos.'
    });
  }

  return {
    destination: `${days} días en ${destName}`,
    flag: '🇮🇹',
    cover: 'https://images.unsplash.com/photo-1553697388-94e804e2f0f6?w=1200&q=80',
    days, companions: 'En pareja', vibe: 'Playa y relax',
    budget: { total: '1.800€', flights: '350€', hotel: '85€/noche', daily: '65€/día' },
    weather: { temp: '28°C', icon: '☀️', text: 'Mediterráneo soleado' },
    bestTime: 'Junio - Septiembre',
    flights: [
      { airline: 'Vueling / Ryanair', price: 'Ver precios', route: `MAD → ${destName}`, duration: '~2h30', link: `https://www.skyscanner.es/vuelos/mad/` }
    ],
    hotels: [
      { name: `Hoteles en ${destName}`, stars: '4★', price: '$$', vibe: 'Céntrico y con encanto', link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destName)}&group_adults=2` }
    ],
    itinerary,
    secretItinerary: [{ day: '3', place: 'Cala Goloritzé', emoji: '🤫', highlight: 'La cala más espectacular de Cerdeña. Solo accesible a pie (2h) o en barco.' }]
  };
}
