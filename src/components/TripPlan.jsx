import { useEffect } from 'react';
import './TripPlan.css';

export default function TripPlan({ plan, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  const handleProUpsell = () => {
    alert("Función exclusiva para Wandr PRO. Suscríbete para descargar tus mapas e itinerarios en PDF.");
  };

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>
        
        {/* Cover Image & Header */}
        <div className="tp-cover" style={{ backgroundImage: `url(${plan.cover})` }}>
          <div className="tp-cover__overlay">
            <button className="tp-close" onClick={onClose}>✕</button>
            <div className="tp-cover__content">
              <span className="tp-flag">{plan.flag}</span>
              <h2 className="tp-title">
                {plan.days} días en {plan.destination}
              </h2>
              <div className="tp-vibes">
                {plan.vibe.map(v => <span key={v} className="tp-vibe-tag">{v}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (PRO Upsell) */}
        <div className="tp-action-bar">
          <div className="tp-action-info">
            <span>✨ Generado por IA usando experiencias de 1.200 viajeros</span>
          </div>
          <button className="btn btn-primary tp-btn-download" onClick={handleProUpsell}>
            Descargar PDF Offline <span className="tp-pro-badge">PRO</span>
          </button>
        </div>

        <div className="tp-body">
          
          {/* Quick Stats Grid */}
          <div className="tp-stats-grid">
            <div className="tp-stat-card glass-strong">
              <span className="tp-stat-icon">🌤️</span>
              <div className="tp-stat-info">
                <span className="tp-stat-label">Clima ({plan.bestTime})</span>
                <span className="tp-stat-val">{plan.weather.temp} - {plan.weather.text}</span>
              </div>
            </div>
            
            <div className="tp-stat-card glass-strong">
              <span className="tp-stat-icon">💰</span>
              <div className="tp-stat-info">
                <span className="tp-stat-label">Presupuesto Medio</span>
                <span className="tp-stat-val">{plan.budget.total}</span>
                <div className="tp-budget-breakdown">
                  <span>✈️ {plan.budget.flights}</span>
                  <span>🏨 {plan.budget.hotel}</span>
                  <span>🍔 {plan.budget.daily}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="tp-section-title">El Itinerario</h3>
          
          {/* Timeline Itinerary */}
          <div className="tp-timeline">
            {plan.itinerary.map((step, idx) => (
              <div key={idx} className="tp-step">
                <div className="tp-step__indicator">
                  <div className="tp-step__dot">{step.emoji}</div>
                  {idx !== plan.itinerary.length - 1 && <div className="tp-step__line" />}
                </div>
                <div className="tp-step__content glass-strong">
                  <div className="tp-step__header">
                    <span className="tp-step__day">Día {step.day}</span>
                    <h4 className="tp-step__place">{step.place}</h4>
                  </div>
                  <p className="tp-step__highlight">{step.highlight}</p>
                  
                  <div className="tp-step__tip-box">
                    <span className="tp-step__tip-label">💡 Tip de la comunidad:</span>
                    <p className="tp-step__tip-text">"{step.tip}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="tp-social-proof">
            <h3 className="tp-section-title">¿Por qué este plan?</h3>
            <p>Este itinerario ha sido sintetizado a partir de las rutas mejor valoradas por la comunidad de Wandr en el último año. Está optimizado para maximizar el tiempo y minimizar los costes turísticos inflados.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
