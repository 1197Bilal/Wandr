import { useState } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Explorar', href: '#explore' },
  { label: 'Mapa', href: '#map' },
  { label: 'Comunidad', href: '#community' },
];

export default function Navbar({ activeSection, user, onLoginClick, onLogoutClick, onProfileClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar glass">
      <a href="#" className="navbar__logo">
        <span className="navbar__logo-icon">✦</span>
        <span className="navbar__logo-text">wandr</span>
      </a>

      <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              className={`navbar__link ${activeSection === link.href.slice(1) ? 'navbar__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        {user ? (
          <div className="navbar__user">
            <button className="btn btn-ghost" onClick={onProfileClick} id="nav-profile">👤 Mi Perfil</button>
            <button className="btn btn-ghost" onClick={onLogoutClick} id="nav-logout">Salir</button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost navbar__signin" onClick={onLoginClick} id="nav-signin">Entrar</button>
            <button className="btn btn-primary navbar__cta" onClick={onLoginClick} id="nav-signup">Únete gratis</button>
          </>
        )}
        
        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          aria-label="Menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
