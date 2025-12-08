import React, { useState } from "react";
import "./FeaturesPage.css";
import { useNavigate } from "react-router-dom";
import SubscriptionFormPage from "./SubscriptionFormPage.js";
import "./mainpage.css";

// Features Data
const featuresData = {
  security: {
    icon: "🔒",
    title: "Bank-Level Security",
    shortDesc:
      "Your data is encrypted with industry-leading security protocols",
    fullDesc:
      "We use AES-256 encryption to protect your data, the same standard used by banks and governments worldwide. Your files are encrypted both in transit and at rest, ensuring maximum security.",
    benefits: [
      "AES-256 military-grade encryption",
      "Multi-factor authentication (MFA)",
      "Zero-knowledge encryption",
      "SOC 2 Type II certified",
      "Regular security audits",
      "Advanced threat detection",
    ],
  },
  speed: {
    icon: "⚡",
    title: "Lightning Fast",
    shortDesc: "Access your files instantly from anywhere in the world",
    fullDesc:
      "Our global CDN network ensures your files load instantly, no matter where you are. With servers in 50+ countries and optimized data routing, you get the fastest possible access speeds.",
    benefits: [
      "Global CDN with 50+ locations",
      "Sub-second file access",
      "Automatic data routing optimization",
      "High-speed file transfers",
      "Real-time synchronization",
      "Optimized for large files",
    ],
  },
  storage: {
    icon: "☁️",
    title: "Unlimited Storage",
    shortDesc: "Never worry about running out of space again",
    fullDesc:
      "Store as much as you need without limitations. From documents to videos, photos to backups - we provide truly unlimited storage space for all your personal and business needs.",
    benefits: [
      "Truly unlimited storage space",
      "Support for all file types",
      "Automatic file versioning",
      "Easy file organization",
      "Smart duplicate detection",
      "Scalable for growing needs",
    ],
  },
  support: {
    icon: "🤝",
    title: "24/7 Support",
    shortDesc: "Our team is always here to help you succeed",
    fullDesc:
      "Get help whenever you need it with our dedicated support team available 24/7/365. We provide multiple channels including live chat, email, and phone support with average response time under 2 minutes.",
    benefits: [
      "Live chat support 24/7",
      "Email and phone support",
      "Average 2-minute response time",
      "Dedicated account managers",
      "Comprehensive knowledge base",
      "Video tutorials and guides",
    ],
  },
};

function FeaturesPage({ onNavigate }) {
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const navigate = useNavigate();

  const handleFeatureClick = (featureKey) => {
    setSelectedFeature(featureKey);
  };

  const closeFeatureModal = () => {
    setSelectedFeature(null);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="hero">
        {/* Back Button in top right corner */}
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>

        <h1 className="hero-title">Premium Cloud Storage</h1>
        <p className="hero-subtitle">
          Secure, fast, and reliable cloud storage for all your needs
        </p>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          {Object.entries(featuresData).map(([key, feature]) => (
            <div
              key={key}
              className="feature-card"
              onClick={() => handleFeatureClick(key)}
            >
              <div className="feature-card-content">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.shortDesc}</p>
              </div>
              <button className="learn-more-btn">Learn More →</button>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <div className="subscribe-button-container">
          <button
            onClick={() => setShowSubscriptionForm(true)}
            className="subscribe-now-button"
          >
            Subscribe Now
          </button>
        </div>
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="feature-modal" onClick={closeFeatureModal}>
          <div
            className="feature-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal-btn" onClick={closeFeatureModal}>
              ✖
            </button>
            <div className="modal-header">
              <div className="modal-icon">
                {featuresData[selectedFeature].icon}
              </div>
              <h2 className="modal-title">
                {featuresData[selectedFeature].title}
              </h2>
            </div>
            <p className="modal-description">
              {featuresData[selectedFeature].fullDesc}
            </p>
            <div className="benefits-section">
              <h3 className="benefits-title">Key Benefits:</h3>
              <ul className="benefits-list">
                {featuresData[selectedFeature].benefits.map(
                  (benefit, index) => (
                    <li key={index} className="benefit-item">
                      <span className="checkmark">✓</span> {benefit}
                    </li>
                  )
                )}
              </ul>
            </div>
            <button
              className="modal-subscribe-btn"
              onClick={() => {
                closeFeatureModal();
                setShowSubscriptionForm(true);
              }}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}

      {/* Subscription Form Modal */}
      {showSubscriptionForm && (
        <div className="subscription-modal">
          <div className="subscription-modal-content">
            <button
              className="close-subscription-btn"
              onClick={() => setShowSubscriptionForm(false)}
            >
              ✖
            </button>
            <SubscriptionFormPage />
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturesPage;
