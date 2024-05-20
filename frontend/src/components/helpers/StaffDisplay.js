import React from "react";
import "./staffDisplay.css";
import { useHistory } from "react-router-dom";

const StaffDisplay = ({ staff }) => {
  const history = useHistory();

  const handleClick = () => {
    sessionStorage.setItem("selectedStaff", JSON.stringify(staff));
    history.push("/student/calendar");
  };

  return (
    <div className="staff-card">
      <img src={staff.Picture_URL} alt="Staff" className="staff-image" />
      <div className="staff-details">
        <h2 className="staff-fullname">{`${staff.First_name} ${staff.Last_name}`}</h2>
        <p className="staff-position">{staff.position}</p>
        <button className="view-button" onClick={handleClick}>
          View
        </button>
      </div>
    </div>
  );
};

export default StaffDisplay;
