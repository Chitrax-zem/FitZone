// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MembershipPlans from './components/MembershipPlans';
import TrainerProfiles from './components/TrainerProfiles';
import ClassSchedule from './components/ClassSchedule';
import WorkoutTips from './components/WorkoutTips';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import UserProfile from './components/UserProfile.temp';
import { BookingProvider } from './contexts/BookingContext';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <AuthProvider>
      <BookingProvider>
        <div className={darkMode ? 'dark' : ''}>
          <div className="app-container">
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <main>
              <Hero />
              <MembershipPlans />
              <TrainerProfiles />
              <ClassSchedule />
              <WorkoutTips />
              <Gallery />
              <Contact />
              <UserProfile />
            </main>
            <Footer />
            <ScrollToTop />
          </div>
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}
export default App;
