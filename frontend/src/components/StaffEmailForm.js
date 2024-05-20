import React from 'react';
import "../styles/lecsignup.css";

const StaffEmailForm = () => {
  return (
    <div className="email-form">
      <form className="signup-form">
        <h2>Choose an Account</h2>
        <label htmlFor="email">Email</label>
        <input type="email" className="email" id='email' placeholder="Faculty Email" />
        <div className="nav-btn">
          <button type="button" className="back-btn">
            Go Back
          </button>
          <button type="button" className="continue-btn">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffEmailForm