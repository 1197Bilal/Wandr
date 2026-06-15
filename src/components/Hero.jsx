import { useState } from 'react';
import './Hero.css';
import { generateTripPlan, SEARCH_EXAMPLES, VIBES } from '../data/tripPlanner';
import TripPlan from './TripPlan';

export default function Hero() {
  const [plan, setPlan] = useState(null);
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('7');
  const [companions, setCompanions] = useState('pareja');
  const [vibe, setVibe] = useState('cultura');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const COMPANIONS = [
    { val: 'solo', label: 'Solo/a', emoji: '🧳' },
    { val: 'pareja', label: 'Pareja', emoji: '❤️' },
    { val: 'amigos', label: 'Amigos', emoji: '🎉' },
    { val: 'familia', label: 'Familia', emoji: '👨‍👩‍👧' },
  ];

  useState(() => {
    const t = setInterval(() => setPlaceholderIdx(p => (p + 1) % SEARCH_EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleMouseMove = (e) => {
    const el = e.currentTarget.querySelector('.hero-corner__map-pattern');
    if (!el) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    const grad = `radial-gradient(circle at ${x}% ${y}%, rgba(0,0,0,1) 0%, transparent 60%)`;
    el.style.maskImage = grad;
    el.style.webkitMaskImage = grad;
  };

  const goStep2 = () => { if (destination.trim()) setStep(2); };
  const goStep3 = () => setStep(3);

  const handleGenerate = async () => {
    setStep(4);
    try {
      // The API call takes some time, so the loading UI will show naturally.
      const p = await generateTripPlan(destination, parseInt(days), companions, vibe);
      setPlan(p);
      setStep(1); 
      setDestination('');
    } catch (error) {
      console.error("Failed to generate plan:", error);
      setStep(1); // Go back if error
    }
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
            Dinos a dónde vas y cómo quieres viajar. Te armamos el plan perfecto, hora a hora.
          </p>

          {/* STEP 1: Destination */}
          {step === 1 && (
            <div className="hero-corner__search-wrap anim-fade-up">
              <div className="hero-corner__search">
                <div className="hero-corner__search-icon">⌘</div>
                <input id="hero-search" type="text" className="hero-corner__search-input"
                  placeholder={`Prueba con "${SEARCH_EXAMPLES[placeholderIdx]}"`}
                  value={destination} onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && goStep2()} autoComplete="off"
                />
                <button className="hero-corner__search-btn" onClick={goStep2} disabled={!destination.trim()}>
                  Siguiente →
                </button>
              </div>
              <div className="hero-corner__examples">
                <span className="hero-corner__ex-label">Trending:</span>
                {SEARCH_EXAMPLES.slice(0,3).map(ex => (
                  <button key={ex} className="hero-corner__ex-chip" onClick={() => setDestination(ex)}>{ex}</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Vibe */}
          {step === 2 && (
            <div className="hero-step2 anim-fade-up">
              <button className="hero-step2__back-btn" onClick={() => setStep(1)}>← {destination}</button>
              <div className="hero-step2__field" style={{marginTop: 24}}>
                <label className="hero-step2__label">✨ ¿Qué tipo de viaje quieres?</label>
                <div className="hero-step2__companions" style={{justifyContent:'center'}}>
                  {VIBES.map(v => (
                    <button key={v.val} className={`hero-step2__companion-btn ${vibe === v.val ? 'active' : ''}`} onClick={() => setVibe(v.val)}>
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="hero-corner__search-btn" style={{marginTop: 32, width:'100%', padding:'16px', borderRadius:'12px', fontSize:'1rem'}} onClick={goStep3}>
                Siguiente →
              </button>
            </div>
          )}

          {/* STEP 3: Days & Companions */}
          {step === 3 && (
            <div className="hero-step2 anim-fade-up">
              <button className="hero-step2__back-btn" onClick={() => setStep(2)}>← {VIBES.find(v2=>v2.val===vibe)?.emoji} {destination}</button>
              <div className="hero-step2__row" style={{marginTop: 24}}>
                <div className="hero-step2__field">
                  <label className="hero-step2__label">📅 ¿Cuántos días?</label>
                  <div className="hero-step2__days">
                    {['5','7','10','14','21'].map(d => (
                      <button key={d} className={`hero-step2__day-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d}d</button>
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
              <button className="hero-step2__generate" onClick={handleGenerate}>
                ✦ Generar mi plan perfecto
              </button>
            </div>
          )}

          {/* STEP 4: Loading */}
          {step === 4 && (
            <div className="hero-loading anim-fade-up">
              <div className="hero-loading__spinner"></div>
              <p className="hero-loading__text">Construyendo tu plan {VIBES.find(v2=>v2.val===vibe)?.emoji} en {destination}...</p>
              <div className="hero-loading__bar"><div className="hero-loading__fill"></div></div>
            </div>
          )}
        </div>

        <div className="hero-corner__scroll">
          <div className="hero-corner__scroll-mouse"><div className="hero-corner__scroll-wheel"></div></div>
        </div>
      </section>

      {plan && <TripPlan plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}
