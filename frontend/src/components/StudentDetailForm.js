import React, { useEffect } from 'react';
import "../styles/lecsignup.css";
import Uni from "../resources/University.jpg";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from 'axios';

const StudentDetailForm = () => {

  const history = useHistory();
  const [stdEmail, setStdEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [tempRegNo, setTempRegNo] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setStdEmail(JSON.parse(sessionStorage.getItem("stdEmail")));
    setBatch("20");
  },[])

  useEffect(() => {
    setTempRegNo(`EG/20${batch-2}/`);
  },[batch])

  const handleRegNoChange = (e) => {
    setTempRegNo(e.target.value);
    if (
      /^[A-Z0-9][A-Z0-9]\/[0-9][0-9][0-9][0-9]\/[0-9][0-9][0-9]$/.test(
        tempRegNo
      )
    ) {
      setRegNo(e.target.value);
      setMessage("");
    } else {
      setMessage("Please enter a valid registration number");
    }
  };

  const addStudent = async (
    Reg_number,
    First_name,
    Last_name,
    Department,
    Email,
    Batch,
    Password
  ) => {
    try {
      const url = `http://localhost:8080/db/students`;
      const response = await axios.post(url, {
        Reg_number,
        First_name,
        Last_name,
        Department,
        Email,
        Batch,
        Password
      });
      console.log(response.data);
      alert("Successfully registered");
      sessionStorage.setItem("isSignUp", JSON.stringify(false));
      sessionStorage.setItem("isSignIn", JSON.stringify(true));
      history.push("/login/student");
      history.push("/login/student");
    } catch (err) {
      if (err.response) {
        console.log(err.response.data.message);
        console.log(err.response.status);
        console.log(err.response.headers);
      } else {
        console.log(err.message);
      }
    }
  };

  const deleteTempUser = async (Email) => {
    try {
      const url = `http://localhost:8080/db/tempUser/${Email}`;
      const response = await axios.delete(url);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (firstName === "") {
      setMessage("First name is required");
    } else if (lastName === "") {
      setMessage("Last name is required");
    } else if (regNo === "") {
      setMessage("Registration number is required");
    } else if (department === "") {
      setMessage("Department is required");
    } else if (password === "") {
      setMessage("Password is required");
    } else {
      deleteTempUser(stdEmail);
      addStudent(regNo, firstName, lastName, department, stdEmail, batch, password);
    }
  };

  return (
    <main className="login">
      <div className="back-img">
        <img src={Uni} />
      </div>
    <div className="detail-form">
      <form className="detail-form" onSubmit={(e) => e.preventDefault()} >
        <h2>SIGN UP</h2>
        <div className="std-name">
          <input 
            type="text" 
            className="Fname" 
            placeholder="First Name" 
            value={firstName} 
            onChange={(e) => {setFirstName(e.target.value)}} 
          />
          <input 
            type="text" 
            className="Lname" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => {setLastName(e.target.value)}}
          />
        </div>
        <div className="reg-number">
          <input
            type="text"
            className="reg-no"
            placeholder="Registration No."
            value={tempRegNo}
            onChange={handleRegNoChange}
          />
          <select name="batch" className="batch" onChange={(e)=> setBatch(e.target.value)}>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
          </select>
        </div>

        <label htmlFor="department">Department</label>
        <select name="department" className="department" onChange={(e) => setDepartment(e.target.value)} >
          <option value="DEIE">DEIE</option>
          <option value="CEE">CEE</option>
          <option value="DMME">DMME</option>
          <option value="MENA">MENA</option>
          <option value="Computer">Computer</option>
          <option value="1st Year" >1st Year</option>
        </select>
        <label htmlFor="email">Email</label>
        <input
         type="email" 
         className="email" 
         placeholder="Faculty Email"
         value={stdEmail} 
        />
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          className="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => {setPassword(e.target.value)}}
        />
        {message && (
          <p className="message" style={{ color: "red", fontSize: "15px" }}>
            {message}
          </p>
        )}
        <button type="submit" className="submit-btn" onClick={handleSubmit}>
          SIGN UP
        </button>
      </form>
    </div>
  </main>
  );
}

export default StudentDetailForm