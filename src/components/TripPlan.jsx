import { useEffect, useState } from 'react';
import './TripPlan.css';
import { editTripPlan } from '../data/tripPlanner';

const TABS = ['🗺️ Ruta Estándar', '🤫 Ruta Secreta'];
const PREMIUM_EMAILS = ['elhspm1@gmail.com'];

export default function TripPlan({ plan: initialPlan, onClose }) {
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [tab, setTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPremiumLock, setShowPremiumLock] = useState(false);

  // Premium check — hardcoded whitelist synced from Firebase auth in App.jsx
  const currentUserEmail = localStorage.getItem('wandr_user_email') || '';
  const isPremium = PREMIUM_EMAILS.includes(currentUserEmail);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleEditSubmit = async () => {
    if (!editPrompt.trim()) return;
    if (!isPremium) { setShowPremiumLock('Wandr AI Edit'); return; }
    setIsEditing(true);
    try {
      const updatedPlan = await editTripPlan(currentPlan, editPrompt);
      setCurrentPlan(updatedPlan); // editTripPlan always returns something (original or updated)
      setEditPrompt('');
    } catch (e) {
      console.warn('Edit silently failed, keeping current plan:', e);
      // Never alert — editTripPlan already returns original plan on failure
    } finally { setIsEditing(false); }
  };

  const handlePremiumAction = (name) => {
    if (!isPremium) { setShowPremiumLock(name); return; }
    alert(`Función ${name} disponible próximamente.`);
  };

  // Premium: all days shown. Free: only day 1
  const visibleSteps = isPremium ? currentPlan.itinerary : currentPlan.itinerary.slice(0, 1);
  const lockedSteps  = isPremium ? [] : currentPlan.itinerary.slice(1);

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>

        {/* Premium Lock Modal */}
        {showPremiumLock && (
          <div className="tp-premium-lock-modal">
            <div className="tp-premium-lock-content">
              <h3>👑 Función exclusiva Wandr Plus</h3>
              <p>Estás intentando usar <strong>{showPremiumLock}</strong>. Los usuarios Pro ahorran una media de <strong>200€ por viaje</strong> con estas herramientas. ¿Vas a quedarte sin ellas?</p>
              <button className="tp-premium-lock-btn" onClick={() => setShowPremiumLock(false)} style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', color: 'white' }}>
                Hazte PRO por 4,99€/mes →
              </button>
              <button className="tp-premium-lock-close" onClick={() => setShowPremiumLock(false)}>No gracias, seguiré perdiendo tiempo</button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="tp-action-bar">
          {isPremium && (
            <span className="tp-premium-badge">👑 Plan Premium · Acceso Total</span>
          )}
          <button className="tp-action-btn" onClick={() => handlePremiumAction('Mapa Offline')}>🗺️ Mapa Offline</button>
          <button className="tp-action-btn" onClick={() => handlePremiumAction('Exportar PDF')}>📄 Exportar PDF</button>
          <button className="tp-close" onClick={onClose}>✕</button>
        </div>

        {/* Cover */}
        <div className="tp-cover" style={{ backgroundImage: `url(${currentPlan.cover})` }}>
          <div className="tp-cover__overlay">
            <div className="tp-cover__content">
              {isPremium && (
                <div className="tp-cover__premium-pill">👑 Acceso Total · Sin Límites</div>
              )}
              <span className="tp-flag">{currentPlan.flag}</span>
              <h2 className="tp-title">{currentPlan.destination}</h2>
              <div className="tp-meta-row">
                <span className="tp-meta-chip">👥 {currentPlan.companions}</span>
                <span className="tp-meta-chip">✨ {currentPlan.vibe}</span>
                <span className="tp-meta-chip">💰 {currentPlan.budget?.total}</span>
                <span className="tp-meta-chip">{currentPlan.weather?.icon} {currentPlan.weather?.temp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flights */}
        <div className="tp-section">
          <h3 className="tp-section-title">✈️ Opciones de vuelo</h3>
          <div className="tp-options-grid">
            {currentPlan.flights?.map((f, i) => (
              <a
                key={i}
                href={f.link || 'https://www.skyscanner.es'}
                target="_blank"
                rel="noopener noreferrer"
                className="tp-option-card tp-option-card--flight"
                onClick={e => e.stopPropagation()}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
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
            {currentPlan.hotels?.map((h, i) => (
              <a
                key={i}
                href={h.link || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name || currentPlan.destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tp-option-card tp-option-card--hotel"
                onClick={e => e.stopPropagation()}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
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

        <div className="tp-body" style={{ paddingBottom: '100px' }}>

          {/* TAB 1: Ruta Estándar */}
          {tab === 0 && (
            <>
              {/* Day Navigation */}
              {visibleSteps.length > 1 && (
                <div className="tp-day-nav">
                  {visibleSteps.map((step, idx) => (
                    <button 
                      key={idx} 
                      className={`tp-day-nav-btn ${selectedDay === step.day ? 'tp-day-nav-btn--active' : ''}`}
                      onClick={() => setSelectedDay(step.day)}
                    >
                      Día {step.day}
                    </button>
                  ))}
                </div>
              )}

              {visibleSteps.filter(s => visibleSteps.length === 1 || s.day === selectedDay).map((step, idx) => (
                <div key={idx} className={`tp-day-card glass-strong${step.isSpecial ? ' tp-day-card--special' : ''}`}>
                  <div className="tp-day-header">
                    <span className="tp-day-emoji">{step.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span className="tp-day-label">Día {step.day}</span>
                      <h4 className="tp-day-place">{step.place}</h4>
                    </div>
                    {step.isSpecial && (
                      <span className="tp-day-special-badge">💫 Noche especial</span>
                    )}
                  </div>

                  <div className="tp-day-slots">
                    {step.slots?.map((slot, si) => (
                      <div key={si} className="tp-slot">
                        <div className="tp-slot__type-badge">{slot.type}</div>
                        <div className="tp-slot__content">
                          <div className="tp-slot__header">
                            <div>
                              <strong className="tp-slot__title">{slot.title}</strong>
                              {slot.time && <span className="tp-slot__time-label">{slot.time}</span>}
                            </div>
                            {slot.link && slot.link !== '#' && (
                              <a 
                                href={slot.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tp-slot__map-btn"
                                style={{ display: 'inline-block', textDecoration: 'none' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                📍 Ver en Maps
                              </a>
                            )}
                          </div>
                          <p className="tp-slot__desc">{slot.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {step.tip && (
                    <div className="tp-day-tip glass-strong">
                      <span className="tp-day-tip-icon">💡</span>
                      <p><strong>Tip:</strong> {step.tip}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Paywall — only for free users */}
              {!isPremium && lockedSteps.length > 0 && (
                <>
                  <div className="tp-paywall-inline glass-strong">
                    <span className="tp-paywall__lock">🔒</span>
                    <h3 className="tp-paywall__title">Desbloquea los {lockedSteps.length} días restantes</h3>
                    <p className="tp-paywall__sub">
                      No te conformes con un día. Los usuarios Pro acceden al itinerario <strong>completo hora a hora</strong>, restaurantes secretos, mapas offline y la ruta de los locales.
                    </p>
                    <a href="#pricing" onClick={onClose} className="tp-paywall__btn-glow">
                      Hazte PRO por 4,99€/mes →
                    </a>
                    <span className="tp-paywall__hint">7 días gratis · Cancela cuando quieras</span>
                  </div>

                  <div className="tp-paywall-blurred-area">
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
                            {step.slots?.slice(0, 2).map((s, si) => (
                              <div key={si} className="tp-slot">
                                <div className="tp-slot__type-badge">{s.type}</div>
                                <div className="tp-slot__content">
                                  <strong className="tp-slot__title">{s.title}</strong>
                                  <p className="tp-slot__desc">{s.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="tp-paywall__gradient-overlay" />
                  </div>
                </>
              )}
            </>
          )}

          {/* TAB 2: Ruta Secreta */}
          {tab === 1 && (
            <div className="tp-secret">
              {isPremium ? (
                currentPlan.secretItinerary?.map((step, idx) => (
                  <div key={idx} className="tp-day-card glass-strong">
                    <div className="tp-day-header">
                      <span className="tp-day-emoji">{step.emoji}</span>
                      <div>
                        <span className="tp-day-label">Día {step.day} · Secreto</span>
                        <h4 className="tp-day-place">{step.place}</h4>
                      </div>
                    </div>
                    <p style={{ color: '#ccc', padding: '0 20px 20px', lineHeight: 1.6 }}>{step.highlight}</p>
                    {step.link && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(step.link, '_blank', 'noopener,noreferrer'); }} 
                        className="tp-slot__map-btn" 
                        style={{ margin: '0 20px 20px', display: 'inline-block' }}
                      >
                        📍 Ver en Maps
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div className="tp-secret__blurred">
                    {currentPlan.secretItinerary?.map((step, idx) => (
                      <div key={idx} className="tp-day-card glass-strong" style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
                        <div className="tp-day-header">
                          <span className="tp-day-emoji">{step.emoji}</span>
                          <div>
                            <span className="tp-day-label">Día {step.day}</span>
                            <h4 className="tp-day-place">{step.place}</h4>
                          </div>
                        </div>
                        <p style={{ color: '#bbb', padding: '0 20px 20px' }}>{step.highlight}</p>
                      </div>
                    ))}
                  </div>
                  <div className="tp-paywall__cta">
                    <span className="tp-paywall__lock">🗝️</span>
                    <h3 className="tp-paywall__title">🔥 Lo que los guías no te cuentan</h3>
                    <p className="tp-paywall__sub">Mientras los turistas hacen colas de 2 horas, los usuarios Pro comen donde los locales y encuentran las calas sin gente. No seas un guiri más.</p>
                    <a href="#pricing" onClick={onClose} className="tp-paywall__btn" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', color: 'white' }}>
                      Ver secretos por 4,99€/mes →
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* AI Edit Bar */}
        <div className="tp-ai-edit-bar">
          {isEditing ? (
            <div className="tp-ai-loading">
              <div className="hero-loading__spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              <span>Wandr AI está rediseñando tu plan...</span>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder={isPremium ? '✨ Cámbiame algo... (Ej: Añade una excursión a Capri el día 4)' : '🔒 Edición IA · Solo usuarios Pro'}
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
                readOnly={!isPremium}
                style={{ cursor: isPremium ? 'text' : 'not-allowed', opacity: isPremium ? 1 : 0.6 }}
              />
              <button onClick={handleEditSubmit} disabled={!editPrompt.trim() || !isPremium}>Enviar</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
