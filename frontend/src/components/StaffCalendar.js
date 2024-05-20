import React, { useEffect, useState } from "react";
import "../styles/calendar.css";
import axios from "axios";
import {
  Inject,
  ScheduleComponent,
  ButtonComponent,
  Day,
  Week,
  Month,
  Agenda,
  ViewsDirective,
  ViewDirective,
  TimelineViews,
  TimelineMonth,
  DragAndDrop,
  Resize,
} from "@syncfusion/ej2-react-schedule";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { L10n } from "@syncfusion/ej2-base";
import ColorCode from "./helpers/ColorCode";

L10n.load({
  "en-US": {
    schedule: {
      saveButton: "Save",
      cancelButton: "Close",
      deleteButton: "Remove",
      newEvent: "Appointment Details",
    },
  },
});

const getColor = (status) => {
  switch (status) {
    case "New":
      return "#FFD700";
    case "Blocked":
      return "#FF6347";
    case "Confirmed":
      return "#32CD32";
    case "Unable":
      return "#87CEFA";
    case "Done":
      return "#FF4500";
    default:
      return "#FFD700";
  }
};

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

const getTimeString = (start, end) => {
  const startTime = getTime(start);
  const endTime = getTime(end);
  if (startTime === "" && endTime === "") {
    return "";
  } else {
    return `Time : ${startTime} - ${endTime}`;
  }
};

const eventTemplate = (e) => {
  const secondaryColor = { background: e.Color };
  const primaryColor_1 = { background: e.Color };
  const primaryColor_2 = { background: e.Color };
  return (
    <div className="template-wrap" style={secondaryColor}>
      <div className="subject" style={primaryColor_1}>
        {e.Subject}
      </div>
      <div className="time" style={primaryColor_2}>
        {getTimeString(e.StartTime, e.EndTime)}
      </div>
      <div className="reg" style={primaryColor_2}>
        {
          <div className="time" style={primaryColor_2}>
            {e.StdReg ? `Student: ${e.StdReg}` : ""}
          </div>
        }
      </div>
    </div>
  );
};

const StaffCalendar = ({ socket }) => {
  const [selectedStaffEmail, setSelectedStaffEmail] = useState(
    JSON.parse(sessionStorage.getItem("selectedStaffEmail"))
  );

  const [blocked, setBlocked] = useState();

  const [appointments, setAppointments] = useState({
    dataSource: [],
    fields: {
      subject: { default: "No title is provided" },
    },
  });

  const [selectedAptId, setSelectedAptId] = useState(0);
  const [isDragged, setIsDragged] = useState(false);
  const [isResized, setIsResized] = useState(false);

  const [staffDetails, setStaffDetails] = useState({});

  const fetchData = async () => {
    try {
      const data = await getAllAppointments(selectedStaffEmail);
      setAppointments({
        dataSource: data.map((item) => ({
          Id: item.Id,
          Subject: item.Subject || "No title is provided",
          EventType: item.Apt_status,
          StartTime: new Date(item.StartTime),
          EndTime: new Date(item.EndTime),
          Description: item.Description,
          Color: getColor(item.Apt_status),
          StdReg: item.Student_reg,
          lecMail: item.Lecturer_mail,
        })),
        fields: {
          subject: { default: "No title is provided" },
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getAllAppointments = async (Lecturer_mail) => {
    try {
      const url = `http://localhost:8080/db/appointments/${Lecturer_mail}`;
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("isDragged", JSON.stringify(false));
    const getStaffDetails = async () => {
      try {
        const url = `http://localhost:8080/db//staff/${selectedStaffEmail}`;
        const response = await axios.get(url);
        setStaffDetails(response.data[0]);
      } catch (err) {
        console.log(err);
      }
    };
    getStaffDetails();
    fetchData();
  }, []);

  useEffect(() => {
    socket.on("block time slot", () => {
      fetchData();
    });
    socket.on("add appointment", (msg) => {
      if (
        (msg.lecMail = JSON.parse(
          sessionStorage.getItem("selectedStaffEmail")
        )) &&
        JSON.parse(sessionStorage.getItem("userType")) === "Staff"
      ) {
        fetchData();
      }
    });
    socket.on("delete appointment", () => {
      fetchData();
    });
    socket.on("change appointment", (msg) => {
      fetchData();
    });
  }, [socket]);

  useEffect(() => {
    sessionStorage.setItem("isDragged", JSON.stringify(false));
    const getStaffDetails = async () => {
      try {
        const url = `http://localhost:8080/db//staff/${selectedStaffEmail}`;
        const response = await axios.get(url);
        setStaffDetails(response.data[0]);
      } catch (err) {
        console.log(err);
      }
    };
    getStaffDetails();
    fetchData();
    setBlocked(false);
    socket.on("block time slot", () => {
      fetchData();
    });
  }, [blocked]);

  const onDragStart = (e) => {
    e.interval = 10;
    setSelectedAptId(e.data.Id);
  };

  const onDragStop = (e) => {
    sessionStorage.setItem("isDragged", JSON.stringify(true));
    updateAppointment(
      e.data.Subject,
      e.data.Description,
      e.data.StartTime,
      e.data.EndTime,
      e.data.EventType,
      e.data.StdReg
    );
  };

  const onResizeStart = (e) => {
    e.interval = 10;
    setSelectedAptId(e.data.Id);
  };

  const onResizeStop = (e) => {
    setIsResized(true);
    updateAppointment(
      e.data.Subject,
      e.data.Description,
      e.data.StartTime,
      e.data.EndTime,
      e.data.EventType,
      selectedAptId
    );
  };

  const selectDropdown = (e) => {
    switch (e.EventType) {
      case "New":
        return ["Unable", "Confirmed"];
      case "Blocked":
        return ["Blocked"];
      case "Unable":
        return ["Unable", "Confirmed"];
      case "Confirmed":
        return ["Confirmed", "Unable", "Done"];
      default:
        return ["Blocked"];
    }
  };

  const ediitorWindowTemplate = (e) => {
    return (
      <table className="custom-event-editor" style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td className="e-textlabel">Summary</td>
            <td>
              <input
                id="Summary"
                className="e-field e-input"
                type="text"
                name="Subject"
                style={{ width: "100%" }}
              />
            </td>
          </tr>
          <tr>
            <td className="e-textlabel">Status</td>
            <td>
              <DropDownListComponent
                id="EventType"
                placeholder="Choose status"
                data-name="EventType"
                className="e-field"
                // dataSource={["New", "Blocked", "Unable", "Confirmed"]}
                dataSource={selectDropdown(e)}
                value="Blocked"
              />
            </td>
          </tr>
          <tr>
            <td className="e-textlabel">From</td>
            <td>
              <DateTimePickerComponent
                id="StartTime"
                data-name="StartTime"
                value={new Date(e.StartTime || e.startTime)}
                format={"dd/MM/yy hh:mm a"}
                className="e-field"
              />
            </td>
          </tr>
          <tr>
            <td className="e-textlabel">To</td>
            <td>
              <DateTimePickerComponent
                id="EndTime"
                data-name="EndTime"
                value={new Date(e.EndTime || e.endTime)}
                format={"dd/MM/yy hh:mm a"}
                className="e-field"
              />
            </td>
          </tr>
          <tr>
            <td className="e-textlabel">Reason</td>
            <td>
              <textarea
                id="Description"
                className="e-field e-input"
                name="Description"
                rows={3}
                cols={50}
                style={{ width: "100%", height: "60px" }}
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const addAppointment = async (
    Id,
    Lecturer_mail,
    Student_reg,
    Subject,
    Description,
    StartTime,
    EndTime,
    Apt_status
  ) => {
    try {
      const url = `http://localhost:8080/db/appointment/add`;
      const response = await axios.post(url, {
        Id,
        Lecturer_mail,
        Student_reg,
        Subject,
        Description,
        StartTime,
        EndTime,
        Apt_status,
      });
      console.log(response.data);
      socket.emit("block time slot");
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

  const getLastAppointment = async () => {
    try {
      const url = `http://localhost:8080/db/appointment/last`;
      const response = await axios.get(url);
      console.log(response.data);
      if (response.data.length === 0) {
        return 1;
      } else {
        return response.data[0].Id;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateAppointment = async (
    Subject,
    Description,
    StartTime,
    EndTime,
    Apt_status,
    StdReg
  ) => {
    try {
      const url = `http://localhost:8080/db/appointment`;
      const response = await axios.put(url, {
        Id: selectedAptId,
        Subject,
        Description,
        StartTime,
        EndTime,
        Apt_status,
      });
      if (StdReg !== null) {
        sendAppointmentChangeMail(StartTime, EndTime, StdReg, Apt_status);
      }
      sessionStorage.setItem("isDragged", JSON.stringify(false));
      setIsResized(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getStudentDetails = async (Reg_number) => {
    try {
      const url = `http://localhost:8080/db/student/details/${Reg_number}`;
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const getDate = (value) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const getAppointment = async (Id) => {
    try {
      const url = `http://localhost:8080/db/appointment/${Id}`;
      const response = await axios.get(url);
      return response.data[0];
    } catch (err) {
      console.log(err);
    }
  };

  const sendAppointmentChangeMail = async (from, to, StdReg, Apt_status) => {
    const msg = { selectedStaffEmail };
    if (JSON.parse(sessionStorage.getItem("isDragged")) === true) {
      try {
        const student = await getStudentDetails(StdReg);
        const stdMail = student[0].Email;
        const url = `http://localhost:8080/mail/student/update/appointment`;
        const subject = "Change of appointment time";
        const content = `
        <p>Dear student,</p>
        <p>Your appointment with ${staffDetails.First_name} ${
          staffDetails.Last_name
        } has been changed.</p>
        <h2>New Appointment Details:</h2>
        <p>Date: ${getDate(from)}</p>
        <p>Time: ${getTime(from)} - ${getTime(to)}</p>
        <br>
        <p>${staffDetails.First_name} ${staffDetails.Last_name}</p>
        <p>${staffDetails.Email}</p>
        <p>${staffDetails.Department}</p>
      `;
        const { data } = await axios.post(url, { stdMail, subject, content });
        const msg = { selectedStaffEmail };
        socket.emit("change appointment", msg);
      } catch (err) {
        console.log(err);
      }
    } else if (Apt_status === "Confirmed") {
      console.log("confirmed");
      try {
        const appointment = await getAppointment(selectedAptId);
        const student = await getStudentDetails(appointment.Student_reg);
        console.log(appointment.Student_reg);
        const stdMail = student[0].Email;
        const url = `http://localhost:8080/mail/student/update/appointment`;
        const subject = "Appointment confirmed";
        const content = `
        <p>Dear student,</p>
        <p>Your appointment with ${staffDetails.First_name} ${
          staffDetails.Last_name
        } has been confirmed.</p>
        <h2>Appointment Details:</h2>
        <p>Date: ${getDate(from)}</p>
        <p>Time: ${getTime(from)} - ${getTime(to)}</p>
        <br>
        <p>${staffDetails.First_name} ${staffDetails.Last_name}</p>
        <p>${staffDetails.Email}</p>
        <p>${staffDetails.Department}</p>
      `;
        const { data } = await axios.post(url, { stdMail, subject, content });
        socket.emit("change appointment", msg);
      } catch (err) {
        console.log(err);
      }
    } else if (Apt_status === "Unable") {
      console.log("confirmed");
      try {
        const appointment = await getAppointment(selectedAptId);
        const student = await getStudentDetails(appointment.Student_reg);
        console.log(appointment.Student_reg);
        const stdMail = student[0].Email;
        const url = `http://localhost:8080/mail/student/update/appointment`;
        const subject = "Appointment cancelled";
        const content = `
        <p>Dear student,</p>
        <p>Your appointment with ${staffDetails.First_name} ${
          staffDetails.Last_name
        } has been cancelled.</p>
        <h2>Appointment Details:</h2>
        <p>Date: ${getDate(from)}</p>
        <p>Time: ${getTime(from)} - ${getTime(to)}</p>
        <br>
        <p>${staffDetails.First_name} ${staffDetails.Last_name}</p>
        <p>${staffDetails.Email}</p>
        <p>${staffDetails.Department}</p>
      `;
        const { data } = await axios.post(url, { stdMail, subject, content });
        socket.emit("change appointment", msg);
      } catch (err) {
        console.log(err);
      }
    } else if (Apt_status === "Done") {
      try {
        const appointment = await getAppointment(selectedAptId);
        const student = await getStudentDetails(appointment.Student_reg);
        console.log(appointment.Student_reg);
        const stdMail = student[0].Email;
        const url = `http://localhost:8080/mail/student/update/appointment`;
        const subject = "Appointment Done";
        const content = `
        <p>Dear student,</p>
        <p>Your appointment with ${staffDetails.First_name} ${
          staffDetails.Last_name
        } has been successfully done.</p>
        <h2>Appointment Details:</h2>
        <p>Date: ${getDate(from)}</p>
        <p>Time: ${getTime(from)} - ${getTime(to)}</p>
        <br>
        <p>${staffDetails.First_name} ${staffDetails.Last_name}</p>
        <p>${staffDetails.Email}</p>
        <p>${staffDetails.Department}</p>
      `;
        const { data } = await axios.post(url, { stdMail, subject, content });
        socket.emit("change appointment", msg);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onPopupClose = async (e) => {
    console.log(e.type);
    console.log(e.data);
    if (e.data != null) {
      if (e.type === "DeleteAlert") {
        deleteAppointment(selectedAptId, e.data.EventType, e.data.StdReg);
      } else if (
        // e.data.Subject !== "No title is provided" &&
        selectedAptId === undefined &&
        e.type === "Editor"
      ) {
        const lastId = await getLastAppointment();
        console.log(lastId);
        addAppointment(
          lastId + 1,
          selectedStaffEmail,
          JSON.parse(sessionStorage.getItem("regNumber"))
            ? JSON.parse(sessionStorage.getItem("regNumber"))
            : null,
          e.data.Subject === "No title is provided"
            ? "Blocked"
            : e.data.Subject,
          e.data.Description,
          e.data.StartTime,
          e.data.EndTime,
          e.data.EventType
        );
        setBlocked(true);
      } else if (
        e.data !== null &&
        selectedAptId !== undefined &&
        e.type === "Editor"
      ) {
        const appointment = await getAppointment(selectedAptId);
        updateAppointment(
          e.data.Subject,
          e.data.Description,
          e.data.StartTime,
          e.data.EndTime,
          e.data.EventType,
          e.data.StdReg
        );
        if (appointment.Student_reg === null) {
          window.location.reload();
        }
      }
    } else {
      console.log(true);
    }
  };

  const onPopupOpen = (e) => {
    setSelectedAptId(e.data.Id);
    console.log(e);
  };

  const deleteAppointment = async (Id, EventType, StdReg) => {
    console.log(selectedStaffEmail);
    try {
      const url = `http://localhost:8080/db/appointment/${Id}`;
      const response = await axios.delete(url);

      const msg = { selectedStaffEmail, EventType };
      if (EventType === "New") {
        sendAppointmentDeleteMail(StdReg, EventType);
      } else {
        socket.emit("delete appointment", msg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendAppointmentDeleteMail = async (StdReg, EventType) => {
    console.log("hello");
    const student = await getStudentDetails(StdReg);
    const stdMail = student[0].Email;
    try {
      const url = `http://localhost:8080/mail/student/update/appointment`;
      const subject = "Your appointment has been deleted";
      const content = `
        <p>Dear student,</p>
        <p>Your appointment with ${staffDetails.First_name} ${staffDetails.Last_name} has been cancelled.</p>
      `;
      const { data } = await axios.post(url, { stdMail, subject, content });
      const msg = { selectedStaffEmail, EventType };
      socket.emit("delete appointment", msg);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main>
      <div>
        <ColorCode />
      </div>
      <div className="calendar">
        <ScheduleComponent
          currentView="Day"
          eventSettings={{
            dataSource: appointments.dataSource,
            fields: appointments.fields,
            template: eventTemplate,
            ignoreWhitespace: true,
          }}
          dragStart={onDragStart}
          dragStop={onDragStop}
          resizeStart={onResizeStart}
          resizeStop={onResizeStop}
          editorTemplate={ediitorWindowTemplate}
          popupClose={onPopupClose}
          popupOpen={onPopupOpen}
          cssClass="schedule-cell-dimension"
          rowAutoHeight={true}
          quickInfoOnSelectionEnd={true}
        >
          <ViewsDirective>
            <ViewDirective
              option="Day"
              startHour="08:00"
              endHour="16:00"
              interval={3}
              displayName="3 Days"
            />
            <ViewDirective option="Week" startHour="08:00" endHour="16:00" />
            <ViewDirective
              option="Month"
              // isSelected={true}
              showWeekNumber={false}
              showWeekend={false}
            />
            <ViewDirective option="Agenda" />
          </ViewsDirective>
          <Inject
            services={[
              Day,
              Week,
              Month,
              Agenda,
              TimelineMonth,
              TimelineViews,
              DragAndDrop,
              Resize,
            ]}
          />
        </ScheduleComponent>
      </div>
    </main>
  );
};

export default StaffCalendar;
