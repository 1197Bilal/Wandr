import { useEffect, useState } from 'react';
import './TripPlan.css';

const TABS = ['🗺️ Ruta Estándar', '🔒 Ruta Secreta'];

export default function TripPlan({ plan, onClose }) {
  const [tab, setTab] = useState(0);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const freeSteps = plan.itinerary.slice(0, 2);
  const lockedSteps = plan.itinerary.slice(2);

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>

        {/* Cover */}
        <div className="tp-cover" style={{ backgroundImage: `url(${plan.cover})` }}>
          <div className="tp-cover__overlay">
            <button className="tp-close" onClick={onClose}>✕</button>
            <div className="tp-cover__content">
              <span className="tp-flag">{plan.flag}</span>
              <h2 className="tp-title">{plan.days} días en {plan.destination}</h2>
              <div className="tp-meta-row">
                <span className="tp-meta-chip">👥 {plan.companions}</span>
                <span className="tp-meta-chip">✨ {plan.vibe}</span>
                <span className="tp-meta-chip">💰 {plan.budget.total}</span>
                <span className="tp-meta-chip">{plan.weather.icon} {plan.weather.temp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flights */}
        <div className="tp-section">
          <h3 className="tp-section-title">✈️ Opciones de vuelo</h3>
          <div className="tp-options-grid">
            {plan.flights.map((f, i) => (
              <a key={i} href={f.link} target="_blank" rel="noopener noreferrer" className="tp-option-card tp-option-card--flight">
                <div className="tp-option-card__top">
                  <span className="tp-option-card__name">{f.airline}</span>
                  <span className="tp-option-card__price">{f.price}</span>
                </div>
                <div className="tp-option-card__sub">{f.route} · {f.duration}</div>
                <span className="tp-option-card__cta">Ver vuelos →</span>
              </a>
            ))}
          </div>
        </div>

        {/* Hotels */}
        <div className="tp-section">
          <h3 className="tp-section-title">🏨 Opciones de alojamiento</h3>
          <div className="tp-options-grid">
            {plan.hotels.map((h, i) => (
              <a key={i} href={h.link} target="_blank" rel="noopener noreferrer" className="tp-option-card tp-option-card--hotel">
                <div className="tp-option-card__top">
                  <span className="tp-option-card__name">{h.name}</span>
                  <span className="tp-option-card__price">{h.price}</span>
                </div>
                <div className="tp-option-card__sub">{h.stars} · {h.vibe}</div>
                <span className="tp-option-card__cta">Ver en Booking →</span>
              </a>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tp-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`tp-tab ${tab === i ? 'tp-tab--active' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        <div className="tp-body">

          {/* TAB 1: Ruta Estándar */}
          {tab === 0 && (
            <>
              {freeSteps.map((step, idx) => (
                <div key={idx} className="tp-day-card glass-strong">
                  <div className="tp-day-header">
                    <span className="tp-day-emoji">{step.emoji}</span>
                    <div>
                      <span className="tp-day-label">Día {step.day}</span>
                      <h4 className="tp-day-place">{step.place}</h4>
                    </div>
                  </div>

                  <div className="tp-day-slots">
                    {[
                      { time: '🌅 Mañana', data: step.morning },
                      { time: '☀️ Tarde', data: step.afternoon },
                      { time: '🌙 Noche', data: step.evening },
                    ].map((slot, si) => slot.data && (
                      <div key={si} className="tp-slot">
                        <span className="tp-slot__time">{slot.time}</span>
                        <div className="tp-slot__content">
                          <div className="tp-slot__title-row">
                            <strong className="tp-slot__title">{slot.data.title}</strong>
                            <a href={slot.data.link} target="_blank" rel="noopener noreferrer" className="tp-slot__map-btn">
                              📍 Ver en Maps
                            </a>
                          </div>
                          <p className="tp-slot__desc">{slot.data.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="tp-day-tip">
                    <span>💡</span>
                    <p>{step.tip}</p>
                  </div>
                </div>
              ))}

              {/* Paywall */}
              {lockedSteps.length > 0 && (
                <div className="tp-paywall">
                  <div className="tp-paywall__blurred">
                    {lockedSteps.map((step, idx) => (
                      <div key={idx} className="tp-day-card glass-strong tp-day-card--blur">
                        <div className="tp-day-header">
                          <span className="tp-day-emoji">{step.emoji}</span>
                          <div>
                            <span className="tp-day-label">Día {step.day}</span>
                            <h4 className="tp-day-place">{step.place}</h4>
                          </div>
                        </div>
                        <div className="tp-day-slots">
                          <div className="tp-slot"><span className="tp-slot__time">🌅 Mañana</span><div className="tp-slot__content"><strong>{step.morning?.title}</strong><p>{step.morning?.desc}</p></div></div>
                          <div className="tp-slot"><span className="tp-slot__time">☀️ Tarde</span><div className="tp-slot__content"><strong>{step.afternoon?.title}</strong><p>{step.afternoon?.desc}</p></div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="tp-paywall__gradient" />
                  <div className="tp-paywall__cta">
                    <span className="tp-paywall__lock">🔒</span>
                    <h3 className="tp-paywall__title">+{lockedSteps.length} días más en este viaje</h3>
                    <p className="tp-paywall__sub">Desbloquea el plan completo hora a hora, los mejores restaurantes y mapas offline con <strong>Wandr Plus</strong>.</p>
                    <a href="#pricing" onClick={onClose} className="tp-paywall__btn">Desbloquear por 4,99€/mes →</a>
                    <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: Ruta Secreta */}
          {tab === 1 && (
            <div className="tp-secret">
              <div className="tp-secret__blurred">
                {plan.secretItinerary.map((step, idx) => (
                  <div key={idx} className="tp-day-card glass-strong">
                    <div className="tp-day-header">
                      <span className="tp-day-emoji">{step.emoji}</span>
                      <div>
                        <span className="tp-day-label">Día {step.day}</span>
                        <h4 className="tp-day-place">{step.place}</h4>
                      </div>
                    </div>
                    <p style={{color:'#bbb', padding:'0 20px 20px'}}>{step.highlight}</p>
                  </div>
                ))}
              </div>
              <div className="tp-paywall__cta">
                <span className="tp-paywall__lock">🗝️</span>
                <h3 className="tp-paywall__title">Ruta Secreta: Lo que los locales no cuentan</h3>
                <p className="tp-paywall__sub">Restaurantes sin guías, rutas alternativas y experiencias únicas. Solo <strong>Wandr Plus</strong>.</p>
                <a href="#pricing" onClick={onClose} className="tp-paywall__btn">Descubrir por 4,99€/mes →</a>
                <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
