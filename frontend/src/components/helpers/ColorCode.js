import React from "react";
import "./colorcode.css";

const ColorCode = () => {
  return (
    <div className="stack">
      <div className="new">New</div>
      <div className="blocked">Blocked</div>
      <div className="confirmed">Confirmed</div>
      <div className="unable">Unable</div>
    </div>
  );
};

export default ColorCode;
