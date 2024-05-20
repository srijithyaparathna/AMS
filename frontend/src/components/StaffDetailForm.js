import "../styles/lecsignup.css";
import React from "react";
import Uni from "../resources/University.jpg";
import { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const StaffDetailForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [img, setImg] = useState("");
  const [message, setMessage] = useState("");
  const defaultImg = "https://www.w3schools.com/howto/img_avatar.png";
  const history = useHistory();

  useEffect(() => {
    const Email = JSON.parse(sessionStorage.getItem("staffEmail"));
    const getUser = async () => {
      try {
        const url = `http://localhost:8080/db/tempUser/${Email}`;
        const response = await axios.get(url, {
          withCredentials: true,
        });
        const tempUser = response.data.find((user) => user.Email === Email);
        setEmail(tempUser.Email);
        setImg(tempUser.Picture_URL);
        setName(`${tempUser.First_Name} ${tempUser.Last_Name}`);
        setFName(tempUser.First_Name);
        setLName(tempUser.Last_Name);
      } catch (err) {
        console.log(err.message);
      }
    };
    getUser();
  }, []);

  const deleteTempUser = async (Email) => {
    try {
      const url = `http://localhost:8080/db/tempUser/${Email}`;
      const response = await axios.delete(url);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addStaff = async (
    First_name,
    Last_name,
    Department,
    Email,
    Picture_URL,
    Password
  ) => {
    try {
      const url = `http://localhost:8080/db/staff`;
      const response = await axios.post(url, {
        First_name,
        Last_name,
        Department,
        Email,
        Picture_URL,
        Password,
      });
      console.log(response.data);
      alert("Successfully registered");
      sessionStorage.setItem("isSignUp", JSON.stringify(false));
      sessionStorage.setItem("isSignIn", JSON.stringify(true));
      history.push("/login/staff");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name === "") {
      setMessage("Name is required");
    } else if (department === "") {
      setMessage("Department is required");
    } else if (password === "") {
      setMessage("Password is required");
    } else if (email === "") {
      setMessage("Email is required");
    } else {
      deleteTempUser(email);
      addStaff(
        fName,
        lName,
        department,
        email,
        img !== "" ? img : defaultImg,
        password
      );
    }
  };

  return (
    <main className="login">
      <div className="back-img">
        <img src={Uni} />
      </div>
      <div className="detail-form">
        <form className="detail-form">
          <h2>SIGN UP</h2>
          <div className="std-name">
            <input
              type="text"
              className="Fname"
              placeholder="First Name"
              value={fName}
              onChange={(e) => {
                setFName(e.target.value);
              }}
            />
            <input
              type="text"
              className="Lname"
              placeholder="Last Name"
              value={lName}
              onChange={(e) => {
                setLName(e.target.value);
              }}
            />
          </div>
          <label htmlFor="department">Department</label>
          <select
            name="department"
            className="department"
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="DEIE">DEIE</option>
            <option value="DCEE">CEE</option>
            <option value="DMME">DMME</option>
            <option value="MENA">MENA</option>
            <option value="Computer">Computer</option>
          </select>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            placeholder="Faculty Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Email</label>
          <input
            type="password"
            className="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && (
            <p className="message" style={{ color: "red", fontSize: "15px" }}>
              {message}
            </p>
          )}
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            Continue
          </button>
        </form>
      </div>
    </main>
  );
};

export default StaffDetailForm;
