import './PricingSection.css';

export default function PricingSection() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing__header anim-fade-up">
        <h2 className="heading-xl pricing__title">Empieza gratis, viaja como un Pro.</h2>
        <p className="pricing__sub">Únete a miles de viajeros descubriendo el mundo con Wandr.</p>
      </div>

      <div className="pricing__cards">
        
        {/* Tier 1: Free */}
        <div className="pricing__card glass anim-fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="pricing__tier-name">Wandr Basic</h3>
          <div className="pricing__price">
            <span className="pricing__currency">€</span>
            <span className="pricing__amount">0</span>
            <span className="pricing__period">/mes</span>
          </div>
          <p className="pricing__tier-desc">Acceso básico para ojear la comunidad.</p>
          
          <ul className="pricing__features">
            <li>✓ Ver posts de la comunidad</li>
            <li>✗ Guardar rutas</li>
            <li>✗ Generación IA</li>
            <li>✗ Mapas offline</li>
            <li>✗ Soporte prioritario</li>
          </ul>
          
          <button className="btn pricing__btn">Empezar Gratis</button>
        </div>

        {/* Tier 2: PRO (Featured) */}
        <div className="pricing__card pricing__card--pro glass anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="pricing__badge">Recomendado</div>
          <h3 className="pricing__tier-name">Wandr Plus</h3>
          <div className="pricing__price">
            <span className="pricing__currency">€</span>
            <span className="pricing__amount">4,99</span>
            <span className="pricing__period">/mes</span>
          </div>
          <p className="pricing__tier-desc">La experiencia completa para organizar tus viajes.</p>
          
          <ul className="pricing__features">
            <li>✓ Guardar rutas ilimitadas</li>
            <li>✓ Itinerarios IA <strong>ilimitados</strong></li>
            <li>✓ <strong>Descarga offline (PDF/Maps)</strong></li>
            <li>✓ Sin publicidad</li>
            <li>✗ Concierge personal</li>
          </ul>
          
          <button className="btn btn-primary pricing__btn">Prueba 7 días gratis</button>
        </div>

        {/* Tier 3: Elite */}
        <div className="pricing__card glass anim-fade-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="pricing__tier-name">Wandr Elite</h3>
          <div className="pricing__price">
            <span className="pricing__currency">€</span>
            <span className="pricing__amount">14,99</span>
            <span className="pricing__period">/mes</span>
          </div>
          <p className="pricing__tier-desc">Para los que quieren viajar a otro nivel sin estrés.</p>
          
          <ul className="pricing__features">
            <li>✓ Todo lo de Wandr Plus</li>
            <li>✓ <strong>Concierge humano 24/7</strong></li>
            <li>✓ Gestión de reservas VIP</li>
            <li>✓ <strong>Soporte prioritario por WhatsApp</strong></li>
            <li>✓ Seguros de cancelación incluidos</li>
          </ul>
          
          <button className="btn pricing__btn">Viajar en Elite</button>
        </div>

      </div>
    </section>
  );
}
