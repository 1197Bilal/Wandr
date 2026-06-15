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

        {/* ── Cover ── */}
        <div className="tp-cover" style={{ backgroundImage: `url(${plan.cover})` }}>
          <div className="tp-cover__overlay">
            <button className="tp-close" onClick={onClose}>✕</button>
            <div className="tp-cover__content">
              <span className="tp-flag">{plan.flag}</span>
              <h2 className="tp-title">{plan.days} días en {plan.destination}</h2>
              <div className="tp-vibes">
                {plan.vibe.map(v => <span key={v} className="tp-vibe-tag">{v}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Affiliate Links (Dinero fácil) ── */}
        <div className="tp-affiliates">
          <a href={plan.flightsUrl} target="_blank" rel="noopener noreferrer" className="tp-affiliate-btn tp-affiliate-btn--flights">
            ✈️ Ver vuelos baratos
            <span className="tp-affiliate-sub">Google Flights</span>
          </a>
          <a href={plan.bookingUrl} target="_blank" rel="noopener noreferrer" className="tp-affiliate-btn tp-affiliate-btn--hotel">
            🏨 Ver hoteles recomendados
            <span className="tp-affiliate-sub">Booking.com</span>
          </a>
          <div className="tp-affiliate-info">
            <span>💰 <strong>{plan.budget.total}</strong> presupuesto estimado · ✈️ {plan.budget.flights} · 🏨 {plan.budget.hotel}</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tp-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`tp-tab ${tab === i ? 'tp-tab--active' : ''}`} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>

        <div className="tp-body">

          {/* ─── TAB 1: Ruta Estándar ─── */}
          {tab === 0 && (
            <>
              <div className="tp-timeline">
                {freeSteps.map((step, idx) => (
                  <div key={idx} className="tp-step">
                    <div className="tp-step__indicator">
                      <div className="tp-step__dot">{step.emoji}</div>
                      {idx !== freeSteps.length - 1 && <div className="tp-step__line" />}
                    </div>
                    <div className="tp-step__content glass-strong">
                      <span className="tp-step__day">Día {step.day}</span>
                      <h4 className="tp-step__place">{step.place}</h4>
                      <p className="tp-step__highlight">{step.highlight}</p>
                      <div className="tp-step__tip-box">
                        <span className="tp-step__tip-label">💡 Tip comunidad:</span>
                        <p className="tp-step__tip-text">"{step.tip}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── PAYWALL: Resto del itinerario bloqueado ── */}
              <div className="tp-paywall">
                <div className="tp-paywall__blurred">
                  {lockedSteps.map((step, idx) => (
                    <div key={idx} className="tp-step tp-step--blurred">
                      <div className="tp-step__indicator">
                        <div className="tp-step__dot">{step.emoji}</div>
                        {idx !== lockedSteps.length - 1 && <div className="tp-step__line" />}
                      </div>
                      <div className="tp-step__content glass-strong">
                        <span className="tp-step__day">Día {step.day}</span>
                        <h4 className="tp-step__place">{step.place}</h4>
                        <p className="tp-step__highlight">{step.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tp-paywall__cta">
                  <span className="tp-paywall__lock">🔒</span>
                  <h3 className="tp-paywall__title">Hay {lockedSteps.length} etapas más en este viaje</h3>
                  <p className="tp-paywall__sub">Desbloquea el itinerario completo, mapas offline y mucho más con <strong>Wandr Plus</strong> por solo 4,99€/mes.</p>
                  <a href="#pricing" onClick={onClose} className="tp-paywall__btn">
                    Desbloquear con Wandr Plus →
                  </a>
                  <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
                </div>
              </div>
            </>
          )}

          {/* ─── TAB 2: Ruta Secreta (Bloqueada) ─── */}
          {tab === 1 && (
            <div className="tp-secret">
              <div className="tp-secret__blurred">
                {plan.secretItinerary.map((step, idx) => (
                  <div key={idx} className="tp-step tp-step--blurred">
                    <div className="tp-step__indicator">
                      <div className="tp-step__dot">{step.emoji}</div>
                      {idx !== plan.secretItinerary.length - 1 && <div className="tp-step__line" />}
                    </div>
                    <div className="tp-step__content glass-strong">
                      <span className="tp-step__day">Día {step.day}</span>
                      <h4 className="tp-step__place">{step.place}</h4>
                      <p className="tp-step__highlight">{step.highlight}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tp-paywall__cta tp-paywall__cta--secret">
                <span className="tp-paywall__lock">🗝️</span>
                <h3 className="tp-paywall__title">Ruta Secreta: Los lugares que los locales no cuentan</h3>
                <p className="tp-paywall__sub">Esta ruta alternativa incluye joyas ocultas, restaurantes sin guías turísticas y experiencias únicas que solo conocen los viajeros expertos. Exclusivo <strong>Wandr Plus</strong>.</p>
                <a href="#pricing" onClick={onClose} className="tp-paywall__btn">
                  Descubrir la Ruta Secreta →
                </a>
                <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
