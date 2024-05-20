import "../styles/lecsignup.css";
import { useState, useEffect } from "react";
import Uni from "../resources/University.jpg";
import { useHistory } from "react-router-dom";
import axios from "axios";

const VerificationForm = () => {
  const [passCode, setPassCode] = useState("");
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [three, setThree] = useState("");
  const [four, setFour] = useState("");
  const [message, setMessage] = useState("");

  const history = useHistory();

  const getPasscode = async (Email) => {
    try {
      const url = `http://localhost:8080/db/tempUser/${Email}`;
      const response = await axios.get(url, {
        withCredentials: true,
      });
      const tempUser = response.data.find((user) => user.Email === Email);
      return tempUser.Verification_Code;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (JSON.parse(sessionStorage.getItem("userType")) === "Staff") {
      setPassCode(
        getPasscode(JSON.parse(sessionStorage.getItem("staffEmail")))
      );
    } else {
      setPassCode(getPasscode(JSON.parse(sessionStorage.getItem("stdEmail"))));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (one === "" || two === "" || three === "" || four === "") {
      setMessage("Please enter the code");
    } else if (`${one}${two}${three}${four}` === passCode) {
      setMessage("Incorrect code");
    } else {
      if (JSON.parse(sessionStorage.getItem("userType")) === "Staff") {
        history.push("/signup/staff/staff-details");
      } else {
        history.push("/signup/student/std-details");
      }
    }
  };

  return (
    <main className="login">
      <div className="back-img">
        <img src={Uni} />
      </div>
      <div className="verification-form">
        <form className="verification-form">
          <h3>Please Enter the Code Received in Your Email</h3>
          <div className="code">
            <input
              type="text"
              maxLength="1"
              className="one"
              value={one}
              onChange={(e) => setOne(e.target.value)}
            />
            <input
              type="text"
              maxLength="1"
              className="two"
              value={two}
              onChange={(e) => setTwo(e.target.value)}
            />
            <input
              type="text"
              maxLength="1"
              className="three"
              value={three}
              onChange={(e) => setThree(e.target.value)}
            />
            <input
              type="text"
              maxLength="1"
              className="four"
              value={four}
              onChange={(e) => setFour(e.target.value)}
            />
          </div>
          {message && (
            <p className="message" style={{ color: "red", fontSize: "15px" }}>
              {message}
            </p>
          )}
          <button
            type="button"
            className="verify-btn back-btn"
            onClick={handleSubmit}
          >
            Verify
          </button>
          <p>
            Didn’t Receive the Code? <a href="#">Resend</a>
          </p>
        </form>
      </div>
    </main>
  );
};

export default VerificationForm;
