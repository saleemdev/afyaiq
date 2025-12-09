import React from 'react';
import bird from '../../assets/bird.svg';
import './Logo.css';

const Logo: React.FC = () => (
    <div className="app-logo">
        <img src={bird} alt="AfyaIQ" className="logo-image" />
        <h2 className="logo-text">AfyaIQ</h2>
    </div>
);

export default Logo;
