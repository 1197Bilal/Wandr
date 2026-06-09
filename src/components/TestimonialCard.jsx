import { useState } from 'react';
import './TestimonialCard.css';
import { users, destinations } from '../data/mockData';

export default function TestimonialCard({ testimonial, featured = false }) {
  const [liked, setLiked]   = useState(false);
  const [saved, setSaved]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const author = users.find(u => u.id === testimonial.userId);
  const dest   = destinations.find(d => d.id === testimonial.destination);

  const stars = Array.from({ length: 5 }, (_, i) => i < testimonial.rating ? '★' : '☆').join('');

  return (
    <article className={`t-card glass ${featured ? 't-card--featured' : ''}`}>
      {/* Header */}
      <div className="t-card__header">
        <img src={author?.avatar} alt={author?.name} className="t-card__avatar" />
        <div className="t-card__author-info">
          <span className="t-card__author-name">{author?.name}</span>
          <span className="t-card__author-meta">
            📍 {author?.location} · {testimonial.date}
          </span>
        </div>
        <span className="tag tag-orange t-card__dest">{dest?.emoji} {dest?.name}</span>
      </div>

      {/* Image (if any) */}
      {testimonial.images?.length > 0 && (
        <div className="t-card__images">
          <img
            src={testimonial.images[0]}
            alt={testimonial.title}
            className="t-card__img"
          />
          {testimonial.images.length > 1 && (
            <img
              src={testimonial.images[1]}
              alt=""
              className="t-card__img t-card__img--secondary"
            />
          )}
        </div>
      )}

      {/* Body */}
      <div className="t-card__body">
        <div className="t-card__rating">{stars}</div>
        <h3 className="t-card__title">{testimonial.title}</h3>
        <p className={`t-card__text ${expanded ? 't-card__text--expanded' : ''}`}>
          {testimonial.body}
        </p>
        {testimonial.body.length > 180 && (
          <button className="t-card__expand" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Leer menos ↑' : 'Leer más ↓'}
          </button>
        )}

        {/* Tips */}
        {testimonial.tips && (
          <ul className="t-card__tips">
            {testimonial.tips.map((tip, i) => (
              <li key={i} className="t-card__tip">
                <span className="t-card__tip-icon">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="t-card__actions">
        <button
          className={`t-card__action ${liked ? 't-card__action--active' : ''}`}
          onClick={() => setLiked(v => !v)}
          id={`like-${testimonial.id}`}
        >
          {liked ? '❤️' : '🤍'} {testimonial.likes + (liked ? 1 : 0)}
        </button>
        <button
          className={`t-card__action ${saved ? 't-card__action--saved' : ''}`}
          onClick={() => setSaved(v => !v)}
          id={`save-${testimonial.id}`}
        >
          {saved ? '🔖' : '📌'} {testimonial.saves + (saved ? 1 : 0)}
        </button>
        <button className="t-card__action t-card__action--share" id={`share-${testimonial.id}`}>
          🔗 Compartir
        </button>
      </div>
    </article>
  );
}
