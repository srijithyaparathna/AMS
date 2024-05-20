const sqlite = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = new sqlite.Database("./ams.db", sqlite.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the database.");
  }
});

const getStudents = (req, res) => {
  const sql = `select * from STUDENT`;
  try {
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getStaffList = (req, res) => {
  const sql = `select * from LECTURER`;
  try {
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getStaffPassword = (req, res) => {
  const { Email } = req.params;
  const sql = `select Original_password from LECTURER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const addStudent = async (req, res) => {
  const {
    Reg_number,
    First_name,
    Last_name,
    Department,
    Email,
    Batch,
    Password,
  } = req.body;
  const sql = `insert into STUDENT(Reg_number, First_name, Last_name, Department, Email, Batch, Password) values(?,?,?,?,?,?,?)`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(
      sql,
      [
        Reg_number,
        First_name,
        Last_name,
        Department,
        Email,
        Batch,
        hashedPassword,
      ],
      (err) => {
        if (err) {
          res.status(500).json(err.message);
          res.send(400).json(err.message);
        } else {
          return res.json({
            message: "Student added successfully",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const handleStdLogin = async (req, res) => {
  const { Email, Password } = req.body;
  const sql = `select * from STUDENT where Email = ?`;

  try {
    db.all(sql, [Email], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStudent = rows[0];
      const isMatch = await bcrypt.compare(Password, foundStudent.Password);

      if (!isMatch) {
        return res.json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const accessToken = jwt.sign(
        { Reg_number: foundStudent.Reg_number },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
      );
      const refreshToken = jwt.sign(
        { Reg_number: foundStudent.Reg_number },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const sql = `update STUDENT set RefreshToken = ? where Email = ?`;
      db.run(sql, [refreshToken, Email], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });

      res.json({ Status: "Success", RefreshToken: refreshToken });
      
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const handleStaffLogin = async (req, res) => {
  const { Email, Original_password } = req.body;
  const sql = `select * from LECTURER where Email = ?`;

  try {
    db.all(sql, [Email], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }
      const foundStaff = rows[0];
      const isMatch = await bcrypt.compare(
        Original_password,
        foundStaff.Password
      );

      if (!isMatch) {
        return res.json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const accessToken = jwt.sign(
        { Email: foundStaff.Email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
      );
      const refreshToken = jwt.sign(
        { Email: foundStaff.Email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const sql = `update LECTURER set RefreshToken = ? where Email = ?`;
      db.run(sql, [refreshToken, Email], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
      res.json({ Status: "Success", RefreshToken: refreshToken});
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getStudentRegNumber = (req, res) => {
  const { Email } = req.params;
  const sql = `select Reg_number from STUDENT where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const handleStdRefreshToken = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from STUDENT where RefreshToken = ?`;

  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStudent = rows[0];

      //evaluate the refresh token
      jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || foundStudent.Reg_number !== decoded.Reg_number) {
            return res.status(403).json({ message: "Invalid refresh token" });
          }
          const accessToken = jwt.sign(
            { Reg_number: foundStudent.Reg_number },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60s" }
          );
          return res.json({ accessToken: accessToken });
        }
      );
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const handleStaffRefreshToken = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from LECTURER where RefreshToken = ?`;

  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStaff = rows[0];

      //evaluate the refresh token
      jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || foundStaff.Email !== decoded.Email) {
            return res.status(403).json({ message: "Invalid refresh token" });
          }
          const accessToken = jwt.sign(
            { Email: foundStaff.Email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60s" }
          );
          return res.json({ accessToken: accessToken });
        }
      );
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
  

const handleStdLogout = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from STUDENT where RefreshToken = ?`;
  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStudent = rows[0];

      // delete the cookie if the student is already logged out
      if (!foundStudent) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.status(200).json({ message: "Logged out successfully" });
      }

      //delete the refreshtoken from the database
      const sql = `update STUDENT set RefreshToken = ? where Email = ?`;
      db.run(sql, [null, foundStudent.Email], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
      res.clearCookie("jwt", { httpOnly: true });
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const handleStaffLogout = async (req, res) => {
  const RefreshToken = req.headers.authorization;
  //---------------------------------------------------------
  const sql = `select * from LECTURER where RefreshToken = ?`;
  try {
    db.all(sql, [RefreshToken], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "No user found" });
      }

      const foundStaff = rows[0];

      // delete the cookie if the staff is already logged out
      if (!foundStaff) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.status(200).json({ message: "Logged out successfully" });
      }

      //delete the refreshtoken from the database
      const sql = `update LECTURER set RefreshToken = ? where Email = ?`;
      db.run(sql, [null, foundStaff.Email], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
      res.clearCookie("jwt", { httpOnly: true });
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const addStaff = async (req, res) => {
  const { First_name, Last_name, Department, Email, Picture_URL, Password } =
    req.body;
  const sql = `insert into LECTURER(First_name, Last_name, Department, Email, Picture_URL, Password, Original_password) values(?,?,?,?,?,?,?)`;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(
      sql,
      [
        First_name,
        Last_name,
        Department,
        Email,
        Picture_URL,
        hashedPassword,
        Password,
      ],
      (err) => {
        if (err) {
          res.status(500).json(err.message);
          res.send(400).json(err.message);
        } else {
          return res.json({
            message: "Student added successfully",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getStaffByEmail = (req, res) => {
  const { Email } = req.params;
  const sql = `select * from LECTURER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteStudent = (req, res) => {
  const { Reg_number } = req.body;
  const sql = `DELETE from STUDENT where Reg_number = ?`;
  try {
    db.run(sql, [Reg_number], (err) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json({
          message: "Student deleted successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getStudentDetails = (req, res) => {
  const { department, year, regNumber } = req.params;
  const Reg_number = `${department}/${year}/${regNumber}`;
  const sql = `select * from STUDENT where Reg_number = ?`;
  try {
    db.all(sql, [Reg_number], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const addTempUser = (req, res) => {
  const { Email, Verification_Code, First_Name, Last_Name, Picture_URL } =
    req.body;
  const sql = `insert into TEMP_USER(Email, Verification_Code, First_Name, Last_Name, Picture_URL) values(?,?,?,?,?)`;
  try {
    db.run(
      sql,
      [Email, Verification_Code, First_Name, Last_Name, Picture_URL],
      (err) => {
        if (err) {
          res.status(500).json(err.message);
          res.send(400).json(err.message);
        } else {
          return res.json({
            message: "User added successfully",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAllTempUsers = (req, res) => {
  const sql = `select * from TEMP_USER`;
  try {
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.sendStatus(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getTempUserByID = (req, res) => {
  const { Email } = req.params;
  const sql = `select * from TEMP_USER where Email = ?`;
  try {
    db.all(sql, [Email], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const updateVerificationCode = (req, res) => {
  const { Email, Verification_Code } = req.body;
  const sql = `update TEMP_USER set Verification_Code = ? where Email = ?`;
  try {
    db.run(sql, [Verification_Code, Email], (err) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json({
          message: "Verification code updated successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteTempUser = (req, res) => {
  const { Email } = req.params;
  const sql = `delete from TEMP_USER where Email = ?`;
  try {
    db.run(sql, [Email], (err) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json({
          message: "User deleted successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAppointmentCount = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `select count(*) from APPOINTMENT where Lecturer_mail = ?`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getLastAppointment = (req, res) => {
  const sql = `select * from APPOINTMENT order by Id desc limit 1`;
  try {
    db.all(sql, (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const addAppointment = (req, res) => {
  const {
    Id,
    Lecturer_mail,
    Student_reg,
    Subject,
    Description,
    StartTime,
    EndTime,
    Apt_status,
  } = req.body;
  const sql = `insert into APPOINTMENT(Id, Lecturer_mail, Student_reg, Subject, Description, StartTime, EndTime, Apt_status) values(?,?,?,?,?,?,?,?)`;
  try {
    db.run(
      sql,
      [
        Id,
        Lecturer_mail,
        Student_reg,
        Subject,
        Description,
        StartTime,
        EndTime,
        Apt_status,
      ],
      (err) => {
        if (err) {
          res.status(500).json(err.message);
          res.send(400).json(err.message);
        } else {
          return res.json({
            message: "Appointment added successfully",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAllAppointments = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `select * from APPOINTMENT where Lecturer_mail = ?`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAllConfirmedAppointments = (req, res) => {
  const { Lecturer_mail } = req.params;
  const sql = `SELECT * FROM APPOINTMENT WHERE Lecturer_mail = ? AND Apt_status = "Confirmed" ORDER BY StartTime`;
  try {
    db.all(sql, [Lecturer_mail], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const updateAppointment = (req, res) => {
  const { Id, Subject, Description, StartTime, EndTime, Apt_status } = req.body;
  const sql = `update APPOINTMENT set Subject = ?, Description = ?, StartTime = ?, EndTime = ?, Apt_status = ? where Id = ?`;
  try {
    db.run(
      sql,
      [Subject, Description, StartTime, EndTime, Apt_status, Id],
      (err) => {
        if (err) {
          res.status(500).json(err.message);
          res.send(400).json(err.message);
        } else {
          return res.json({
            message: "Appointment updated successfully",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteAppointment = (req, res) => {
  const { Id } = req.params;
  const sql = `delete from APPOINTMENT where Id = ?`;
  try {
    db.run(sql, [Id], (err) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json({
          message: "Appointment deleted successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getAppointment = (req, res) => {
  const { Id } = req.params;
  const sql = `select * from APPOINTMENT where Id = ?`;
  try {
    db.all(sql, [Id], (err, rows) => {
      if (err) {
        res.status(500).json(err.message);
        res.send(400).json(err.message);
      } else {
        return res.json(rows);
      }
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  getStudents,
  addStudent,
  addTempUser,
  getAllTempUsers,
  getTempUserByID,
  deleteTempUser,
  updateVerificationCode,
  deleteStudent,
  getStaffList,
  addStaff,
  handleStdLogin,
  handleStdRefreshToken,
  handleStdLogout,
  addAppointment,
  getStudentRegNumber,
  getAppointmentCount,
  getAllAppointments,
  getLastAppointment,
  updateAppointment,
  deleteAppointment,
  handleStaffLogin,
  getStaffByEmail,
  handleStaffLogout,
  getStaffPassword,
  getStudentDetails,
  getAppointment,
  getAllConfirmedAppointments,
  handleStaffRefreshToken,
};
