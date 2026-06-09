import { useState } from 'react';
import './CommunitySection.css';
import { users, destinations } from '../data/mockData';

const BADGE_COLORS = {
  'Explorador':     'tag-purple',
  'Fotógrafo':      'tag-teal',
  'Viajera Nata':   'tag-orange',
  'Foodie':         'tag-gold',
  'Aventurera':     'tag-teal',
  'Nómada Digital': 'tag-purple',
};

export default function CommunitySection() {
  const [connected, setConnected] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  const destFilters = [
    { id: 'all',      label: 'Todos' },
    { id: 'sardinia', label: '🏖️ Cerdeña' },
    { id: 'naples',   label: '🍕 Nápoles' },
    { id: 'capri',    label: '⛵ Capri' },
  ];

  const filtered = activeFilter === 'all'
    ? users
    : users.filter(u => u.destinations.includes(activeFilter));

  const toggle = (id) => setConnected(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className="community" id="community">
      <div className="community__inner">
        {/* Header */}
        <div className="community__header">
          <span className="label">Comunidad</span>
          <h2 className="display-lg community__title">
            ¿Quién viaja a los <span className="gradient-text">mismos sitios</span> que tú?
          </h2>
          <p className="community__sub">
            Conecta con viajeros que coinciden en destino y fechas. Quedadas espontáneas, recomendaciones en directo y amigos de viaje.
          </p>
        </div>

        {/* Filters */}
        <div className="community__filters">
          {destFilters.map(f => (
            <button
              key={f.id}
              className={`community__filter ${activeFilter === f.id ? 'community__filter--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
              id={`comm-filter-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* User cards grid */}
        <div className="community__grid">
          {filtered.map((user, i) => (
            <div
              key={user.id}
              className="u-card glass"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="u-card__top">
                <div className="u-card__avatar-wrap">
                  <img src={user.avatar} alt={user.name} className="u-card__avatar" />
                  <span className="u-card__online" />
                </div>
                <div className="u-card__info">
                  <span className="u-card__name">{user.name}</span>
                  <span className="u-card__location">📍 {user.location}</span>
                  <span className={`tag ${BADGE_COLORS[user.badge] || 'tag-purple'} u-card__badge`}>
                    {user.badge}
                  </span>
                </div>
              </div>

              <p className="u-card__bio">{user.bio}</p>

              <div className="u-card__dests">
                {user.destinations.map(dId => {
                  const d = destinations.find(x => x.id === dId);
                  return (
                    <span key={dId} className="tag tag-orange u-card__dest-tag">
                      {d?.emoji} {d?.name}
                    </span>
                  );
                })}
              </div>

              <div className="u-card__footer">
                <div className="u-card__meta">
                  <span className="u-card__dates">🗓 {user.dates}</span>
                  <span className="u-card__trips">✈️ {user.tripCount} viajes</span>
                </div>
                <button
                  className={`btn u-card__connect ${connected[user.id] ? 'btn-ghost u-card__connect--done' : 'btn-accent'}`}
                  onClick={() => toggle(user.id)}
                  id={`connect-${user.id}`}
                >
                  {connected[user.id] ? '✓ Conectado' : 'Conectar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="community__cta glass">
          <div className="community__cta-text">
            <h3 className="heading-lg">¿Te vas a Italia este verano?</h3>
            <p>Crea tu perfil y aparece en el mapa de viajeros. Ya hay <strong style={{color:'var(--c-primary)'}}>298 personas</strong> con planes en Italia para agosto.</p>
          </div>
          <div className="community__cta-actions">
            <button className="btn btn-primary" id="cta-create-profile">Crear mi perfil ✦</button>
            <button className="btn btn-ghost" id="cta-browse-all">Ver todos los viajeros</button>
          </div>
        </div>
      </div>
    </section>
  );
}
