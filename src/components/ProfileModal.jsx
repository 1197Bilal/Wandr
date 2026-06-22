import { useState } from 'react';
import './ProfileModal.css';

export default function ProfileModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('mis-viajes');
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');

  const mockMisViajes = [
    { title: '7 días en Cerdeña', date: 'Generado hace 2 días', cover: 'https://images.unsplash.com/photo-1533423996375-f914ab160932?w=800' },
    { title: '14 días en Japón', date: 'Generado la semana pasada', cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' }
  ];

  const mockGuardados = [
    { title: 'Ruta por la Toscana', author: 'Ana García', cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800' }
  ];

  const mockAmigos = [
    { id: 1, name: 'Ana García', status: 'En línea', avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia' },
    { id: 2, name: 'Carlos Ruiz', status: 'Viendo: Roma', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz' },
    { id: 3, name: 'Lucía M.', status: 'Desconectado', avatar: 'https://ui-avatars.com/api/?name=Lucia+M' }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    alert(`Mensaje enviado a ${activeChat.name}: ${chatMessage}`);
    setChatMessage('');
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>✕</button>

        {activeChat ? (
          // Chat View
          <div className="pm-chat-view">
            <div className="pm-chat-header">
              <button className="pm-chat-back" onClick={() => setActiveChat(null)}>←</button>
              <img src={activeChat.avatar} alt={activeChat.name} />
              <div>
                <strong>{activeChat.name}</strong>
                <span>{activeChat.status}</span>
              </div>
            </div>
            <div className="pm-chat-messages">
              <div className="pm-message received">
                <span>¡Hola! ¿Viste la ruta por Cerdeña que guardé?</span>
              </div>
              <div className="pm-message sent">
                <span>Sí, ¡tiene pintaza! ¿Nos vamos en agosto?</span>
              </div>
            </div>
            <div className="pm-chat-input-area">
              <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Enviar</button>
            </div>
          </div>
        ) : (
          // Normal Profile View
          <>
            <div className="pm-header">
              <img src={user.photoURL} alt="Profile" className="pm-avatar" />
              <h2 className="pm-name">{user.name}</h2>
              <span className="pm-badge">Miembro Wandr</span>
            </div>

            <div className="pm-tabs">
              <button className={`pm-tab ${activeTab === 'mis-viajes' ? 'active' : ''}`} onClick={() => setActiveTab('mis-viajes')}>Mis Viajes</button>
              <button className={`pm-tab ${activeTab === 'guardados' ? 'active' : ''}`} onClick={() => setActiveTab('guardados')}>Guardados</button>
              <button className={`pm-tab ${activeTab === 'amigos' ? 'active' : ''}`} onClick={() => setActiveTab('amigos')}>Comunidad</button>
            </div>

            <div className="pm-body">
              {activeTab === 'mis-viajes' && (
                <div className="pm-grid">
                  {mockMisViajes.map((t, i) => (
                    <div key={i} className="pm-card" style={{backgroundImage: `url(${t.cover})`}}>
                      <div className="pm-card-content">
                        <h4>{t.title}</h4>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'guardados' && (
                <div className="pm-grid">
                  {mockGuardados.map((t, i) => (
                    <div key={i} className="pm-card" style={{backgroundImage: `url(${t.cover})`}}>
                      <div className="pm-card-content">
                        <h4>{t.title}</h4>
                        <span>Guardado de {t.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'amigos' && (
                <div className="pm-friends">
                  {mockAmigos.map((f, i) => (
                    <div key={i} className="pm-friend-row">
                      <img src={f.avatar} alt={f.name} />
                      <div className="pm-friend-info">
                        <strong>{f.name}</strong>
                        <span>{f.status}</span>
                      </div>
                      <button className="pm-chat-btn" onClick={() => setActiveChat(f)}>💬 Chat</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
