import { useState } from 'react';
import './Hero.css';
import { generateQuestions, generateTripPlan, SEARCH_EXAMPLES } from '../data/tripPlanner';
import TripPlan from './TripPlan';

export default function Hero() {
  const [plan, setPlan] = useState(null);
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Dynamic Questionnaire State
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '', '']);
  const [dates, setDates] = useState({ start: '', end: '' });

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

  const handleStartAnalysis = async () => {
    if (!destination.trim()) return;
    setStep(2); // Loading questions
    try {
      const q = await generateQuestions(destination);
      setQuestions(q);
      setStep(3); // Questionnaire
    } catch (e) {
      console.error(e);
      setStep(1);
    }
  };

  const handleGeneratePlan = async () => {
    if (!dates.start || !dates.end) {
      alert("Por favor, selecciona las fechas del viaje.");
      return;
    }
    setStep(4); // Loading plan
    try {
      const p = await generateTripPlan(destination, dates, questions, answers);
      setPlan(p);
      setStep(1); 
      setDestination('');
      setAnswers(['','','']);
      setDates({ start:'', end:'' });
    } catch (error) {
      console.error("Failed to generate plan:", error);
      setStep(1);
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
            El primer planificador guiado por IA
          </div>
          <h1 className="hero-corner__title">
            Conecta con el mundo.<br/>
            <em className="gradient-text">Conecta con su gente.</em>
          </h1>
          <p className="hero-corner__sub">
            Pide un deseo. Te haremos unas preguntas rápidas y armaremos el viaje de tus sueños hora a hora.
          </p>

          {/* STEP 1: Destination Idea */}
          {step === 1 && (
            <div className="hero-corner__search-wrap anim-fade-up">
              <div className="hero-corner__search">
                <div className="hero-corner__search-icon">⌘</div>
                <input id="hero-search" type="text" className="hero-corner__search-input"
                  placeholder={`Ej. "${SEARCH_EXAMPLES[placeholderIdx]}"`}
                  value={destination} onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStartAnalysis()} autoComplete="off"
                />
                <button className="hero-corner__search-btn" onClick={handleStartAnalysis} disabled={!destination.trim()}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Loading Questions */}
          {step === 2 && (
            <div className="hero-loading anim-fade-up" style={{marginTop: 40}}>
              <div className="hero-loading__spinner"></div>
              <p className="hero-loading__text">Analizando tu idea para {destination}...</p>
            </div>
          )}

          {/* STEP 3: Dynamic Questionnaire */}
          {step === 3 && (
            <div className="hero-step2 anim-fade-up" style={{maxWidth: 600, margin: '40px auto 0'}}>
              <button className="hero-step2__back-btn" onClick={() => setStep(1)}>← Cambiar destino</button>
              
              <div className="hero-step2__form" style={{marginTop: 24, textAlign: 'left'}}>
                
                {/* Dates (Fixed) */}
                <div style={{marginBottom: 24}}>
                  <label className="hero-step2__label" style={{display:'block', marginBottom: 8}}>📅 ¿En qué fechas viajas?</label>
                  <div style={{display:'flex', gap: 12}}>
                    <input type="date" className="hero-corner__search-input" style={{padding:'12px', flex:1}} 
                           value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} />
                    <input type="date" className="hero-corner__search-input" style={{padding:'12px', flex:1}} 
                           value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} />
                  </div>
                </div>

                {/* AI Dynamic Questions */}
                {questions.map((q, i) => (
                  <div key={i} style={{marginBottom: 20}}>
                    <label className="hero-step2__label" style={{display:'block', marginBottom: 8, fontSize:'0.9rem', color:'#fff'}}>✨ {q}</label>
                    <input type="text" className="hero-corner__search-input" style={{padding:'12px', width:'100%', fontSize:'0.95rem'}}
                           placeholder="Tu respuesta..."
                           value={answers[i]} onChange={e => {
                             const newAns = [...answers];
                             newAns[i] = e.target.value;
                             setAnswers(newAns);
                           }} />
                  </div>
                ))}

              </div>

              <button className="hero-step2__generate" onClick={handleGeneratePlan} style={{marginTop: 16}}>
                ✦ Crear itinerario exacto
              </button>
            </div>
          )}

          {/* STEP 4: Loading Final Plan */}
          {step === 4 && (
            <div className="hero-loading anim-fade-up" style={{marginTop: 40}}>
              <div className="hero-loading__spinner"></div>
              <p className="hero-loading__text">Buscando vuelos, hoteles e itinerario perfecto para {destination}...</p>
              <div className="hero-loading__bar"><div className="hero-loading__fill"></div></div>
            </div>
          )}
        </div>
      </section>

      {plan && <TripPlan plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}
