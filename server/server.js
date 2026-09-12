const axios = require('axios');
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

const PORT = 5001;

const JWT_SECRET =
  process.env.JWT_SECRET || "student-life-os-dev-secret";

/* =========================================================
   DATABASE
========================================================= */

const pool = new Pool({
  user: "shasmith",
  host: "localhost",
  database: "student_life_os",
  port: 5432,
});

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}


/* =========================================================
   CALENDAR
========================================================= */

app.get("/api/calendar", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, event_type, start_time, end_time, description, location, created_at
       FROM calendar_events
       WHERE user_id = $1
       ORDER BY start_time ASC, id ASC`,
      [req.user.id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    res.status(500).json({ message: "Failed to fetch calendar events." });
  }
});

app.post("/api/calendar", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      event_type,
      start_time,
      end_time,
      description,
      location,
    } = req.body;

    if (!title || !start_time) {
      return res.status(400).json({
        message: "Title and start time are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO calendar_events
       (user_id, title, event_type, start_time, end_time, description, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, event_type, start_time, end_time, description, location, created_at`,
      [
        req.user.id,
        title.trim(),
        event_type || "Personal",
        start_time,
        end_time || null,
        description || null,
        location || null,
      ]
    );

    res.status(201).json({ event: result.rows[0] });
  } catch (error) {
    console.error("Calendar create error:", error);
    res.status(500).json({ message: "Failed to create calendar event." });
  }
});

app.delete("/api/calendar/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM calendar_events
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Calendar event not found.",
      });
    }

    res.json({ message: "Calendar event deleted successfully." });
  } catch (error) {
    console.error("Calendar delete error:", error);
    res.status(500).json({ message: "Failed to delete calendar event." });
  }
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api", (req, res) => {
  res.json({
    message: "Student Life OS API is running.",
  });
});

/* =========================================================
   AUTH — SIGN UP
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [cleanEmail]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING
        id,
        name,
        email,
        created_at
      `,
      [
        cleanName,
        cleanEmail,
        passwordHash,
      ]
    );

    res.status(201).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Unable to create account.",
    });
  }
});

/* =========================================================
   AUTH — LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at
      FROM users
      WHERE email = $1
      `,
      [cleanEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    delete user.password_hash;

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

/* =========================================================
   AUTH — CURRENT USER
========================================================= */

app.get(
  "/api/auth/me",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          created_at
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json({
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Get user error:", error);

      res.status(500).json({
        message: "Unable to load user.",
      });
    }
  }
);

/* =========================================================
   COURSES — GET
========================================================= */

app.get(
  "/api/courses",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          course_code,
          course_name,
          professor,
          semester,
          created_at
        FROM courses
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        courses: result.rows,
      });
    } catch (error) {
      console.error("Get courses error:", error);

      res.status(500).json({
        message: "Unable to load courses.",
      });
    }
  }
);

/* =========================================================
   COURSES — CREATE
========================================================= */

app.post(
  "/api/courses",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        course_code,
        course_name,
        professor,
        semester,
      } = req.body;

      const cleanCourseCode =
        course_code?.trim();

      const cleanCourseName =
        course_name?.trim();

      const cleanProfessor =
        professor?.trim() || null;

      const cleanSemester =
        semester?.trim() || null;

      if (!cleanCourseCode) {
        return res.status(400).json({
          message: "Course code is required.",
        });
      }

      if (!cleanCourseName) {
        return res.status(400).json({
          message: "Course name is required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO courses
        (
          user_id,
          course_code,
          course_name,
          professor,
          semester
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING
          id,
          course_code,
          course_name,
          professor,
          semester,
          created_at
        `,
        [
          req.user.id,
          cleanCourseCode,
          cleanCourseName,
          cleanProfessor,
          cleanSemester,
        ]
      );

      res.status(201).json({
        course: result.rows[0],
      });
    } catch (error) {
      console.error("Create course error:", error);

      res.status(500).json({
        message: "Unable to create course.",
      });
    }
  }
);

/* =========================================================
   ASSIGNMENTS — GET
========================================================= */

app.get(
  "/api/assignments",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          a.id,
          a.user_id,
          a.course_id,
          a.title,
          a.description,
          a.due_date,
          a.completed,
          a.created_at,
          c.course_code,
          c.course_name
        FROM assignments a
        LEFT JOIN courses c
          ON a.course_id = c.id
          AND c.user_id = a.user_id
        WHERE a.user_id = $1
        ORDER BY
          a.completed ASC,
          a.due_date ASC NULLS LAST,
          a.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        assignments: result.rows,
      });
    } catch (error) {
      console.error(
        "Get assignments error:",
        error
      );

      res.status(500).json({
        message: "Unable to load assignments.",
      });
    }
  }
);

/* =========================================================
   ASSIGNMENTS — CREATE
========================================================= */

app.post(
  "/api/assignments",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        course_id,
        description,
        due_date,
      } = req.body;

      const cleanTitle = title?.trim();

      const courseId = Number(course_id);

      const cleanDescription =
        description?.trim() || null;

      let parsedDueDate = null;

      if (due_date) {
        parsedDueDate = new Date(due_date);

        if (
          Number.isNaN(
            parsedDueDate.getTime()
          )
        ) {
          return res.status(400).json({
            message: "Invalid due date.",
          });
        }
      }

      if (!cleanTitle) {
        return res.status(400).json({
          message: "Assignment title is required.",
        });
      }

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          message: "Please select a valid course.",
        });
      }

      const courseCheck =
        await pool.query(
          `
          SELECT id
          FROM courses
          WHERE id = $1
            AND user_id = $2
          `,
          [
            courseId,
            req.user.id,
          ]
        );

      if (courseCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Course not found.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO assignments
        (
          user_id,
          course_id,
          title,
          description,
          due_date
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING
          id,
          user_id,
          course_id,
          title,
          description,
          due_date,
          completed,
          created_at
        `,
        [
          req.user.id,
          courseId,
          cleanTitle,
          cleanDescription,
          parsedDueDate
            ? parsedDueDate.toISOString()
            : null,
        ]
      );

      res.status(201).json({
        assignment: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create assignment error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create assignment.",
      });
    }
  }
);

/* =========================================================
   ASSIGNMENTS — UPDATE COMPLETION
========================================================= */

app.patch(
  "/api/assignments/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const assignmentId =
        Number(req.params.id);

      const { completed } = req.body;

      if (
        !Number.isInteger(assignmentId) ||
        assignmentId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid assignment ID.",
        });
      }

      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message:
            "Completed must be true or false.",
        });
      }

      const result = await pool.query(
        `
        UPDATE assignments
        SET completed = $1
        WHERE id = $2
          AND user_id = $3
        RETURNING
          id,
          user_id,
          course_id,
          title,
          description,
          due_date,
          completed,
          created_at
        `,
        [
          completed,
          assignmentId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message:
            "Assignment not found.",
        });
      }

      res.json({
        assignment: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update assignment error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update assignment.",
      });
    }
  }
);

/* =========================================================
   ASSIGNMENTS — DELETE
========================================================= */

app.delete(
  "/api/assignments/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const assignmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(assignmentId) ||
        assignmentId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid assignment ID.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM assignments
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          assignmentId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message:
            "Assignment not found.",
        });
      }

      res.json({
        message:
          "Assignment deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete assignment error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete assignment.",
      });
    }
  }
);

/* =========================================================
   EXAMS — GET
========================================================= */

app.get(
  "/api/exams",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          e.id,
          e.user_id,
          e.course_id,
          e.title,
          e.exam_date,
          e.notes,
          e.created_at,
          c.course_code,
          c.course_name
        FROM exams e
        LEFT JOIN courses c
          ON e.course_id = c.id
          AND c.user_id = e.user_id
        WHERE e.user_id = $1
        ORDER BY e.exam_date ASC
        `,
        [req.user.id]
      );

      res.json({
        exams: result.rows,
      });
    } catch (error) {
      console.error("Get exams error:", error);

      res.status(500).json({
        message: "Unable to load exams.",
      });
    }
  }
);

/* =========================================================
   EXAMS — CREATE
========================================================= */

app.post(
  "/api/exams",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        course_id,
        exam_date,
        notes,
      } = req.body;

      const cleanTitle = title?.trim();

      const courseId = Number(course_id);

      const cleanNotes =
        notes?.trim() || null;

      if (!cleanTitle) {
        return res.status(400).json({
          message: "Exam title is required.",
        });
      }

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          message: "Please select a valid course.",
        });
      }

      if (!exam_date) {
        return res.status(400).json({
          message:
            "Exam date and time are required.",
        });
      }

      const parsedExamDate =
        new Date(exam_date);

      if (
        Number.isNaN(
          parsedExamDate.getTime()
        )
      ) {
        return res.status(400).json({
          message: "Invalid exam date.",
        });
      }

      const courseCheck =
        await pool.query(
          `
          SELECT id
          FROM courses
          WHERE id = $1
            AND user_id = $2
          `,
          [
            courseId,
            req.user.id,
          ]
        );

      if (courseCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Course not found.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO exams
        (
          user_id,
          course_id,
          title,
          exam_date,
          notes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING
          id,
          user_id,
          course_id,
          title,
          exam_date,
          notes,
          created_at
        `,
        [
          req.user.id,
          courseId,
          cleanTitle,
          parsedExamDate.toISOString(),
          cleanNotes,
        ]
      );

      res.status(201).json({
        exam: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create exam error:",
        error
      );

      res.status(500).json({
        message: "Unable to create exam.",
      });
    }
  }
);

/* =========================================================
   EXAMS — DELETE
========================================================= */

app.delete(
  "/api/exams/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const examId =
        Number(req.params.id);

      if (
        !Number.isInteger(examId) ||
        examId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid exam ID.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM exams
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          examId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Exam not found.",
        });
      }

      res.json({
        message:
          "Exam deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete exam error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete exam.",
      });
    }
  }
);/* =========================================================
   STUDY SESSIONS — GET
========================================================= */

app.get(
  "/api/study-sessions",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          ss.id,
          ss.user_id,
          ss.course_id,
          ss.topic,
          ss.duration_minutes,
          ss.session_date,
          ss.notes,
          ss.created_at,
          c.course_code,
          c.course_name
        FROM study_sessions ss
        LEFT JOIN courses c
          ON ss.course_id = c.id
          AND c.user_id = ss.user_id
        WHERE ss.user_id = $1
        ORDER BY ss.session_date DESC,
                 ss.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        study_sessions: result.rows,
      });
    } catch (error) {
      console.error(
        "Get study sessions error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load study sessions.",
      });
    }
  }
);

/* =========================================================
   STUDY SESSIONS — CREATE
========================================================= */

app.post(
  "/api/study-sessions",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        course_id,
        topic,
        duration_minutes,
        session_date,
        notes,
      } = req.body;

      const courseId = Number(course_id);
      const duration = Number(duration_minutes);

      const cleanTopic =
        topic?.trim();

      const cleanNotes =
        notes?.trim() || null;

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          message:
            "Please select a valid course.",
        });
      }

      if (!cleanTopic) {
        return res.status(400).json({
          message:
            "Study topic is required.",
        });
      }

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        return res.status(400).json({
          message:
            "Duration must be a positive whole number.",
        });
      }

      const courseCheck =
        await pool.query(
          `
          SELECT id
          FROM courses
          WHERE id = $1
            AND user_id = $2
          `,
          [
            courseId,
            req.user.id,
          ]
        );

      if (courseCheck.rowCount === 0) {
        return res.status(404).json({
          message:
            "Course not found.",
        });
      }

      let parsedSessionDate = null;

      if (session_date) {
        parsedSessionDate =
          new Date(session_date);

        if (
          Number.isNaN(
            parsedSessionDate.getTime()
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid study session date.",
          });
        }
      }

      const result = await pool.query(
        `
        INSERT INTO study_sessions
        (
          user_id,
          course_id,
          topic,
          duration_minutes,
          session_date,
          notes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          COALESCE($5, CURRENT_TIMESTAMP),
          $6
        )
        RETURNING
          id,
          user_id,
          course_id,
          topic,
          duration_minutes,
          session_date,
          notes,
          created_at
        `,
        [
          req.user.id,
          courseId,
          cleanTopic,
          duration,
          parsedSessionDate
            ? parsedSessionDate.toISOString()
            : null,
          cleanNotes,
        ]
      );

      const studySession =
        result.rows[0];

      res.status(201).json({
        study_session:
          studySession,
      });
    } catch (error) {
      console.error(
        "Create study session error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create study session.",
      });
    }
  }
);

/* =========================================================
   STUDY SESSIONS — DELETE
========================================================= */

app.delete(
  "/api/study-sessions/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const studySessionId =
        Number(req.params.id);

      if (
        !Number.isInteger(studySessionId) ||
        studySessionId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid study session ID.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM study_sessions
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          studySessionId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message:
            "Study session not found.",
        });
      }

      res.json({
        message:
          "Study session deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete study session error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete study session.",
      });
    }
  }
);

/* =========================================================
   FITNESS
========================================================= */

// GET all workouts
app.get(
  "/api/workouts",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          w.id,
          w.user_id,
          w.workout_date,
          w.name,
          w.workout_type,
          w.notes,
          w.created_at,
          COUNT(DISTINCT we.id)::int AS exercise_count
        FROM workouts w
        LEFT JOIN workout_exercises we
          ON we.workout_id = w.id
        WHERE w.user_id = $1
        GROUP BY w.id
        ORDER BY w.workout_date DESC
        `,
        [req.user.id]
      );

      res.json({
        workouts: result.rows,
      });
    } catch (error) {
      console.error(
        "Get workouts error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load workouts.",
      });
    }
  }
);

// POST create workout
app.post(
  "/api/workouts",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        workout_date,
        name,
        workout_type,
        notes,
      } = req.body;

      if (
        !workout_date ||
        !name?.trim()
      ) {
        return res.status(400).json({
          message:
            "Workout date and workout name are required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO workouts
        (
          user_id,
          workout_date,
          name,
          workout_type,
          notes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING
          id,
          user_id,
          workout_date,
          name,
          workout_type,
          notes,
          created_at
        `,
        [
          req.user.id,
          workout_date,
          name.trim(),
          workout_type?.trim() || null,
          notes?.trim() || null,
        ]
      );

      res.status(201).json({
        workout: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create workout error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create workout.",
      });
    }
  }
);

// DELETE workout
app.delete(
  "/api/workouts/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const workoutId =
        Number(req.params.id);

      if (
        !Number.isInteger(workoutId) ||
        workoutId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid workout ID.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM workouts
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          workoutId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message:
            "Workout not found.",
        });
      }

      res.json({
        message:
          "Workout deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete workout error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete workout.",
      });
    }
  }
);

// GET exercises
app.get(
  "/api/exercises",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          user_id,
          name,
          muscle_group,
          created_at
        FROM exercises
        WHERE user_id = $1
        ORDER BY name ASC
        `,
        [req.user.id]
      );

      res.json({
        exercises: result.rows,
      });
    } catch (error) {
      console.error(
        "Get exercises error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load exercises.",
      });
    }
  }
);

// POST create exercise
app.post(
  "/api/exercises",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        muscle_group,
      } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          message:
            "Exercise name is required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO exercises
        (
          user_id,
          name,
          muscle_group
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING
          id,
          user_id,
          name,
          muscle_group,
          created_at
        `,
        [
          req.user.id,
          name.trim(),
          muscle_group?.trim() || null,
        ]
      );

      res.status(201).json({
        exercise: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create exercise error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create exercise.",
      });
    }
  }
);

// POST add exercise to workout
app.post(
  "/api/workout-exercises",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        workout_id,
        exercise_id,
        exercise_order,
        notes,
      } = req.body;

      const workoutId =
        Number(workout_id);

      const exerciseId =
        Number(exercise_id);

      if (
        !Number.isInteger(workoutId) ||
        workoutId <= 0 ||
        !Number.isInteger(exerciseId) ||
        exerciseId <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid workout and exercise are required.",
        });
      }

      const workoutCheck =
        await pool.query(
          `
          SELECT id
          FROM workouts
          WHERE id = $1
            AND user_id = $2
          `,
          [
            workoutId,
            req.user.id,
          ]
        );

      if (workoutCheck.rowCount === 0) {
        return res.status(404).json({
          message:
            "Workout not found.",
        });
      }

      const exerciseCheck =
        await pool.query(
          `
          SELECT id
          FROM exercises
          WHERE id = $1
            AND user_id = $2
          `,
          [
            exerciseId,
            req.user.id,
          ]
        );

      if (exerciseCheck.rowCount === 0) {
        return res.status(404).json({
          message:
            "Exercise not found.",
        });
      }

      const order =
        Number.isInteger(
          Number(exercise_order)
        ) &&
        Number(exercise_order) > 0
          ? Number(exercise_order)
          : 1;

      const result = await pool.query(
        `
        INSERT INTO workout_exercises
        (
          workout_id,
          exercise_id,
          exercise_order,
          notes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING
          id,
          workout_id,
          exercise_id,
          exercise_order,
          notes,
          created_at
        `,
        [
          workoutId,
          exerciseId,
          order,
          notes?.trim() || null,
        ]
      );

      res.status(201).json({
        workout_exercise:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Add workout exercise error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to add exercise to workout.",
      });
    }
  }
);

// POST add set
app.post(
  "/api/workout-sets",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        workout_exercise_id,
        set_number,
        reps,
        weight,
      } = req.body;

      const workoutExerciseId =
        Number(workout_exercise_id);

      const setNumber =
        Number(set_number);

      const repsNumber =
        Number(reps);

      if (
        !Number.isInteger(workoutExerciseId) ||
        workoutExerciseId <= 0 ||
        !Number.isInteger(setNumber) ||
        setNumber <= 0 ||
        !Number.isInteger(repsNumber) ||
        repsNumber <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid exercise, set number, and reps are required.",
        });
      }

      const ownershipCheck =
        await pool.query(
          `
          SELECT we.id
          FROM workout_exercises we
          JOIN workouts w
            ON w.id = we.workout_id
          WHERE we.id = $1
            AND w.user_id = $2
          `,
          [
            workoutExerciseId,
            req.user.id,
          ]
        );

      if (ownershipCheck.rowCount === 0) {
        return res.status(404).json({
          message:
            "Workout exercise not found.",
        });
      }

      let weightNumber = null;

      if (
        weight !== null &&
        weight !== undefined &&
        weight !== ""
      ) {
        weightNumber =
          Number(weight);

        if (
          !Number.isFinite(weightNumber) ||
          weightNumber < 0
        ) {
          return res.status(400).json({
            message:
              "Weight must be a valid non-negative number.",
          });
        }
      }

      const result = await pool.query(
        `
        INSERT INTO workout_sets
        (
          workout_exercise_id,
          set_number,
          reps,
          weight
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING
          id,
          workout_exercise_id,
          set_number,
          reps,
          weight,
          created_at
        `,
        [
          workoutExerciseId,
          setNumber,
          repsNumber,
          weightNumber,
        ]
      );

      res.status(201).json({
        workout_set:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create workout set error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create workout set.",
      });
    }
  }
);/* =========================================================
   STUDY SESSIONS — GET
========================================================= */

app.get(
  "/api/study-sessions",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          ss.id,
          ss.user_id,
          ss.course_id,
          ss.topic,
          ss.session_date,
          ss.duration_minutes,
          ss.notes,
          ss.created_at,
          c.course_code,
          c.course_name
        FROM study_sessions ss
        LEFT JOIN courses c
          ON ss.course_id = c.id
          AND c.user_id = ss.user_id
        WHERE ss.user_id = $1
        ORDER BY
          ss.session_date DESC,
          ss.created_at DESC
        `,
        [req.user.id]
      );

      res.json({
        study_sessions: result.rows,
      });
    } catch (error) {
      console.error(
        "Get study sessions error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load study sessions.",
      });
    }
  }
);


/* =========================================================
   STUDY SESSIONS — CREATE
========================================================= */

app.post(
  "/api/study-sessions",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        course_id,
        topic,
        session_date,
        duration_minutes,
        notes,
      } = req.body;

      const courseId =
        Number(course_id);

      const duration =
        Number(duration_minutes);

      const cleanTopic =
        topic?.trim();

      const cleanNotes =
        notes?.trim() || null;

      /* -----------------------------
         VALIDATION
      ----------------------------- */

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          message:
            "Please select a valid course.",
        });
      }

      if (!cleanTopic) {
        return res.status(400).json({
          message:
            "Please enter what you studied.",
        });
      }

      if (!session_date) {
        return res.status(400).json({
          message:
            "Please select a date and time.",
        });
      }

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        return res.status(400).json({
          message:
            "Duration must be a positive whole number.",
        });
      }

      const parsedSessionDate =
        new Date(session_date);

      if (
        Number.isNaN(
          parsedSessionDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Please provide a valid session date.",
        });
      }

      /* -----------------------------
         VERIFY COURSE OWNERSHIP
      ----------------------------- */

      const courseCheck =
        await pool.query(
          `
          SELECT
            id,
            course_code,
            course_name
          FROM courses
          WHERE id = $1
            AND user_id = $2
          `,
          [
            courseId,
            req.user.id,
          ]
        );

      if (courseCheck.rowCount === 0) {
        return res.status(404).json({
          message:
            "The selected course was not found.",
        });
      }

      /* -----------------------------
         CREATE STUDY SESSION
      ----------------------------- */

      const result = await pool.query(
        `
        INSERT INTO study_sessions
        (
          user_id,
          course_id,
          topic,
          session_date,
          duration_minutes,
          notes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING
          id,
          user_id,
          course_id,
          topic,
          session_date,
          duration_minutes,
          notes,
          created_at
        `,
        [
          req.user.id,
          courseId,
          cleanTopic,
          parsedSessionDate.toISOString(),
          duration,
          cleanNotes,
        ]
      );

      const studySession =
        result.rows[0];

      /* -----------------------------
         ADD COURSE INFORMATION
      ----------------------------- */

      studySession.course_code =
        courseCheck.rows[0].course_code;

      studySession.course_name =
        courseCheck.rows[0].course_name;

      /* -----------------------------
         RESPONSE
      ----------------------------- */

      res.status(201).json({
        study_session: studySession,
      });
    } catch (error) {
      console.error(
        "Create study session error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to create study session.",
      });
    }
  }
);


/* =========================================================
   STUDY SESSIONS — DELETE
========================================================= */

app.delete(
  "/api/study-sessions/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const studySessionId =
        Number(req.params.id);

      if (
        !Number.isInteger(studySessionId) ||
        studySessionId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid study session ID.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM study_sessions
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          studySessionId,
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message:
            "Study session not found.",
        });
      }

      res.json({
        message:
          "Study session deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete study session error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete study session.",
      });
    }
  }
);app.get("/api/nutrition/goals", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, daily_calories, protein_grams,
              carbs_grams, fat_grams, water_ml,
              created_at, updated_at
       FROM nutrition_goals
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ goals: result.rows[0] || null });
  } catch (error) {
    console.error("Get nutrition goals error:", error);
    res.status(500).json({ message: "Unable to load nutrition goals." });
  }
});


app.put("/api/nutrition/goals", authMiddleware, async (req, res) => {
  try {
    const {
      daily_calories,
      protein_grams,
      carbs_grams,
      fat_grams,
      water_ml,
    } = req.body;

    const values = [
      daily_calories ?? null,
      protein_grams ?? null,
      carbs_grams ?? null,
      fat_grams ?? null,
      water_ml ?? null,
    ];

    if (
      values.some(
        (value) =>
          value !== null &&
          (!Number.isFinite(Number(value)) || Number(value) < 0)
      )
    ) {
      return res.status(400).json({
        message: "Nutrition goals must contain valid non-negative numbers.",
      });
    }

    const result = await pool.query(
      `INSERT INTO nutrition_goals
       (user_id, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         daily_calories = EXCLUDED.daily_calories,
         protein_grams = EXCLUDED.protein_grams,
         carbs_grams = EXCLUDED.carbs_grams,
         fat_grams = EXCLUDED.fat_grams,
         water_ml = EXCLUDED.water_ml,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, ...values]
    );

    res.json({ goals: result.rows[0] });
  } catch (error) {
    console.error("Save nutrition goals error:", error);
    res.status(500).json({ message: "Unable to save nutrition goals." });
  }
});


app.get("/api/nutrition/foods", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, name, serving_size, calories,
              protein_grams, carbs_grams, fat_grams, created_at
       FROM foods
       WHERE user_id = $1
       ORDER BY name ASC`,
      [req.user.id]
    );

    res.json({ foods: result.rows });
  } catch (error) {
    console.error("Get foods error:", error);
    res.status(500).json({ message: "Unable to load foods." });
  }
});


app.post("/api/nutrition/foods", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      serving_size,
      calories = 0,
      protein_grams = 0,
      carbs_grams = 0,
      fat_grams = 0,
    } = req.body;

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return res.status(400).json({ message: "Food name is required." });
    }

    const numbers = [
      calories,
      protein_grams,
      carbs_grams,
      fat_grams,
    ];

    if (
      numbers.some(
        (value) =>
          !Number.isFinite(Number(value)) || Number(value) < 0
      )
    ) {
      return res.status(400).json({
        message: "Nutrition values must be valid non-negative numbers.",
      });
    }

    const result = await pool.query(
      `INSERT INTO foods
       (user_id, name, serving_size, calories,
        protein_grams, carbs_grams, fat_grams)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        cleanName,
        String(serving_size || "").trim() || null,
        Number(calories),
        Number(protein_grams),
        Number(carbs_grams),
        Number(fat_grams),
      ]
    );

    res.status(201).json({ food: result.rows[0] });
  } catch (error) {
    console.error("Create food error:", error);
    res.status(500).json({ message: "Unable to create food." });
  }
});


app.delete("/api/nutrition/foods/:id", authMiddleware, async (req, res) => {
  try {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({ message: "Invalid food ID." });
    }

    const result = await pool.query(
      `DELETE FROM foods
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [foodId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Food not found." });
    }

    res.json({ message: "Food deleted successfully." });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({ message: "Unable to delete food." });
  }
});


app.get("/api/nutrition/meals", authMiddleware, async (req, res) => {
  try {
    const mealDate =
      String(req.query.date || "").trim() ||
      new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT
         m.id,
         m.user_id,
         m.meal_type,
         m.meal_date,
         m.notes,
         m.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', mi.id,
               'food_id', mi.food_id,
               'food_name', mi.food_name,
               'servings', mi.servings,
               'calories', mi.calories,
               'protein_grams', mi.protein_grams,
               'carbs_grams', mi.carbs_grams,
               'fat_grams', mi.fat_grams
             )
             ORDER BY mi.id
           ) FILTER (WHERE mi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM meals m
       LEFT JOIN meal_items mi ON mi.meal_id = m.id
       WHERE m.user_id = $1 AND m.meal_date = $2
       GROUP BY m.id
       ORDER BY m.id DESC`,
      [req.user.id, mealDate]
    );

    res.json({ meals: result.rows });
  } catch (error) {
    console.error("Get meals error:", error);
    res.status(500).json({ message: "Unable to load meals." });
  }
});


app.post("/api/nutrition/meals", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      meal_type,
      meal_date,
      notes,
      items = [],
    } = req.body;

    const mealType = String(meal_type || "").trim();

    if (!mealType) {
      return res.status(400).json({ message: "Meal type is required." });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "Meal items must be an array.",
      });
    }

    await client.query("BEGIN");

    const mealResult = await client.query(
      `INSERT INTO meals
       (user_id, meal_name, meal_type, meal_date, notes)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [
        req.user.id,
        mealType,
        mealType,
        meal_date || null,
        String(notes || "").trim() || null,
      ]
    );

    const meal = mealResult.rows[0];
    const savedItems = [];

    for (const item of items) {
      const foodName = String(
        item.food_name || item.name || ""
      ).trim();

      if (!foodName) {
        throw new Error("Every meal item needs a food name.");
      }

      const servings = Number(item.servings ?? 1);
      const calories = Number(item.calories ?? 0);
      const protein = Number(item.protein_grams ?? 0);
      const carbs = Number(item.carbs_grams ?? 0);
      const fat = Number(item.fat_grams ?? 0);

      if (
        !Number.isFinite(servings) ||
        servings <= 0 ||
        [calories, protein, carbs, fat].some(
          (value) => !Number.isFinite(value) || value < 0
        )
      ) {
        throw new Error("Meal nutrition values are invalid.");
      }

      const itemResult = await client.query(
        `INSERT INTO meal_items
         (meal_id, food_id, food_name, servings, calories,
          protein_grams, carbs_grams, fat_grams)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          meal.id,
          item.food_id ? Number(item.food_id) : null,
          foodName,
          servings,
          calories,
          protein,
          carbs,
          fat,
        ]
      );

      savedItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      meal: {
        ...meal,
        items: savedItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create meal error:", error);
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to create meal.",
    });
  } finally {
    client.release();
  }
});


app.delete("/api/nutrition/meals/:id", authMiddleware, async (req, res) => {
  try {
    const mealId = Number(req.params.id);

    if (!Number.isInteger(mealId) || mealId <= 0) {
      return res.status(400).json({ message: "Invalid meal ID." });
    }

    const result = await pool.query(
      `DELETE FROM meals
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [mealId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Meal not found." });
    }

    res.json({ message: "Meal deleted successfully." });
  } catch (error) {
    console.error("Delete meal error:", error);
    res.status(500).json({ message: "Unable to delete meal." });
  }
});


app.get("/api/nutrition/daily", authMiddleware, async (req, res) => {
  try {
    const nutritionDate =
      String(req.query.date || "").trim() ||
      new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(mi.calories), 0) AS calories,
         COALESCE(SUM(mi.protein_grams), 0) AS protein_grams,
         COALESCE(SUM(mi.carbs_grams), 0) AS carbs_grams,
         COALESCE(SUM(mi.fat_grams), 0) AS fat_grams,
         COUNT(DISTINCT m.id) AS meal_count
       FROM meals m
       LEFT JOIN meal_items mi ON mi.meal_id = m.id
       WHERE m.user_id = $1 AND m.meal_date = $2`,
      [req.user.id, nutritionDate]
    );

    res.json({
      date: nutritionDate,
      totals: result.rows[0],
    });
  } catch (error) {
    console.error("Get daily nutrition error:", error);
    res.status(500).json({
      message: "Unable to load daily nutrition.",
    });
  }
});app.get("/api/nutrition/water", authMiddleware, async (req, res) => {
  try {
    const intakeDate =
      String(req.query.date || "").trim() ||
      new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT id, user_id, intake_date, amount_ml, created_at
       FROM water_intake
       WHERE user_id = $1 AND intake_date = $2
       ORDER BY created_at ASC`,
      [req.user.id, intakeDate]
    );

    const total = result.rows.reduce(
      (sum, row) => sum + Number(row.amount_ml || 0),
      0
    );

    res.json({
      date: intakeDate,
      entries: result.rows,
      total_ml: total,
    });
  } catch (error) {
    console.error("Get water intake error:", error);
    res.status(500).json({
      message: "Unable to load water intake.",
    });
  }
});


app.post("/api/nutrition/water", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount_ml);

    const intakeDate =
      String(req.body.intake_date || "").trim() ||
      new Date().toISOString().slice(0, 10);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Water amount must be a positive whole number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO water_intake
       (user_id, intake_date, amount_ml)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, intakeDate, amount]
    );

    res.status(201).json({
      entry: result.rows[0],
    });
  } catch (error) {
    console.error("Create water intake error:", error);

    res.status(500).json({
      message: "Unable to save water intake.",
    });
  }
});


app.delete("/api/nutrition/water/:id", authMiddleware, async (req, res) => {
  try {
    const waterId = Number(req.params.id);

    if (!Number.isInteger(waterId) || waterId <= 0) {
      return res.status(400).json({
        message: "Invalid water intake ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM water_intake
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [waterId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Water intake entry not found.",
      });
    }

    res.json({
      message: "Water intake deleted successfully.",
    });
  } catch (error) {
    console.error("Delete water intake error:", error);

    res.status(500).json({
      message: "Unable to delete water intake.",
    });
  }
});



// ==================== FINANCE ====================

// GET income
app.get("/api/finance/income", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM finance_income
       WHERE user_id = $1
       ORDER BY income_date DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({ income: result.rows });
  } catch (error) {
    console.error("Get finance income error:", error);
    res.status(500).json({
      message: "Unable to load income.",
    });
  }
});

// POST income
app.post("/api/finance/income", authMiddleware, async (req, res) => {
  try {
    const { source, amount, income_date, description } = req.body;

    const cleanSource = String(source || "").trim();
    const numericAmount = Number(amount);

    if (!cleanSource) {
      return res.status(400).json({
        message: "Income source is required.",
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        message: "Income amount must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_income
       (user_id, source, amount, income_date, description)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [
        req.user.id,
        cleanSource,
        numericAmount,
        income_date || null,
        String(description || "").trim() || null,
      ]
    );

    res.status(201).json({
      income: result.rows[0],
    });
  } catch (error) {
    console.error("Create finance income error:", error);
    res.status(400).json({
      message: "Unable to create income.",
    });
  }
});

// DELETE income
app.delete("/api/finance/income/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM finance_income
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [Number(req.params.id), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Income entry not found.",
      });
    }

    res.json({
      message: "Income deleted successfully.",
    });
  } catch (error) {
    console.error("Delete finance income error:", error);
    res.status(500).json({
      message: "Unable to delete income.",
    });
  }
});

// GET expenses
app.get("/api/finance/expenses", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM finance_expenses
       WHERE user_id = $1
       ORDER BY expense_date DESC, created_at DESC`,
      [req.user.id]
    );

    res.json({ expenses: result.rows });
  } catch (error) {
    console.error("Get finance expenses error:", error);
    res.status(500).json({
      message: "Unable to load expenses.",
    });
  }
});

// POST expense
app.post("/api/finance/expenses", authMiddleware, async (req, res) => {
  try {
    const { amount, category, expense_date, description } = req.body;

    const cleanCategory = String(category || "").trim();
    const numericAmount = Number(amount);

    if (!cleanCategory) {
      return res.status(400).json({
        message: "Expense category is required.",
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        message: "Expense amount must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_expenses
       (user_id, amount, category, expense_date, description)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [
        req.user.id,
        numericAmount,
        cleanCategory,
        expense_date || null,
        String(description || "").trim() || null,
      ]
    );

    res.status(201).json({
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Create finance expense error:", error);
    res.status(400).json({
      message: "Unable to create expense.",
    });
  }
});

// DELETE expense
app.delete("/api/finance/expenses/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM finance_expenses
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [Number(req.params.id), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Expense entry not found.",
      });
    }

    res.json({
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("Delete finance expense error:", error);
    res.status(500).json({
      message: "Unable to delete expense.",
    });
  }
});


// GET main analytics
app.get("/api/analytics", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      tasksResult,
      goalsResult,
      habitsResult,
      completionsResult,
      financeResult,
      careerResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE completed = true)::int AS completed,
          COUNT(*) FILTER (WHERE completed = false)::int AS pending
         FROM assignments
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE completed = true)::int AS completed,
          COALESCE(ROUND(AVG(progress), 1), 0) AS average_progress
         FROM goals
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*)::int AS active
         FROM habits
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*)::int AS completed
         FROM habit_completions
         WHERE user_id = $1
           AND completed = true
           AND completion_date >= CURRENT_DATE - INTERVAL '6 days'`,
        [userId]
      ),

      pool.query(
        `SELECT
          COALESCE((
            SELECT SUM(amount)
            FROM finance_income
            WHERE user_id = $1
              AND income_date >= DATE_TRUNC('month', CURRENT_DATE)::date
              AND income_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0) AS income,
          COALESCE((
            SELECT SUM(amount)
            FROM finance_expenses
            WHERE user_id = $1
              AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)::date
              AND expense_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0) AS expenses`,
        [userId]
      ),

      pool.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'Interested')::int AS interested,
          COUNT(*) FILTER (WHERE status = 'Applied')::int AS applied,
          COUNT(*) FILTER (WHERE status = 'Interview')::int AS interview,
          COUNT(*) FILTER (WHERE status = 'Offer')::int AS offers,
          COUNT(*) FILTER (WHERE status = 'Rejected')::int AS rejected
         FROM career_applications
         WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const tasks = tasksResult.rows[0];
    const goals = goalsResult.rows[0];
    const habits = habitsResult.rows[0];
    const completions = completionsResult.rows[0];
    const finance = financeResult.rows[0];
    const career = careerResult.rows[0];

    const taskTotal = Number(tasks.total);
    const taskCompleted = Number(tasks.completed);

    res.json({
      tasks: {
        total: taskTotal,
        completed: taskCompleted,
        pending: Number(tasks.pending),
        completionRate: taskTotal
          ? Math.round((taskCompleted / taskTotal) * 100)
          : 0,
      },
      goals: {
        total: Number(goals.total),
        completed: Number(goals.completed),
        averageProgress: Number(goals.average_progress),
      },
      habits: {
        active: Number(habits.active),
        recentCompletions: Number(completions.completed),
      },
      finance: {
        income: Number(finance.income),
        expenses: Number(finance.expenses),
        remaining: Number(finance.income) - Number(finance.expenses),
      },
      career: {
        total: Number(career.total),
        interested: Number(career.interested),
        applied: Number(career.applied),
        interview: Number(career.interview),
        offers: Number(career.offers),
        rejected: Number(career.rejected),
      },
    });
  } catch (error) {
    console.error("Get main analytics error:", error);
    res.status(500).json({
      message: "Unable to load analytics.",
    });
  }
});

// ==================== FINANCE BUDGETS ====================

// GET monthly budget
app.get("/api/finance/budget", authMiddleware, async (req, res) => {
  try {
    const month = String(req.query.month || "").trim();

    const result = await pool.query(
      `SELECT *
       FROM finance_budgets
       WHERE user_id = $1
       AND month = COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
       LIMIT 1`,
      [req.user.id, month || null]
    );

    res.json({
      budget: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Get finance budget error:", error);
    res.status(500).json({
      message: "Unable to load monthly budget.",
    });
  }
});

// PUT monthly budget
app.put("/api/finance/budget", authMiddleware, async (req, res) => {
  try {
    const { month, monthly_budget } = req.body;

    const numericBudget = Number(monthly_budget);

    if (!Number.isFinite(numericBudget) || numericBudget < 0) {
      return res.status(400).json({
        message: "Monthly budget must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_budgets
       (user_id, month, monthly_budget)
       VALUES (
         $1,
         COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date),
         $3
       )
       ON CONFLICT (user_id, month)
       DO UPDATE SET
         monthly_budget = EXCLUDED.monthly_budget,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        month || null,
        numericBudget,
      ]
    );

    res.json({
      budget: result.rows[0],
    });
  } catch (error) {
    console.error("Save finance budget error:", error);
    res.status(400).json({
      message: "Unable to save monthly budget.",
    });
  }
});

// GET category budgets
app.get("/api/finance/category-budgets", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM finance_category_budgets
       WHERE user_id = $1
       ORDER BY category ASC`,
      [req.user.id]
    );

    res.json({
      categoryBudgets: result.rows,
    });
  } catch (error) {
    console.error("Get category budgets error:", error);
    res.status(500).json({
      message: "Unable to load category budgets.",
    });
  }
});

// PUT category budget
app.put("/api/finance/category-budgets", authMiddleware, async (req, res) => {
  try {
    const { category, monthly_limit } = req.body;

    const cleanCategory = String(category || "").trim();
    const numericLimit = Number(monthly_limit);

    if (!cleanCategory) {
      return res.status(400).json({
        message: "Budget category is required.",
      });
    }

    if (!Number.isFinite(numericLimit) || numericLimit < 0) {
      return res.status(400).json({
        message: "Category limit must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_category_budgets
       (user_id, category, monthly_limit)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category)
       DO UPDATE SET
         monthly_limit = EXCLUDED.monthly_limit,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        cleanCategory,
        numericLimit,
      ]
    );

    res.json({
      categoryBudget: result.rows[0],
    });
  } catch (error) {
    console.error("Save category budget error:", error);
    res.status(400).json({
      message: "Unable to save category budget.",
    });
  }
});

// GET finance analytics
app.get("/api/finance/analytics", authMiddleware, async (req, res) => {
  try {
    const month = String(req.query.month || "").trim();

    const monthResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount), 0) AS total_income
       FROM finance_income
       WHERE user_id = $1
       AND income_date >= COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
       AND income_date < (
         COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
         + INTERVAL '1 month'
       )`,
      [req.user.id, month || null]
    );

    const expenseResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount), 0) AS total_expenses
       FROM finance_expenses
       WHERE user_id = $1
       AND expense_date >= COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
       AND expense_date < (
         COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
         + INTERVAL '1 month'
       )`,
      [req.user.id, month || null]
    );

    const categoryResult = await pool.query(
      `SELECT
         category,
         COALESCE(SUM(amount), 0) AS total
       FROM finance_expenses
       WHERE user_id = $1
       AND expense_date >= COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
       AND expense_date < (
         COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
         + INTERVAL '1 month'
       )
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.id, month || null]
    );

    const trendResult = await pool.query(
      `SELECT
         TO_CHAR(month_start, 'YYYY-MM') AS month,
         COALESCE(income.total_income, 0) AS income,
         COALESCE(expenses.total_expenses, 0) AS expenses
       FROM generate_series(
         DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
         DATE_TRUNC('month', CURRENT_DATE),
         INTERVAL '1 month'
       ) AS month_start
       LEFT JOIN (
         SELECT
           DATE_TRUNC('month', income_date) AS month_start,
           SUM(amount) AS total_income
         FROM finance_income
         WHERE user_id = $1
         GROUP BY DATE_TRUNC('month', income_date)
       ) income USING (month_start)
       LEFT JOIN (
         SELECT
           DATE_TRUNC('month', expense_date) AS month_start,
           SUM(amount) AS total_expenses
         FROM finance_expenses
         WHERE user_id = $1
         GROUP BY DATE_TRUNC('month', expense_date)
       ) expenses USING (month_start)
       ORDER BY month_start ASC`,
      [req.user.id]
    );

    const budgetResult = await pool.query(
      `SELECT monthly_budget
       FROM finance_budgets
       WHERE user_id = $1
       AND month = COALESCE($2::date, DATE_TRUNC('month', CURRENT_DATE)::date)
       LIMIT 1`,
      [req.user.id, month || null]
    );

    const totalIncome = Number(monthResult.rows[0].total_income);
    const totalExpenses = Number(expenseResult.rows[0].total_expenses);
    const monthlyBudget = Number(
      budgetResult.rows[0]?.monthly_budget || 0
    );

    res.json({
      totalIncome,
      totalExpenses,
      remainingIncome: totalIncome - totalExpenses,
      monthlyBudget,
      remainingBudget: monthlyBudget - totalExpenses,
      spendingByCategory: categoryResult.rows.map((row) => ({
        category: row.category,
        total: Number(row.total),
      })),
      trends: trendResult.rows.map((row) => ({
        month: row.month,
        income: Number(row.income),
        expenses: Number(row.expenses),
      })),
    });
  } catch (error) {
    console.error("Get finance analytics error:", error);
    res.status(500).json({
      message: "Unable to load finance analytics.",
    });
  }
});

/* =========================================================
   404 HANDLER
========================================================= */


// ==================== FINANCE BUDGETS ====================

// GET budgets
app.get("/api/finance/budgets", authMiddleware, async (req, res) => {
  try {
    const budgetResult = await pool.query(
      `SELECT *
       FROM finance_budgets
       WHERE user_id = $1
       ORDER BY month DESC`,
      [req.user.id]
    );

    const categoryResult = await pool.query(
      `SELECT *
       FROM finance_category_budgets
       WHERE user_id = $1
       ORDER BY category ASC`,
      [req.user.id]
    );

    res.json({
      budgets: budgetResult.rows,
      categoryLimits: categoryResult.rows,
    });
  } catch (error) {
    console.error("Get finance budgets error:", error);
    res.status(500).json({
      message: "Unable to load budgets.",
    });
  }
});

// PUT monthly budget
app.put("/api/finance/budgets", authMiddleware, async (req, res) => {
  try {
    const {
      month,
      monthly_budget,
    } = req.body;

    const cleanMonth = String(month || "").trim();
    const numericBudget = Number(monthly_budget);

    if (!/^\d{4}-\d{2}$/.test(cleanMonth)) {
      return res.status(400).json({
        message: "Budget month must use YYYY-MM format.",
      });
    }

    if (!Number.isFinite(numericBudget) || numericBudget < 0) {
      return res.status(400).json({
        message: "Monthly budget must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_budgets
       (user_id, month, monthly_budget)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month)
       DO UPDATE SET
         monthly_budget = EXCLUDED.monthly_budget,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        cleanMonth,
        numericBudget,
      ]
    );

    res.json({
      budget: result.rows[0],
    });
  } catch (error) {
    console.error("Save finance budget error:", error);
    res.status(400).json({
      message: "Unable to save monthly budget.",
    });
  }
});

// POST category budget
app.post("/api/finance/budgets/categories", authMiddleware, async (req, res) => {
  try {
    const {
      category,
      monthly_limit,
    } = req.body;

    const cleanCategory = String(category || "").trim();
    const numericLimit = Number(monthly_limit);

    if (!cleanCategory) {
      return res.status(400).json({
        message: "Budget category is required.",
      });
    }

    if (!Number.isFinite(numericLimit) || numericLimit < 0) {
      return res.status(400).json({
        message: "Category limit must be a valid non-negative number.",
      });
    }

    const result = await pool.query(
      `INSERT INTO finance_category_budgets
       (user_id, category, monthly_limit)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category)
       DO UPDATE SET
         monthly_limit = EXCLUDED.monthly_limit,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        cleanCategory,
        numericLimit,
      ]
    );

    res.status(201).json({
      categoryLimit: result.rows[0],
    });
  } catch (error) {
    console.error("Save category budget error:", error);
    res.status(400).json({
      message: "Unable to save category budget.",
    });
  }
});

// DELETE category budget
app.delete(
  "/api/finance/budgets/categories/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM finance_category_budgets
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [
          Number(req.params.id),
          req.user.id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Category budget not found.",
        });
      }

      res.json({
        message: "Category budget deleted successfully.",
      });
    } catch (error) {
      console.error("Delete category budget error:", error);
      res.status(500).json({
        message: "Unable to delete category budget.",
      });
    }
  }
);


// =========================================================
// MILESTONE 12 — HABITS & SELF-CARE
// =========================================================

// GET habits with recent completion status
app.get("/api/habits", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         h.*,
         EXISTS (
           SELECT 1
           FROM habit_completions hc
           WHERE hc.habit_id = h.id
             AND h.user_id = $1
             AND hc.completion_date = CURRENT_DATE
         ) AS completed_today
       FROM habits h
       WHERE h.user_id = $1
       ORDER BY h.is_active DESC, h.created_at DESC`,
      [req.user.id]
    );

    res.json({ habits: result.rows });
  } catch (error) {
    console.error("Get habits error:", error);
    res.status(500).json({ message: "Unable to load habits." });
  }
});

// POST habit
app.post("/api/habits", authMiddleware, async (req, res) => {
  try {
    const { name, frequency } = req.body;
    const cleanName = String(name || "").trim();
    const cleanFrequency = String(frequency || "daily").trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({ message: "Habit name is required." });
    }

    if (!["daily", "weekdays", "weekly"].includes(cleanFrequency)) {
      return res.status(400).json({ message: "Invalid habit frequency." });
    }

    const result = await pool.query(
      `INSERT INTO habits (user_id, name, frequency)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, cleanName, cleanFrequency]
    );

    res.status(201).json({ habit: result.rows[0] });
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(400).json({ message: "Unable to create habit." });
  }
});

// PUT habit
app.put("/api/habits/:id", authMiddleware, async (req, res) => {
  try {
    const { name, frequency, is_active } = req.body;
    const cleanName = String(name || "").trim();
    const cleanFrequency = String(frequency || "daily").trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({ message: "Habit name is required." });
    }

    if (!["daily", "weekdays", "weekly"].includes(cleanFrequency)) {
      return res.status(400).json({ message: "Invalid habit frequency." });
    }

    const result = await pool.query(
      `UPDATE habits
       SET name = $1,
           frequency = $2,
           is_active = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [
        cleanName,
        cleanFrequency,
        is_active !== false,
        Number(req.params.id),
        req.user.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Habit not found." });
    }

    res.json({ habit: result.rows[0] });
  } catch (error) {
    console.error("Update habit error:", error);
    res.status(400).json({ message: "Unable to update habit." });
  }
});

// DELETE habit
app.delete("/api/habits/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM habits
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [Number(req.params.id), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Habit not found." });
    }

    res.json({ message: "Habit deleted successfully." });
  } catch (error) {
    console.error("Delete habit error:", error);
    res.status(500).json({ message: "Unable to delete habit." });
  }
});

// POST habit completion
app.post("/api/habits/:id/completions", authMiddleware, async (req, res) => {
  try {
    const completionDate = req.body.completion_date || null;

    const habitResult = await pool.query(
      `SELECT id
       FROM habits
       WHERE id = $1 AND user_id = $2`,
      [Number(req.params.id), req.user.id]
    );

    if (habitResult.rowCount === 0) {
      return res.status(404).json({ message: "Habit not found." });
    }

    const result = await pool.query(
      `INSERT INTO habit_completions
       (habit_id, user_id, completion_date)
       VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE))
       ON CONFLICT (habit_id, completion_date)
       DO NOTHING
       RETURNING *`,
      [Number(req.params.id), req.user.id, completionDate]
    );

    if (result.rowCount === 0) {
      await pool.query(
        `DELETE FROM habit_completions
         WHERE habit_id = $1
           AND user_id = $2
           AND completion_date = COALESCE($3::date, CURRENT_DATE)`,
        [Number(req.params.id), req.user.id, completionDate]
      );

      return res.json({
        completed: false,
        message: "Habit marked incomplete.",
      });
    }

    res.status(201).json({
      completed: true,
      completion: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle habit completion error:", error);
    res.status(400).json({ message: "Unable to update habit completion." });
  }
});

// GET habit progress
app.get("/api/habits/progress", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         h.id,
         h.name,
         h.frequency,
         COUNT(hc.id)::integer AS completion_count,
         COUNT(
           CASE
             WHEN hc.completion_date >= CURRENT_DATE - INTERVAL '6 days'
             THEN 1
           END
         )::integer AS last_7_days
       FROM habits h
       LEFT JOIN habit_completions hc
         ON hc.habit_id = h.id
        AND h.user_id = $1
       WHERE h.user_id = $1
       GROUP BY h.id, h.name, h.frequency
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    res.json({ progress: result.rows });
  } catch (error) {
    console.error("Get habit progress error:", error);
    res.status(500).json({ message: "Unable to load habit progress." });
  }
});

// GET self-care entries
app.get("/api/self-care", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM self_care_entries
       WHERE user_id = $1
       ORDER BY entry_date DESC, created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    res.json({ entries: result.rows });
  } catch (error) {
    console.error("Get self-care entries error:", error);
    res.status(500).json({ message: "Unable to load self-care entries." });
  }
});

// POST/UPDATE self-care entry
app.put("/api/self-care", authMiddleware, async (req, res) => {
  try {
    const {
      entry_date,
      sleep_hours,
      water_glasses,
      mood,
      notes,
    } = req.body;

    const cleanDate = entry_date || null;
    const cleanSleep =
      sleep_hours === "" || sleep_hours === null || sleep_hours === undefined
        ? null
        : Number(sleep_hours);
    const cleanWater =
      water_glasses === "" ||
      water_glasses === null ||
      water_glasses === undefined
        ? null
        : Number(water_glasses);
    const cleanMood = String(mood || "").trim();
    const cleanNotes = String(notes || "").trim();

    if (
      cleanSleep !== null &&
      (!Number.isFinite(cleanSleep) || cleanSleep < 0 || cleanSleep > 24)
    ) {
      return res.status(400).json({
        message: "Sleep hours must be between 0 and 24.",
      });
    }

    if (
      cleanWater !== null &&
      (!Number.isInteger(cleanWater) || cleanWater < 0 || cleanWater > 100)
    ) {
      return res.status(400).json({
        message: "Water glasses must be a whole number between 0 and 100.",
      });
    }

    const result = await pool.query(
      `INSERT INTO self_care_entries
       (user_id, entry_date, sleep_hours, water_glasses, mood, notes)
       VALUES (
         $1,
         COALESCE($2::date, CURRENT_DATE),
         $3,
         $4,
         $5,
         $6
       )
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET
         sleep_hours = EXCLUDED.sleep_hours,
         water_glasses = EXCLUDED.water_glasses,
         mood = EXCLUDED.mood,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        cleanDate,
        cleanSleep,
        cleanWater,
        cleanMood || null,
        cleanNotes || null,
      ]
    );

    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error("Save self-care entry error:", error);
    res.status(400).json({ message: "Unable to save self-care entry." });
  }
});

// DELETE self-care entry
app.delete("/api/self-care/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM self_care_entries
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [Number(req.params.id), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Self-care entry not found." });
    }

    res.json({ message: "Self-care entry deleted successfully." });
  } catch (error) {
    console.error("Delete self-care entry error:", error);
    res.status(500).json({ message: "Unable to delete self-care entry." });
  }
});


/* =========================================================
  MILESTONE 13 — GOALS API
========================================================= */

// GET all goals for logged-in user
app.get("/api/goals", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, category, description, deadline,
              progress, completed, created_at
       FROM goals
       WHERE user_id = $1
       ORDER BY completed ASC,
                deadline ASC NULLS LAST,
                created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/goals error:", error);
    res.status(500).json({ message: "Failed to load goals." });
  }
});

// CREATE a goal
app.post("/api/goals", authMiddleware, async (req, res) => {
  try {
    const { title, category, description, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Goal title is required." });
    }

    const result = await pool.query(
      `INSERT INTO goals
       (user_id, title, category, description, deadline, progress, completed)
       VALUES ($1, $2, $3, $4, $5, 0, false)
       RETURNING id, title, category, description, deadline,
                 progress, completed, created_at`,
      [
        req.user.id,
        title.trim(),
        category || null,
        description || null,
        deadline || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /api/goals error:", error);
    res.status(500).json({ message: "Failed to create goal." });
  }
});

// UPDATE a goal
app.put("/api/goals/:id", authMiddleware, async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID." });
    }

    const {
      title,
      category,
      description,
      deadline,
      progress,
      completed
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Goal title is required." });
    }

    const numericProgress = Number(progress);

    if (
      !Number.isInteger(numericProgress) ||
      numericProgress < 0 ||
      numericProgress > 100
    ) {
      return res.status(400).json({
        message: "Progress must be a whole number between 0 and 100."
      });
    }

    const result = await pool.query(
      `UPDATE goals
       SET title = $1,
           category = $2,
           description = $3,
           deadline = $4,
           progress = $5,
           completed = $6
       WHERE id = $7
         AND user_id = $8
       RETURNING id, title, category, description, deadline,
                 progress, completed, created_at`,
      [
        title.trim(),
        category || null,
        description || null,
        deadline || null,
        numericProgress,
        Boolean(completed),
        goalId,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /api/goals/:id error:", error);
    res.status(500).json({ message: "Failed to update goal." });
  }
});

// DELETE a goal
app.delete("/api/goals/:id", authMiddleware, async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID." });
    }

    const result = await pool.query(
      `DELETE FROM goals
       WHERE id = $1
         AND user_id = $2
       RETURNING id`,
      [goalId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.json({ message: "Goal deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/goals/:id error:", error);
    res.status(500).json({ message: "Failed to delete goal." });
  }
});



/* =========================================================
   CAREER — APPLICATIONS & SKILLS
========================================================= */

app.get("/api/career/applications", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company, role, application_date, status, interview_date, notes, created_at
       FROM career_applications
       WHERE user_id = $1
       ORDER BY COALESCE(application_date, created_at::date) DESC, id DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Career applications error:", error);
    res.status(500).json({ message: "Failed to load career applications." });
  }
});

app.post("/api/career/applications", authMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      application_date,
      status,
      interview_date,
      notes,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        message: "Company and role are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO career_applications
       (user_id, company, role, application_date, status, interview_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, company, role, application_date, status, interview_date, notes, created_at`,
      [
        req.user.id,
        company.trim(),
        role.trim(),
        application_date || null,
        status || "Interested",
        interview_date || null,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create career application error:", error);
    res.status(500).json({ message: "Failed to create career application." });
  }
});

app.put("/api/career/applications/:id", authMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      application_date,
      status,
      interview_date,
      notes,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        message: "Company and role are required.",
      });
    }

    const result = await pool.query(
      `UPDATE career_applications
       SET company = $1,
           role = $2,
           application_date = $3,
           status = $4,
           interview_date = $5,
           notes = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, company, role, application_date, status, interview_date, notes, created_at`,
      [
        company.trim(),
        role.trim(),
        application_date || null,
        status || "Interested",
        interview_date || null,
        notes || null,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Career application not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update career application error:", error);
    res.status(500).json({ message: "Failed to update career application." });
  }
});

app.delete("/api/career/applications/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM career_applications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Career application not found.",
      });
    }

    res.json({ message: "Career application deleted." });
  } catch (error) {
    console.error("Delete career application error:", error);
    res.status(500).json({ message: "Failed to delete career application." });
  }
});

app.get("/api/career/skills", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, created_at
       FROM skills
       ORDER BY category NULLS LAST, name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Career skills error:", error);
    res.status(500).json({ message: "Failed to load skills." });
  }
});

app.get("/api/career/my-skills", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.category
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = $1
       ORDER BY s.category NULLS LAST, s.name ASC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("My skills error:", error);
    res.status(500).json({ message: "Failed to load your skills." });
  }
});

app.post("/api/career/my-skills", authMiddleware, async (req, res) => {
  try {
    const { skill_id, name } = req.body;

    let resolvedSkillId = skill_id;

    if (!resolvedSkillId && name && name.trim()) {
      const skillResult = await pool.query(
        `INSERT INTO skills (name, category)
         VALUES ($1, $2)
         ON CONFLICT (name)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, category`,
        [name.trim(), "Other"]
      );

      resolvedSkillId = skillResult.rows[0].id;
    }

    if (!resolvedSkillId) {
      return res.status(400).json({
        message: "Skill name is required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO user_skills (user_id, skill_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING user_id, skill_id`,
      [req.user.id, resolvedSkillId]
    );

    res.status(201).json({
      message: "Skill added.",
      added: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Add skill error:", error);
    res.status(500).json({ message: "Failed to add skill." });
  }
});

app.delete("/api/career/my-skills/:skillId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM user_skills
       WHERE user_id = $1 AND skill_id = $2
       RETURNING skill_id`,
      [req.user.id, req.params.skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Skill not found in your profile.",
      });
    }

    res.json({ message: "Skill removed." });
  } catch (error) {
    console.error("Remove skill error:", error);
    res.status(500).json({ message: "Failed to remove skill." });
  }
});


/* =========================================================
   AI ASSISTANT
   Student-life planning assistant
   No external API and no database dependency
========================================================= */

app.post("/api/ai/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question."
      });
    }

    const userId = req.user.id;

    const [
      assignmentsResult,
      goalsResult,
      habitsResult,
      careerResult,
      calendarResult,
      financeResult
    ] = await Promise.all([
      pool.query(
        `SELECT id, title, due_date, completed
         FROM assignments
         WHERE user_id = $1
         ORDER BY completed ASC, due_date ASC NULLS LAST
         LIMIT 10`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM goals
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM habits
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM career_applications
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT title, event_type, start_time, end_time, location
         FROM calendar_events
         WHERE user_id = $1
         ORDER BY start_time ASC
         LIMIT 10`,
        [userId]
      ),

      pool.query(
        `SELECT
           0 AS income,
           0 AS expenses`,
        []
      )
    ]);

    const context = {
      assignments: assignmentsResult.rows,
      goals: goalsResult.rows[0]?.count || 0,
      activeHabits: habitsResult.rows[0]?.count || 0,
      careerApplications: careerResult.rows[0]?.count || 0,
      calendarEvents: calendarResult.rows,
      finances: financeResult.rows[0] || { income: 0, expenses: 0 }
    };

    const systemPrompt = `
You are the AI Assistant inside Student Life OS.

You are a helpful, friendly personal student-life assistant.
Answer the user's actual question directly and naturally.

You have access to the user's current Student Life OS data below.
Use it when relevant, but do not force it into unrelated questions.

Student Life OS data:
${JSON.stringify(context, null, 2)}

Rules:
- Answer normal questions naturally.
- If the question is about the student's schedule, assignments, goals, habits, career, or finances, use the provided data.
- If the question is general advice, answer normally using your knowledge.
- If the user asks about today, tomorrow, this week, deadlines, or priorities, reason from the available dates and data.
- Never say "try asking" unless the user genuinely asks what you can do.
- Be concise but useful.
- Give practical recommendations when appropriate.
- If information is missing, clearly say what is unavailable instead of inventing it.
`;

    const ollamaResponse = await axios.post(
      "http://127.0.0.1:11434/api/chat",
      {
        model: "llama3.2:3b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message.trim()
          }
        ],
        stream: false,
        options: {
          temperature: 0.7
        }
      },
      {
        timeout: 120000
      }
    );

    const responseText =
      ollamaResponse.data?.message?.content?.trim();

    if (!responseText) {
      throw new Error("Ollama returned an empty response.");
    }

    return res.json({
      response: responseText
    });
  } catch (error) {
    console.error(
      "Local AI Assistant error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message:
        "The local AI assistant is unavailable. Make sure Ollama is running."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});






/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error.",
    });
  }
);



/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error.",
    });
  }
);
/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log(
      "PostgreSQL connection successful."
    );

    app.listen(PORT, () => {
      console.log(
        `Student Life OS API running on port ${PORT}.`
      );
    });
  } catch (error) {
    console.error(
      "Unable to connect to PostgreSQL:",
      error.message
    );

    process.exit(1);
  }
}

startServer();