import { useState } from 'react';
import './Hero.css';
import { generateTripPlan, SEARCH_EXAMPLES } from '../data/tripPlanner';
import TripPlan from './TripPlan';

export default function Hero() {
  const [query, setQuery]     = useState('');
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setPlan(generateTripPlan(query));
      setLoading(false);
    }, 900);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />

        <div className="hero__content anim-fade-up">
          <div className="hero__eyebrow">
            <span className="tag tag-orange">✦ Tu comunidad de viajes</span>
          </div>

          <h1 className="display-xl hero__title">
            Dime adónde vas<br />
            y te cuento <em className="gradient-text">cómo hacerlo</em>
          </h1>

          <p className="hero__sub">
            Escribe tu destino y cuántos días tienes. Te generamos un plan basado en experiencias reales de la comunidad.
          </p>

          {/* ── Smart search bar ── */}
          <div className="hero__search-wrap">
            <div className={`hero__search glass ${loading ? 'hero__search--loading' : ''}`}>
              <span className="hero__search-icon">{loading ? '⏳' : '✈️'}</span>
              <input
                id="hero-search"
                type="text"
                className="hero__search-input"
                placeholder="Ej: Tailandia 10 días, Japón 2 semanas..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
              />
              <button
                className={`btn btn-primary hero__search-btn ${loading ? 'hero__search-btn--loading' : ''}`}
                onClick={handleSearch}
                id="hero-search-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="hero__spinner" />
                ) : (
                  'Generar plan →'
                )}
              </button>
            </div>

            {/* Example chips */}
            <div className="hero__examples">
              {SEARCH_EXAMPLES.map(ex => (
                <button
                  key={ex}
                  className="hero__example-chip"
                  onClick={() => { setQuery(ex); }}
                  id={`example-${ex.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Floating stat cards ── */}
        <div className="hero__stats anim-fade-up">
          <div className="hero__stat glass">
            <span className="hero__stat-value">12k+</span>
            <span className="hero__stat-label">Testimonios</span>
          </div>
          <div className="hero__stat glass">
            <span className="hero__stat-value">84</span>
            <span className="hero__stat-label">Destinos</span>
          </div>
          <div className="hero__stat glass">
            <span className="hero__stat-value">3.2k</span>
            <span className="hero__stat-label">Viajeros activos</span>
          </div>
        </div>

        <div className="hero__scroll">
          <span className="label">Scroll</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* Trip plan modal */}
      {plan && <TripPlan plan={plan} onClose={() => setPlan(null)} />}
    </>
  );
}
