import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-4">
      <div className="container text-center">
        <p className="mb-0">All Rights Reserved - Amit Upadhyay, Copyright © 2025</p>
        <ul className="list-inline mt-3">
          <li className="list-inline-item">
            <Link to="#" className="text-dark text-decoration-none">Privacy Policy</Link>
          </li>
          <li className="list-inline-item">
            <Link to="#" className="text-dark text-decoration-none">Terms of Use</Link>
          </li>
          <li className="list-inline-item">
            <Link to="#" className="text-dark text-decoration-none">Contact Us</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
