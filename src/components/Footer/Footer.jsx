import React from 'react';
import './Footer.css';

const Footer = React.memo(() => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-right">
           <h3>Epicurean Express</h3>
           <p>نقدم لك تجربة طعام استثنائية مع أسرع خدمة توصيل في المدينة.</p>
        </div>
        <div className="footer-links">
          <a href="#support">Support</a>
          <a href="#about">About Us</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <div className="footer-left">
           <p>© 2024 Epicurean Express. All rights reserved.</p>
           <div className="social-icons">
             <span>✉️</span>
             <span>🔗</span>
           </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
