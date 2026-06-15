// Full day-by-day planner with vibe-based personalization
export const VIBES = [
  { val: 'chill',   label: 'Chill & Relax', emoji: '🌴' },
  { val: 'playa',   label: 'Sol & Playa',   emoji: '🏖️' },
  { val: 'cultura', label: 'Cultura & Arte', emoji: '🏛️' },
  { val: 'paseos',  label: 'Paseos & Naturaleza', emoji: '🥾' },
  { val: 'fiesta',  label: 'Fiesta & Noche', emoji: '🎉' },
];

export function generateTripPlan(destination, days, companions, vibe) {
  const q = destination.toLowerCase();
  const d = parseInt(days) || 7;
  const v = vibe || 'cultura';

  if (q.includes('japon') || q.includes('japón') || q.includes('japan') || q.includes('tokio') || q.includes('tokyo'))
    return buildJapan(d, companions, v);
  if (q.includes('tailandia') || q.includes('thailand') || q.includes('bangkok') || q.includes('bali'))
    return buildThailand(d, companions, v);
  if (q.includes('marruecos') || q.includes('morocco') || q.includes('marrakech'))
    return buildMorocco(d, companions, v);
  return buildGeneric(destination, d, companions, v);
}

// ─── JAPAN ────────────────────────────────────────────────────────────────────
function buildJapan(days, companions, vibe) {
  const allDays = {
    chill: [
      {
        day: 1, place: 'Tokio', emoji: '🗼',
        morning:   { title: 'Desayuno en Onibus Coffee', desc: 'El café de especialidad más tranquilo de Nakameguro, junto al canal.', link: 'https://maps.app.goo.gl/onibus-coffee' },
        afternoon: { title: 'Paseo por el Canal de Nakameguro', desc: 'Un paseo relajado entre cafés y tiendas independientes. Sin prisas.', link: 'https://maps.app.goo.gl/nakameguro' },
        evening:   { title: 'Cena en Afuri Ramen (Harajuku)', desc: 'El ramen de yuzu más suave de Tokio. Siempre merece la cola.', link: 'https://maps.app.goo.gl/afuri-harajuku' },
        tip: 'Evita el metro en hora punta (8-9am). Tokio en calma es magia.'
      },
      {
        day: 2, place: 'Yanaka (Tokio antiguo)', emoji: '🏮',
        morning:   { title: 'Mercado Yanaka Ginza', desc: 'El barrio más auténtico de Tokio. Como un pueblo dentro de la megaciudad.', link: 'https://maps.app.goo.gl/yanaka-ginza' },
        afternoon: { title: 'Jardín del Palacio Imperial', desc: 'Paseo relajado por los jardines imperiales. Entrada gratis.', link: 'https://maps.app.goo.gl/imperial-garden-tokyo' },
        evening:   { title: 'Izakaya local en Koenji', desc: 'El barrio más bohemio de Tokio. Pide kushiyaki y cerveza local.', link: 'https://maps.app.goo.gl/koenji' },
        tip: 'En Yanaka no hay prácticamente turistas. Es el Tokio de verdad.'
      },
    ],
    cultura: [
      {
        day: 1, place: 'Tokio - Asakusa & Akihabara', emoji: '🗼',
        morning:   { title: 'Templo Senso-ji al amanecer', desc: 'Llega antes de las 7am. Sin turistas, con niebla, es una experiencia mística.', link: 'https://maps.app.goo.gl/sensoji' },
        afternoon: { title: 'Museo Nacional de Tokio (Ueno)', desc: 'La colección de arte japonés más grande del mundo. Reserva 3h mínimo.', link: 'https://maps.app.goo.gl/tokyo-national-museum' },
        evening:   { title: 'Cena en Sushi Saito (reserva previa)', desc: 'Considerado el mejor omakase de Tokio. Reserva con 3 meses de antelación.', link: 'https://maps.app.goo.gl/sushi-saito' },
        tip: 'Si no consigues Saito, Sushi Yoshitake tiene lista de espera de solo 1 mes.'
      },
      {
        day: 2, place: 'Kioto - Gion & Arashiyama', emoji: '🎎',
        morning:   { title: 'Fushimi Inari a las 5:30am', desc: 'Miles de toriis rojos sin un solo turista. La imagen más mágica de Japón.', link: 'https://maps.app.goo.gl/fushimi-inari' },
        afternoon: { title: 'Bambú de Arashiyama + Templo Tenryu-ji', desc: 'El jardín zen más bello de Kioto. Incluye vistas al Fujiyama en días claros.', link: 'https://maps.app.goo.gl/arashiyama' },
        evening:   { title: 'Paseo nocturno por Gion (Barrio de Geishas)', desc: 'Si tienes suerte, verás una Geiko caminar hacia su reunión. Solo observa, nunca fotografíes sin permiso.', link: 'https://maps.app.goo.gl/gion-kyoto' },
        tip: 'Kioto es mucho mejor entre semana. Los fines de semana se colapsa.'
      },
      {
        day: 3, place: 'Nara & Osaka', emoji: '🦌',
        morning:   { title: 'Ciervos sagrados en Nara Park', desc: 'Los ciervos se inclinan si les ofreces galletas. Es absurdamente tierno.', link: 'https://maps.app.goo.gl/nara-park' },
        afternoon: { title: 'Mercado Kuromon (Osaka)', desc: 'El mercado de los chefs de Osaka. Prueba el fugu (pez globo) y las ostras.', link: 'https://maps.app.goo.gl/kuromon-market' },
        evening:   { title: 'Dotonbori de noche + Takoyaki', desc: 'El corazón de Osaka de noche. Pide takoyaki en Kukuru y come paseando.', link: 'https://maps.app.goo.gl/dotonbori' },
        tip: 'Osaka tiene la mejor comida callejera de Japón. No reserves: come donde haya cola.'
      },
    ],
    fiesta: [
      {
        day: 1, place: 'Tokio - Shinjuku & Shibuya', emoji: '🎌',
        morning:   { title: 'Brunch en Eggs n Things (Harajuku)', desc: 'El desayuno más instagrameable de Tokio. Llega pronto o hay 1h de espera.', link: 'https://maps.app.goo.gl/eggs-n-things' },
        afternoon: { title: 'Barrio de Harajuku & Takeshita Street', desc: 'Moda urbana, crepes de colores y la cultura pop japonesa en estado puro.', link: 'https://maps.app.goo.gl/takeshita-street' },
        evening:   { title: 'Noche en Golden Gai (Shinjuku)', desc: '200 bares diminutos en 6 callejones. El lugar más especial del mundo para tomar una copa.', link: 'https://maps.app.goo.gl/golden-gai' },
        tip: 'En Golden Gai los bares tienen 6 asientos. Habla con el de al lado, será una historia que contar.'
      },
    ]
  };

  const vibeKey = allDays[vibe] ? vibe : 'cultura';
  const dayPlan = allDays[vibeKey];

  return {
    destination: 'Japón', flag: '🇯🇵',
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
    days, companions, vibe,
    budget: { total: '2.500–3.500€', flights: '~1.100€', hotel: '~70-120€/noche', daily: '~50€/día' },
    weather: { temp: '15°C - 22°C', icon: '🌸', text: 'Primavera templada' },
    bestTime: 'Mar-Abr / Oct-Nov',
    flights: [
      { airline: 'Japan Airlines', price: '~890€', route: 'MAD → NRT', duration: '14h', link: 'https://www.google.com/travel/flights/search?tfs=CBwQAhooagcIARIDTUFEEgQIAjABKhJIQUwgSkwgSUJFUklBIFVYQXIHCAESA05SVBAB' },
      { airline: 'Iberia + JAL', price: '~1.050€', route: 'MAD → NRT (escala)', duration: '18h', link: 'https://www.iberia.com/es/buscar-vuelos/?origin=MAD&destination=TYO' },
      { airline: 'Finnair (via HEL)', price: '~780€', route: 'MAD → HEL → NRT', duration: '16h', link: 'https://www.finnair.com/es/book/flights?origin=MAD&destination=NRT' },
    ],
    hotels: [
      { name: 'Trunk Hotel (Shibuya)', stars: '★★★★', price: '~130€/noche', vibe: 'Trendy & Social', link: 'https://www.booking.com/hotel/jp/trunk.es.html' },
      { name: 'Hoshinoya Tokyo', stars: '★★★★★', price: '~280€/noche', vibe: 'Ryokan en el corazón de Tokio', link: 'https://www.booking.com/hotel/jp/hoshinoya-tokyo.es.html' },
      { name: 'Sakura Hotel Ikebukuro', stars: '★★★', price: '~45€/noche', vibe: 'Económico & bien situado', link: 'https://www.booking.com/hotel/jp/sakura-ikebukuro.es.html' },
    ],
    itinerary: dayPlan,
    secretItinerary: [
      { day: '1-2', place: 'Hakone & Onsen privado', emoji: '♨️', highlight: 'Vista al Fuji desde un onsen privado. Experiencia que no sale en ninguna guía.' },
      { day: '3-4', place: 'Kanazawa - El Kioto sin turistas', emoji: '🏮', highlight: 'Geishas reales, jardín Kenroku-en y el mercado Omicho. 10x más auténtico que Kioto.' },
    ]
  };
}

// ─── THAILAND ────────────────────────────────────────────────────────────────
function buildThailand(days, companions, vibe) {
  const allDays = {
    playa: [
      {
        day: 1, place: 'Bangkok - Llegada', emoji: '🏙️',
        morning:   { title: 'Desayuno Thai en Or Tor Kor Market', desc: 'El mercado más fresco y limpio de Bangkok. Prueba el mango sticky rice a las 8am.', link: 'https://maps.app.goo.gl/or-tor-kor-market' },
        afternoon: { title: 'Templo Wat Arun desde el río', desc: 'Coge el ferry local (3 baht) al templo del amanecer. Las vistas desde la orilla son brutales.', link: 'https://maps.app.goo.gl/wat-arun' },
        evening:   { title: 'Cena en Gaggan Anand', desc: 'El restaurante asiático nº1 del mundo. Solo menú degustación 20 platos. Reserva 6 meses antes.', link: 'https://maps.app.goo.gl/gaggan-anand' },
        tip: 'Si Gaggan está lleno, Bo.lan tiene cocina thai auténtica igual de increíble.'
      },
      {
        day: 2, place: 'Koh Samui - Playas del norte', emoji: '🏖️',
        morning:   { title: 'Playa Choeng Mon al amanecer', desc: 'La playa más tranquila de Koh Samui. Solo tú y el mar turquesa a las 7am.', link: 'https://maps.app.goo.gl/choeng-mon' },
        afternoon: { title: 'Snorkel en Koh Tan', desc: 'Excursión en barco privado a la isla vecina. Coral, peces de colores y sin turistas.', link: 'https://maps.app.goo.gl/koh-tan' },
        evening:   { title: 'Cena en The Larder (Fisherman\'s Village)', desc: 'El sunset más bonito de la isla y la mejor langosta a la brasa de Samui.', link: 'https://maps.app.goo.gl/larder-samui' },
        tip: 'Alquila una moto para moverte por la isla. Es la única forma real de descubrirla.'
      },
    ],
    chill: [
      {
        day: 1, place: 'Bangkok - Zona tranquila', emoji: '🌿',
        morning:   { title: 'Yoga y desayuno en Thonglor', desc: 'El barrio residencial más chill de Bangkok. Yoguerías, cafés de especialidad y expatriados tranquilos.', link: 'https://maps.app.goo.gl/thonglor-bangkok' },
        afternoon: { title: 'Spa Thai en Divana Virtue Spa', desc: 'El mejor spa de Bangkok. Masaje thai de 2h en jardines tropicales por 40€.', link: 'https://maps.app.goo.gl/divana-spa' },
        evening:   { title: 'Cena ligera en Err Urban Rustic Thai', desc: 'Cocina thai moderna y delicada. Vino natural y ambiente íntimo. Sin prisa.', link: 'https://maps.app.goo.gl/err-restaurant' },
        tip: 'En Bangkok hay tráfico brutal. Muévete en Grab (Uber thai) o en barco por el río.'
      },
    ],
    cultura: [
      {
        day: 1, place: 'Bangkok - Templos & Historia', emoji: '🛕',
        morning:   { title: 'Wat Pho (Buda Reclinado) + masaje en el templo', desc: 'El templo alberga la escuela de masaje thai más antigua. Date uno al salir.', link: 'https://maps.app.goo.gl/wat-pho' },
        afternoon: { title: 'Palacio Real de Bangkok', desc: 'Complejo enorme. Reserva al menos 3h. Cubre los hombros o te prestarán ropa en la entrada.', link: 'https://maps.app.goo.gl/grand-palace' },
        evening:   { title: 'Chinatown de Bangkok (Yaowarat Road)', desc: 'Las mejores dim sum de Tailandia y los mejores cangrejos al curry. Come de pie, en la calle.', link: 'https://maps.app.goo.gl/yaowarat' },
        tip: 'Visita los templos antes de las 9am o después de las 4pm. El calor de mediodía es brutal.'
      },
    ],
  };

  const vibeKey = allDays[vibe] ? vibe : 'cultura';
  return {
    destination: 'Tailandia', flag: '🇹🇭',
    cover: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80',
    days, companions, vibe,
    budget: { total: '1.200–1.800€', flights: '~750€', hotel: '~30-80€/noche', daily: '~30€/día' },
    weather: { temp: '28°C - 33°C', icon: '☀️', text: 'Tropical seco' },
    bestTime: 'Nov – Mar',
    flights: [
      { airline: 'Thai Airways', price: '~650€', route: 'MAD → BKK', duration: '13h', link: 'https://www.thaiairways.com/es_ES/book/flights.page' },
      { airline: 'Qatar Airways', price: '~720€', route: 'MAD → DOH → BKK', duration: '16h', link: 'https://www.qatarairways.com/es-es/flights.html' },
      { airline: 'Emirates', price: '~800€', route: 'MAD → DXB → BKK', duration: '17h', link: 'https://www.emirates.com/es/spanish/destinations/flights-to/thailand/' },
    ],
    hotels: [
      { name: 'Rosewood Bangkok', stars: '★★★★★', price: '~200€/noche', vibe: 'Lujo & diseño contemporáneo', link: 'https://www.booking.com/hotel/th/rosewood-bangkok.es.html' },
      { name: 'Akyra Thonglor Bangkok', stars: '★★★★', price: '~90€/noche', vibe: 'Boutique & piscina infinity', link: 'https://www.booking.com/hotel/th/akyra-thonglor.es.html' },
      { name: 'Lub d Bangkok Silom', stars: '★★★', price: '~25€/noche', vibe: 'Social hostel con piscina', link: 'https://www.booking.com/hotel/th/lubd-bangkok-silom.es.html' },
    ],
    itinerary: allDays[vibeKey],
    secretItinerary: [
      { day: '1-3', place: 'Pai - El valle secreto del norte', emoji: '🏔️', highlight: 'Aguas termales, cascadas y un mercado nocturno bohemio que no sale en ninguna guía.' },
      { day: '4-5', place: 'Koh Kood - La isla virgen', emoji: '🏝️', highlight: 'Sin hoteles de cadena, sin fiesta. Solo jungla, manglares y el agua más transparente de Tailandia.' },
    ]
  };
}

// ─── MOROCCO ──────────────────────────────────────────────────────────────────
function buildMorocco(days, companions, vibe) {
  return {
    destination: 'Marruecos', flag: '🇲🇦',
    cover: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
    days, companions, vibe,
    budget: { total: '600–1.000€', flights: '~180€', hotel: '~30-70€/noche', daily: '~25€/día' },
    weather: { temp: '22°C - 30°C', icon: '🌞', text: 'Cálido y seco' },
    bestTime: 'Mar-May / Sep-Nov',
    flights: [
      { airline: 'Ryanair', price: '~80€', route: 'MAD → RAK', duration: '2h30', link: 'https://www.ryanair.com/es/es/vuelos-baratos/madrid/marrakech' },
      { airline: 'Vueling', price: '~110€', route: 'BCN → CMN', duration: '2h15', link: 'https://www.vueling.com/es/ofertas-de-vuelos/buscador-de-vuelos?origin=BCN&destination=CMN' },
      { airline: 'Royal Air Maroc', price: '~150€', route: 'MAD → CMN', duration: '2h', link: 'https://www.royalairmaroc.com/es/booking' },
    ],
    hotels: [
      { name: 'La Mamounia Marrakech', stars: '★★★★★', price: '~400€/noche', vibe: 'El hotel más icónico de África', link: 'https://www.booking.com/hotel/ma/la-mamounia.es.html' },
      { name: 'Riad BE Marrakech', stars: '★★★★', price: '~80€/noche', vibe: 'Riad auténtico con piscina', link: 'https://www.booking.com/hotel/ma/riad-be.es.html' },
      { name: 'Equity Point Hostel', stars: '★★★', price: '~20€/noche', vibe: 'Mochilero céntrico en la Medina', link: 'https://www.booking.com/hotel/ma/equity-point-marrakech.es.html' },
    ],
    itinerary: [
      {
        day: 1, place: 'Marrakech - La Medina', emoji: '🕌',
        morning:   { title: 'Desayuno en Café des Épices', desc: 'Terraza con vistas a la Plaza Rahba Kedima. Café marroquí, msemen y zumo de naranja fresco.', link: 'https://maps.app.goo.gl/cafe-des-epices' },
        afternoon: { title: 'Palacio Bahia & Souks de tintes', desc: 'Los tintes Sebbaghine son los más fotogénicos de la Medina. Ve con un guía local (10€), vale la pena.', link: 'https://maps.app.goo.gl/bahia-palace' },
        evening:   { title: 'Cena en Nomad Restaurant', desc: 'Cocina marroquí moderna con terraza. El pastilla de pichón es para llorar.', link: 'https://maps.app.goo.gl/nomad-marrakech' },
        tip: 'Regatea siempre en los souks. El precio inicial suele ser 3x el precio real.'
      },
      {
        day: 2, place: 'Desierto de Agafay', emoji: '🏜️',
        morning:   { title: 'Desierto de Agafay en camello', desc: '45 min de Marrakech. Desierto de piedra con vistas al Atlas. Salida al amanecer en camello.', link: 'https://maps.app.goo.gl/agafay-desert' },
        afternoon: { title: 'Piscina del campamento con vistas', desc: 'Los mejores glamping tienen piscina infinita con el Atlas de fondo. Descansa y desconecta.', link: 'https://maps.app.goo.gl/agafay-camp' },
        evening:   { title: 'Cena en el campamento bajo las estrellas', desc: 'Cena de tajine de cordero, música gnawa y cielo sin contaminación lumínica.', link: 'https://maps.app.goo.gl/agafay-dinner' },
        tip: 'El transporte en taxi compartido desde Marrakech sale por 8€. No pagues excursión organizada.'
      },
    ],
    secretItinerary: [
      { day: '1-2', place: 'Chefchaouen - La ciudad azul', emoji: '💙', highlight: 'El pueblo más fotogénico del mundo está a 5h de Marrakech. Vale cada minuto del viaje.' },
      { day: '3-4', place: 'Erg Chebbi - El desierto del Sáhara real', emoji: '🌅', highlight: 'Dunas de 150m, noche en jaima y el amanecer más impresionante de tu vida.' },
    ]
  };
}

// ─── GENERIC ──────────────────────────────────────────────────────────────────
function buildGeneric(destination, days, companions, vibe) {
  const dest = capitalizeFirst(destination);
  return {
    destination: dest, flag: '🌍',
    cover: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    days, companions, vibe,
    budget: { total: '800–1.500€', flights: '~400€', hotel: '~60€/noche', daily: '~40€/día' },
    weather: { temp: '20°C - 26°C', icon: '🌤️', text: 'Clima agradable' },
    bestTime: 'Primavera u Otoño',
    flights: [
      { airline: 'Google Flights', price: 'Busca las mejores fechas', route: `MAD → ${dest}`, duration: 'Variable', link: `https://www.google.com/travel/flights?q=vuelos+a+${encodeURIComponent(dest)}+desde+Madrid` },
      { airline: 'Skyscanner', price: 'Compara todas las aerolíneas', route: `BCN → ${dest}`, duration: 'Variable', link: `https://www.skyscanner.es/vuelos/bcn/${dest.toLowerCase().substring(0,4)}/` },
      { airline: 'Kiwi.com', price: 'Rutas alternativas baratas', route: `ESP → ${dest}`, duration: 'Variable', link: `https://www.kiwi.com/es/search/results/spain/${encodeURIComponent(dest)}` },
    ],
    hotels: [
      { name: `Hoteles en ${dest}`, stars: '★★★★★', price: 'Ver precios', vibe: 'Lujo', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(dest)}&class=5` },
      { name: `Boutique Hotels ${dest}`, stars: '★★★★', price: 'Ver precios', vibe: 'Boutique', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(dest)}&class=4` },
      { name: `Hostels & Budget ${dest}`, stars: '★★★', price: 'Ver precios', vibe: 'Económico', link: `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(dest)}&class=3` },
    ],
    itinerary: [
      {
        day: 1, place: `${dest} - Llegada`, emoji: '✈️',
        morning:   { title: 'Desayuno en el mercado local', desc: 'La mejor forma de entender un lugar es desayunar donde desayunan los de allí.', link: `https://www.google.com/search?q=mejor+cafe+desayuno+${encodeURIComponent(dest)}` },
        afternoon: { title: 'Barrio histórico a pie', desc: 'Sin mapas, sin prisas. Piérdete por las calles del centro histórico.', link: `https://www.google.com/maps/search/${encodeURIComponent(dest)}+casco+historico` },
        evening:   { title: 'Restaurante local recomendado', desc: 'Pregunta en el hotel qué restaurante van los lugareños. Ese es el bueno.', link: `https://www.google.com/search?q=restaurante+autentico+${encodeURIComponent(dest)}` },
        tip: 'El primer día no planifiques demasiado. Déjate sorprender.'
      },
    ],
    secretItinerary: [
      { day: '1-2', place: 'Ruta Alternativa Secreta', emoji: '🔒', highlight: 'Los rincones que no salen en TripAdvisor. Solo para usuarios Plus.' },
    ]
  };
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const SEARCH_EXAMPLES = [
  'Japón 14 días',
  'Tailandia 10 días',
  'Marruecos 7 días',
  'Islandia 8 días',
  'Costa Rica 12 días',
];
