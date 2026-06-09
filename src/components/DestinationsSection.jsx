import './DestinationsSection.css';
import { destinations } from '../data/mockData';

export default function DestinationsSection() {
  return (
    <section className="dests" id="destinations">
      <div className="dests__inner">
        <div className="dests__header">
          <span className="label">Destinos activos</span>
          <h2 className="display-lg dests__title">
            Italia en agosto: <span className="gradient-text">tu guía colectiva</span>
          </h2>
          <p className="dests__sub">Datos en tiempo real de viajeros que ya están allí o que estuvieron. Sin agencias, sin publicidad.</p>
        </div>

        <div className="dests__grid">
          {destinations.map((d, i) => (
            <article
              key={d.id}
              className={`d-card ${i === 0 ? 'd-card--hero' : ''}`}
              id={`dest-${d.id}`}
            >
              <img src={d.cover} alt={d.name} className="d-card__img" />
              <div className="d-card__overlay" />

              <div className="d-card__content">
                <div className="d-card__top">
                  <span className="d-card__emoji">{d.emoji}</span>
                  <div className="d-card__tags">
                    {d.tags.map(tag => (
                      <span key={tag} className="tag tag-teal d-card__tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="d-card__bottom">
                  <div>
                    <h3 className="d-card__name">{d.name}</h3>
                    <p className="d-card__country">{d.country}</p>
                    <p className="d-card__tagline">{d.tagline}</p>
                  </div>
                  <div className="d-card__stats">
                    <span className="d-card__stat">
                      <strong>{d.travelers}</strong> viajeros ahora
                    </span>
                    <span className="d-card__rating">
                      ★ {d.avgRating}
                    </span>
                  </div>
                  <button className="btn btn-ghost d-card__btn" id={`dest-btn-${d.id}`}>
                    Ver experiencias →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
