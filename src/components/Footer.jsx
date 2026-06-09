import './Footer.css';
import { trendingTips } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Trending tips ticker */}
      <div className="footer__ticker">
        <span className="label footer__ticker-label">🔥 Trending</span>
        <div className="footer__ticker-track">
          <div className="footer__ticker-inner">
            {[...trendingTips, ...trendingTips].map((tip, i) => (
              <span key={i} className="footer__ticker-item">
                {tip.emoji} {tip.tip}
                <span className="footer__ticker-sep">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">✦</span>
            <span className="footer__logo-text">wandr</span>
          </div>
          <p className="footer__tagline">
            La comunidad de viajeros que comparten lo que de verdad importa. Sin agencias, sin publicidad, solo gente real.
          </p>
          <div className="footer__socials">
            {['𝕏', 'IG', 'TT'].map(s => (
              <button key={s} className="footer__social btn btn-ghost">{s}</button>
            ))}
          </div>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__group-title">Explorar</h4>
          <ul className="footer__links">
            {['Destinos', 'Testimonios', 'Trending tips', 'Mapa de viajeros'].map(l => (
              <li key={l}><a href="#" className="footer__link">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer__links-group">
          <h4 className="footer__group-title">Comunidad</h4>
          <ul className="footer__links">
            {['Conectar viajeros', 'Quedadas', 'Grupos por destino', 'Newsletter'].map(l => (
              <li key={l}><a href="#" className="footer__link">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer__newsletter">
          <h4 className="footer__group-title">Italia en agosto</h4>
          <p className="footer__newsletter-sub">Recibe los mejores tips de Cerdeña, Nápoles y Capri antes de irte.</p>
          <div className="footer__newsletter-form">
            <input
              type="email"
              placeholder="tu@email.com"
              className="footer__input glass"
              id="newsletter-email"
            />
            <button className="btn btn-primary" id="newsletter-submit">Suscribir</button>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 wandr · Hecho con ❤️ por y para viajeros</span>
        <div className="footer__bottom-links">
          <a href="#" className="footer__link">Privacidad</a>
          <a href="#" className="footer__link">Términos</a>
          <a href="#" className="footer__link">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
