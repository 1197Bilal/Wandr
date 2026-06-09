import { useState } from 'react';
import './ExploreFeed.css';
import TestimonialCard from './TestimonialCard';
import { testimonials, destinations } from '../data/mockData';

const FILTERS = ['Todo', 'Cerdeña', 'Nápoles', 'Capri', 'Amalfi'];

export default function ExploreFeed() {
  const [activeFilter, setActiveFilter] = useState('Todo');

  const filtered = activeFilter === 'Todo'
    ? testimonials
    : testimonials.filter(t => {
        const dest = destinations.find(d => d.id === t.destination);
        return dest?.name === activeFilter;
      });

  return (
    <section className="feed" id="explore">
      <div className="feed__header">
        <div>
          <span className="label">Experiencias reales</span>
          <h2 className="display-lg feed__title">
            Lo que dice la <span className="gradient-text">gente que ya fue</span>
          </h2>
        </div>
        <p className="feed__sub">Testimonios sin filtros de quienes han estado ahí. Lo bueno, lo malo y los trucos que no salen en ninguna guía.</p>
      </div>

      {/* Filter tabs */}
      <div className="feed__filters" role="tablist">
        {FILTERS.map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={activeFilter === f}
            className={`feed__filter ${activeFilter === f ? 'feed__filter--active' : ''}`}
            onClick={() => setActiveFilter(f)}
            id={`filter-${f.toLowerCase().replace(' ', '-')}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="feed__grid">
        {filtered.map((t, i) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            featured={i === 0}
          />
        ))}
      </div>
    </section>
  );
}
