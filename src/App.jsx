import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialFeed from './components/SocialFeed';
import MapSection from './components/MapSection';
import DestinationsSection from './components/DestinationsSection';
import CommunitySection from './components/CommunitySection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ComposeModal from './components/ComposeModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div className="app">
      <Navbar 
        user={user} 
        onLoginClick={() => setShowAuth(true)} 
        onLogoutClick={() => setUser(null)}
      />
      
      <main>
        <Hero />
        <SocialFeed onComposeClick={() => setShowCompose(true)} />
        <MapSection />
        <DestinationsSection />
        <CommunitySection />
      </main>
      
      <Footer />

      {/* Modals */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onAuth={(u) => setUser(u)} 
        />
      )}
      
      {showCompose && (
        <ComposeModal 
          onClose={() => setShowCompose(false)} 
        />
      )}
    </div>
  );
}
