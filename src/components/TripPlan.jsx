import { useState } from 'react';
import './TripPlan.css';

export default function TripPlan({ plan, onClose }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!plan) return null;

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal glass-strong" onClick={e => e.stopPropagation()}>

        {/* Hero image */}
        <div className="tp-hero">
          <img src={plan.cover} alt={plan.destination} className="tp-hero__img" />
          <div className="tp-hero__overlay" />
          <button className="tp-close" onClick={onClose} id="trip-plan-close" aria-label="Cerrar">✕</button>
          <div className="tp-hero__content">
            <div className="tp-hero__flag">{plan.flag}</div>
            <h2 className="tp-hero__title display-lg">{plan.destination}</h2>
            <div className="tp-hero__meta">
              <span className="tag tag-orange">🗓 {plan.days} días</span>
              <span className="tag tag-teal">💸 {plan.budget}</span>
              <span className="tag tag-gold">☀️ Mejor época: {plan.bestTime}</span>
            </div>
            <div className="tp-hero__vibes">
              {plan.vibe.map(v => (
                <span key={v} className="tp-vibe">{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="tp-body">
          <div className="tp-section-label label">📍 Itinerario sugerido</div>

          {/* Day selector */}
          <div className="tp-days">
            {plan.itinerary.map((item, i) => (
              <button
                key={i}
                className={`tp-day-btn ${activeDay === i ? 'tp-day-btn--active' : ''}`}
                onClick={() => setActiveDay(i)}
                id={`day-btn-${i}`}
              >
                <span className="tp-day-emoji">{item.emoji}</span>
                <span className="tp-day-place">{item.place}</span>
                <span className="tp-day-num">Día {item.day}</span>
              </button>
            ))}
          </div>

          {/* Active day detail */}
          <div className="tp-detail glass">
            <div className="tp-detail__header">
              <span className="tp-detail__emoji">{plan.itinerary[activeDay].emoji}</span>
              <div>
                <h3 className="tp-detail__place">{plan.itinerary[activeDay].place}</h3>
                <span className="label">Día {plan.itinerary[activeDay].day}</span>
              </div>
            </div>
            <p className="tp-detail__highlight">{plan.itinerary[activeDay].highlight}</p>
            <div className="tp-detail__tip">
              <span className="tp-detail__tip-icon">💡</span>
              <span>{plan.itinerary[activeDay].tip}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="tp-actions">
            <button className="btn btn-primary tp-save" id="trip-plan-save">
              ✦ Guardar este plan
            </button>
            <button className="btn btn-ghost tp-share" id="trip-plan-share">
              🔗 Compartir
            </button>
            <button className="btn btn-ghost tp-edit" id="trip-plan-edit">
              ✏️ Personalizar
            </button>
          </div>

          {/* Who went */}
          <div className="tp-community">
            <span className="label">👥 Viajeros que hicieron esta ruta</span>
            <div className="tp-community__avatars">
              {[
                'https://randomuser.me/api/portraits/women/44.jpg',
                'https://randomuser.me/api/portraits/men/32.jpg',
                'https://randomuser.me/api/portraits/women/68.jpg',
                'https://randomuser.me/api/portraits/men/76.jpg',
              ].map((src, i) => (
                <img key={i} src={src} alt="traveler" className="tp-community__avatar" style={{ zIndex: 4 - i }} />
              ))}
              <span className="tp-community__count">+234 más</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
