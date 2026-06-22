import { useEffect, useState } from 'react';
import './TripPlan.css';
import { editTripPlan } from '../data/tripPlanner';

const TABS = ['🗺️ Ruta Estándar', '🔒 Ruta Secreta'];

export default function TripPlan({ plan: initialPlan, onClose }) {
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [tab, setTab] = useState(0);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPremiumLock, setShowPremiumLock] = useState(false);

  // Mock user status. Change to true to test Pro features without paywall.
  const isPremium = false; 

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handlePremiumAction = (actionName) => {
    if (!isPremium) {
      setShowPremiumLock(actionName);
    } else {
      alert(`Ejecutando acción premium: ${actionName}`);
    }
  };

  const handleEditSubmit = async () => {
    if (!editPrompt.trim()) return;
    if (!isPremium) {
      setShowPremiumLock("Wandr AI Edit");
      return;
    }
    
    setIsEditing(true);
    try {
      const updatedPlan = await editTripPlan(currentPlan, editPrompt);
      setCurrentPlan(updatedPlan);
      setEditPrompt('');
    } catch (e) {
      alert("Error al editar el plan.");
    } finally {
      setIsEditing(false);
    }
  };

  const freeSteps = currentPlan.itinerary.slice(0, 2);
  const lockedSteps = currentPlan.itinerary.slice(2);

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>

        {/* Premium Lock Modal */}
        {showPremiumLock && (
          <div className="tp-premium-lock-modal">
            <div className="tp-premium-lock-content">
              <h3>👑 Desbloquea {showPremiumLock}</h3>
              <p>Esta función es exclusiva para miembros de Wandr Plus. Únete a la comunidad PRO y lleva tus viajes al siguiente nivel.</p>
              <button className="tp-premium-lock-btn" onClick={() => setShowPremiumLock(false)}>Pasarme a Plus →</button>
              <button className="tp-premium-lock-close" onClick={() => setShowPremiumLock(false)}>Quizás luego</button>
            </div>
          </div>
        )}

        {/* Action Bar (Top Right) */}
        <div className="tp-action-bar">
          <button className="tp-action-btn" onClick={() => handlePremiumAction("Mapa Offline")}>🗺️ Mapa Offline</button>
          <button className="tp-action-btn" onClick={() => handlePremiumAction("Exportar a PDF")}>📄 Exportar PDF</button>
          <button className="tp-close" onClick={onClose}>✕</button>
        </div>

        {/* Cover */}
        <div className="tp-cover" style={{ backgroundImage: `url(${currentPlan.cover})` }}>
          <div className="tp-cover__overlay">
            <div className="tp-cover__content">
              <span className="tp-flag">{currentPlan.flag}</span>
              <h2 className="tp-title">{currentPlan.days} días en {currentPlan.destination}</h2>
              <div className="tp-meta-row">
                <span className="tp-meta-chip">👥 {currentPlan.companions}</span>
                <span className="tp-meta-chip">✨ {currentPlan.vibe}</span>
                <span className="tp-meta-chip">💰 {currentPlan.budget.total}</span>
                <span className="tp-meta-chip">{currentPlan.weather.icon} {currentPlan.weather.temp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flights */}
        <div className="tp-section">
          <h3 className="tp-section-title">✈️ Opciones de vuelo</h3>
          <div className="tp-options-grid">
            {currentPlan.flights.map((f, i) => (
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
            {currentPlan.hotels.map((h, i) => (
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

        <div className="tp-body" style={{ paddingBottom: '100px' }}> {/* Space for edit bar */}
          
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
              {lockedSteps.length > 0 && !isPremium && (
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
                {currentPlan.secretItinerary.map((step, idx) => (
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
              {!isPremium && (
                <div className="tp-paywall__cta">
                  <span className="tp-paywall__lock">🗝️</span>
                  <h3 className="tp-paywall__title">Ruta Secreta: Lo que los locales no cuentan</h3>
                  <p className="tp-paywall__sub">Restaurantes sin guías, rutas alternativas y experiencias únicas. Solo <strong>Wandr Plus</strong>.</p>
                  <a href="#pricing" onClick={onClose} className="tp-paywall__btn">Descubrir por 4,99€/mes →</a>
                  <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wandr AI Iterative Edit Bar */}
        <div className="tp-ai-edit-bar">
          {isEditing ? (
            <div className="tp-ai-loading">
              <div className="hero-loading__spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              <span>Wandr AI está rediseñando tu plan...</span>
            </div>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="✨ Cámbiame algo... (Ej: Pon más restaurantes locales en el día 2)" 
                value={editPrompt} 
                onChange={e => setEditPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
              />
              <button onClick={handleEditSubmit} disabled={!editPrompt.trim()}>Enviar</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
