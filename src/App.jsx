import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialFeed from './components/SocialFeed';
import MapSection from './components/MapSection';
import DestinationsSection from './components/DestinationsSection';
import CommunitySection from './components/CommunitySection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ComposeModal from './components/ComposeModal';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email,
          photoURL: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}&background=random`
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="app">
      <Navbar 
        user={user} 
        onLoginClick={() => setShowAuth(true)} 
        onLogoutClick={handleLogout}
      />
      
      <main>
        <Hero />
        <SocialFeed onComposeClick={() => setShowCompose(true)} user={user} />
        <MapSection />
        <DestinationsSection />
        <CommunitySection />
        <PricingSection />
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
          user={user}
          onClose={() => setShowCompose(false)} 
        />
      )}
    </div>
  );
}
