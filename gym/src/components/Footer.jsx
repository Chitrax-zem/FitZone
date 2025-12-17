import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/footer.css'; 

// Data moved outside component to avoid recreation on each render
const FOOTER_LINKS = {
  'Quick Links': [
    { name: 'Home', href: '#home' },
    { name: 'Membership', href: '#membership' },
    { name: 'Trainers', href: '#trainers' },
    { name: 'Classes', href: '#classes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' }
  ],
  'Services': [
    { name: 'Personal Training', href: '#' },
    { name: 'Group Classes', href: '#' },
    { name: 'Nutrition Coaching', href: '#' },
    { name: 'Fitness Assessment', href: '#' },
    { name: 'Online Training', href: '#' },
    { name: 'Corporate Wellness', href: '#' }
  ],
  'Support': [
    { name: 'FAQ', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Refund Policy', href: '#' },
    { name: 'Contact Support', href: '#' }
  ]
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', className: 'social-facebook', label: 'Facebook' },
  { icon: Twitter, href: '#', className: 'social-twitter', label: 'Twitter' },
  { icon: Instagram, href: '#', className: 'social-instagram', label: 'Instagram' },
  { icon: Youtube, href: '#', className: 'social-youtube', label: 'YouTube' }
];

const Footer = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="animate-fade-in-up"
            >
              <div className="brand-logo">
                <Dumbbell className="brand-icon" />
                <span className="brand-name">FitZone</span>
              </div>
              <p className="brand-description">
                Transform your life with our world-class fitness programs, expert trainers, 
                and state-of-the-art facilities. Your fitness journey starts here.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="footer-contact animate-fade-in-up delay-100"
            >
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span className="contact-text">123 Fitness Street, Gym City, GC 12345</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span className="contact-text">+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span className="contact-text">info@fitzone.com</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="social-links animate-fade-in-up delay-200"
            >
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`social-link ${social.className}`}
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <Icon className="social-icon" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>

          {/* Footer Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (categoryIndex + 1) }}
              viewport={{ once: true }}
              className={`footer-links-column animate-fade-in-up delay-${(categoryIndex + 1) * 100}`}
            >
              <h3 className="footer-links-title">{category}</h3>
              <ul className="footer-links-list">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="footer-link"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="newsletter-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="newsletter-content"
          >
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">Subscribe to our newsletter for fitness tips and updates</p>
          </motion.div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
              aria-label="Email for newsletter"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="newsletter-button"
            >
              Subscribe
            </motion.button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="bottom-container">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="copyright"
          >
            © {currentYear} FitZone. All rights reserved.
          </motion.p>
          <div className="legal-links">
            <a href="#privacy" className="legal-link">
              Privacy Policy
            </a>
            <a href="#terms" className="legal-link">
              Terms of Service
            </a>
            <a href="#cookies" className="legal-link">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
