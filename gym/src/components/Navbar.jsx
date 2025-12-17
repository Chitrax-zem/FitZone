import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, Dumbbell, User, LogOut, ChevronDown } from 'lucide-react';
import '../styles/navbar.css';
import AuthContext from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const dropdownItemsRef = useRef([]);

  // Add this function to handle logo click and refresh the page
  const handleLogoClick = () => {
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const handleClickOutside = (event) => {
      // Check if the click is outside both the dropdown toggle button and the dropdown menu
      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target) &&
        !dropdownItemsRef.current.some(item => item && item.contains(event.target))
      ) {
        setShowUserDropdown(false);
      }
    };
    
    // Add event listener for auth modal events
    const handleAuthModalEvent = (event) => {
      console.log('Auth modal event received:', event.detail);
      setAuthModalView(event.detail.view);
      setShowAuthModal(true);
    };
    
    // Add all event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('openAuthModal', handleAuthModalEvent);
    
    // Clean up all event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('openAuthModal', handleAuthModalEvent);
    };
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Membership', href: '#membership' },
    { name: 'Trainers', href: '#trainers' },
    { name: 'Classes', href: '#classes' },
    { name: 'Tips', href: '#tips' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  // Function to handle scrolling to a specific section
  const scrollToSection = (sectionId) => {
    console.log(`Scrolling to section: ${sectionId}`);
    const section = document.getElementById(sectionId);
    
    if (section) {
      const navbarHeight = document.querySelector('.navbar').offsetHeight;
      const offsetPosition = section.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      console.log(`Scrolled to position: ${offsetPosition}`);
    } else {
      console.error(`Section with ID "${sectionId}" not found`);
    }
  };

  // Function to handle scrolling to membership section
  const handleJoinNowClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
    
    scrollToSection('membership');
  };

  // Updated handleProfileClick function with better event handling
  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up
    
    console.log('Profile link clicked');
    
    // Keep the dropdown open until we're done processing
    const profileSection = document.getElementById('user-profile');
    
    // Use a timeout to ensure the click event is fully processed
    setTimeout(() => {
      // Now close the dropdown
      setShowUserDropdown(false);
      
      // Close mobile menu if open
      if (isOpen) {
        setIsOpen(false);
      }
      
      // Use another timeout to ensure UI updates before scrolling
      setTimeout(() => {
        if (profileSection) {
          const navbarHeight = document.querySelector('.navbar').offsetHeight;
          const offsetPosition = profileSection.offsetTop - navbarHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          console.log(`Scrolled to profile at position: ${offsetPosition}`);
        } else {
          console.error('User profile section not found');
          
          // Log all available sections for debugging
          const allSections = document.querySelectorAll('section');
          console.log('Available sections:');
          allSections.forEach(section => {
            console.log(`- ${section.id || 'unnamed section'}`);
          });
          
          // Dispatch event to potentially create the section
          document.dispatchEvent(new CustomEvent('showUserProfile'));
        }
      }, 100);
    }, 10);
  };

  // Function to handle scrolling to bookings section
  const handleBookingsClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up
    
    console.log('Bookings link clicked');
    
    // Use a timeout to ensure the click event is fully processed
    setTimeout(() => {
      // Now close the dropdown
      setShowUserDropdown(false);
      
      // Close mobile menu if open
      if (isOpen) {
        setIsOpen(false);
      }
      
      // Use another timeout to ensure UI updates before scrolling
      setTimeout(() => {
        scrollToSection('bookings');
      }, 100);
    }, 10);
  };

  // Function to open auth modal with specified view (login or register)
  const handleOpenAuthModal = (view) => {
    console.log(`Opening auth modal with view: ${view}`);
    setAuthModalView(view);
    setShowAuthModal(true);
  };

  // Updated logout handler with better event handling
  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Stop event from bubbling up
    }
    
    console.log("Logout button clicked");
    
    // Use a timeout to ensure the click event is fully processed
    setTimeout(() => {
      if (typeof logout === 'function') {
        logout();
        console.log("Logout function executed");
      } else {
        console.error("Logout is not a function:", logout);
      }
      
      setShowUserDropdown(false);
    }, 10);
  };

  // Toggle user dropdown menu
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    console.log('Toggle dropdown clicked, current state:', showUserDropdown);
    setShowUserDropdown(!showUserDropdown);
  };

  // Add a ref to a dropdown item
  const addDropdownItemRef = (el) => {
    if (el && !dropdownItemsRef.current.includes(el)) {
      dropdownItemsRef.current.push(el);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`navbar ${scrolled ? 'navbar-scrolled' : 'navbar-transparent'} fixed w-full z-50`}
      >
        <div className="navbar-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="navbar-content flex justify-between items-center">
            {/* Logo - Updated with click handler */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="navbar-logo flex items-center space-x-2 cursor-pointer"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
              aria-label="FitZone - Refresh page"
            >
              <Dumbbell className="navbar-logo-icon h-6 w-6 text-primary-500" />
              <span className="navbar-logo-text text-xl font-bold text-primary-500">FitZone</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="navbar-nav hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ scale: 1.05 }}
                  className="navbar-nav-link text-gray-700 dark:text-gray-300 hover:text-primary-500"
                >
                  {item.name}
                </motion.a>
              ))}
              
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                {darkMode ? <Sun className="theme-toggle-icon h-4 w-4" /> : <Moon className="theme-toggle-icon h-4 w-4" />}
              </motion.button>

              {/* Auth Buttons or User Menu */}
              {user ? (
                <div className="user-dropdown-container" ref={userDropdownRef}>
                  <button 
                    onClick={toggleUserDropdown}
                    className="user-button flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                    aria-expanded={showUserDropdown}
                    aria-haspopup="true"
                    type="button"
                  >
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{user.name.split(' ')[0]}</span>
                    <ChevronDown 
                      className={`h-3 w-3 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${showUserDropdown ? 'transform rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div 
                      className="user-dropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                      ref={addDropdownItemRef}
                    >
                      <a 
                        href="#user-profile" 
                        className="user-dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleProfileClick}
                      >
                        Profile
                      </a>
                      <a 
                        href="#bookings" 
                        className="user-dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleBookingsClick}
                      >
                        My Bookings
                      </a>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button 
                        onClick={handleLogout} 
                        className="user-dropdown-item block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        type="button"
                      >
                        <div className="flex items-center">
                          <LogOut size={14} className="mr-2" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons flex items-center space-x-3">
                  {/* Updated login button with explicit onClick handler */}
                  <button
                    className="login-button text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => handleOpenAuthModal('login')}
                    type="button"
                  >
                    Log In
                  </button>
                  <button
                    className="join-now-btn text-sm px-3 py-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white font-medium"
                    onClick={() => handleOpenAuthModal('register')} // Changed to open register view
                    aria-label="Join now and create an account"
                    type="button"
                  >
                    Join Now
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu-toggle md:hidden flex items-center space-x-2">
              {user && (
                <button 
                  onClick={toggleUserDropdown}
                  className="user-button-mobile flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full"
                  type="button"
                >
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
                type="button"
              >
                {darkMode ? <Sun className="theme-toggle-icon h-4 w-4" /> : <Moon className="theme-toggle-icon h-4 w-4" />}
              </motion.button>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="mobile-toggle-btn text-gray-700 dark:text-gray-300"
                type="button"
              >
                {isOpen ? <X className="mobile-toggle-icon h-5 w-5" /> : <Menu className="mobile-toggle-icon h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mobile-menu md:hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-2 py-2"
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="mobile-menu-link block px-4 py-2"
                >
                  {item.name}
                </a>
              ))}
              
              {/* Mobile Auth Options */}
              {user ? (
                <>
                  <div className="mobile-user-info px-4 py-2 flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700 mt-1">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-full">
                      <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                  <a 
                    href="#user-profile" 
                    className="mobile-menu-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      setTimeout(() => handleProfileClick(e), 10);
                    }}
                  >
                    Profile
                  </a>
                  <a 
                    href="#bookings" 
                    className="mobile-menu-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      setTimeout(() => handleBookingsClick(e), 10);
                    }}
                  >
                    My Bookings
                  </a>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      setTimeout(() => handleLogout(e), 10);
                    }}
                    className="mobile-menu-link w-full text-left flex items-center text-red-600 dark:text-red-400"
                    type="button"
                  >
                    <LogOut size={14} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Updated mobile login button */}
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleOpenAuthModal('login');
                    }}
                    className="mobile-menu-link mobile-auth-link text-primary-600 dark:text-primary-400"
                    type="button"
                  >
                    Log In
                  </button>
                  <div className="px-4 py-2">
                    <button 
                      className="w-full text-sm px-3 py-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white font-medium"
                      onClick={() => {
                        setIsOpen(false);
                        handleOpenAuthModal('register');
                      }}
                      type="button"
                    >
                      Join Now
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
          
          {/* Mobile User Dropdown */}
          {showUserDropdown && (
            <div 
              className="md:hidden user-dropdown-mobile absolute right-4 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
              ref={addDropdownItemRef}
            >
              <a 
                href="#user-profile" 
                className="user-dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleProfileClick}
              >
                Profile
              </a>
              <a 
                href="#bookings" 
                className="user-dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleBookingsClick}
              >
                My Bookings
              </a>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button 
                onClick={handleLogout} 
                className="user-dropdown-item block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                type="button"
              >
                <div className="flex items-center">
                  <LogOut size={14} className="mr-2" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Auth Modal - Ensure it's properly rendered */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialView={authModalView} 
      />
    </>
  );
};

export default Navbar;
