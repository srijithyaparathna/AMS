import React from "react";
import "./style.css";

const DropdownButton = ({ dropdownName, options, handleOptionSelect }) => {
  return (
    <div className="dropdown">
      <div className="dropdown">
        <button
          id={dropdownName === "LOGIN" ? "login-dropdown" : "dropdown-button"}
          className="dropdown-button"
        >
          {dropdownName}
        </button>
        <div className="dropdown-content">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="dropdown-item"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownButton;
