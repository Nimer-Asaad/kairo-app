// import React, { useState } from "react";
// import "./SubscriptionFormPage.css";

// function SubscriptionFormPage({ onNavigate }) {
//   const [subscriptionType, setSubscriptionType] = useState("personal");
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [paymentMethod, setPaymentMethod] = useState("card");
//   const [formData, setFormData] = useState({
//     cardNumber: "",
//     cardName: "",
//     expiryDate: "",
//     cvv: "",
//     companyName: "",
//     taxId: "",
//   });

//   const pricing = {
//     personal: {
//       monthly: 29.99,
//       yearly: 299.99,
//     },
//     company: {
//       monthly: 99.99,
//       yearly: 999.99,
//     },
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = () => {
//     const data = {
//       subscriptionType,
//       billingCycle,
//       paymentMethod,
//       amount: pricing[subscriptionType][billingCycle],
//       formData,
//     };

//     console.log("Subscription Data:", data);
//     alert(
//       `Subscription successful!\nType: ${subscriptionType}\nBilling: ${billingCycle}\nAmount: $${pricing[subscriptionType][billingCycle]}`
//     );
//   };

//   const currentPrice = pricing[subscriptionType][billingCycle];
//   const savedAmount =
//     subscriptionType === "personal"
//       ? (29.99 * 12 - 299.99).toFixed(2)
//       : (99.99 * 12 - 999.99).toFixed(2);

//   return (
//     <div className="form-container-wrapper">
//       <div className="subscription-section">
//         {/* Back Button */}

//         <h2 className="section-title">Choose Your Plan</h2>

//         {/* Account Type Toggle */}
//         <div className="toggle-container">
//           <button
//             className={`toggle-button ${
//               subscriptionType === "personal" ? "active" : ""
//             }`}
//             onClick={() => setSubscriptionType("personal")}
//           >
//             Personal
//           </button>
//           <button
//             className={`toggle-button ${
//               subscriptionType === "company" ? "active" : ""
//             }`}
//             onClick={() => setSubscriptionType("company")}
//           >
//             Company
//           </button>
//         </div>

//         {/* Billing Cycle Toggle */}
//         <div className="toggle-container">
//           <button
//             className={`toggle-button ${
//               billingCycle === "monthly" ? "active" : ""
//             }`}
//             onClick={() => setBillingCycle("monthly")}
//           >
//             Monthly
//           </button>
//           <button
//             className={`toggle-button ${
//               billingCycle === "yearly" ? "active" : ""
//             }`}
//             onClick={() => setBillingCycle("yearly")}
//           >
//             Yearly
//             <span className="save-badge">Save ${savedAmount}</span>
//           </button>
//         </div>

//         {/* Price Display */}
//         <div className="price-card">
//           <div className="price-amount">${currentPrice}</div>
//           <div className="price-period">
//             per {billingCycle === "monthly" ? "month" : "year"}
//           </div>
//           {billingCycle === "yearly" && (
//             <div className="price-note">
//               That's just ${(currentPrice / 12).toFixed(2)} per month!
//             </div>
//           )}
//         </div>

//         {/* Payment Method Selection */}
//         <div className="payment-method-section">
//           <h3 className="subsection-title">Payment Method</h3>
//           <div className="payment-methods">
//             <button
//               className={`payment-method-button ${
//                 paymentMethod === "card" ? "active" : ""
//               }`}
//               onClick={() => setPaymentMethod("card")}
//             >
//               💳 Credit Card
//             </button>
//             <button
//               className={`payment-method-button ${
//                 paymentMethod === "paypal" ? "active" : ""
//               }`}
//               onClick={() => setPaymentMethod("paypal")}
//             >
//               🅿️ PayPal
//             </button>
//             <button
//               className={`payment-method-button ${
//                 paymentMethod === "bank" ? "active" : ""
//               }`}
//               onClick={() => setPaymentMethod("bank")}
//             >
//               🏦 Bank Transfer
//             </button>
//           </div>
//         </div>

//         {/* Payment Form */}
//         <div className="form-container">
//           {subscriptionType === "company" && (
//             <>
//               <div className="form-group">
//                 <label className="label">Company Name *</label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={handleInputChange}
//                   className="input"
//                   placeholder="Enter company name"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="label">Tax ID / VAT Number *</label>
//                 <input
//                   type="text"
//                   name="taxId"
//                   value={formData.taxId}
//                   onChange={handleInputChange}
//                   className="input"
//                   placeholder="Enter tax ID"
//                 />
//               </div>
//             </>
//           )}

//           {paymentMethod === "card" && (
//             <>
//               <div className="form-group">
//                 <label className="label">Card Number *</label>
//                 <input
//                   type="text"
//                   name="cardNumber"
//                   value={formData.cardNumber}
//                   onChange={handleInputChange}
//                   className="input"
//                   placeholder="1234 5678 9012 3456"
//                   maxLength="19"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="label">Cardholder Name *</label>
//                 <input
//                   type="text"
//                   name="cardName"
//                   value={formData.cardName}
//                   onChange={handleInputChange}
//                   className="input"
//                   placeholder="John Doe"
//                 />
//               </div>
//               <div className="form-row">
//                 <div className="form-group">
//                   <label className="label">Expiry Date *</label>
//                   <input
//                     type="text"
//                     name="expiryDate"
//                     value={formData.expiryDate}
//                     onChange={handleInputChange}
//                     className="input"
//                     placeholder="MM/YY"
//                     maxLength="5"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="label">CVV *</label>
//                   <input
//                     type="text"
//                     name="cvv"
//                     value={formData.cvv}
//                     onChange={handleInputChange}
//                     className="input"
//                     placeholder="123"
//                     maxLength="4"
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {paymentMethod === "paypal" && (
//             <div className="payment-info">
//               <p>
//                 You will be redirected to PayPal to complete your payment
//                 securely.
//               </p>
//             </div>
//           )}

//           {paymentMethod === "bank" && (
//             <div className="payment-info">
//               <p>
//                 Bank transfer details will be provided after you confirm your
//                 subscription.
//               </p>
//             </div>
//           )}

//           <button onClick={handleSubmit} className="submit-button">
//             Subscribe Now - ${currentPrice}
//           </button>

//           <p className="terms-text">
//             By subscribing, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SubscriptionFormPage;
import React, { useState } from "react";
import "./SubscriptionFormPage.css";

function SubscriptionFormPage() {
  const [subscriptionType, setSubscriptionType] = useState("personal");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "person",
  });
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    companyName: "",
    taxId: "",
  });

  const pricing = {
    personal: { monthly: 29.99, yearly: 299.99 },
    company: { monthly: 99.99, yearly: 999.99 },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (authData.email && authData.password) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      alert("Login successful! You can now subscribe.");
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (
      authData.email &&
      authData.password &&
      authData.confirmPassword &&
      authData.fullName
    ) {
      if (authData.password === authData.confirmPassword) {
        setIsAuthenticated(true);
        setShowAuthModal(false);
        alert("Account created successfully! You can now subscribe.");
      } else {
        alert("Passwords do not match");
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      alert("Please login or sign up first to subscribe!");
      setShowAuthModal(true);
      return;
    }

    const data = {
      subscriptionType,
      billingCycle,
      paymentMethod,
      amount: pricing[subscriptionType][billingCycle],
      formData,
    };

    console.log("Subscription Data:", data);
    alert(
      `Subscription successful!\nType: ${subscriptionType}\nBilling: ${billingCycle}\nAmount: $${pricing[subscriptionType][billingCycle]}`
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    alert("You have been logged out");
  };

  const currentPrice = pricing[subscriptionType][billingCycle];
  const savedAmount =
    subscriptionType === "personal"
      ? (29.99 * 12 - 299.99).toFixed(2)
      : (99.99 * 12 - 999.99).toFixed(2);

  return (
    <div className="subscription-form-container">
      <div className="form-content-wrapper">
        {/* Authentication Status Bar */}
        <div className="auth-status-panel">
          {isAuthenticated ? (
            <div className="auth-status-content-wrapper">
              <div className="auth-status--logged-in">
                <span className="auth-status-icon--check">✓</span>
                <span>Logged in as {authData.email || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="auth-action-button--logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-status-content-wrapper">
              <div className="auth-status--warning">
                <span className="auth-status-icon--warning animation-pulse">
                  ⚠️
                </span>
                <span>Please login to subscribe</span>
              </div>
              <div className="auth-buttons-container">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="auth-action-button auth-action-button--login"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                  }}
                  className="auth-action-button auth-action-button--signup"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Form */}
        <div className="subscription-form-content">
          <h2 className="subscription-form-title">Choose Your Plan</h2>

          {/* Subscription Type Selection */}
          <div className="option-selector-group">
            <button
              className={`option-selector-button ${
                subscriptionType === "personal"
                  ? "option-selector-button--active"
                  : "option-selector-button--inactive"
              }`}
              onClick={() => setSubscriptionType("personal")}
            >
              Personal
            </button>
            <button
              className={`option-selector-button ${
                subscriptionType === "company"
                  ? "option-selector-button--active"
                  : "option-selector-button--inactive"
              }`}
              onClick={() => setSubscriptionType("company")}
            >
              Company
            </button>
          </div>

          {/* Billing Cycle Selection */}
          <div className="option-selector-group">
            <button
              className={`option-selector-button ${
                billingCycle === "monthly"
                  ? "option-selector-button--active"
                  : "option-selector-button--inactive"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`option-selector-button option-selector-button--yearly ${
                billingCycle === "yearly"
                  ? "option-selector-button--active"
                  : "option-selector-button--inactive"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <span className="savings-badge">Save ${savedAmount}</span>
            </button>
          </div>

          {/* Pricing Display */}
          <div className="pricing-display-card">
            <div className="pricing-display-amount">${currentPrice}</div>
            <div className="pricing-display-period">
              per {billingCycle === "monthly" ? "month" : "year"}
            </div>
            {billingCycle === "yearly" && (
              <div className="pricing-display-savings">
                That's just ${(currentPrice / 12).toFixed(2)} per month!
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="payment-method-section">
            <h3 className="section-heading">Payment Method</h3>
            <div className="payment-method-grid">
              <button
                className={`payment-method-button ${
                  paymentMethod === "card"
                    ? "payment-method-button--active"
                    : "payment-method-button--inactive"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                💳 Credit Card
              </button>
              <button
                className={`payment-method-button ${
                  paymentMethod === "paypal"
                    ? "payment-method-button--active"
                    : "payment-method-button--inactive"
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                🅿️ PayPal
              </button>
              <button
                className={`payment-method-button ${
                  paymentMethod === "bank"
                    ? "payment-method-button--active"
                    : "payment-method-button--inactive"
                }`}
                onClick={() => setPaymentMethod("bank")}
              >
                🏦 Bank Transfer
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-inputs-container">
            {subscriptionType === "company" && (
              <>
                <div className="form-input-group">
                  <label className="form-input-label">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="form-input-field"
                    placeholder="Enter company name"
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="form-input-group">
                  <label className="form-input-label">
                    Tax ID / VAT Number *
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="form-input-field"
                    placeholder="Enter tax ID"
                    disabled={!isAuthenticated}
                  />
                </div>
              </>
            )}

            {paymentMethod === "card" && (
              <>
                <div className="form-input-group">
                  <label className="form-input-label">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="form-input-field"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="form-input-group">
                  <label className="form-input-label">Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="form-input-field"
                    placeholder="John Doe"
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="form-input-row">
                  <div className="form-input-group">
                    <label className="form-input-label">Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="form-input-field"
                      placeholder="MM/YY"
                      maxLength="5"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div className="form-input-group">
                    <label className="form-input-label">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="form-input-field"
                      placeholder="123"
                      maxLength="4"
                      disabled={!isAuthenticated}
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === "paypal" && (
              <div className="payment-info-message">
                <p>
                  You will be redirected to PayPal to complete your payment
                  securely.
                </p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="payment-info-message">
                <p>
                  Bank transfer details will be provided after you confirm your
                  subscription.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className={`subscription-submit-button ${
                isAuthenticated
                  ? "subscription-submit-button--gradient"
                  : "subscription-submit-button--disabled"
              }`}
              disabled={!isAuthenticated}
            >
              {isAuthenticated
                ? `Subscribe Now - $${currentPrice}`
                : "Login to Subscribe"}
            </button>

            <p className="subscription-terms-notice">
              By subscribing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div
            className="modal-content-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setShowAuthModal(false)}
            >
              ✖
            </button>

            <h2 className="modal-header-title">
              {authMode === "login"
                ? "Login to Your Account"
                : "Create New Account"}
            </h2>

            <form
              className="auth-form-container"
              onSubmit={authMode === "login" ? handleLogin : handleSignup}
            >
              {authMode === "signup" && (
                <>
                  <div className="form-input-group">
                    <label className="form-input-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={authData.fullName}
                      onChange={handleAuthInputChange}
                      className="form-input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-input-group">
                    <label className="form-input-label">Account Type *</label>
                    <div className="radio-options-group">
                      <label className="radio-option-label">
                        <input
                          type="radio"
                          name="role"
                          value="person"
                          checked={authData.role === "person"}
                          onChange={handleAuthInputChange}
                          className="radio-option-input"
                        />
                        <span className="radio-option-text">Person</span>
                      </label>
                      <label className="radio-option-label">
                        <input
                          type="radio"
                          name="role"
                          value="company"
                          checked={authData.role === "company"}
                          onChange={handleAuthInputChange}
                          className="radio-option-input"
                        />
                        <span className="radio-option-text">Company</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="form-input-group">
                <label className="form-input-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={authData.email}
                  onChange={handleAuthInputChange}
                  className="form-input-field"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-input-group">
                <label className="form-input-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={authData.password}
                  onChange={handleAuthInputChange}
                  className="form-input-field"
                  placeholder="Enter your password"
                />
              </div>

              {authMode === "signup" && (
                <div className="form-input-group">
                  <label className="form-input-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authData.confirmPassword}
                    onChange={handleAuthInputChange}
                    className="form-input-field"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="auth-form-submit-button subscription-submit-button--gradient"
              >
                {authMode === "login" ? "Login" : "Sign Up"}
              </button>

              <div className="auth-form-switch">
                {authMode === "login" ? (
                  <p>
                    Don't have an account?{" "}
                    <span
                      onClick={() => setAuthMode("signup")}
                      className="auth-form-switch-link"
                    >
                      Sign Up
                    </span>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <span
                      onClick={() => setAuthMode("login")}
                      className="auth-form-switch-link"
                    >
                      Login
                    </span>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionFormPage;
