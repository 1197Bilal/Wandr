import { useState } from 'react';
import './Hero.css';
import { generateTripPlan, SEARCH_EXAMPLES } from '../data/tripPlanner';
import TripPlan from './TripPlan';

const COMPANIONS = [
  { val: 'solo', label: 'Solo/a', emoji: '🧳' },
  { val: 'pareja', label: 'Pareja', emoji: '❤️' },
  { val: 'amigos', label: 'Amigos', emoji: '🎉' },
  { val: 'familia', label: 'Familia', emoji: '👨‍👩‍👧' },
];

export default function Hero() {
  const [plan, setPlan] = useState(null);
  const [step, setStep] = useState(1); // 1=dest, 2=details, 3=loading
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('7');
  const [companions, setCompanions] = useState('pareja');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Rotate placeholder
  useState(() => {
    const interval = setInterval(() => setPlaceholderIdx(p => (p + 1) % SEARCH_EXAMPLES.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    e.currentTarget.querySelector('.hero-corner__map-pattern').style.maskImage =
      `radial-gradient(circle at ${x}% ${y}%, rgba(0,0,0,1) 0%, transparent 60%)`;
    e.currentTarget.querySelector('.hero-corner__map-pattern').style.webkitMaskImage =
      `radial-gradient(circle at ${x}% ${y}%, rgba(0,0,0,1) 0%, transparent 60%)`;
  };

  const goToStep2 = () => { if (destination.trim()) setStep(2); };
  const handleKey = (e) => { if (e.key === 'Enter') goToStep2(); };

  const handleGenerate = () => {
    setStep(3);
    setTimeout(() => {
      setPlan(generateTripPlan(destination, parseInt(days), companions));
      setStep(1);
      setDestination('');
    }, 2000);
  };

  return (
    <>
      <section className="hero-corner" id="hero" onMouseMove={handleMouseMove}>
        <div className="hero-corner__bg">
          <div className="hero-corner__map-pattern"></div>
          <div className="hero-corner__glow hero-corner__glow--1"></div>
          <div className="hero-corner__glow hero-corner__glow--2"></div>
        </div>

        <div className="hero-corner__content anim-fade-up">
          <div className="hero-corner__badge">
            <span className="hero-corner__badge-dot"></span>
            El motor de viajes impulsado por comunidad
          </div>

          <h1 className="hero-corner__title">
            Conecta con el mundo.<br/>
            <em className="gradient-text">Conecta con su gente.</em>
          </h1>

          <p className="hero-corner__sub">
            Genera itinerarios hiper-optimizados en segundos. Basado en datos de miles de viajeros reales.
          </p>

          {/* ── Step 1: Destination ── */}
          {step === 1 && (
            <div className="hero-corner__search-wrap anim-fade-up">
              <div className="hero-corner__search">
                <div className="hero-corner__search-icon">⌘</div>
                <input
                  id="hero-search"
                  type="text"
                  className="hero-corner__search-input"
                  placeholder={`Prueba con "${SEARCH_EXAMPLES[placeholderIdx]}"`}
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="off"
                />
                <button className="hero-corner__search-btn" onClick={goToStep2} disabled={!destination.trim()}>
                  Siguiente →
                </button>
              </div>
              <div className="hero-corner__examples">
                <span className="hero-corner__ex-label">Trending:</span>
                {SEARCH_EXAMPLES.slice(0,3).map(ex => (
                  <button key={ex} className="hero-corner__ex-chip" onClick={() => setDestination(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div className="hero-step2 anim-fade-up">
              <div className="hero-step2__back">
                <button className="hero-step2__back-btn" onClick={() => setStep(1)}>← {destination}</button>
              </div>

              <div className="hero-step2__row">
                <div className="hero-step2__field">
                  <label className="hero-step2__label">📅 ¿Cuántos días?</label>
                  <div className="hero-step2__days">
                    {['5','7','10','14','21'].map(d => (
                      <button key={d} className={`hero-step2__day-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hero-step2__field">
                  <label className="hero-step2__label">👥 ¿Con quién viajas?</label>
                  <div className="hero-step2__companions">
                    {COMPANIONS.map(c => (
                      <button key={c.val} className={`hero-step2__companion-btn ${companions === c.val ? 'active' : ''}`} onClick={() => setCompanions(c.val)}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="hero-corner__search-btn hero-step2__generate" onClick={handleGenerate}>
                ✦ Generar mi plan personalizado
              </button>
            </div>
          )}

          {/* ── Step 3: Loading ── */}
          {step === 3 && (
            <div className="hero-loading anim-fade-up">
              <div className="hero-loading__spinner"></div>
              <p className="hero-loading__text">Analizando {destination} con datos de 12.000 viajeros...</p>
              <div className="hero-loading__bar"><div className="hero-loading__fill"></div></div>
            </div>
          )}
        </div>

        <div className="hero-corner__scroll">
          <div className="hero-corner__scroll-mouse">
            <div className="hero-corner__scroll-wheel"></div>
          </div>
        </div>
      </section>

      {plan && <TripPlan plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}
