import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import '../styles/scroll-to-top.css'; 

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Use useCallback to memoize the scroll handler function
  const toggleVisibility = useCallback(() => {
    const scrollY = window.pageYOffset;
    setIsVisible(scrollY > 300);
  }, []);

  useEffect(() => {
    // Add event listener with passive option for better performance
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Initial check in case page is already scrolled on load
    toggleVisibility();

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [toggleVisibility]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Animation variants
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={scrollToTop}
          className="scroll-to-top-button"
          aria-label="Scroll to top"
        >
          <ChevronUp className="scroll-to-top-icon" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ScrollToTop);
