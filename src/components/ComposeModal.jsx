import { useState } from 'react';
import './ComposeModal.css';
import { destinations } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ComposeModal({ onClose, user }) {
  const [step, setStep]         = useState(1); // 1=dest, 2=write, 3=done
  const [destId, setDestId]     = useState('');
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [tips, setTips]         = useState(['']);
  const [rating, setRating]     = useState(5);
  const [hoverRating, setHover] = useState(0);

  const addTip = () => setTips(t => [...t, '']);
  const updateTip = (i, val) => setTips(t => t.map((x, j) => j === i ? val : x));
  const removeTip = (i) => setTips(t => t.filter((_, j) => j !== i));

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !user) return;
    
    try {
      const selectedDest = destinations.find(d => d.id === destId);
      
      await addDoc(collection(db, 'posts'), {
        user: {
          name: user.name,
          avatar: user.photoURL,
          uid: user.uid
        },
        destId,
        destinationName: selectedDest ? selectedDest.name : '',
        title,
        body,
        tips: tips.filter(t => t.trim() !== ''),
        rating,
        likes: 0,
        createdAt: serverTimestamp()
      });
      
      setStep(3);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Hubo un error al publicar.");
    }
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal glass-strong" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cm-header">
          <div className="cm-header__left">
            <img src={user?.photoURL || "https://ui-avatars.com/api/?name=Viajero"} alt="Tú" className="cm-header__avatar" />
            <div>
              <span className="cm-header__name">{user ? user.name : 'Tú'}</span>
              <span className="cm-header__label label">Compartir experiencia</span>
            </div>
          </div>
          <button className="cm-close" onClick={onClose} id="compose-close">✕</button>
        </div>

        {/* Step indicators */}
        <div className="cm-steps">
          {['Destino', 'Tu historia', 'Publicado'].map((s, i) => (
            <div key={s} className={`cm-step ${step > i ? 'cm-step--done' : ''} ${step === i+1 ? 'cm-step--active' : ''}`}>
              <span className="cm-step__num">{step > i+1 ? '✓' : i+1}</span>
              <span className="cm-step__label">{s}</span>
            </div>
          ))}
        </div>

        {/* ── Step 1: Destination ── */}
        {step === 1 && (
          <div className="cm-body anim-fade-in">
            <p className="cm-hint">¿De dónde viene tu historia?</p>
            <div className="cm-dest-grid">
              {destinations.map(d => (
                <button
                  key={d.id}
                  className={`cm-dest-btn ${destId === d.id ? 'cm-dest-btn--active' : ''}`}
                  onClick={() => setDestId(d.id)}
                  id={`compose-dest-${d.id}`}
                >
                  <span className="cm-dest-emoji">{d.emoji}</span>
                  <span className="cm-dest-name">{d.name}</span>
                </button>
              ))}
            </div>

            {/* Rating */}
            <div className="cm-rating">
              <span className="label">¿Cómo fue?</span>
              <div className="cm-stars">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    className={`cm-star ${n <= (hoverRating || rating) ? 'cm-star--on' : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    id={`star-${n}`}
                  >★</button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary cm-next"
              onClick={() => destId && setStep(2)}
              disabled={!destId}
              id="compose-next-1"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* ── Step 2: Write ── */}
        {step === 2 && (
          <div className="cm-body anim-fade-in">
            <input
              className="cm-input"
              placeholder="Título: Lo que nadie te cuenta de..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              id="compose-title"
            />
            <span className="cm-char-count">{title.length}/100</span>

            <textarea
              className="cm-textarea"
              placeholder="Cuéntalo todo — las cosas buenas, las malas y los trucos que descubriste. Cuanto más honesto, más útil para la comunidad."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              id="compose-body"
            />

            <div className="cm-tips-section">
              <span className="label">💡 Tips para la comunidad (opcional)</span>
              {tips.map((tip, i) => (
                <div key={i} className="cm-tip-row">
                  <input
                    className="cm-input cm-tip-input"
                    placeholder={`Tip ${i+1}: Ej. "Llega antes de las 8am para evitar colas"`}
                    value={tip}
                    onChange={e => updateTip(i, e.target.value)}
                    id={`compose-tip-${i}`}
                  />
                  {tips.length > 1 && (
                    <button className="cm-tip-remove" onClick={() => removeTip(i)}>✕</button>
                  )}
                </div>
              ))}
              {tips.length < 3 && (
                <button className="cm-add-tip" onClick={addTip} id="compose-add-tip">+ Añadir tip</button>
              )}
            </div>

            <div className="cm-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)} id="compose-back">← Atrás</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!title.trim() || !body.trim()}
                id="compose-submit"
              >
                Publicar ✦
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="cm-done anim-fade-in">
            <div className="cm-done__icon">🎉</div>
            <h3 className="heading-lg">¡Tu experiencia está en vivo!</h3>
            <p className="cm-done__sub">Ya la puede ver la comunidad. Gracias por contribuir — esto es lo que hace que wandr funcione.</p>
            <div className="cm-done__actions">
              <button className="btn btn-primary" onClick={onClose} id="compose-done">Ver el feed</button>
              <button className="btn btn-ghost" onClick={() => { setStep(1); setTitle(''); setBody(''); setTips(['']); setDestId(''); }} id="compose-another">
                Publicar otra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
