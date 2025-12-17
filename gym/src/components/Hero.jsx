import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate } from 'framer-motion';
import { Play, Users, Award, Calendar, X } from 'lucide-react';
import '../styles/hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Transform Your Body",
      subtitle: "Achieve Your Fitness Goals"
    },
    {
      image: "https://i.pinimg.com/1200x/38/26/9c/38269ce1df24f1c5d82b774cff3d79d3.jpg",
      title: "Professional Training",
      subtitle: "Expert Guidance Every Step"
    },
    {
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Modern Equipment",
      subtitle: "State-of-the-Art Facilities"
    }
  ];

  // Convert YouTube URL to embed format
  // The video ID is "ExBlR--AbHA" from your URL
  const videoId = "ExBlR--AbHA";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle opening the video popup
  const openVideo = () => {
    setShowVideo(true);
    // Prevent background scrolling when popup is open
    document.body.style.overflow = 'hidden';
  };

  // Handle closing the video popup
  const closeVideo = () => {
    setShowVideo(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const Counter = ({ end, label, icon: Icon }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const controls = animate(0, end, {
        duration: 2,
        onUpdate: (latest) => {
          setCount(Math.round(latest));
        },
      });
      return () => controls.stop();
    }, [end]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="hero-stat"
      >
        <div className="hero-stat-icon-wrapper">
          <Icon className="hero-stat-icon" />
          <span className="hero-stat-number">{count}+</span>
        </div>
        <p className="hero-stat-label">{label}</p>
      </motion.div>
    );
  };

  return (
    <section id="home" className="hero-section">
      {/* Background Slider */}
      <div className="hero-background">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="hero-background-slide"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              <span className="hero-title-highlight">UNLEASH</span> YOUR
              <br />
              POTENTIAL
            </h1>
            <p className="hero-subtitle">
              Join thousands of members who have transformed their lives with our 
              world-class fitness programs and expert trainers.
            </p>
            
            <div className="hero-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hero-btn hero-btn-primary"
              >
                Start Your Journey
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hero-btn hero-btn-secondary"
                onClick={openVideo}
              >
                <Play className="hero-btn-icon" />
                Watch Video
              </motion.button>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <Counter end={15} label="Years Experience" icon={Calendar} />
              <Counter end={5000} label="Happy Members" icon={Users} />
              <Counter end={50} label="Expert Trainers" icon={Award} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="hero-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`hero-indicator ${currentSlide === index ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Video Popup */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="video-popup-overlay"
            onClick={closeVideo}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="video-popup-container"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button 
                className="video-popup-close"
                onClick={closeVideo}
                aria-label="Close video"
              >
                <X size={24} />
              </button>
              <iframe
                className="video-popup-iframe"
                src={embedUrl}
                title="Fitness Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
