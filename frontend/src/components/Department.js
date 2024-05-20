import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/department.css";
import StaffDisplay from "./helpers/StaffDisplay";

const Department = () => {

  const getDepName = () => {
    const dep = JSON.parse(sessionStorage.getItem("department"));
    switch (dep) {
      case "DCEE":
        return "Department of Civil and Environmental Engineering";
      case "DEIE":
        return "Department of Electrical and Information Engineering";
      case "DMME":
        return "Department of Mechanical and Manufacturing Engineering";
      case "MENA":
        return "Department of Metallurgical and Materials Engineering";
      case "Computer":
        return "Department of Computer Science and Engineering";
    }
  };

  return (
    <main className="department-page">
      <div className="top">
        <div className="dep-name">
          <p className="abbr-name">
            {JSON.parse(sessionStorage.getItem("department")) === "Computer"
              ? "COM"
              : JSON.parse(sessionStorage.getItem("department"))}
          </p>
          <p className="long-name">{getDepName()}</p>
        </div>
        <div className="search">
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="content">
        {JSON.parse(sessionStorage.getItem("staffList")) !== undefined && (
          <>
            {JSON.parse(sessionStorage.getItem("staffList")).find(
              (staff) =>
                staff.Department ===
                JSON.parse(sessionStorage.getItem("department"))
            ) === undefined && <p>No staff</p>}
            {JSON.parse(sessionStorage.getItem("staffList"))
              .filter(
                (staff) =>
                  staff.Department ===
                  JSON.parse(sessionStorage.getItem("department"))
              )
              .map((staff, index) => (
                <StaffDisplay staff={staff} />
              ))}
          </>
        )}
      </div>
    </main>
  );
};

export default Department;
