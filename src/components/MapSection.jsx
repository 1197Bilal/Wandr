import { useState } from 'react';
import './MapSection.css';
import { destinations, users } from '../data/mockData';

// Approximate world-map % positions for each destination
const PINS = [
  { id: 'sardinia', name: 'Cerdeña',      emoji: '🏖️', x: 50.5, y: 35.5, travelers: 142 },
  { id: 'naples',   name: 'Nápoles',      emoji: '🍕', x: 51.8, y: 37.2, travelers: 89  },
  { id: 'capri',    name: 'Capri',        emoji: '⛵', x: 51.9, y: 38.0, travelers: 67  },
  { id: 'amalfi',   name: 'Costa Amalfitana', emoji: '🌊', x: 52.0, y: 37.8, travelers: 198 },
  { id: 'rome',     name: 'Roma',         emoji: '🏛️', x: 51.6, y: 36.5, travelers: 312 },
  { id: 'thailand', name: 'Tailandia',    emoji: '🇹🇭', x: 76.2, y: 52.5, travelers: 421 },
  { id: 'japan',    name: 'Japón',        emoji: '🇯🇵', x: 83.5, y: 37.0, travelers: 289 },
  { id: 'portugal', name: 'Lisboa',       emoji: '🇵🇹', x: 44.2, y: 37.8, travelers: 178 },
  { id: 'greece',   name: 'Grecia',       emoji: '🏛️', x: 54.5, y: 38.5, travelers: 203 },
  { id: 'morocco',  name: 'Marruecos',    emoji: '🕌', x: 46.5, y: 43.0, travelers: 134 },
];

export default function MapSection() {
  const [active, setActive] = useState(null);
  const pin = PINS.find(p => p.id === active);

  return (
    <section className="map-section" id="map">
      <div className="map-section__header">
        <span className="label">🌍 Mapa en vivo</span>
        <h2 className="display-lg map-section__title">
          Viajeros en el <span className="gradient-text">mundo ahora</span>
        </h2>
        <p className="map-section__sub">
          Pincha en cualquier destino para ver quién está allí y qué están haciendo.
        </p>
      </div>

      <div className="map-wrap glass">
        {/* SVG world map background */}
        <div className="map-bg">
          <svg viewBox="0 0 1000 500" className="map-svg" xmlns="http://www.w3.org/2000/svg">
            {/* Simplified continent shapes */}
            {/* Europe */}
            <ellipse cx="505" cy="195" rx="65" ry="55" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            {/* Africa */}
            <ellipse cx="500" cy="320" rx="55" ry="80" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            {/* Asia */}
            <ellipse cx="720" cy="220" rx="130" ry="80" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            {/* Americas */}
            <ellipse cx="240" cy="260" rx="90" ry="120" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            {/* Oceania */}
            <ellipse cx="830" cy="370" rx="55" ry="35" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>

            {/* Grid lines */}
            {[0,100,200,300,400,500].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            ))}
            {[0,100,200,300,400,500,600,700,800,900,1000].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            ))}
          </svg>
        </div>

        {/* Destination pins */}
        {PINS.map(pin => (
          <button
            key={pin.id}
            className={`map-pin ${active === pin.id ? 'map-pin--active' : ''}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => setActive(active === pin.id ? null : pin.id)}
            id={`map-pin-${pin.id}`}
            title={pin.name}
          >
            <span className="map-pin__pulse" />
            <span className="map-pin__dot">{pin.emoji}</span>
            <span className="map-pin__label">{pin.name}</span>
          </button>
        ))}

        {/* Info card on click */}
        {active && pin && (
          <div className="map-card glass-strong" key={active}>
            <button className="map-card__close" onClick={() => setActive(null)}>✕</button>
            <div className="map-card__header">
              <span className="map-card__emoji">{pin.emoji}</span>
              <div>
                <h3 className="map-card__name">{pin.name}</h3>
                <span className="tag tag-orange">{pin.travelers} viajeros activos</span>
              </div>
            </div>
            <div className="map-card__avatars">
              {users.slice(0, 4).map((u, i) => (
                <img key={i} src={u.avatar} alt={u.name} className="map-card__avatar" style={{ zIndex: 4-i }} />
              ))}
              <span className="map-card__more">+{pin.travelers - 4} más</span>
            </div>
            <button className="btn btn-primary map-card__btn" id={`map-card-btn-${pin.id}`}>
              Ver experiencias →
            </button>
          </div>
        )}

        {/* Live stats bar */}
        <div className="map-stats glass">
          <span className="map-stats__item">🟢 <strong>1.243</strong> viajeros online</span>
          <span className="map-stats__sep">·</span>
          <span className="map-stats__item">📍 <strong>84</strong> destinos activos</span>
          <span className="map-stats__sep">·</span>
          <span className="map-stats__item">✦ Actualizado hace 2 min</span>
        </div>
      </div>
    </section>
  );
}
