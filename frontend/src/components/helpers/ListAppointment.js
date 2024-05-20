import React, { useEffect } from "react";
import "./listAppointment.css";
import { useState } from "react";
import axios from "axios";

const ListAppointment = ({ appointment, key }) => {
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");

  const getTime = (value) => {
    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedTime = `${formattedHours}:${formattedMinutes}`;
    if (formattedTime === "NaN:NaN") {
      return "";
    } else {
      return formattedTime;
    }
  };

  const getDate = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    if (formattedDate === "NaN/NaN/NaN") {
      return "";
    } else {
      return formattedDate;
    }
  };

  useEffect(() => {
    const getStudentDetails = async (Reg_number) => {
      try {
        const url = `http://localhost:8080/db/student/details/${Reg_number}`;
        const { data } = await axios.get(url, Reg_number);
        return data;
      } catch (err) {
        console.log(err);
      }
    };

    if (appointment) {
      console.log(appointment);

      setDate(getDate(appointment.StartTime));
      setStartTime(getTime(appointment.StartTime));
      setEndTime(getTime(appointment.EndTime));
      setStatus(appointment.Apt_status);
      setId(appointment.Id);

      if (appointment.Subject === "undefined" || appointment.Subject === null) {
        setSubject("No subject");
      } else {
        setSubject(appointment.Subject);
      }

      if (
        appointment.Description === "undefined" ||
        appointment.Description === null
      ) {
        setDescription("No description");
      } else {
        if (appointment.Description.length > 50) {
          setDescription(appointment.Description.slice(0, 50) + "...");
        } else {
          setDescription(appointment.Description);
        }
      }

      getStudentDetails(appointment.Student_reg).then((data) => {
        setName(`${data[0].First_name} ${data[0].Last_name}`);
        setBatch(data[0].Batch);
      });
    }
  }, []);

  return (
    <main className="apt-description">
      <div className="appointment-header">
        <div className="apt-number heading">
          <div className="apt-number-val">{id}</div>
        </div>
        <div className="apt-student">
          <div>{`Name: ${name}`}</div>
          <div>{`Batch: ${batch}`}</div>
        </div>
        <div className="apt-reason">
          <div className="subject">{subject}</div>
          <div>{description} </div>
        </div>
        <div className="apt-details">
          <div>{date}</div>
          <div>{`${startTime} - ${endTime}`}</div>
        </div>
        <div className="apt-status">
          <div>{status}</div>
        </div>
      </div>
    </main>
  );
};

export default ListAppointment;
