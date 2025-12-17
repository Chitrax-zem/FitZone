import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import '../styles/gallery.css'; 

const Gallery = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('All');

  const images = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Equipment",
      title: "Modern Gym Equipment",
      description: "State-of-the-art fitness equipment for all your workout needs"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Training",
      title: "Personal Training Session",
      description: "One-on-one training with our expert trainers"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Training",
      title: "Strength Training",
      description: "Building strength with proper form and technique"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Classes",
      title: "Yoga Class",
      description: "Find your inner peace with our yoga sessions"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Facilities",
      title: "Gym Interior",
      description: "Spacious and well-equipped workout areas"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Training",
      title: "Group Training",
      description: "Motivating group workout sessions"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Equipment",
      title: "Cardio Zone",
      description: "Premium cardio equipment with entertainment systems"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGd5bXxlbnwwfHwwfHx8MA%3D%3D",
      category: "Transformation",
      title: "Success Story",
      description: "Amazing transformation achieved through dedication"
    },
    {
      id: 9,
      src: "https://media.istockphoto.com/id/1483989758/photo/diverse-yoga-class-participants-doing-a-side-plank-on-their-yoga-mats-in-a-beautiful-yoga.webp?a=1&b=1&s=612x612&w=0&k=20&c=kEvewO27lhmnW47sP3Z-P58VvM9OutXD0l6Z9iqo680=",
      category: "Classes",
      title: "Aerobics Classes",
      description: "High-intensity interval training sessions"
    },
    {
      id: 10,
      src: "https://media.istockphoto.com/id/1092812652/photo/modern-interior-of-a-locker-changing-room.webp?a=1&b=1&s=612x612&w=0&k=20&c=q1azxWsiR3SDrimxV14SBmfSb9PSTd7nA7OfiqzNvXo=",
      category: "Facilities",
      title: "Locker Room",
      description: "Clean and modern changing facilities"
    },
    {
      id: 11,
      src: "https://plus.unsplash.com/premium_photo-1663099511243-0273a4e9cb7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGJvZHklMjB0cmFuc2Zvcm1hdGlvbiUyMGluJTIwZ3ltfGVufDB8fDB8fHww",
      category: "Transformation",
      title: "Before & After",
      description: "Incredible 6-month transformation journey"
    },
    {
      id: 12,
      src: "https://media.istockphoto.com/id/1028268374/photo/dumbbells-in-gym.jpg?s=612x612&w=0&k=20&c=dhLtdAWIRxnStmgumzaenq7IX0Ou1T49HmrzZKKJb0s=",
      category: "Equipment",
      title: "Free Weights",
      description: "Complete range of free weights and accessories"
    }
  ];

  const categories = ['All', 'Equipment', 'Training', 'Classes', 'Facilities', 'Transformation'];

  const filteredImages = filter === 'All' 
    ? images 
    : images.filter(image => image.category === filter);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="gallery-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="gallery-header"
          ref={ref}
        >
          <h2 className="gallery-title">
            Our <span className="gallery-title-highlight">Gallery</span>
          </h2>
          <p className="gallery-subtitle">
            Take a look at our state-of-the-art facilities, equipment, and the amazing 
            transformations of our members.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="filter-container"
        >
          <div className="filter-wrapper">
            <Filter className="filter-icon" />
            <div className="filter-buttons">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(category)}
                  className={`filter-button ${
                    filter === category
                      ? 'filter-button--active'
                      : 'filter-button--inactive'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="gallery-grid"
        >
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="gallery-item"
                onClick={() => openLightbox(image)}
              >
                <div className="gallery-item-container">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="gallery-image"
                  />
                  <div className="gallery-overlay" />
                  <div className="gallery-content">
                    <div className="gallery-text">
                      <h3 className="gallery-item-title">{image.title}</h3>
                      <p className="gallery-item-description">{image.description}</p>
                    </div>
                  </div>
                  <div className="gallery-category-badge">
                    {image.category}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lightbox"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="lightbox-container"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="lightbox-image"
                />
                
                {/* Image Info */}
                <div className="lightbox-info">
                  <span className="lightbox-category">
                    {selectedImage.category}
                  </span>
                  <h3 className="lightbox-title">{selectedImage.title}</h3>
                  <p className="lightbox-description">{selectedImage.description}</p>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="lightbox-close"
                >
                  <X className="lightbox-nav-icon" />
                </button>

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="lightbox-nav lightbox-prev"
                >
                  <ChevronLeft className="lightbox-nav-icon" />
                </button>
                <button
                  onClick={nextImage}
                  className="lightbox-nav lightbox-next"
                >
                  <ChevronRight className="lightbox-nav-icon" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;
