import React, { useEffect } from "react";
import "../styles/appointments.css";
import { useState } from "react";
import axios, { all } from "axios";
import ListAppointment from "./helpers/ListAppointment";

const StaffAppointments = ({ socket }) => {
  const [appointments, setAppointments] = useState([]);

  const getAllAppointments = async (Lecturer_mail) => {
    try {
      const url = `http://localhost:8080/db/appointments/confirmed/${Lecturer_mail}`;
      const response = await axios.get(url);
      console.log(response.data);
      setAppointments(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setAppointments(
      getAllAppointments(
        JSON.parse(sessionStorage.getItem("selectedStaffEmail"))
      )
    );
  }, []);

  useEffect(() => {
    const mail = JSON.parse(sessionStorage.getItem("selectedStaffEmail"));
    socket.on("block time slot", () => {
      setAppointments(getAllAppointments(mail));
    });
    socket.on("add appointment", (msg) => {
      if (
        (msg.lecMail = JSON.parse(
          sessionStorage.getItem("selectedStaffEmail")
        )) &&
        JSON.parse(sessionStorage.getItem("userType")) === "Staff"
      ) {
        setAppointments(getAllAppointments(mail));
      }
    });
    socket.on("delete appointment", () => {
      setAppointments(getAllAppointments(mail));
    });
    socket.on("change appointment", (msg) => {
      setAppointments(getAllAppointments(mail));
    });
  }, [socket]);

  return (
    <div className="appointments">
      <div className="appointment-header">
        <div className="apt-number heading">
          <span>No.</span>
        </div>
        <div className="apt-student heading">
          <span>Student</span>
        </div>
        <div className="apt-reason heading">
          <span>Reason</span>
        </div>
        <div className="apt-details heading">
          <span>Appointment</span>
        </div>
        <div className="apt-status heading">
          <span>Status</span>
        </div>
      </div>
      {appointments !== null && appointments.length > 0 ? (
        appointments.map((appointment, index) => (
          <ListAppointment key={index} appointment={appointment} />
        ))
      ) : (
        <div className="no-appointments">No appointments</div>
      )}
    </div>
  );
};

export default StaffAppointments;
