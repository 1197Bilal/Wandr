import { useState, useEffect } from 'react';
import './SocialFeed.css';
import { testimonials, users, destinations } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function PostCard({ testimonial }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Fallback to mockData if author/dest info is not directly on the object
  const authorName = testimonial.user?.name || (users.find(u => u.id === testimonial.userId)?.name);
  const authorAvatar = testimonial.user?.avatar || (users.find(u => u.id === testimonial.userId)?.avatar);
  const authorLocation = testimonial.user?.location || (users.find(u => u.id === testimonial.userId)?.location) || 'Mundo';
  
  const dest = destinations.find(d => d.id === (testimonial.destId || testimonial.destination));
  const stars  = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));

  // Format date
  const dateStr = testimonial.createdAt?.toDate 
    ? testimonial.createdAt.toDate().toLocaleDateString() 
    : (testimonial.date || 'Reciente');

  return (
    <article className="post glass">
      {/* ── Author row ── */}
      <div className="post__header">
        <img src={authorAvatar} alt={authorName} className="post__avatar" />
        <div className="post__author">
          <div className="post__author-row">
            <span className="post__name">{authorName}</span>
            <span className="tag tag-orange post__dest">{dest?.emoji} {dest?.name || testimonial.destinationName}</span>
          </div>
          <span className="post__meta">📍 {authorLocation} · {dateStr}</span>
        </div>
        <div className="post__stars">{stars}</div>
      </div>

      {/* ── Image ── */}
      {testimonial.images?.[0] && (
        <div className="post__img-wrap">
          <img src={testimonial.images[0]} alt={testimonial.title} className="post__img" />
          {testimonial.images[1] && (
            <img src={testimonial.images[1]} alt="" className="post__img post__img--secondary" />
          )}
        </div>
      )}

      {/* ── Text ── */}
      <div className="post__body">
        <h3 className="post__title">{testimonial.title}</h3>
        <p className="post__text">{testimonial.body}</p>

        {testimonial.tips?.length > 0 && (
          <button
            className="post__tips-toggle"
            onClick={() => setShowTips(v => !v)}
            id={`tips-toggle-${testimonial.id}`}
          >
            💡 {showTips ? 'Ocultar tips' : `Ver ${testimonial.tips.length} tips de viaje`}
          </button>
        )}

        {showTips && (
          <ul className="post__tips">
            {testimonial.tips.map((tip, i) => (
              <li key={i} className="post__tip">✓ {tip}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="post__actions">
        <button
          className={`post__action ${liked ? 'post__action--liked' : ''}`}
          onClick={() => setLiked(v => !v)}
          id={`like-${testimonial.id}`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{testimonial.likes + (liked ? 1 : 0)}</span>
        </button>
        <button
          className={`post__action ${saved ? 'post__action--saved' : ''}`}
          onClick={() => setSaved(v => !v)}
          id={`save-${testimonial.id}`}
        >
          <span>{saved ? '🔖' : '📌'}</span>
          <span>{saved ? 'Guardado' : 'Guardar'}</span>
        </button>
        <button className="post__action" id={`share-${testimonial.id}`}>
          <span>🔗</span><span>Compartir</span>
        </button>
        <button className="post__action post__action--plan" id={`plan-${testimonial.id}`}>
          <span>✦</span><span>Ver plan</span>
        </button>
      </div>
    </article>
  );
}

const FILTERS = [
  { label: 'Todo 🌍',      val: 'all'      },
  { label: '🏝️ Playa',     val: 'beach'    },
  { label: '⛰️ Montaña',   val: 'mountain' },
  { label: '🏙️ Ciudad',    val: 'city'     },
];

export default function SocialFeed({ onComposeClick, user }) {
  const [filter, setFilter] = useState('all');
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  // Combine DB posts and mock posts for now, or just use DB if it has items.
  // In a real app, you'd migrate all mock data to the DB.
  // Here we'll just show DB posts first, then mock ones if filter matches.
  
  // Actually, let's just use the DB posts and if empty, we fall back to nothing 
  // or we can hardcode the mockData below. We will merge them for display purposes.
  const allPosts = [...dbPosts, ...testimonials];

  const filteredPosts = filter === 'all'
    ? allPosts
    : allPosts.filter(t => (t.destId || t.destination) === filter);

  return (
    <section className="sfeed" id="explore">
      <div className="sfeed__inner">

        {/* ── Sidebar left: filters + trending ── */}
        <aside className="sfeed__sidebar">
          <div className="sfeed__sidebar-box glass">
            <span className="label sfeed__sidebar-label">Filtrar por destino</span>
            <nav className="sfeed__nav">
              {FILTERS.map(f => (
                <button
                  key={f.val}
                  className={`sfeed__nav-btn ${filter === f.val ? 'sfeed__nav-btn--active' : ''}`}
                  onClick={() => setFilter(f.val)}
                  id={`feed-filter-${f.val}`}
                >
                  {f.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="sfeed__sidebar-box glass sfeed__trending">
            <span className="label sfeed__sidebar-label">🔥 Trending tips</span>
            <ul className="sfeed__trend-list">
              {[
                { emoji:'🗺️', tip:'Usa Google Maps offline' },
                { emoji:'🎒', tip:'Viaja con equipaje ligero' },
                { emoji:'🍽️', tip:'Come donde comen los locales' },
                { emoji:'🚊', tip:'El tren es más barato si reservas 1 mes antes' },
                { emoji:'📸', tip:'Levántate temprano para fotos sin gente' },
              ].map((t, i) => (
                <li key={i} className="sfeed__trend-item">
                  <span>{t.emoji}</span>
                  <span>{t.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main feed ── */}
        <div className="sfeed__feed">
          <div className="sfeed__feed-header">
            <h2 className="heading-lg">Feed de experiencias</h2>
            <span className="sfeed__count body-sm" style={{color:'var(--c-text-muted)'}}>
              {filteredPosts.length} publicaciones
            </span>
          </div>

          <div className="sfeed__compose glass">
            <img
              src={user?.photoURL || "https://ui-avatars.com/api/?name=Viajero"}
              alt="Tú"
              className="sfeed__compose-avatar"
            />
            <button className="sfeed__compose-input" id="compose-btn" onClick={() => user ? onComposeClick() : alert("Inicia sesión para publicar")}>
              ¿Dónde has estado? Comparte tu experiencia...
            </button>
            <button className="btn btn-primary sfeed__compose-post" id="compose-post" onClick={() => user ? onComposeClick() : alert("Inicia sesión para publicar")}>Publicar</button>
          </div>

          <div className="sfeed__posts">
            {filteredPosts.map((t, i) => (
              <div key={t.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <PostCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar right: community ── */}
        <aside className="sfeed__sidebar sfeed__sidebar--right">
          <div className="sfeed__sidebar-box glass">
            <span className="label sfeed__sidebar-label">👥 Viajando ahora</span>
            <ul className="sfeed__people">
              {users.slice(0, 5).map(u => (
                <li key={u.id} className="sfeed__person">
                  <img src={u.avatar} alt={u.name} className="sfeed__person-avatar" />
                  <div className="sfeed__person-info">
                    <span className="sfeed__person-name">{u.name}</span>
                    <span className="sfeed__person-dest">
                      {u.destinations.map(dId => {
                        const d = destinations.find(x => x.id === dId);
                        return d?.emoji;
                      }).join(' ')} · {u.dates}
                    </span>
                  </div>
                  <button className="sfeed__follow btn btn-ghost" id={`follow-${u.id}`}>+</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sfeed__sidebar-box glass">
            <span className="label sfeed__sidebar-label">✦ Generar plan</span>
            <p style={{fontSize:'0.83rem', color:'var(--c-text-muted)', lineHeight:1.6, marginBottom:12}}>
              Escribe tu destino arriba y te generamos un itinerario con tips de la comunidad.
            </p>
            <a href="#hero" className="btn btn-accent" style={{width:'100%', justifyContent:'center'}}>
              Probar ahora →
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
