import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import "./index.css";
import "./styles/home.css";
import { Route, Switch, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import StudentLoginForm from "./components/StudentLoginForm";
import StaffLoginForm from "./components/StaffLoginForm";
import StaffSignUpForm from "./components/StaffSignUpForm";
import StudentSignUpForm from "./components/StudentSignUpForm";
import VerificationForm from "./components/VerificationForm";
import StudentDetailForm from "./components/StudentDetailForm";
import StaffDetailForm from "./components/StaffDetailForm";
import StudentHome from "./components/StudentHome";
import Department from "./components/Department";
import StaffHome from "./components/StaffHome";
import StudentCalendar from "./components/StudentCalendar";
import StaffCalendar from "./components/StaffCalendar";
import StaffAppointments from "./components/StaffAppointments";
import { message } from "antd";

import { io } from "socket.io-client";

// This should be changed to the URL of the backend server manually
const URL = "http://localhost:8080";
const socket = io(URL, {
  autoConnect: false,
});

function App() {
  const notify = (msg) => {
    message.success(msg);
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(msg);
      } else {
        Notification.requestPermission().then((res) => {
          if (res === "granted") {
            new Notification(msg);
          } else if (res === "denied") {
            console.log("Access denied");
          } else if (res === "default") {
            console.log("Notification permission not given");
          }
        });
      }
    } else {
      console.log("Notifications not supported");
    }
  };

  useEffect(() => {
    socket.on("add appointment", (msg) => {
      if (
        (msg.lecMail = JSON.parse(
          sessionStorage.getItem("selectedStaffEmail")
        )) &&
        JSON.parse(sessionStorage.getItem("userType")) === "Staff"
      ) {
        notify("New appointment added!");
      }
    });

    socket.on("delete appointment", (msg) => {
      if (
        (msg.lecMail = JSON.parse(
          sessionStorage.getItem("selectedStaffEmail")
        )) &&
        JSON.parse(sessionStorage.getItem("userType")) === "Staff" &&
        msg.EventType !== "Blocked"
      ) {
        notify("Appointment deleted!");
      }
    });

    socket.on("change appointment", (msg) => {
      if (
        (msg.lecMail = JSON.parse(
          sessionStorage.getItem("selectedStaffEmail")
        )) &&
        JSON.parse(sessionStorage.getItem("userType")) === "Staff"
      ) {
        notify("Appointment changed!");
      }
    });
  }, [socket]);

  const [authorized, setAuthorized] = useState(false);

  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const getAllStaff = async () => {
      try {
        const url = `http://localhost:8080/db/staffList`;
        const response = await axios.get(url);
        setStaffList(response.data);
        sessionStorage.setItem("staffList", JSON.stringify(response.data));
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
  }, []);

  useEffect(() => {
    const getStdToken = async () => {
      const jwt = JSON.parse(sessionStorage.getItem("jwt"));
      try {
        const config = {
          headers: { Authorization: jwt }
        };
        const url = `http://localhost:8080/db/student/refresh`;
        const response = await axios.get(url, config);
        const accessToken = response.data.accessToken;
        if (accessToken !== undefined) {
          socket.connect();
        }
        setAuthorized(true);
        return accessToken;
      } catch (err) {
        setAuthorized(false);
        console.log(err);
      }
    };

    const getStaffToken = async () => {
      const jwt = JSON.parse(sessionStorage.getItem("jwt"));
      try {
        const config = {
          headers: { Authorization: jwt }, // Send JWT token in the headers
        };
        const url = `http://localhost:8080/db/staff/refresh`;
        const response = await axios.get(url, config);
        const accessToken = response.data.accessToken;
        if (accessToken !== undefined) {
          socket.connect();
        }
        setAuthorized(true);
        return accessToken;
      } catch (err) {
        setAuthorized(false);
        console.log(err);
      }
    };


    if (JSON.parse(sessionStorage.getItem("userType")) === "Student") {
      if (getStdToken() !== undefined) {
        setAuthorized(true);
      }
    } else if (JSON.parse(sessionStorage.getItem("userType")) === "Staff") {
      if (getStaffToken() !== undefined) {
        setAuthorized(true);
      }
    }
  }, []);

  return (
    <div className="App">
      <Header socket={socket} />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login/student">
          <StudentLoginForm socket={socket} />
        </Route>
        <Route exact path="/login/staff">
          <StaffLoginForm socket={socket} />
        </Route>
        <Route exact path="/signup/staff">
          <StaffSignUpForm socket={socket} />
        </Route>
        <Route exact path="/signup/student">
          <StudentSignUpForm />
        </Route>
        <Route exact path="/signup/verify">
          <VerificationForm />
        </Route>
        <Route exact path="/signup/student/std-details">
          <StudentDetailForm />
        </Route>
        <Route exact path="/signup/staff/staff-details">
          <StaffDetailForm />
        </Route>
        <Route exact path="/student/home" component={StudentHome} />
        <Route exact path="/student/department">
          <Department />
        </Route>
        <Route exact path="/student/calendar">
          <StudentCalendar socket={socket} />
        </Route>
        <Route exact path="/staff/calendar">
          <StaffCalendar socket={socket} />
        </Route>
        <Route exact path="/staff/home">
          <StaffHome />
        </Route>
        <Route exact path="/staff/appointments">
          <StaffAppointments socket={socket} />
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
