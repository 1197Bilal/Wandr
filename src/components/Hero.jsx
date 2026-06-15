import { useState, useEffect } from 'react';
import './Hero.css';
import { generateTripPlan, SEARCH_EXAMPLES } from '../data/tripPlanner';
import TripPlan from './TripPlan';

export default function Hero() {
  const [query, setQuery]     = useState('');
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Rotating placeholder for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % SEARCH_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setPlan(generateTripPlan(query));
      setLoading(false);
    }, 1200); // Slightly longer for "AI generation" effect
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleMouseMove = (e) => {
    // Calculate percentage position of mouse across screen
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  return (
    <>
      <section className="hero-corner" id="hero" onMouseMove={handleMouseMove}>
        {/* Dynamic Map Background */}
        <div className="hero-corner__bg">
          <div className="hero-corner__map-pattern" style={{
            maskImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, transparent 60%)`,
            WebkitMaskImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, transparent 60%)`
          }}></div>
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
            Genera itinerarios hiper-optimizados en segundos. Basado en datos de miles de viajeros reales, no en guías turísticas desfasadas.
          </p>

          {/* ── Giant Search Bar ── */}
          <div className="hero-corner__search-wrap">
            <div className={`hero-corner__search ${loading ? 'hero-corner__search--loading' : ''}`}>
              <div className="hero-corner__search-icon">
                {loading ? <span className="hero__spinner" /> : '⌘'}
              </div>
              <input
                id="hero-search"
                type="text"
                className="hero-corner__search-input"
                placeholder={`Prueba con "${SEARCH_EXAMPLES[placeholderIdx]}"`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                autoComplete="off"
              />
              <button
                className="hero-corner__search-btn"
                onClick={handleSearch}
                id="hero-search-btn"
                disabled={loading || !query.trim()}
              >
                Generar Plan
              </button>
            </div>

            {/* Sub text / examples */}
            <div className="hero-corner__examples">
              <span className="hero-corner__ex-label">Destinos trending:</span>
              {SEARCH_EXAMPLES.slice(0,3).map(ex => (
                <button
                  key={ex}
                  className="hero-corner__ex-chip"
                  onClick={() => { setQuery(ex); }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-corner__scroll">
          <div className="hero-corner__scroll-mouse">
            <div className="hero-corner__scroll-wheel"></div>
          </div>
        </div>
      </section>

      {/* Trip plan modal */}
      {plan && <TripPlan plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}
