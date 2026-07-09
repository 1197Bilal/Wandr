export const SEARCH_EXAMPLES = [
  '6 días en Cagliari, playa chill y buena comida con mi chica',
  'Ruta por la Toscana en pareja, vino y atardeceres',
  'Japón en la época de los cerezos, cultura e izakayas',
  'Islandia, auroras boreales y paisajes únicos',
  'Costa Rica, naturaleza y aventura',
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAY_THEMES = [
  'LLEGADA_Y_PRIMERA_IMPRESION',
  'CULTURA_E_HISTORIA',
  'NATURALEZA_Y_AVENTURA',
  'GASTRONOMIA_LOCAL',
  'RELAX_Y_ZONAS_VIP',
  'VIDA_NOCTURNA_Y_SOCIAL',
  'DESPEDIDA',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function calculateDays(start, end) {
  if (!start || !end) return 7;
  return Math.max(1, Math.ceil(Math.abs(new Date(end) - new Date(start)) / 86400000) + 1);
}

function assignThemes(days) {
  return Array.from({ length: days }, (_, i) => {
    if (i === 0) return DAY_THEMES[0];
    if (i === days - 1 && days > 1) return DAY_THEMES[6];
    return DAY_THEMES[1 + ((i - 1) % (DAY_THEMES.length - 2))];
  });
}

// ─── SYSTEM PROMPT BUILDER ────────────────────────────────────────────────────
function buildSystemPrompt({ segments, totalDays, mood, checkin, checkout }) {
  const segmentMap = segments.map((seg, i) => {
    const startDay = segments.slice(0, i).reduce((acc, s) => acc + s.days, 1);
    const endDay = startDay + seg.days - 1;
    return `- BLOQUE ${i + 1}: Días ${startDay}–${endDay} en "${seg.destination}" (${seg.days} días)${seg.transport_from_prev ? `\n  → TRANSPORTE DESDE BLOQUE ${i}: ${seg.transport_from_prev}` : ''}`;
  }).join('\n');

  return `Eres una agencia de viajes de lujo con conocimiento local profundo de cada destino.

DATOS CONFIRMADOS DEL VIAJE:
- MOOD: "${mood}"
- DURACIÓN TOTAL: EXACTAMENTE ${totalDays} días (${checkin} → ${checkout})
- ESTRUCTURA MULTI-DESTINO (NO NEGOCIABLE):
${segmentMap}

═══════════════════════════════════════════
REGLAS ABSOLUTAS — INCUMPLIR = JSON INVÁLIDO
═══════════════════════════════════════════

### REGLA 1 — CONTROL EXACTO DE DÍAS
- La suma de días de todos los bloques debe ser EXACTAMENTE ${totalDays}.
- Los días se indexan del 1 al ${totalDays} SIN SALTOS ni repeticiones.
- PROHIBIDO generar más o menos días de los especificados por bloque.

### REGLA 2 — SEGMENTACIÓN ESTRICTA POR BLOQUE
- Cada día pertenece a UN ÚNICO bloque/destino. No mezcles contenido entre bloques.
- Si el bloque es "Roma", todos los restaurantes, hoteles y actividades son de Roma.
- PROHIBIDO usar el nombre del país, continente o región como destino (nada de "Europa", "Italia Centro", "Toscana genérica").

### REGLA 3 — SLOT LOGÍSTICO OBLIGATORIO EN CAMBIOS DE BLOQUE
- El PRIMER día de cada bloque nuevo (excepto bloque 1) DEBE tener un slot con:
  - "type": "🚗 Traslado" (o ✈️/🚂 según el medio)
  - "time": primera hora del día
  - "title": nombre de la ruta real (ej: "Roma → Florencia por la A1")
  - "desc": duración real, paradas interesantes en ruta, tip de conducción
  - "precio_aprox": coste real del trayecto
- Si el usuario mencionó "coche", usa coche. Si mencionó "tren", usa tren. Si no especificó, elige el más lógico.

### REGLA 4 — CERO DATOS GENÉRICOS
- PROHIBIDO: "Hotel Boutique [Destino]", "Restaurante local", "Bar de moda", "Zona histórica".
- OBLIGATORIO: nombre propio real y verificable en ese destino específico.
- Para cada restaurante: nombre exacto + plato exacto + precio por persona.
- Para cada hotel: nombre real + por qué es el mejor para este viaje.
- Para cada actividad: nombre del lugar + dirección/barrio + qué hace único ese momento.

### REGLA 5 — VARIEDAD POR DÍA
- PROHIBIDO repetir tipo de actividad en días consecutivos del mismo bloque.
- Cada día del mismo bloque debe tener un "tema" distinto (cultura, gastronomía, barrio alternativo, naturaleza, noche, etc.)

═══════════════════════════════════════════
FORMATO JSON — DEVUELVE SOLO ESTO, NADA MÁS
═══════════════════════════════════════════

{
  "destination": "string corto del viaje completo (máx 6 palabras)",
  "is_multi_destination": true,
  "segments": [
    { "label": "nombre destino", "days_range": "1-3", "color": "#hex" }
  ],
  "flag": "emoji bandera país principal",
  "cover": "https://images.unsplash.com/photo-REAL?w=1200&q=80",
  "days": ${totalDays},
  "companions": "string",
  "vibe": "${mood}",
  "budget": {
    "total": "X.XXX€",
    "flights": "XXX€",
    "hotel": "XX€/noche",
    "daily": "XX€/día",
    "transport_between": "XXX€ (traslados entre destinos)"
  },
  "weather": { "temp": "XX°C", "icon": "emoji", "text": "descripción" },
  "bestTime": "meses ideales",
  "flights": [
    {
      "airline": "aerolínea real",
      "price": "~XXX€",
      "route": "MAD → IATA_PRIMER_DESTINO",
      "duration": "Xh Xm",
      "link": "https://www.skyscanner.es/vuelos/mad/IATA/",
      "note": "tip"
    }
  ],
  "hotels": [
    {
      "destination_block": "Nombre Destino A",
      "name": "Nombre Hotel Real en Destino A",
      "stars": "X★",
      "price": "XX€/noche",
      "nights": X,
      "vibe": "por qué este hotel",
      "highlight": "qué lo hace único",
      "link": "https://www.booking.com/searchresults.html?ss=NOMBRE_HOTEL&checkin=${checkin}&checkout=${checkout}&group_adults=2"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "destination_block": "Nombre Destino A",
      "theme": "LLEGADA_Y_PRIMERA_IMPRESION",
      "place": "Destino A – subtítulo único",
      "emoji": "✈️",
      "isSpecial": false,
      "why_unique": "qué hace este día irrepetible",
      "transport_tip": "cómo moverse este día concreto",
      "slots": [
        {
          "period": "mañana|tarde|noche",
          "type": "emoji Tipo",
          "time": "HH:MM",
          "title": "Nombre real del lugar",
          "address": "Barrio o calle",
          "desc": "Qué hacer/pedir/ver exactamente.",
          "plato_recomendado": "nombre del plato o null",
          "precio_aprox": "X€/persona",
          "link": "https://www.google.com/maps/search/?api=1&query=NOMBRE+DESTINO"
        }
      ],
      "tip": "Consejo insider real."
    }
  ],
  "secretItinerary": [
    {
      "day": 2,
      "destination_block": "Destino A",
      "place": "Nombre propio lugar secreto",
      "emoji": "🤫",
      "highlight": "Por qué es secreto y cómo llegar.",
      "link": "https://www.google.com/maps/search/?api=1&query=LUGAR+DESTINO"
    }
  ]
}`;
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

  if (!apiKey) return buildGenericFallback('tu destino', days, 'exploración general');

  // Step 1: Delegate intent parsing to AI (300 tokens, temp 0.1) — no fragile regex
  let destination = 'Europa';
  let mood = 'exploración general';
  let companions = 'viajero';
  let segments = [{ destination: 'Europa', days: days, transport_from_prev: null }];

  try {
    const parseRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analiza: "${rawInput}". Extrae la intención de viaje. Devuelve SOLO JSON válido sin markdown con esta estructura: {"destination":"nombre general del viaje","mood":"array de strings (chill, cultura, etc)","companions":"con quién viaja","segments":[{"destination":"Ciudad 1","days":X,"transport_from_prev":"tren/coche/vuelo o null si es el primero"}]}. IMPORTANTE: Divide los días totales (${days}) entre los destinos mencionados. Si no hay destinos múltiples, devuelve un solo segmento con ${days} días.` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300, responseMimeType: 'application/json' }
        })
      }
    );
    const parseData = await parseRes.json();
    const intent = JSON.parse(parseData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    if (intent.destination) destination = intent.destination;
    if (Array.isArray(intent.mood) && intent.mood.length) mood = intent.mood.join(', ');
    else if (typeof intent.mood === 'string' && intent.mood) mood = intent.mood;
    if (intent.companions) companions = intent.companions;
    if (intent.segments && Array.isArray(intent.segments) && intent.segments.length > 0) {
      segments = intent.segments;
    } else {
      segments = [{ destination: destination, days: days, transport_from_prev: null }];
    }
  } catch (err) {
    console.warn('Intent parse failed, using defaults:', err.message);
  }

  const extras = (questions || []).map((q, i) => `${q}: ${answers?.[i] || ''}`).filter(Boolean).join('. ');
  if (extras) mood += `. Contexto: ${extras}`;

  const prompt = buildSystemPrompt({
    segments,
    totalDays: days,
    mood,
    checkin: dates.start,
    checkout: dates.end,
  });

  // Step 2: Generate full plan
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
      console.error('Gemini API error:', res.status);
      return buildGenericFallback(destination, days, mood);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Robust JSON extraction
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

    const parsed = JSON.parse(text);
    if (!parsed.itinerary?.length) throw new Error('Empty itinerary');

    // Normalize slots: ensure link always exists
    parsed.itinerary = parsed.itinerary.map(day => ({
      ...day,
      slots: (day.slots || []).map(slot => ({
        ...slot,
        link: slot.link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.title + ' ' + destination)}`
      }))
    }));

    return parsed;
  } catch (err) {
    console.error('Plan generation failed:', err.message);
    return buildGenericFallback(destination, days, mood);
  }
}

// ─── EDIT TRIP PLAN ───────────────────────────────────────────────────────────
export async function editTripPlan(currentPlanJSON, userEditRequest) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return currentPlanJSON;

  try {
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
              text: `Eres editor de itinerarios. Viaje a "${currentPlanJSON.destination}".
JSON actual: ${JSON.stringify(slim)}
El usuario pide: "${userEditRequest}"
Aplica el cambio SOLO en campos relevantes. Mantén estructura exacta. Devuelve JSON completo sin markdown.`
            }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 10000, responseMimeType: 'application/json' }
        })
      }
    );

    if (!res.ok) return currentPlanJSON;

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

    const updated = JSON.parse(text);
    return {
      ...currentPlanJSON,
      vibe: updated.vibe || currentPlanJSON.vibe,
      itinerary: updated.itinerary || currentPlanJSON.itinerary,
      secretItinerary: updated.secretItinerary || currentPlanJSON.secretItinerary,
    };
  } catch (err) {
    console.error('Edit failed silently:', err.message);
    return currentPlanJSON;
  }
}

// ─── GENERIC FALLBACK (when AI fails) ────────────────────────────────────────
function buildGenericFallback(destination, days, mood) {
  const raw = (destination || 'tu destino').replace(/[^a-zA-ZÀ-ÿ\s]/g, '').replace(/\s+/g, ' ').trim();
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1);
  const enc = encodeURIComponent(cap);
  const hotel = `Hotel Boutique ${cap}`;
  const themes = assignThemes(days);

  const THEME_SLOTS = {
    LLEGADA_Y_PRIMERA_IMPRESION: [
      { period: 'mañana', type: '✈️ Llegada', time: '13:00', title: 'Aeropuerto y traslado al hotel', address: 'Aeropuerto principal', desc: `Aterriza en ${cap}. Toma un taxi o shuttle al hotel. Deja el equipaje y sal a explorar sin mapa.`, plato_recomendado: null, precio_aprox: '15-30€', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${enc}` },
      { period: 'tarde', type: '☕ Café', time: '15:30', title: 'Primer café en el barrio', address: 'Centro histórico', desc: `Siéntate en la terraza de una cafetería local. Observa, absorbe y bienvenido a ${cap}.`, plato_recomendado: 'Café con leche y croissant', precio_aprox: '4€', link: `https://www.google.com/maps/search/?api=1&query=cafe+${enc}` },
      { period: 'tarde', type: '🚶 Paseo', time: '17:00', title: 'Centro histórico a pie', address: 'Casco antiguo', desc: `Primer paseo sin rumbo. Arquitectura, calles y gente. Sin agenda.`, plato_recomendado: null, precio_aprox: 'Gratis', link: `https://www.google.com/maps/search/?api=1&query=casco+historico+${enc}` },
      { period: 'noche', type: '🍽️ Cena', time: '20:30', title: 'Restaurante de bienvenida', address: 'Centro', desc: `Primera cena en ${cap}. Pide la especialidad de la casa, sin pensar mucho.`, plato_recomendado: 'Especialidad local', precio_aprox: '20-30€', link: `https://www.google.com/maps/search/?api=1&query=restaurante+tipico+${enc}` },
    ],
    CULTURA_E_HISTORIA: [
      { period: 'mañana', type: '🥐 Desayuno', time: '08:30', title: 'Mercado local', address: 'Mercado central', desc: `Desayuna en el mercado. El más auténtico de ${cap}. Prueba lo que no reconozcas.`, plato_recomendado: 'Lo que haya fresco', precio_aprox: '5-8€', link: `https://www.google.com/maps/search/?api=1&query=mercado+central+${enc}` },
      { period: 'mañana', type: '🏛️ Visita', time: '10:00', title: 'Monumento principal', address: 'Centro histórico', desc: `El icono de ${cap}. Llega antes de las 11h. Sube arriba si hay vistas.`, plato_recomendado: null, precio_aprox: '8-15€', link: `https://www.google.com/maps/search/?api=1&query=monumento+principal+${enc}` },
      { period: 'tarde', type: '🍽️ Comida', time: '14:00', title: 'Restaurante histórico', address: 'Casco antiguo', desc: `Local con historia. Pide el menú del día. Sin reserva es la vieja escuela.`, plato_recomendado: 'Menú del día', precio_aprox: '12-18€', link: `https://www.google.com/maps/search/?api=1&query=restaurante+historico+${enc}` },
      { period: 'tarde', type: '🎨 Museo', time: '16:00', title: 'Museo más emblemático', address: 'Zona cultural', desc: `El museo más representativo de ${cap}. Máximo 2h para no saturarte.`, plato_recomendado: null, precio_aprox: '10-15€', link: `https://www.google.com/maps/search/?api=1&query=museo+${enc}` },
      { period: 'noche', type: '🍷 Cena', time: '20:30', title: 'Taberna con historia', address: 'Barrio antiguo', desc: `Décadas de historia. Sin reserva: llega antes de las 21h o espera en la barra.`, plato_recomendado: 'Plato estrella de la casa', precio_aprox: '25-35€', link: `https://www.google.com/maps/search/?api=1&query=taberna+${enc}` },
    ],
    NATURALEZA_Y_AVENTURA: [
      { period: 'mañana', type: '🥐 Desayuno', time: '08:00', title: 'Desayuno rápido en el hotel', address: 'Hotel', desc: 'Hoy madrugas. Desayuno ligero, ropa cómoda y agua.', plato_recomendado: null, precio_aprox: 'Incluido', link: `https://www.google.com/maps/search/?api=1&query=desayuno+${enc}` },
      { period: 'mañana', type: '🚗 Excursión', time: '09:00', title: `Ruta por los alrededores de ${cap}`, address: 'Salida desde el centro', desc: `Alquila coche o tour organizado. Los alrededores de ${cap} son impresionantes.`, plato_recomendado: null, precio_aprox: '30-60€', link: `https://www.google.com/maps/search/?api=1&query=excursion+${enc}` },
      { period: 'mañana', type: '📸 Parada', time: '11:00', title: 'Mirador con vistas', address: 'Punto panorámico', desc: 'Para el coche. Sal. Haz fotos. Este momento no se repite.', plato_recomendado: null, precio_aprox: 'Gratis', link: `https://www.google.com/maps/search/?api=1&query=mirador+${enc}` },
      { period: 'tarde', type: '🍽️ Comida', time: '13:30', title: 'Restaurante de pueblo cercano', address: 'Pueblo próximo', desc: 'Pedid lo que tienen HOY, no la carta. Así se come bien de verdad.', plato_recomendado: 'Plato del día', precio_aprox: '10-15€', link: `https://www.google.com/maps/search/?api=1&query=restaurante+rural+${enc}` },
      { period: 'noche', type: '🍷 Cena', time: '21:00', title: 'Cena merecida en el hotel', address: 'Hotel / zona centro', desc: `Lo has ganado. Cena tranquila en ${cap} tras el día de excursión.`, plato_recomendado: 'Recomendación del hotel', precio_aprox: '20-30€', link: `https://www.google.com/maps/search/?api=1&query=cena+${enc}` },
    ],
    GASTRONOMIA_LOCAL: [
      { period: 'mañana', type: '🛒 Mercado', time: '09:30', title: 'Mercado gastronómico', address: 'Mercado principal', desc: `Llega con el estómago vacío. Prueba TODO lo que no reconozcas. Así se viaja de verdad en ${cap}.`, plato_recomendado: 'Lo que haga cola de locales', precio_aprox: '8-12€', link: `https://www.google.com/maps/search/?api=1&query=mercado+gastronomico+${enc}` },
      { period: 'mañana', type: '🍳 Taller', time: '11:00', title: 'Taller de cocina local', address: 'Zona turística', desc: `Aprende a cocinar el plato típico de ${cap}. Lo mejor: te lo comes después.`, plato_recomendado: 'Plato típico de la región', precio_aprox: '40-60€', link: `https://www.google.com/maps/search/?api=1&query=taller+cocina+${enc}` },
      { period: 'tarde', type: '🍽️ Comida', time: '14:00', title: 'Restaurante top de la ciudad', address: 'Zona gastronómica', desc: `El más valorado por locales (no turistas). Reserva obligatoria si tienes más de 2 personas.`, plato_recomendado: 'El que más piden los de la mesa de al lado', precio_aprox: '30-45€', link: `https://www.google.com/maps/search/?api=1&query=mejor+restaurante+${enc}` },
      { period: 'tarde', type: '☕ Café', time: '16:30', title: 'Cafetería de especialidad', address: 'Barrio hip', desc: `Café de calidad. Buen momento para escribir el diario de viaje o simplemente no hacer nada.`, plato_recomendado: 'Café de filtro o espresso doble', precio_aprox: '4-6€', link: `https://www.google.com/maps/search/?api=1&query=specialty+coffee+${enc}` },
      { period: 'noche', type: '🍷 Degustación', time: '21:00', title: 'Menú de degustación local', address: 'Restaurante top', desc: `La mejor inversión del viaje. Cocina local moderna con menú de degustación de 6 platos.`, plato_recomendado: 'Todo el menú', precio_aprox: '50-80€', link: `https://www.google.com/maps/search/?api=1&query=menu+degustacion+${enc}` },
    ],
    RELAX_Y_ZONAS_VIP: [
      { period: 'mañana', type: '🥐 Brunch', time: '10:30', title: 'Brunch tardío', address: 'Barrio trendy', desc: `Sin prisa. Hoy no hay que madrugar. El mejor brunch de ${cap} con café largo.`, plato_recomendado: 'Huevos benedict o tostada aguacate', precio_aprox: '12-18€', link: `https://www.google.com/maps/search/?api=1&query=brunch+${enc}` },
      { period: 'mañana', type: '🏖️ Playa o Spa', time: '12:00', title: 'Playa o spa de lujo', address: 'Zona VIP', desc: `La mejor cala/playa de ${cap} o el spa del hotel. Hoy no hay obligaciones.`, plato_recomendado: null, precio_aprox: '0-80€', link: `https://www.google.com/maps/search/?api=1&query=spa+${enc}` },
      { period: 'tarde', type: '🍽️ Comida', time: '14:30', title: 'Chiringuito o terraza VIP', address: 'Zona de playa / mirador', desc: `Comida con vistas. Pide el pescado del día o lo que huela mejor desde la terraza.`, plato_recomendado: 'Pescado del día', precio_aprox: '25-40€', link: `https://www.google.com/maps/search/?api=1&query=terraza+restaurante+${enc}` },
      { period: 'tarde', type: '🛍️ Compras', time: '17:00', title: 'Zona de tiendas locales', address: 'Barrio comercial', desc: `Marcas locales, artesanía, souvenirs que valen la pena. Sin cadenas internacionales.`, plato_recomendado: null, precio_aprox: 'Libre', link: `https://www.google.com/maps/search/?api=1&query=tiendas+${enc}` },
      { period: 'noche', type: '🍷 Cena', time: '21:00', title: 'Cena con vistas al atardecer', address: 'Terraza o mirador', desc: `Mesa con vistas. Pide el maridaje recomendado por el sommelier.`, plato_recomendado: 'Maridaje del chef', precio_aprox: '40-60€', link: `https://www.google.com/maps/search/?api=1&query=cena+vistas+${enc}` },
    ],
    VIDA_NOCTURNA_Y_SOCIAL: [
      { period: 'mañana', type: '🥐 Desayuno', time: '10:00', title: 'Desayuno tardío tranquilo', address: 'Cafetería del barrio', desc: 'Hoy el día empieza tarde porque la noche va a ser larga. Desayuno sin prisas.', plato_recomendado: 'Lo de siempre pero con calma', precio_aprox: '6-10€', link: `https://www.google.com/maps/search/?api=1&query=desayuno+${enc}` },
      { period: 'tarde', type: '🍽️ Comida', time: '14:00', title: 'Restaurante informal en zona de bares', address: 'Barrio nocturno', desc: `Come bien antes de la noche. Barrio de moda de ${cap} con buen ambiente.`, plato_recomendado: 'Tabla de embutidos o raciones', precio_aprox: '15-25€', link: `https://www.google.com/maps/search/?api=1&query=restaurante+zona+bares+${enc}` },
      { period: 'noche', type: '🍹 Pre-noche', time: '21:00', title: 'Cócteles en rooftop bar', address: 'Azotea centro', desc: `El mejor rooftop de ${cap}. Cócteles de firma con vistas. El dress code importa.`, plato_recomendado: 'Cóctel de la casa', precio_aprox: '12-18€/cóctel', link: `https://www.google.com/maps/search/?api=1&query=rooftop+bar+${enc}` },
      { period: 'noche', type: '🎶 Club', time: '00:00', title: 'Sala o club local', address: 'Zona nocturna', desc: `El club que mola en ${cap}. Llega tarde (00:30+). La música local es diferente a todo lo que conoces.`, plato_recomendado: null, precio_aprox: '10-25€ entrada', link: `https://www.google.com/maps/search/?api=1&query=club+nocturno+${enc}` },
    ],
    DESPEDIDA: [
      { period: 'mañana', type: '🥐 Último desayuno', time: '09:00', title: 'El último desayuno en ' + cap, address: 'Tu sitio favorito del viaje', desc: `Pide lo que más te ha gustado esta semana. Último desayuno. Saboréalo.`, plato_recomendado: 'Tu favorito del viaje', precio_aprox: '6-10€', link: `https://www.google.com/maps/search/?api=1&query=desayuno+${enc}` },
      { period: 'mañana', type: '🚶 Despedida', time: '10:30', title: 'Último paseo por ' + cap, address: 'Rincones favoritos', desc: `Recorre los lugares que más te han gustado. Sin agenda. La despedida merece calma.`, plato_recomendado: null, precio_aprox: 'Gratis', link: `https://www.google.com/maps/search/?api=1&query=${enc}` },
      { period: 'tarde', type: '🍽️ Última comida', time: '13:00', title: 'Comida de despedida', address: 'Tu restaurante favorito', desc: `Tu restaurante favorito del viaje o uno que te quedó pendiente. La última de ${cap}.`, plato_recomendado: 'Lo que más has echado de menos', precio_aprox: '20-35€', link: `https://www.google.com/maps/search/?api=1&query=restaurante+${enc}` },
      { period: 'tarde', type: '✈️ Vuelo', time: '17:00', title: 'Traslado al aeropuerto', address: 'Aeropuerto', desc: `Con tiempo de sobra. Los recuerdos van contigo, el equipaje también.`, plato_recomendado: null, precio_aprox: '15-30€', link: `https://www.google.com/maps/search/?api=1&query=aeropuerto+${enc}` },
    ],
  };

  const itinerary = themes.map((theme, i) => ({
    day: i + 1,
    theme,
    place: `${cap} – ${theme.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`,
    emoji: ['✈️', '🏛️', '🌿', '🍽️', '😌', '🌙', '🏠'][i % 7],
    isSpecial: i === Math.floor(days / 2),
    why_unique: `Día completamente distinto al resto: hoy todo gira en torno a ${theme.replace(/_/g, ' ').toLowerCase()}.`,
    transport_tip: 'Consulta Google Maps para el mejor trayecto del día.',
    slots: THEME_SLOTS[theme] || THEME_SLOTS.CULTURA_E_HISTORIA,
    tip: `Tip del día ${i + 1}: pregunta siempre a los locales, no al hotel.`,
  }));

  return {
    destination: `${days} días en ${cap}`,
    flag: '🌍',
    cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    days,
    companions: 'Viajero',
    vibe: mood || 'Exploración y relax',
    budget: { total: '1.500€', flights: '300€', hotel: '90€/noche', daily: '60€/día' },
    weather: { temp: '25°C', icon: '🌤️', text: 'Clima agradable' },
    bestTime: 'Consulta la temporada local',
    flights: [{ airline: 'Busca vuelos', price: 'Ver precios', route: `MAD → ${cap.slice(0, 3).toUpperCase()}`, duration: '-', link: 'https://www.skyscanner.es/', note: 'Compara precios con antelación.' }],
    hotels: [{ name: hotel, stars: '4★', price: '90€/noche', vibe: 'Céntrico y moderno', highlight: 'Ubicación ideal para explorar a pie.', link: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel)}&group_adults=2` }],
    itinerary,
    secretItinerary: [{ day: 2, place: `Rincón secreto de ${cap}`, emoji: '🤫', highlight: `El lugar que los locales no comparten con turistas en ${cap}. Pregunta en el mercado.`, link: `https://www.google.com/maps/search/?api=1&query=lugares+secretos+${enc}` }],
  };
}
