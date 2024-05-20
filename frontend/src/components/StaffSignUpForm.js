import React, { useEffect, useState } from "react";
import "../styles/lecsignup.css";
import Uni from "../resources/University.jpg";
import { FaGoogle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import axios from "axios";

const StaffSignUpForm = ({ socket }) => {
  const [staff, setStaff] = useState(null);
  const [allStaff, setAllStaff] = useState([]);
  const [message, setMessage] = useState("");
  const [tempUsers, setTempUsers] = useState([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [picture, setPicture] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const history = useHistory();

  useEffect(() => {
    const clearCookies = async () => {
      try {
        const url = `http://localhost:8080/clearCookies`;
        const response = await axios.get(url, { withCredentials: true });
        if (response.ok) {
          console.log("Cookies cleared successfully");
        } else {
          console.error("Failed to clear cookies");
        }
      } catch (error) {
        console.error("Error clearing cookies:", error);
      }
    };

    const getStaff = async () => {
      try {
        const url = `http://localhost:8080/auth/login/success`;
        const { data } = await axios.get(url, { withCredentials: true });
        sessionStorage.setItem(
          "staffEmail",
          JSON.stringify(data.user._json.email)
        );
        setStaff(data.user._json);
        setPicture(data.user._json.picture);
        setFName(data.user._json.given_name);
        setLName(data.user._json.family_name);
        console.log(data.user._json);
      } catch (err) {
        console.log(err);
      }
    };

    getStaff();
    clearCookies();
  }, []);

  useEffect(() => {
    setStaffEmail(staff ? staff.email : "");
  }, [staff]);

  useEffect(() => {
    const getStaffPassword = async (Email) => {
      try {
        const url = `http://localhost:8080/db/staff/password/${Email}`;
        const response = await axios.get(url);
        return response.data[0].Original_password;
      } catch (err) {
        console.log(err);
      }
    };

    const handleStaffLogin = async (Email, Original_password) => {
      try {
        const url = `http://localhost:8080/db/staff/login`;
        const body = { Email, Original_password };
        const response = await axios.post(url, body, {
          withCredentials: true,
        });
        if (response.data.Status === "Success") {
          sessionStorage.setItem("jwt", JSON.stringify(response.data.RefreshToken));
          sessionStorage.setItem("authorized", JSON.stringify(true));
          console.log("Login successful");
          socket.connect();
          history.push("/staff/home");
        } else {
          setMessage("Invalid email or password");
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    const checkStaffIsThere = async () => {
      try {
        const url = `http://localhost:8080/db/staff/${JSON.parse(
          sessionStorage.getItem("staffEmail")
        )}`;
        const response = await axios.get(url);
        if (response.data[0] !== undefined) {
          sessionStorage.setItem(
            "selectedStaffEmail",
            JSON.stringify(response.data[0].Email)
          );
          sessionStorage.setItem("staffEmail", JSON.stringify(""));
          sessionStorage.setItem("isAuthed", JSON.stringify(true));
          const password = await getStaffPassword(response.data[0].Email);
          handleStaffLogin(response.data[0].Email, password);
          // history.push("/login/staff");
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkStaffIsThere();
  });

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    window.open(`http://localhost:8080/auth/google`, "_self");
  };

  const sendVerificationMail = async (email, code) => {
    // sessionStorage.setItem("staffCode", JSON.stringify(code));
    // sessionStorage.setItem("passCode", JSON.stringify(code));
    sessionStorage.setItem("staffEmail", JSON.stringify(staffEmail));
    try {
      const url = `http://localhost:8080/mail/student/verify`;
      const { data } = await axios.post(url, { email, code });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateVerificationCode = async (Email, Verification_Code) => {
    try {
      const url = `http://localhost:8080/db/tempUser`;
      const { data } = await axios.put(url, { Email, Verification_Code });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addTempUser = async (
    Email,
    Verification_Code,
    First_Name,
    Last_Name,
    Picture_URL
  ) => {
    try {
      const url = `http://localhost:8080/db/tempUser`;
      const { data } = await axios.post(url, {
        Email,
        Verification_Code,
        First_Name,
        Last_Name,
        Picture_URL,
      });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getAllStaff = async () => {
      try {
        const url = `http://localhost:8080/db/staffList`;
        const response = await axios.get(url);
        setAllStaff(response.data);
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

    const getAllTempUsers = async () => {
      try {
        const url = `http://localhost:8080/db/tempUsers`;
        const response = await axios.get(url);
        setTempUsers(response.data);
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
    getAllStaff();
    getAllTempUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (staffEmail === "") {
      setMessage("Email is required");
      console.log(message);
    } else if (!staffEmail.includes("eng.ruh.ac.lk")) {
      setMessage("Please enter a valid email");
    } else {
      const code = `${Math.floor(Math.random() * 10)}${Math.floor(
        Math.random() * 10
      )}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
      // setPassCode(code);
      const lec = allStaff.find((stf) => stf.Email === staffEmail);
      const tempUser = tempUsers.find((temp) => temp.Email === staffEmail);
      if (!lec && (!tempUser || !tempUser.Verified)) {
        sendVerificationMail(staffEmail, code);
        if (!tempUser) {
          addTempUser(staffEmail, code, fName, lName, picture);
        }
        if (tempUser && !tempUser.Verified) {
          updateVerificationCode(staffEmail, code);
        }
        // sessionStorage.setItem("stdEmail", JSON.stringify(stdEmail));
        history.push("/signup/verify");
      } else {
        setMessage("Email already exists");
      }
    }
  };

  return (
    <main className="lec-signup">
      <div className="back-img">
        <img src={Uni} />
      </div>
      <div className="signup-form">
        <form className="signup-form">
          <h2>SIGN UP</h2>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="email"
            placeholder="Faculty Email"
            Value={staffEmail ? staffEmail : " "}
            onChange={(e) => setStaffEmail(e.target.value)}
          />
          {message && (
            <p className="message" style={{ color: "red", fontSize: "15px" }}>
              {message}
            </p>
          )}
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            Continue
          </button>
          <p>Or</p>
          <button className="google-btn" onClick={handleGoogleAuth}>
            <FaGoogle className="google-icon" />
            <p>CONTINUE WITH GOOGLE</p>
          </button>
        </form>
      </div>
    </main>
  );
};

export default StaffSignUpForm;
