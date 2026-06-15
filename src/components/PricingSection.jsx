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
          <h3 className="pricing__tier-name">Wandr Free</h3>
          <div className="pricing__price">
            <span className="pricing__currency">€</span>
            <span className="pricing__amount">0</span>
            <span className="pricing__period">/mes</span>
          </div>
          <p className="pricing__tier-desc">Para viajeros ocasionales que buscan inspiración.</p>
          
          <ul className="pricing__features">
            <li>✓ Acceso a toda la comunidad</li>
            <li>✓ Guardar posts y rutas</li>
            <li>✓ 3 Itinerarios IA por mes</li>
            <li>✗ Mapas offline</li>
          </ul>
          
          <button className="btn pricing__btn">Empezar Gratis</button>
        </div>

        {/* Tier 2: PRO (Featured) */}
        <div className="pricing__card pricing__card--pro glass anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="pricing__badge">Más popular</div>
          <h3 className="pricing__tier-name">Wandr PRO</h3>
          <div className="pricing__price">
            <span className="pricing__currency">€</span>
            <span className="pricing__amount">4,99</span>
            <span className="pricing__period">/mes</span>
          </div>
          <p className="pricing__tier-desc">Para viajeros empedernidos que quieren el control total.</p>
          
          <ul className="pricing__features">
            <li>✓ Todo lo de Free</li>
            <li>✓ Itinerarios IA <strong>ilimitados</strong></li>
            <li>✓ <strong>Descarga offline (PDF/Maps)</strong></li>
            <li>✓ Badge de Viajero Verificado</li>
            <li>✓ Sin publicidad de afiliados</li>
          </ul>
          
          <button className="btn btn-primary pricing__btn">Pruébalo 7 días gratis</button>
        </div>

      </div>
    </section>
  );
}
