import React from "react";
import Uni from "../resources/University.jpg";
import { useEffect, useState } from "react";

const StudentHome = ({ socket }) => {
  return (
    <div className="caption">
      <h2>APPOINTMENT MANAGEMENT SYSTEM</h2>
      <h2 style={{ margin: "-10px" }}>FACULTY OF ENGINEERING</h2>
      <img src={Uni} alt="University" />
    </div>
  );
};

export default StudentHome;
