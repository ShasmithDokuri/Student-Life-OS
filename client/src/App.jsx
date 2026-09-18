import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {


  return (
    <ErrorBoundary>
      <StudentLifeOS />
    </ErrorBoundary>
  );
}

/* =========================================================
   ERROR BOUNDARY
========================================================= */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Student Life OS error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-screen">
          <div className="app-error-card">
            <div className="brand-mark">S</div>
            <p className="eyebrow">STUDENT LIFE OS</p>
            <h1>Something went wrong.</h1>
            <p>
              The application encountered an unexpected rendering error.
            </p>

            <pre>{this.state.error?.message || "Unknown error"}</pre>

            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =========================================================
   MAIN APP
========================================================= */

function StudentLifeOS() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarForm, setCalendarForm] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
  });
  const [savingCalendarEvent, setSavingCalendarEvent] = useState(false);
  const [exams, setExams] = useState([]);
  const [studySessions, setStudySessions] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  const [courseForm, setCourseForm] = useState({
    course_code: "",
    course_name: "",
    professor: "",
    semester: "",
  });

  const [studyForm, setStudyForm] = useState({
    course_id: "",
    topic: "",
    session_date: getDefaultDateTime(),
    duration_minutes: "60",
    notes: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    course_id: "",
    description: "",
    due_date: "",
  });

  const [savingCourse, setSavingCourse] = useState(false);
  const [savingStudySession, setSavingStudySession] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [fitnessWorkouts, setFitnessWorkouts] = useState([]);
  const [fitnessExercises, setFitnessExercises] = useState([]);
  const [fitnessLoading, setFitnessLoading] = useState(false);
  const [fitnessError, setFitnessError] = useState("");
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [savingExercise, setSavingExercise] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    name: "",
    workout_type: "",
    workout_date: getDefaultDateTime(),
    duration_minutes: "60",
    notes: "",
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    muscle_group: "",
  });


  const [financeIncome, setFinanceIncome] = useState([]);
  const [financeExpenses, setFinanceExpenses] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState("");
  const [savingFinance, setSavingFinance] = useState(false);
  const [financeBudgets, setFinanceBudgets] = useState([]);
  const [financeCategoryLimits, setFinanceCategoryLimits] = useState([]);
  const [financeAnalytics, setFinanceAnalytics] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const [savingFinanceBudget, setSavingFinanceBudget] = useState(false);

  const [budgetForm, setBudgetForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    monthly_budget: "",
  });

  const [categoryBudgetForm, setCategoryBudgetForm] = useState({
    category: "",
    monthly_limit: "",
  });


  // ---------------------------------------------------------
  // SELF-CARE & HABITS
  // ---------------------------------------------------------
  const [habits, setHabits] = useState([]);
  const [habitProgress, setHabitProgress] = useState([]);
  const [selfCareEntries, setSelfCareEntries] = useState([]);
  const [selfCareLoading, setSelfCareLoading] = useState(false);
  const [selfCareError, setSelfCareError] = useState("");
  const [savingSelfCare, setSavingSelfCare] = useState(false);
  const [savingHabit, setSavingHabit] = useState(false);

  const [habitForm, setHabitForm] = useState({
    name: "",
    frequency: "daily",
  });

  const [selfCareForm, setSelfCareForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    sleep_hours: "",
    water_glasses: "",
    mood: "",
    notes: "",
  });


  const [incomeForm, setIncomeForm] = useState({
    source: "",
    amount: "",
    income_date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I’m ready to help you organize your student life. What would you like to work on?"
    }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "",
    expense_date: new Date().toISOString().slice(0, 10),
    description: "",
  });

async function sendAiMessage(event) {
  event.preventDefault();

  const message = aiInput.trim();

  if (!message || aiLoading) return;

  setAiMessages((current) => [
    ...current,
    { role: "user", text: message }
  ]);

  setAiInput("");
  setAiLoading(true);

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Unable to get an AI response.");
    }

    setAiMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: data.response || "I couldn't generate a response right now."
      }
    ]);
  } catch (error) {
    console.error("AI Assistant error:", error);

    setAiMessages((current) => [
      ...current,
      {
        role: "assistant",
        text: "I'm having trouble connecting to your Student Life data right now. Please make sure the backend server is running and try again."
      }
    ]);
  } finally {
    setAiLoading(false);
  }
}

  /* ---------------------------------------------------------
     AUTH CHECK
  --------------------------------------------------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCheckingAuth(false);
      return;
    }

    checkCurrentUser(token);
  }, []);

  async function checkCurrentUser(token) {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Your session has expired.");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Authentication check error:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }

  /* ---------------------------------------------------------
     LOAD DATA
  --------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    loadAllData();
  }, [user]);

  async function loadAllData() {
    setLoadingData(true);
    setDataError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        coursesResponse,
        assignmentsResponse,
        examsResponse,
        studySessionsResponse,
        calendarResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/courses`, { headers }),
        fetch(`${API_URL}/api/assignments`, { headers }),
        fetch(`${API_URL}/api/exams`, { headers }),
        fetch(`${API_URL}/api/study-sessions`, { headers }),
        fetch(`${API_URL}/api/calendar`, { headers }),
      ]);

      const coursesData = await parseResponse(coursesResponse);
      const assignmentsData = await parseResponse(assignmentsResponse);
      const examsData = await parseResponse(examsResponse);
      const studySessionsData = await parseResponse(studySessionsResponse);
      const calendarData = await parseResponse(calendarResponse);

      if (!coursesResponse.ok) {
        throw new Error(coursesData.message || "Unable to load courses.");
      }

      if (!assignmentsResponse.ok) {
        throw new Error(
          assignmentsData.message || "Unable to load assignments."
        );
      }

      if (!examsResponse.ok) {
        throw new Error(examsData.message || "Unable to load exams.");
      }

      if (!studySessionsResponse.ok) {
        throw new Error(
          studySessionsData.message || "Unable to load study sessions."
        );
      }

      if (!calendarResponse.ok) {
        throw new Error(
          calendarData.message || "Unable to load calendar events."
        );
      }

      setCourses(coursesData.courses || []);
      setAssignments(assignmentsData.assignments || []);
      setExams(examsData.exams || []);
      setStudySessions(studySessionsData.study_sessions || []);
      setCalendarEvents(calendarData.events || []);
    } catch (error) {
      console.error("Load data error:", error);

      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to load application data."
      );
    } finally {
      setLoadingData(false);
    }
  }

  /* ---------------------------------------------------------
     AUTH
  --------------------------------------------------------- */

  function handleAuthChange(event) {
    const { name, value } = event.target;

    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));

    setAuthError("");
  }

  async function handleGoogleLogin(credentialResponse) {
    if (authLoading) return;

    setAuthError("");
    setAuthLoading(true);

    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google sign-in did not return a credential.");
      }

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Google authentication failed."
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "The server did not return a valid Google login response."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error("Google login error:", error);
      setAuthError(
        error.message || "Unable to sign in with Google."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (authLoading) return;

    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const body =
        authMode === "login"
          ? {
              email: authForm.email.trim(),
              password: authForm.password,
            }
          : {
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            };

      if (authMode === "signup" && !body.name) {
        throw new Error("Please enter your name.");
      }

      if (!body.email) {
        throw new Error("Please enter your email.");
      }

      if (!body.password) {
        throw new Error("Please enter your password.");
      }

      if (authMode === "signup" && body.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication request failed."
        );
      }

      if (authMode === "signup") {
        setAuthMode("login");

        setAuthForm({
          name: "",
          email: body.email,
          password: "",
        });

        setAuthError("Account created successfully. Please log in.");
        return;
      }

      if (!data.token || !data.user) {
        throw new Error(
          "The server did not return a valid login response."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthError(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCourses([]);
    setAssignments([]);
    setExams([]);
    setStudySessions([]);
    setActivePage("dashboard");
  }

  /* ---------------------------------------------------------
     COURSES
  --------------------------------------------------------- */

  function handleCourseChange(event) {
    const { name, value } = event.target;

    setCourseForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetCourseForm() {
    setCourseForm({
      course_code: "",
      course_name: "",
      professor: "",
      semester: "",
    });
  }

  async function handleCreateCourse(event) {
    event.preventDefault();

    if (savingCourse) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    const courseCode = courseForm.course_code.trim();
    const courseName = courseForm.course_name.trim();

    if (!courseCode || !courseName) {
      setDataError("Course code and course name are required.");
      return;
    }

    setSavingCourse(true);
    setDataError("");

    try {
      const response = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_code: courseCode,
          course_name: courseName,
          professor: courseForm.professor.trim() || null,
          semester: courseForm.semester.trim() || null,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to create course.");
      }

      if (!data.course) {
        throw new Error("The server did not return the created course.");
      }

      setCourses((current) => [data.course, ...current]);

      resetCourseForm();
      setShowCourseForm(false);
    } catch (error) {
      console.error("Create course error:", error);

      setDataError(
        error instanceof Error ? error.message : "Unable to create course."
      );
    } finally {
      setSavingCourse(false);
    }
  }

  /* ---------------------------------------------------------
     ASSIGNMENTS / TASKS
  --------------------------------------------------------- */

  function handleAssignmentChange(event) {
    const { name, value } = event.target;
    setAssignmentForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetAssignmentForm() {
    setAssignmentForm({
      title: "",
      course_id: "",
      description: "",
      due_date: "",
    });
  }

  async function handleCreateAssignment(event) {
    event.preventDefault();
    if (savingAssignment) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    const title = assignmentForm.title.trim();
    const courseId = Number(assignmentForm.course_id);

    if (!title) {
      setDataError("Please enter an assignment title.");
      return;
    }

    if (!Number.isInteger(courseId) || courseId <= 0) {
      setDataError("Please select a course.");
      return;
    }

    if (!assignmentForm.due_date) {
      setDataError("Please select a due date.");
      return;
    }

    setSavingAssignment(true);
    setDataError("");

    try {
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          course_id: courseId,
          description: assignmentForm.description.trim() || null,
          due_date: assignmentForm.due_date,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to create assignment.");
      }

      if (!data.assignment) {
        throw new Error("The server did not return the created assignment.");
      }

      setAssignments((current) => [data.assignment, ...current]);
      resetAssignmentForm();
      setShowAssignmentForm(false);
    } catch (error) {
      console.error("Create assignment error:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to create assignment."
      );
    } finally {
      setSavingAssignment(false);
    }
  }

  async function handleToggleAssignment(assignment) {
    const token = localStorage.getItem("token");

    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/assignments/${assignment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !assignment.completed,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to update assignment.");
      }

      setAssignments((current) =>
        current.map((item) =>
          item.id === assignment.id
            ? { ...item, completed: !assignment.completed }
            : item
        )
      );
    } catch (error) {
      console.error("Toggle assignment error:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to update assignment."
      );
    }
  }

  async function handleDeleteAssignment(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/assignments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete assignment.");
      }

      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== id)
      );
    } catch (error) {
      console.error("Delete assignment error:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to delete assignment."
      );
    }
  }

  /* ---------------------------------------------------------
     STUDY SESSIONS
  --------------------------------------------------------- */

  function handleStudyChange(event) {
    const { name, value } = event.target;

    setStudyForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetStudyForm() {
    setStudyForm({
      course_id: "",
      topic: "",
      session_date: getDefaultDateTime(),
      duration_minutes: "60",
      notes: "",
    });
  }

  async function handleCreateStudySession(event) {
    event.preventDefault();

    if (savingStudySession) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    const courseId = Number(studyForm.course_id);
    const duration = Number(studyForm.duration_minutes);
    const topic = studyForm.topic.trim();

    if (!Number.isInteger(courseId) || courseId <= 0) {
      setDataError("Please select a course.");
      return;
    }

    if (!topic) {
      setDataError("Please enter what you studied.");
      return;
    }

    if (!studyForm.session_date) {
      setDataError("Please select a date and time.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setDataError("Duration must be a positive whole number.");
      return;
    }

    const parsedDate = new Date(studyForm.session_date);

    if (Number.isNaN(parsedDate.getTime())) {
      setDataError("Please enter a valid date and time.");
      return;
    }

    setSavingStudySession(true);
    setDataError("");

    try {
      const response = await fetch(`${API_URL}/api/study-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          topic,
          session_date: parsedDate.toISOString(),
          duration_minutes: duration,
          notes: studyForm.notes.trim() || null,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create study session."
        );
      }

      if (!data.study_session) {
        throw new Error(
          "The server did not return the created study session."
        );
      }

      setStudySessions((current) =>
        [data.study_session, ...current].sort(
          (a, b) =>
            new Date(b.session_date) - new Date(a.session_date)
        )
      );

      resetStudyForm();
      setShowStudyForm(false);
    } catch (error) {
      console.error("Create study session error:", error);

      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to create study session."
      );
    } finally {
      setSavingStudySession(false);
    }
  }

  async function handleDeleteStudySession(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setDataError("Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/study-sessions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete study session."
        );
      }

      setStudySessions((current) =>
        current.filter((session) => session.id !== id)
      );
    } catch (error) {
      console.error("Delete study session error:", error);

      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to delete study session."
      );
    }
  }


  /* ---------------------------------------------------------
     FITNESS
  --------------------------------------------------------- */

  useEffect(() => {
    if (!user || activePage !== "fitness") return;
    loadFitnessData();
  }, [user, activePage]);

  async function loadFitnessData() {
    const token = localStorage.getItem("token");

    if (!token) {
      setFitnessError("Please log in again.");
      return;
    }

    setFitnessLoading(true);
    setFitnessError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [workoutsResponse, exercisesResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/workouts`, { headers }),
          fetch(`${API_URL}/api/exercises`, { headers }),
        ]);

      const workoutsData = await parseResponse(workoutsResponse);
      const exercisesData = await parseResponse(exercisesResponse);

      if (!workoutsResponse.ok) {
        throw new Error(
          workoutsData.message || "Unable to load workouts."
        );
      }

      if (!exercisesResponse.ok) {
        throw new Error(
          exercisesData.message || "Unable to load exercises."
        );
      }

      setFitnessWorkouts(workoutsData.workouts || []);
      setFitnessExercises(exercisesData.exercises || []);
    } catch (error) {
      console.error("Fitness loading error:", error);

      setFitnessError(
        error instanceof Error
          ? error.message
          : "Unable to load fitness data."
      );
    } finally {
      setFitnessLoading(false);
    }
  }

  function handleWorkoutChange(event) {
    const { name, value } = event.target;

    setWorkoutForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleExerciseChange(event) {
    const { name, value } = event.target;

    setExerciseForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetWorkoutForm() {
    setWorkoutForm({
      name: "",
      workout_type: "",
      workout_date: getDefaultDateTime(),
      duration_minutes: "60",
      notes: "",
    });
  }

  function resetExerciseForm() {
    setExerciseForm({
      name: "",
      muscle_group: "",
    });
  }

  async function handleCreateWorkout(event) {
    event.preventDefault();

    if (savingWorkout) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFitnessError("Please log in again.");
      return;
    }

    const name = workoutForm.name.trim();
    const workoutDate = new Date(workoutForm.workout_date);

    if (!name) {
      setFitnessError("Workout name is required.");
      return;
    }

    if (Number.isNaN(workoutDate.getTime())) {
      setFitnessError("Please enter a valid workout date.");
      return;
    }

    setSavingWorkout(true);
    setFitnessError("");

    try {
      const response = await fetch(`${API_URL}/api/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          workout_type: workoutForm.workout_type.trim() || null,
          workout_date: workoutDate.toISOString(),
          duration_minutes:
            workoutForm.duration_minutes === ""
              ? null
              : Number(workoutForm.duration_minutes),
          notes: workoutForm.notes.trim() || null,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create workout."
        );
      }

      if (!data.workout) {
        throw new Error(
          "The server did not return the created workout."
        );
      }

      setFitnessWorkouts((current) =>
        [data.workout, ...current].sort(
          (a, b) =>
            new Date(b.workout_date) -
            new Date(a.workout_date)
        )
      );

      resetWorkoutForm();
      setShowWorkoutForm(false);
    } catch (error) {
      console.error("Create workout error:", error);

      setFitnessError(
        error instanceof Error
          ? error.message
          : "Unable to create workout."
      );
    } finally {
      setSavingWorkout(false);
    }
  }

  async function handleDeleteWorkout(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setFitnessError("Please log in again.");
      return;
    }

    try {
      setFitnessError("");

      const response = await fetch(
        `${API_URL}/api/workouts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete workout."
        );
      }

      setFitnessWorkouts((current) =>
        current.filter((workout) => workout.id !== id)
      );
    } catch (error) {
      console.error("Delete workout error:", error);

      setFitnessError(
        error instanceof Error
          ? error.message
          : "Unable to delete workout."
      );
    }
  }

  async function handleCreateExercise(event) {
    event.preventDefault();

    if (savingExercise) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFitnessError("Please log in again.");
      return;
    }

    const name = exerciseForm.name.trim();

    if (!name) {
      setFitnessError("Exercise name is required.");
      return;
    }

    setSavingExercise(true);
    setFitnessError("");

    try {
      const response = await fetch(`${API_URL}/api/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          muscle_group:
            exerciseForm.muscle_group.trim() || null,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create exercise."
        );
      }

      if (!data.exercise) {
        throw new Error(
          "The server did not return the created exercise."
        );
      }

      setFitnessExercises((current) =>
        [...current, data.exercise].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      resetExerciseForm();
      setShowExerciseForm(false);
    } catch (error) {
      console.error("Create exercise error:", error);

      setFitnessError(
        error instanceof Error
          ? error.message
          : "Unable to create exercise."
      );
    } finally {
      setSavingExercise(false);
    }
  }



  // ---------------------------------------------------------
  // SELF-CARE & HABITS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || activePage !== "self-care") return;
    loadSelfCareData();
  }, [user, activePage]);

  async function loadSelfCareData() {
    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSelfCareLoading(true);
    setSelfCareError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [habitsResponse, progressResponse, selfCareResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/habits`, { headers }),
          fetch(`${API_URL}/api/habits/progress`, { headers }),
          fetch(`${API_URL}/api/self-care`, { headers }),
        ]);

      const habitsData = await parseResponse(habitsResponse);
      const progressData = await parseResponse(progressResponse);
      const selfCareData = await parseResponse(selfCareResponse);

      if (!habitsResponse.ok) {
        throw new Error(
          habitsData.message || "Unable to load habits."
        );
      }

      if (!progressResponse.ok) {
        throw new Error(
          progressData.message || "Unable to load habit progress."
        );
      }

      if (!selfCareResponse.ok) {
        throw new Error(
          selfCareData.message || "Unable to load self-care entries."
        );
      }

      setHabits(habitsData.habits || []);
      setHabitProgress(progressData.progress || []);
      setSelfCareEntries(selfCareData.entries || []);

      const today = new Date().toISOString().slice(0, 10);
      const todayEntry = (selfCareData.entries || []).find(
        (entry) => String(entry.entry_date).slice(0, 10) === today
      );

      if (todayEntry) {
        setSelfCareForm({
          entry_date: today,
          sleep_hours:
            todayEntry.sleep_hours != null
              ? String(todayEntry.sleep_hours)
              : "",
          water_glasses:
            todayEntry.water_glasses != null
              ? String(todayEntry.water_glasses)
              : "",
          mood: todayEntry.mood || "",
          notes: todayEntry.notes || "",
        });
      }
    } catch (error) {
      console.error("Self-care loading error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to load self-care data."
      );
    } finally {
      setSelfCareLoading(false);
    }
  }

  function handleHabitChange(event) {
    const { name, value } = event.target;

    setHabitForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSelfCareChange(event) {
    const { name, value } = event.target;

    setSelfCareForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreateHabit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSavingHabit(true);
    setSelfCareError("");

    try {
      const response = await fetch(`${API_URL}/api/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitForm),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create habit."
        );
      }

      setHabitForm({
        name: "",
        frequency: "daily",
      });

      await loadSelfCareData();
    } catch (error) {
      console.error("Create habit error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to create habit."
      );
    } finally {
      setSavingHabit(false);
    }
  }

  async function handleToggleHabit(habitId) {
    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSelfCareError("");

    try {
      const response = await fetch(
        `${API_URL}/api/habits/${habitId}/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completion_date: new Date().toISOString().slice(0, 10),
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update habit."
        );
      }

      await loadSelfCareData();
    } catch (error) {
      console.error("Toggle habit error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to update habit."
      );
    }
  }

  async function handleDeleteHabit(habitId) {
    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSelfCareError("");

    try {
      const response = await fetch(
        `${API_URL}/api/habits/${habitId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete habit."
        );
      }

      await loadSelfCareData();
    } catch (error) {
      console.error("Delete habit error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to delete habit."
      );
    }
  }

  async function handleSaveSelfCare(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSavingSelfCare(true);
    setSelfCareError("");

    try {
      const response = await fetch(`${API_URL}/api/self-care`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selfCareForm),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save self-care entry."
        );
      }

      await loadSelfCareData();
    } catch (error) {
      console.error("Save self-care error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to save self-care entry."
      );
    } finally {
      setSavingSelfCare(false);
    }
  }

  async function handleDeleteSelfCare(entryId) {
    const token = localStorage.getItem("token");

    if (!token) {
      setSelfCareError("Please log in again.");
      return;
    }

    setSelfCareError("");

    try {
      const response = await fetch(
        `${API_URL}/api/self-care/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete self-care entry."
        );
      }

      await loadSelfCareData();
    } catch (error) {
      console.error("Delete self-care error:", error);
      setSelfCareError(
        error instanceof Error
          ? error.message
          : "Unable to delete self-care entry."
      );
    }
  }

  /* ---------------------------------------------------------
     FINANCE
  --------------------------------------------------------- */

  useEffect(() => {
    if (!user || activePage !== "finance") return;

    loadFinanceData();
  }, [user, activePage]);


  useEffect(() => {
    if (!user || activePage !== "analytics") return;
    loadAnalyticsData();
  }, [user, activePage]);

  async function loadAnalyticsData() {
    const token = localStorage.getItem("token");

    if (!token) {
      setAnalyticsError("Please log in again.");
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError("");

    try {
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to load analytics.");
      }

      setAnalyticsData(data);
    } catch (error) {
      console.error("Analytics loading error:", error);
      setAnalyticsError(
        error instanceof Error
          ? error.message
          : "Unable to load analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadFinanceData() {
    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    setFinanceLoading(true);
    setFinanceError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        incomeResponse,
        expensesResponse,
        budgetsResponse,
        analyticsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/finance/income`, { headers }),
        fetch(`${API_URL}/api/finance/expenses`, { headers }),
        fetch(`${API_URL}/api/finance/budgets`, { headers }),
        fetch(`${API_URL}/api/finance/analytics`, { headers }),
      ]);

      const incomeData = await parseResponse(incomeResponse);
      const expensesData = await parseResponse(expensesResponse);
      const budgetsData = await parseResponse(budgetsResponse);
      const analyticsData = await parseResponse(analyticsResponse);

      if (!incomeResponse.ok) {
        throw new Error(
          incomeData.message || "Unable to load income."
        );
      }

      if (!expensesResponse.ok) {
        throw new Error(
          expensesData.message || "Unable to load expenses."
        );
      }

      if (!budgetsResponse.ok) {
        throw new Error(
          budgetsData.message || "Unable to load budgets."
        );
      }

      if (!analyticsResponse.ok) {
        throw new Error(
          analyticsData.message || "Unable to load finance analytics."
        );
      }

      const loadedBudgets = budgetsData.budgets || [];

      setFinanceIncome(incomeData.income || []);
      setFinanceExpenses(expensesData.expenses || []);
      setFinanceBudgets(loadedBudgets);
      setFinanceCategoryLimits(budgetsData.categoryLimits || []);
      setFinanceAnalytics(analyticsData);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentBudget = loadedBudgets.find(
        (item) => String(item.month).slice(0, 7) === currentMonth
      );

      setBudgetForm({
        month: currentMonth,
        monthly_budget:
          currentBudget != null
            ? String(currentBudget.monthly_budget)
            : "",
      });
    } catch (error) {
      console.error("Finance loading error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to load finance data."
      );
    } finally {
      setFinanceLoading(false);
    }
  }

  function handleIncomeChange(event) {
    const { name, value } = event.target;

    setIncomeForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleExpenseChange(event) {
    const { name, value } = event.target;

    setExpenseForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleBudgetChange(event) {
    const { name, value } = event.target;

    setBudgetForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCategoryBudgetChange(event) {
    const { name, value } = event.target;

    setCategoryBudgetForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSaveBudget(event) {
    event.preventDefault();

    if (savingFinanceBudget) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    const month = budgetForm.month.trim();
    const monthlyBudget = Number(budgetForm.monthly_budget);

    if (!/^\d{4}-\d{2}$/.test(month)) {
      setFinanceError("Choose a valid budget month.");
      return;
    }

    if (!Number.isFinite(monthlyBudget) || monthlyBudget < 0) {
      setFinanceError("Enter a valid monthly budget.");
      return;
    }

    setSavingFinanceBudget(true);
    setFinanceError("");

    try {
      const response = await fetch(
        `${API_URL}/api/finance/budgets`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month,
            monthly_budget: monthlyBudget,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save monthly budget."
        );
      }

      await loadFinanceData();
    } catch (error) {
      console.error("Save monthly budget error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to save monthly budget."
      );
    } finally {
      setSavingFinanceBudget(false);
    }
  }

  async function handleSaveCategoryBudget(event) {
    event.preventDefault();

    if (savingFinanceBudget) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    const category = categoryBudgetForm.category.trim();
    const monthlyLimit = Number(
      categoryBudgetForm.monthly_limit
    );

    if (!category) {
      setFinanceError("Budget category is required.");
      return;
    }

    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
      setFinanceError("Enter a valid category limit.");
      return;
    }

    setSavingFinanceBudget(true);
    setFinanceError("");

    try {
      const response = await fetch(
        `${API_URL}/api/finance/budgets/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category,
            monthly_limit: monthlyLimit,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save category budget."
        );
      }

      setCategoryBudgetForm({
        category: "",
        monthly_limit: "",
      });

      await loadFinanceData();
    } catch (error) {
      console.error("Save category budget error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to save category budget."
      );
    } finally {
      setSavingFinanceBudget(false);
    }
  }

  async function handleDeleteCategoryBudget(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    setSavingFinanceBudget(true);
    setFinanceError("");

    try {
      const response = await fetch(
        `${API_URL}/api/finance/budgets/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete category budget."
        );
      }

      await loadFinanceData();
    } catch (error) {
      console.error("Delete category budget error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to delete category budget."
      );
    } finally {
      setSavingFinanceBudget(false);
    }
  }

  async function handleCreateIncome(event) {
    event.preventDefault();

    if (savingFinance) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    const source = incomeForm.source.trim();
    const amount = Number(incomeForm.amount);

    if (!source) {
      setFinanceError("Income source is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setFinanceError("Enter a valid income amount.");
      return;
    }

    setSavingFinance(true);
    setFinanceError("");

    try {
      const response = await fetch(
        `${API_URL}/api/finance/income`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            source,
            amount,
            income_date: incomeForm.income_date || null,
            description:
              incomeForm.description.trim() || null,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create income."
        );
      }

      setFinanceIncome((current) =>
        [data.income, ...current]
      );

      setIncomeForm({
        source: "",
        amount: "",
        income_date: new Date()
          .toISOString()
          .slice(0, 10),
        description: "",
      });
    } catch (error) {
      console.error("Create income error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to create income."
      );
    } finally {
      setSavingFinance(false);
    }
  }

  async function handleCreateExpense(event) {
    event.preventDefault();

    if (savingFinance) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    const category = expenseForm.category.trim();
    const amount = Number(expenseForm.amount);

    if (!category) {
      setFinanceError("Expense category is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setFinanceError("Enter a valid expense amount.");
      return;
    }

    setSavingFinance(true);
    setFinanceError("");

    try {
      const response = await fetch(
        `${API_URL}/api/finance/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            category,
            expense_date: expenseForm.expense_date || null,
            description:
              expenseForm.description.trim() || null,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create expense."
        );
      }

      setFinanceExpenses((current) =>
        [data.expense, ...current]
      );

      setExpenseForm({
        amount: "",
        category: "",
        expense_date: new Date()
          .toISOString()
          .slice(0, 10),
        description: "",
      });
    } catch (error) {
      console.error("Create expense error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to create expense."
      );
    } finally {
      setSavingFinance(false);
    }
  }

  async function handleDeleteIncome(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/finance/income/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete income."
        );
      }

      setFinanceIncome((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Delete income error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to delete income."
      );
    }
  }

  async function handleDeleteExpense(id) {
    const token = localStorage.getItem("token");

    if (!token) {
      setFinanceError("Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/finance/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete expense."
        );
      }

      setFinanceExpenses((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Delete expense error:", error);

      setFinanceError(
        error instanceof Error
          ? error.message
          : "Unable to delete expense."
      );
    }
  }

  /* ---------------------------------------------------------
     AUTH CHECK SCREEN
  --------------------------------------------------------- */

  async function handleCreateCalendarEvent(event) {
    event.preventDefault();

    if (!calendarForm.title.trim() || !calendarForm.start_time) {
      setDataError("Event title and start time are required.");
      return;
    }

    try {
      setSavingCalendarEvent(true);
      setDataError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(calendarForm),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to create calendar event.");
      }

      setCalendarEvents((current) => [...current, data.event]);
      setCalendarForm({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
      });
      setShowCalendarForm(false);
    } catch (error) {
      console.error("Create calendar event error:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to create calendar event."
      );
    } finally {
      setSavingCalendarEvent(false);
    }
  }

  async function handleDeleteCalendarEvent(id) {
    try {
      setDataError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/calendar/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete calendar event.");
      }

      setCalendarEvents((current) =>
        current.filter((event) => event.id !== id)
      );
    } catch (error) {
      console.error("Delete calendar event error:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Unable to delete calendar event."
      );
    }
  }

  function handleCalendarFormChange(event) {
    const { name, value } = event.target;

    setCalendarForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetCalendarForm() {
    setCalendarForm({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
    });
  }

  if (checkingAuth) {
  

  return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-spinner" />
          <p className="eyebrow">STUDENT LIFE OS</p>
          <h2>Getting things ready</h2>
          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     AUTH SCREEN
  --------------------------------------------------------- */

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        form={authForm}
        loading={authLoading}
        error={authError}
        onChange={handleAuthChange}
        onSubmit={handleAuthSubmit}
        onSwitch={() => {
          setAuthMode((current) =>
            current === "login" ? "signup" : "login"
          );
          setAuthError("");
        }}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  /* ---------------------------------------------------------
     APP SHELL
  --------------------------------------------------------- */

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={logout}
        user={user}
      />

      <main className="main-content">
        <Topbar
          activePage={activePage}
          user={user}
          loadingData={loadingData}
        />

        {dataError && (
          <div className="data-error">
            <div>
              <strong>Something went wrong</strong>
              <p>{dataError}</p>
            </div>

            <button
              type="button"
              onClick={() => setDataError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="content-area">
          {activePage === "dashboard" && (
            <Dashboard
              user={user}
              courses={courses}
              assignments={assignments}
              exams={exams}
              studySessions={studySessions}
              onStudy={() => {
                setActivePage("study");
                setShowStudyForm(true);
              }}
              onNavigate={setActivePage}
            />
          )}

          {activePage === "study" && (
            <StudyPage
              courses={courses}
              studySessions={studySessions}
              showForm={showStudyForm}
              form={studyForm}
              saving={savingStudySession}
              onOpenForm={() => {
                if (courses.length === 0) {
                  setDataError(
                    "Create a course before logging a study session."
                  );
                  return;
                }

                setDataError("");
                setShowStudyForm(true);
              }}
              onCloseForm={() => {
                resetStudyForm();
                setShowStudyForm(false);
              }}
              onChange={handleStudyChange}
              onSubmit={handleCreateStudySession}
              onDelete={handleDeleteStudySession}
            />
          )}

          {activePage === "courses" && (
            <CoursesPage
              courses={courses}
              showForm={showCourseForm}
              form={courseForm}
              saving={savingCourse}
              onOpenForm={() => {
                setDataError("");
                setShowCourseForm(true);
              }}
              onCloseForm={() => {
                resetCourseForm();
                setShowCourseForm(false);
              }}
              onChange={handleCourseChange}
              onSubmit={handleCreateCourse}
            />
          )}

          {activePage === "tasks" && (
            <TasksPage
              assignments={assignments}
              courses={courses}
              showForm={showAssignmentForm}
              form={assignmentForm}
              saving={savingAssignment}
              onOpenForm={() => {
                if (courses.length === 0) {
                  setDataError("Create a course before adding an assignment.");
                  return;
                }
                setDataError("");
                setShowAssignmentForm(true);
              }}
              onCloseForm={() => {
                resetAssignmentForm();
                setShowAssignmentForm(false);
              }}
              onChange={handleAssignmentChange}
              onSubmit={handleCreateAssignment}
              onToggle={handleToggleAssignment}
              onDelete={handleDeleteAssignment}
            />
          )}

          {activePage === "calendar" && (
            <CalendarPage
              events={calendarEvents}
              showForm={showCalendarForm}
              form={calendarForm}
              saving={savingCalendarEvent}
              onOpenForm={() => {
                setDataError("");
                resetCalendarForm();
                setShowCalendarForm(true);
              }}
              onCloseForm={() => {
                resetCalendarForm();
                setShowCalendarForm(false);
              }}
              onChange={handleCalendarFormChange}
              onSubmit={handleCreateCalendarEvent}
              onDelete={handleDeleteCalendarEvent}
            />
          )}

          {activePage === "nutrition" && (
              <NutritionPage />
            )}

            {activePage === "fitness" && (
            <FitnessPage
              workouts={fitnessWorkouts}
              exercises={fitnessExercises}
              loading={fitnessLoading}
              error={fitnessError}
              showWorkoutForm={showWorkoutForm}
              showExerciseForm={showExerciseForm}
              workoutForm={workoutForm}
              exerciseForm={exerciseForm}
              savingWorkout={savingWorkout}
              savingExercise={savingExercise}
              onOpenWorkout={() => {
                setFitnessError("");
                setShowWorkoutForm(true);
              }}
              onCloseWorkout={() => {
                resetWorkoutForm();
                setShowWorkoutForm(false);
              }}
              onOpenExercise={() => {
                setFitnessError("");
                setShowExerciseForm(true);
              }}
              onCloseExercise={() => {
                resetExerciseForm();
                setShowExerciseForm(false);
              }}
              onWorkoutChange={handleWorkoutChange}
              onExerciseChange={handleExerciseChange}
              onCreateWorkout={handleCreateWorkout}
              onCreateExercise={handleCreateExercise}
              onDeleteWorkout={handleDeleteWorkout}
              onRefresh={loadFitnessData}
            />
          )}

          {activePage === "finance" && (
            <FinancePage
              income={financeIncome}
              expenses={financeExpenses}
              loading={financeLoading}
              error={financeError}
              saving={savingFinance}
              incomeForm={incomeForm}
              expenseForm={expenseForm}
              onIncomeChange={handleIncomeChange}
              onExpenseChange={handleExpenseChange}
              onCreateIncome={handleCreateIncome}
              onCreateExpense={handleCreateExpense}
              onDeleteIncome={handleDeleteIncome}
              onDeleteExpense={handleDeleteExpense}
              financeBudgets={financeBudgets}
              financeCategoryLimits={financeCategoryLimits}
              budgetForm={budgetForm}
              categoryBudgetForm={categoryBudgetForm}
              savingFinanceBudget={savingFinanceBudget}
              onBudgetChange={handleBudgetChange}
              onCategoryBudgetChange={handleCategoryBudgetChange}
              onSaveBudget={handleSaveBudget}
              onSaveCategoryBudget={handleSaveCategoryBudget}
              onDeleteCategoryBudget={handleDeleteCategoryBudget}
              onRefresh={loadFinanceData}
            />
          )}

          {activePage === "self-care" && (
            <SelfCarePage
              habits={habits}
              habitProgress={habitProgress}
              selfCareEntries={selfCareEntries}
              loading={selfCareLoading}
              error={selfCareError}
              savingHabit={savingHabit}
              savingSelfCare={savingSelfCare}
              habitForm={habitForm}
              selfCareForm={selfCareForm}
              onHabitChange={handleHabitChange}
              onSelfCareChange={handleSelfCareChange}
              onCreateHabit={handleCreateHabit}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
              onSaveSelfCare={handleSaveSelfCare}
              onDeleteSelfCare={handleDeleteSelfCare}
              onRefresh={loadSelfCareData}
            />
          )}

          {activePage === "goals" && (
  <GoalsPage />
)}

          {activePage === "career" && <CareerPage />}

          {activePage === "analytics" && (
            <section className="analytics-page">
              <div className="page-header">
                <div>
                  <span className="eyebrow">INSIGHTS</span>
                  <h2>Analytics</h2>
                  <p>See how your student life is progressing across key areas.</p>
                </div>
              </div>

              {analyticsLoading && (
                <div className="analytics-status">Loading analytics...</div>
              )}

              {analyticsError && (
                <div className="analytics-status analytics-error">
                  {analyticsError}
                </div>
              )}

              {analyticsData && !analyticsLoading && (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <span className="analytics-card-label">Tasks</span>
                    <strong>{analyticsData.tasks.completed}/{analyticsData.tasks.total}</strong>
                    <span>{analyticsData.tasks.completionRate}% completed</span>
                    <small>{analyticsData.tasks.pending} pending</small>
                  </div>

                  <div className="analytics-card">
                    <span className="analytics-card-label">Goals</span>
                    <strong>{analyticsData.goals.averageProgress}%</strong>
                    <span>Average progress</span>
                    <small>
                      {analyticsData.goals.completed}/{analyticsData.goals.total} completed
                    </small>
                  </div>

                  <div className="analytics-card">
                    <span className="analytics-card-label">Habits</span>
                    <strong>{analyticsData.habits.active}</strong>
                    <span>Active habits</span>
                    <small>
                      {analyticsData.habits.recentCompletions} completions in the last 7 days
                    </small>
                  </div>

                  <div className="analytics-card">
                    <span className="analytics-card-label">Finance</span>
                    <strong>${analyticsData.finance.remaining.toFixed(2)}</strong>
                    <span>Remaining this month</span>
                    <small>
                      ${analyticsData.finance.income.toFixed(2)} income · ${analyticsData.finance.expenses.toFixed(2)} expenses
                    </small>
                  </div>

                  <div className="analytics-card analytics-card-wide">
                    <span className="analytics-card-label">Career</span>
                    <strong>{analyticsData.career.total}</strong>
                    <span>Total applications</span>
                    <div className="analytics-career-stats">
                      <span>Interested: {analyticsData.career.interested}</span>
                      <span>Applied: {analyticsData.career.applied}</span>
                      <span>Interview: {analyticsData.career.interview}</span>
                      <span>Offers: {analyticsData.career.offers}</span>
                      <span>Rejected: {analyticsData.career.rejected}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activePage === "ai" && (
            <section className="ai-page">
              <div className="page-header">
                <div>
                  <span className="eyebrow">INTELLIGENCE</span>
                  <h2>AI Assistant</h2>
                  <p>Your personal planning assistant for student life.</p>
                </div>
              </div>

              <div className="ai-shell">
                <button
  type="button"
  className="ai-clear-button"
  onClick={() =>
    setAiMessages([
      {
        role: "assistant",
        text: "Hi! I’m ready to help you organize your student life. What would you like to work on?"
      }
    ])
  }
>
  Clear chat
</button>
                <div className="ai-welcome">
                  <div className="ai-icon">✦</div>
                  <div>
                    <h3>How can I help?</h3>
                    <p>
                      Ask me about your tasks, goals, study plans, habits,
                      finances, or career progress.
                    </p>
                  </div>
                </div>

                <div className="ai-suggestions">
                  <button type="button" onClick={() => setAiInput("What should I focus on today?")}>What should I focus on today?</button>
                  <button type="button" onClick={() => setAiInput("Help me plan my week")}>Help me plan my week</button>
                  <button type="button" onClick={() => setAiInput("How am I doing overall?")}>How am I doing overall?</button>
                </div>

                <div className="ai-messages">
                  {aiMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`ai-message ${
                        message.role === "user"
                          ? "ai-message-user"
                          : "ai-message-assistant"
                      }`}
                    >
                      <strong>
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </strong>
                      <p><ReactMarkdown remarkPlugins={[remarkGfm]}>
  {message.text}
</ReactMarkdown></p>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="ai-message ai-message-assistant">
                      <strong>AI Assistant</strong>
                      <p>Thinking...</p>
                    </div>
                  )}
                </div>

                <form className="ai-input-row" onSubmit={sendAiMessage}>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    placeholder="Ask your AI Assistant..."
                    aria-label="Ask your AI Assistant"
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    {aiLoading ? "Thinking..." : "Send"}
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}


/* =========================================================
   FINANCE PAGE
========================================================= */


function SelfCarePage({
  habits,
  habitProgress,
  selfCareEntries,
  loading,
  error,
  savingHabit,
  savingSelfCare,
  habitForm,
  selfCareForm,
  onHabitChange,
  onSelfCareChange,
  onCreateHabit,
  onToggleHabit,
  onDeleteHabit,
  onSaveSelfCare,
  onDeleteSelfCare,
  onRefresh,
}) {
  const activeHabits = habits.filter((habit) => habit.is_active);
  const completedToday = activeHabits.filter(
    (habit) => habit.completed_today
  ).length;

  const completionPercent =
    activeHabits.length > 0
      ? Math.round((completedToday / activeHabits.length) * 100)
      : 0;

  return (
    <section className="page-section self-care-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">SELF-CARE</span>
          <h1>Self-Care & Habits</h1>
          <p>Build healthy routines and keep track of your daily well-being.</p>
        </div>

        <button className="secondary-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {error && <div className="finance-error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <h3>Loading self-care data...</h3>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Today's Habits</span>
              <strong>
                {completedToday}/{activeHabits.length}
              </strong>
            </div>

            <div className="stat-card">
              <span>Today's Progress</span>
              <strong>{completionPercent}%</strong>
            </div>

            <div className="stat-card">
              <span>Active Habits</span>
              <strong>{activeHabits.length}</strong>
            </div>
          </div>

          <div className="content-grid">
            <div className="content-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ROUTINE</span>
                  <h2>My Habits</h2>
                </div>
              </div>

              <form onSubmit={onCreateHabit} className="form-grid">
                <input
                  name="name"
                  value={habitForm.name}
                  onChange={onHabitChange}
                  placeholder="Habit name"
                  required
                />

                <select
                  name="frequency"
                  value={habitForm.frequency}
                  onChange={onHabitChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingHabit}
                >
                  {savingHabit ? "Adding..." : "Add Habit"}
                </button>
              </form>

              <div className="finance-list">
                {activeHabits.length === 0 ? (
                  <div className="empty-state">
                    <h3>No habits yet</h3>
                    <p>Add your first habit above.</p>
                  </div>
                ) : (
                  activeHabits.map((habit) => {
                    const progress = habitProgress.find(
                      (item) => Number(item.id) === Number(habit.id)
                    );

                    return (
                      <div className="finance-row" key={habit.id}>
                        <div>
                          <strong>{habit.name}</strong>
                          <span>
                            {habit.frequency} ·{" "}
                            {progress?.last_7_days || 0} completions in 7 days
                          </span>
                        </div>

                        <div className="finance-row-right">
                          <button
                            className={
                              habit.completed_today
                                ? "primary-button"
                                : "secondary-button"
                            }
                            onClick={() => onToggleHabit(habit.id)}
                          >
                            {habit.completed_today ? "✓ Done" : "Complete"}
                          </button>

                          <button
                            className="danger-button"
                            onClick={() => onDeleteHabit(habit.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="content-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">WELLNESS</span>
                  <h2>Daily Check-In</h2>
                </div>
              </div>

              <form onSubmit={onSaveSelfCare} className="form-grid">
                <label>
                  Date
                  <input
                    type="date"
                    name="entry_date"
                    value={selfCareForm.entry_date}
                    onChange={onSelfCareChange}
                  />
                </label>

                <label>
                  Sleep Hours
                  <input
                    type="number"
                    name="sleep_hours"
                    min="0"
                    max="24"
                    step="0.5"
                    value={selfCareForm.sleep_hours}
                    onChange={onSelfCareChange}
                    placeholder="8"
                  />
                </label>

                <label>
                  Water Glasses
                  <input
                    type="number"
                    name="water_glasses"
                    min="0"
                    max="100"
                    value={selfCareForm.water_glasses}
                    onChange={onSelfCareChange}
                    placeholder="8"
                  />
                </label>

                <label>
                  Mood
                  <select
                    name="mood"
                    value={selfCareForm.mood}
                    onChange={onSelfCareChange}
                  >
                    <option value="">Select mood</option>
                    <option value="great">Great</option>
                    <option value="good">Good</option>
                    <option value="okay">Okay</option>
                    <option value="low">Low</option>
                    <option value="stressed">Stressed</option>
                  </select>
                </label>

                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    value={selfCareForm.notes}
                    onChange={onSelfCareChange}
                    placeholder="How are you feeling today?"
                    rows="4"
                  />
                </label>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingSelfCare}
                >
                  {savingSelfCare ? "Saving..." : "Save Check-In"}
                </button>
              </form>
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HISTORY</span>
                <h2>Recent Self-Care Entries</h2>
              </div>
            </div>

            {selfCareEntries.length === 0 ? (
              <div className="empty-state">
                <h3>No check-ins yet</h3>
                <p>Your saved wellness entries will appear here.</p>
              </div>
            ) : (
              <div className="finance-list">
                {selfCareEntries.map((entry) => (
                  <div className="finance-row" key={entry.id}>
                    <div>
                      <strong>{String(entry.entry_date).slice(0, 10)}</strong>
                      <span>
                        Sleep: {entry.sleep_hours ?? "—"}h · Water:{" "}
                        {entry.water_glasses ?? "—"} glasses · Mood:{" "}
                        {entry.mood || "—"}
                      </span>
                      {entry.notes && <p>{entry.notes}</p>}
                    </div>

                    <div className="finance-row-right">
                      <button
                        className="danger-button"
                        onClick={() => onDeleteSelfCare(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}


function CareerPage() {
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company: "",
    role: "",
    application_date: "",
    status: "Interested",
    interview_date: "",
    notes: "",
  });

  const loadCareer = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [applicationsResponse, skillsResponse, mySkillsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/career/applications`, { headers }),
          fetch(`${API_URL}/api/career/skills`, { headers }),
          fetch(`${API_URL}/api/career/my-skills`, { headers }),
        ]);

      const applicationsData = await applicationsResponse.json();
      const skillsData = await skillsResponse.json();
      const mySkillsData = await mySkillsResponse.json();

      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.message || "Failed to load applications."
        );
      }

      if (!skillsResponse.ok) {
        throw new Error(skillsData.message || "Failed to load skills.");
      }

      if (!mySkillsResponse.ok) {
        throw new Error(
          mySkillsData.message || "Failed to load your skills."
        );
      }

      setApplications(applicationsData);
      setSkills(skillsData);
      setMySkills(mySkillsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareer();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateApplication = async (event) => {
    event.preventDefault();

    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and role are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/career/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add application.");
      }

      setApplications((previous) => [data, ...previous]);
      setForm({
        company: "",
        role: "",
        application_date: "",
        status: "Interested",
        interview_date: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/career/applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete application.");
      }

      setApplications((previous) =>
        previous.filter((application) => application.id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditApplication = async (application) => {
    const company = window.prompt("Company", application.company);
    if (company === null) return;

    const role = window.prompt("Role", application.role);
    if (role === null) return;

    const status = window.prompt(
      "Status (Interested, Applied, Interview, Offer, Rejected)",
      application.status
    );
    if (status === null) return;

    const notes = window.prompt("Notes", application.notes || "");
    if (notes === null) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/career/applications/${application.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company,
            role,
            application_date: application.application_date
              ? application.application_date.slice(0, 10)
              : "",
            status,
            interview_date: application.interview_date
              ? application.interview_date.slice(0, 10)
              : "",
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update application.");
      }

      setApplications((previous) =>
        previous.map((item) =>
          item.id === application.id ? data : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSkill = async (skillName) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/career/my-skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: skillName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add skill.");
      }

      await loadCareer();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/career/my-skills/${skillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove skill.");
      }

      setMySkills((previous) =>
        previous.filter((skill) => skill.id !== skillId)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const mySkillIds = new Set(mySkills.map((skill) => skill.id));
  const availableSkills = skills.filter((skill) => !mySkillIds.has(skill.id));

  const totalApplications = applications.length;
  const interviews = applications.filter(
    (application) => application.status === "Interview"
  ).length;
  const offers = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Career</h1>
          <p>Track applications, interviews, and the skills you are building.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Applications</span>
          <strong>{totalApplications}</strong>
        </div>
        <div className="stat-card">
          <span>Interviews</span>
          <strong>{interviews}</strong>
        </div>
        <div className="stat-card">
          <span>Offers</span>
          <strong>{offers}</strong>
        </div>
        <div className="stat-card">
          <span>Skills</span>
          <strong>{mySkills.length}</strong>
        </div>
      </div>

      <div className="content-grid">
        <section className="content-card">
          <div className="content-card-header">
            <div>
              <h2>Add Application</h2>
              <p>Keep every opportunity organized in one place.</p>
            </div>
          </div>

          <form onSubmit={handleCreateApplication} className="form-grid">
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company"
            />

            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Role"
            />

            <label>
              Application date
              <input
                type="date"
                name="application_date"
                value={form.application_date}
                onChange={handleChange}
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Interested</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </label>

            <label>
              Interview date
              <input
                type="date"
                name="interview_date"
                value={form.interview_date}
                onChange={handleChange}
              />
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              rows="3"
            />

            <button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add Application"}
            </button>
          </form>
        </section>

        <section className="content-card">
          <div className="content-card-header">
            <div>
              <h2>My Skills</h2>
              <p>Build a profile of the skills you want to showcase.</p>
            </div>
          </div>

          <div className="skill-list">
            {mySkills.length === 0 ? (
              <p className="empty-state">No skills added yet.</p>
            ) : (
              mySkills.map((skill) => (
                <div className="skill-row" key={skill.id}>
                  <div>
                    <strong>{skill.name}</strong>
                    <span>{skill.category || "General"}</span>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleRemoveSkill(skill.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="skill-picker">
            <h3>Add a skill</h3>
            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                const input = event.currentTarget.elements.skillName;
                const name = input.value.trim();

                if (!name) {
                  setError("Please enter a skill.");
                  return;
                }

                handleAddSkill(name);
                input.value = "";
              }}
            >
              <input
                name="skillName"
                type="text"
                placeholder="Type a skill..."
                maxLength="100"
              />
              <button type="submit" className="secondary-button">
                + Add Skill
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Applications</h2>
            <p>Your current job and internship pipeline.</p>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading career data...</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">
            No applications yet. Add your first opportunity above.
          </p>
        ) : (
          <div className="application-list">
            {applications.map((application) => (
              <div className="application-row" key={application.id}>
                <div>
                  <strong>{application.company}</strong>
                  <span>{application.role}</span>
                  {application.notes && <p>{application.notes}</p>}
                </div>

                <div className="application-meta">
                  <span
  className={`application-status status-${application.status
    .toLowerCase()
    .replace(/\s+/g, "-")}`}
>
  {application.status}
</span>
                  {application.application_date && (
                    <small>
                      Applied {application.application_date.slice(0, 10)}
                    </small>
                  )}
                  {application.interview_date && (
                    <small>
                      Interview {application.interview_date.slice(0, 10)}
                    </small>
                  )}
                </div>
              <div className="application-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleEditApplication(application)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteApplication(application.id)}
                >
                  Delete
                </button>
              </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Academic",
    description: "",
    deadline: "",
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load goals.");
      }

      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateGoal = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create goal.");
      }

      setGoals((previous) => [data, ...previous]);

      setForm({
        title: "",
        category: "Academic",
        description: "",
        deadline: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/goals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete goal.");
      }

      setGoals((previous) =>
        previous.filter((goal) => goal.id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProgressChange = async (goal, progress) => {
    const numericProgress = Number(progress);

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: goal.title,
          category: goal.category,
          description: goal.description,
          deadline: goal.deadline,
          progress: numericProgress,
          completed: numericProgress === 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update progress.");
      }

      setGoals((previous) =>
        previous.map((item) =>
          item.id === goal.id ? data : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const completedGoals = goals.filter((goal) => goal.completed).length;

  return (
    <section className="page-section goals-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">GOALS</span>
          <h1>My Goals</h1>
          <p>Set goals, track progress, and keep moving forward.</p>
        </div>

        <div className="finance-row">
          <span>Completed</span>
          <strong>
            {completedGoals}/{goals.length}
          </strong>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="card">
        <h2>Create a Goal</h2>

        <form onSubmit={handleCreateGoal}>
          <div className="form-grid">
            <div>
              <label>Goal Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Get an A in CSE 220"
              />
            </div>

            <div>
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Academic</option>
                <option>Career</option>
                <option>Fitness</option>
                <option>Personal</option>
              </select>
            </div>

            <div>
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What do you want to accomplish?"
                rows="3"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Goal"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>My Goals</h2>

        {loading ? (
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <h3>No goals yet</h3>
            <p>Create your first goal above.</p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => (
              <div className="goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <div>
                    <span className="goal-category">
                      {goal.category || "Personal"}
                    </span>

                    <h3>{goal.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    Delete
                  </button>
                </div>

                {goal.description && (
                  <p>{goal.description}</p>
                )}

                {goal.deadline && (
                  <small>
                    Deadline: {goal.deadline}
                  </small>
                )}

                <div className="goal-progress">
                  <div className="goal-progress-header">
                    <span>Progress</span>
                    <strong>{goal.progress}%</strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goal.progress}
                    onChange={(event) =>
                      handleProgressChange(
                        goal,
                        event.target.value
                      )
                    }
                  />
                </div>

                {goal.completed && (
                  <div className="goal-complete">
                    ✓ Goal completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FinancePage({
  income,
  expenses,
  loading,
  error,
  saving,
  incomeForm,
  expenseForm,
  onIncomeChange,
  onExpenseChange,
  onCreateIncome,
  onCreateExpense,
  onDeleteIncome,
  onDeleteExpense,
  financeAnalytics,
  savingFinanceBudget,
  onSaveBudget,
  onSaveCategoryBudget,
  onDeleteCategoryBudget,
  budgetForm,
  categoryBudgetForm,
  onBudgetChange,
  onCategoryBudgetChange,
  financeBudgets,
  financeCategoryLimits,
  onRefresh,
}) {
  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  return (
    <section className="finance-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h2>Know where your money goes.</h2>
          <p>
            Track income and expenses in one place.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="finance-error">
          <div>
            <strong>Finance error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          label="Total income"
          value={`$${totalIncome.toFixed(2)}`}
          description="All recorded income"
        />

        <StatCard
          label="Total expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          description="All recorded expenses"
        />

        <StatCard
          label="Balance"
          value={`$${balance.toFixed(2)}`}
          description="Income minus expenses"
        />

        <StatCard
          label="Transactions"
          value={income.length + expenses.length}
          description="Income and expense entries"
        />
      </div>

      <div className="content-grid finance-form-grid">
        <section className="content-card form-card">
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">INCOME</p>
              <h3>Add income</h3>
            </div>
          </div>

          <form onSubmit={onCreateIncome}>
            <div className="form-grid">
              <label>
                <span>Source</span>
                <input
                  type="text"
                  name="source"
                  value={incomeForm.source}
                  onChange={onIncomeChange}
                  placeholder="e.g. Part-time job"
                />
              </label>

              <label>
                <span>Amount</span>
                <input
                  type="number"
                  name="amount"
                  value={incomeForm.amount}
                  onChange={onIncomeChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </label>

              <label>
                <span>Date</span>
                <input
                  type="date"
                  name="income_date"
                  value={incomeForm.income_date}
                  onChange={onIncomeChange}
                />
              </label>

              <label>
                <span>Description</span>
                <input
                  type="text"
                  name="description"
                  value={incomeForm.description}
                  onChange={onIncomeChange}
                  placeholder="Optional"
                />
              </label>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add income"}
            </button>
          </form>
        </section>

        <section className="content-card form-card">
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">EXPENSES</p>
              <h3>Add expense</h3>
            </div>
          </div>

          <form onSubmit={onCreateExpense}>
            <div className="form-grid">
              <label>
                <span>Amount</span>
                <input
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={onExpenseChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </label>

              <label>
                <span>Category</span>
                <input
                  type="text"
                  name="category"
                  value={expenseForm.category}
                  onChange={onExpenseChange}
                  placeholder="e.g. Food"
                />
              </label>

              <label>
                <span>Date</span>
                <input
                  type="date"
                  name="expense_date"
                  value={expenseForm.expense_date}
                  onChange={onExpenseChange}
                />
              </label>

              <label>
                <span>Description</span>
                <input
                  type="text"
                  name="description"
                  value={expenseForm.description}
                  onChange={onExpenseChange}
                  placeholder="Optional"
                />
              </label>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add expense"}
            </button>
          </form>
        </section>
      </div>

      <div className="content-grid finance-form-grid">
        <section className="content-card form-card">
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">MONTHLY BUDGET</p>
              <h3>Set your monthly budget</h3>
            </div>
          </div>

          <form onSubmit={onSaveBudget}>
            <div className="form-grid">
              <label>
                <span>Month</span>
                <input
                  type="month"
                  name="month"
                  value={budgetForm.month}
                  onChange={onBudgetChange}
                />
              </label>

              <label>
                <span>Monthly budget</span>
                <input
                  type="number"
                  name="monthly_budget"
                  value={budgetForm.monthly_budget}
                  onChange={onBudgetChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={savingFinanceBudget}
            >
              {savingFinanceBudget ? "Saving..." : "Save budget"}
            </button>
          </form>
        </section>

        <section className="content-card form-card">
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">CATEGORY LIMITS</p>
              <h3>Set spending limits</h3>
            </div>
          </div>

          <form onSubmit={onSaveCategoryBudget}>
            <div className="form-grid">
              <label>
                <span>Category</span>
                <input
                  type="text"
                  name="category"
                  value={categoryBudgetForm.category}
                  onChange={onCategoryBudgetChange}
                  placeholder="e.g. Dining"
                />
              </label>

              <label>
                <span>Monthly limit</span>
                <input
                  type="number"
                  name="monthly_limit"
                  value={categoryBudgetForm.monthly_limit}
                  onChange={onCategoryBudgetChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={savingFinanceBudget}
            >
              {savingFinanceBudget ? "Saving..." : "Save category limit"}
            </button>
          </form>

          {financeCategoryLimits.length > 0 && (
            <div className="finance-list">
              {financeCategoryLimits.map((item) => (
                <div className="finance-row" key={item.id}>
                  <div>
                    <strong>{item.category}</strong>
                    <span>
                      ${Number(item.monthly_limit).toFixed(2)} / month
                    </span>
                  </div>

                  <button
                    type="button"
                    className="text-button danger-text"
                    onClick={() => onDeleteCategoryBudget(item.id)}
                    disabled={savingFinanceBudget}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);

        const currentBudget = financeBudgets.find(
          (item) => String(item.month).slice(0, 7) === currentMonth
        );

        const currentExpenses = expenses
          .filter(
            (item) =>
              String(item.expense_date).slice(0, 7) === currentMonth
          )
          .reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          );

        const monthlyBudget = currentBudget
          ? Number(currentBudget.monthly_budget || 0)
          : 0;

        const remaining = monthlyBudget - currentExpenses;

        return (
          <section className="content-card">
            <div className="card-header">
              <div>
                <section className="content-card">
  <div className="card-header">
    <div>
      <p className="eyebrow">FINANCE ANALYTICS</p>
      <h3>Monthly overview</h3>
    </div>
  </div>

  {financeAnalytics?.summary && (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted-text">Monthly income</span>
          <strong>${Number(financeAnalytics.summary.monthlyIncome || 0).toFixed(2)}</strong>
        </div>

        <div className="stat-card">
          <span className="muted-text">Monthly expenses</span>
          <strong>${Number(financeAnalytics.summary.monthlyExpenses || 0).toFixed(2)}</strong>
        </div>

        <div className="stat-card">
          <span className="muted-text">Monthly balance</span>
          <strong>${Number(financeAnalytics.summary.monthlyBalance || 0).toFixed(2)}</strong>
        </div>

        <div className="stat-card">
          <span className="muted-text">Budget remaining</span>
          <strong>${Number(financeAnalytics.summary.remainingBudget || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="finance-lists-grid">
        <div className="finance-list">
          <div className="form-card-heading">
            <h4>Spending by category</h4>
          </div>

          {financeAnalytics.spendingByCategory?.length > 0 ? (
            financeAnalytics.spendingByCategory.map((item) => (
              <div className="finance-row" key={item.category}>
                <div>
                  <strong>{item.category}</strong>
                </div>
                <div className="finance-row-right">
                  <strong>${Number(item.total || 0).toFixed(2)}</strong>
                </div>
              </div>
            ))
          ) : (
            <p className="muted-text">No spending recorded this month.</p>
          )}
        </div>

        <div className="finance-list">
          <div className="form-card-heading">
            <h4>Daily spending</h4>
          </div>

          {financeAnalytics.dailySpending?.length > 0 ? (
            financeAnalytics.dailySpending.map((item) => (
              <div className="finance-row" key={item.date}>
                <div>
                  <strong>{item.date}</strong>
                </div>
                <div className="finance-row-right">
                  <strong>${Number(item.total || 0).toFixed(2)}</strong>
                </div>
              </div>
            ))
          ) : (
            <p className="muted-text">No daily spending recorded this month.</p>
          )}
        </div>
      </div>
    </>
  )}
</section>

<p className="eyebrow">BUDGET OVERVIEW</p>
                <h3>Current month</h3>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                label="Monthly budget"
                value={`$${monthlyBudget.toFixed(2)}`}
                description="Current month's budget"
              />
              <StatCard
                label="Spent"
                value={`$${currentExpenses.toFixed(2)}`}
                description="Expenses recorded this month"
              />
              <StatCard
                label="Remaining"
                value={`$${remaining.toFixed(2)}`}
                description="Budget minus current spending"
              />
            </div>
          </section>
        );
      })()}

      <div className="content-grid finance-lists-grid">
        <section className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">INCOME HISTORY</p>
              <h3>Recent income</h3>
            </div>
          </div>

          {income.length === 0 ? (
            <EmptyState
              title="No income yet"
              description="Add your first income source above."
            />
          ) : (
            <div className="finance-list">
              {income.map((item) => (
                <div className="finance-row" key={item.id}>
                  <div>
                    <strong>{item.source}</strong>
                    <span>
                      {formatDate(item.income_date)}
                      {item.description
                        ? ` · ${item.description}`
                        : ""}
                    </span>
                  </div>

                  <div className="finance-row-right">
                    <strong>
                      +${Number(item.amount).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="text-button danger-text"
                      onClick={() =>
                        onDeleteIncome(item.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">EXPENSE HISTORY</p>
              <h3>Recent expenses</h3>
            </div>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense above."
            />
          ) : (
            <div className="finance-list">
              {expenses.map((item) => (
                <div className="finance-row" key={item.id}>
                  <div>
                    <strong>{item.category}</strong>
                    <span>
                      {formatDate(item.expense_date)}
                      {item.description
                        ? ` · ${item.description}`
                        : ""}
                    </span>
                  </div>

                  <div className="finance-row-right">
                    <strong>
                      -${Number(item.amount).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      className="text-button danger-text"
                      onClick={() =>
                        onDeleteExpense(item.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   AUTH SCREEN
========================================================= */

function AuthScreen({
  mode,
  form,
  loading,
  error,
  onChange,
  onSubmit,
  onSwitch,
  onGoogleLogin,
}) {
  const isLogin = mode === "login";

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        <div className="auth-brand-panel">
          <div className="auth-brand">
            <div className="brand-mark large">S</div>

            <div>
              <strong>Student Life OS</strong>
              <span>Your personal operating system</span>
            </div>
          </div>

          <div className="auth-hero">
            <p className="eyebrow">ONE SYSTEM. YOUR WHOLE LIFE.</p>

            <h1>
              Stop managing
              <br />
              your life in
              <br />
              <span>ten different places.</span>
            </h1>

            <p>
              Bring your academics, routines, goals, fitness,
              finances, career, and daily priorities into one
              organized system.
            </p>
          </div>

          <div className="auth-feature-list">
            <span>01 — Plan your day</span>
            <span>02 — Track your progress</span>
            <span>03 — Build consistency</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="mobile-brand">
              <div className="brand-mark">S</div>
              <strong>Student Life OS</strong>
            </div>

            <div className="auth-card-heading">
              <p className="eyebrow">
                {isLogin ? "WELCOME BACK" : "GET STARTED"}
              </p>

              <h2>
                {isLogin
                  ? "Welcome back."
                  : "Build your system."}
              </h2>

              <p>
                {isLogin
                  ? "Sign in to continue."
                  : "Create your account and start organizing your student life."}
              </p>
            </div>

            {error && (
              <div className="auth-message">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="auth-form">
              {!isLogin && (
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                />
              </label>

              <button
                className="primary-button full-width"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <GoogleLogin
                onSuccess={onGoogleLogin}
                onError={() => {
                  setAuthError("Google sign-in was cancelled or failed.");
                }}
                useOneTap={false}
              />
            </div>

            <div className="auth-switch">
              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>

              <button type="button" onClick={onSwitch}>
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  activePage,
  onNavigate,
  onLogout,
  user,
}) {
  const navigation = [
    {
      section: "Overview",
      items: [
        ["dashboard", "Dashboard"],
        ["calendar", "Calendar"],
      ],
    },
    {
      section: "Life",
      items: [
        ["study", "Study"],
        ["courses", "Courses"],
        ["tasks", "Tasks"],
        ["fitness", "Fitness"],
        ["nutrition", "Nutrition"],
      ],
    },
    {
      section: "Personal",
      items: [
        ["finance", "Finance"],
        ["self-care", "Self-Care"],
        ["goals", "Goals"],
        ["career", "Career"],
      ],
    },
    {
      section: "Insights",
      items: [
        ["analytics", "Analytics"],
        ["ai", "AI Assistant"],
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <div className="brand-mark small">S</div>

          <div>
            <strong>Student Life OS</strong>
            <span>Personal operating system</span>
          </div>
        </button>

        <nav className="sidebar-nav">
          {navigation.map((group) => (
            <div className="nav-group" key={group.section}>
              <p>{group.section}</p>

              {group.items.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={
                    activePage === id
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => onNavigate(id)}
                >
                  <span className="nav-icon">
                    {getNavIcon(id)}
                  </span>

                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="avatar small-avatar">
            {getInitials(user.name)}
          </div>

          <div className="profile-text">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  activePage,
  user,
  loadingData,
}) {
  const now = new Date();

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <p>{formatLongDate(now)}</p>
        {activePage !== "goals" && (
          <h1>{getPageTitle(activePage)}</h1>
        )}
      </div>

      <div className="topbar-right">
        {loadingData && (
          <span className="sync-status">
            Syncing
          </span>
        )}

        <div className="topbar-user">
          <div className="avatar">
            {getInitials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  courses,
  assignments,
  exams,
  studySessions,
  onStudy,
  onNavigate,
}) {
  const completedAssignments = assignments.filter(
    (assignment) => assignment.completed
  ).length;

  const totalStudyMinutes = studySessions.reduce(
    (total, session) =>
      total + Number(session.duration_minutes || 0),
    0
  );

  const upcomingAssignments = assignments
    .filter((assignment) => !assignment.completed)
    .sort(
      (a, b) =>
        new Date(a.due_date || 0) -
        new Date(b.due_date || 0)
    )
    .slice(0, 4);

  const upcomingExams = [...exams]
    .sort(
      (a, b) =>
        new Date(a.exam_date) -
        new Date(b.exam_date)
    )
    .slice(0, 3);

  const firstName = user.name.split(" ")[0];

  const todaysFocus = [
    ...upcomingAssignments.map((assignment) => ({
      id: `assignment-${assignment.id}`,
      type: "Assignment",
      title: assignment.title,
      course: assignment.course_code || "Course",
      date: assignment.due_date,
      action: "tasks",
    })),
    ...upcomingExams.map((exam) => ({
      id: `exam-${exam.id}`,
      type: "Exam",
      title: exam.title,
      course: exam.course_code || "Course",
      date: exam.exam_date,
      action: "study",
    })),
  ]
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .slice(0, 3);

  return (
    <section className="page dashboard-page">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">YOUR DAY</p>

          <h2>
            Good to see you,
            <br />
            <span>{firstName}.</span>
          </h2>

          <p className="dashboard-subtitle">
            Here's what needs your attention today.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate("courses")}
          >
            View courses
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onStudy}
          >
            + Log study
          </button>
        </div>
      </div>

      <div className="dashboard-overview">
        <div className="overview-main">
          <div className="overview-label">
            <span className="status-dot" />
            STUDENT LIFE OVERVIEW
          </div>

          <div className="overview-value">
            {getDashboardProgress(
              completedAssignments,
              assignments.length,
              studySessions.length
            )}
            <span>%</span>
          </div>

          <p>
            Your current academic activity is building
            momentum. Keep showing up consistently.
          </p>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${getDashboardProgress(
                  completedAssignments,
                  assignments.length,
                  studySessions.length
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="overview-side">
          <MiniMetric
            value={courses.length}
            label="Courses"
          />

          <MiniMetric
            value={`${Math.floor(
              totalStudyMinutes / 60
            )}h ${totalStudyMinutes % 60}m`}
            label="Study logged"
          />

          <MiniMetric
            value={`${completedAssignments}/${assignments.length}`}
            label="Assignments"
          />

          <MiniMetric
            value={upcomingExams.length}
            label="Upcoming exams"
          />
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">ATTENTION</p>
          <h3>What's next</h3>
        </div>

        <span>
          {upcomingAssignments.length +
            upcomingExams.length}{" "}
          items
        </span>
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">ACADEMIC</p>
              <h3>Assignments</h3>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("tasks")}
            >
              View all
            </button>
          </div>

          {upcomingAssignments.length === 0 ? (
            <EmptyState
              title="You're caught up."
              description="No pending assignments right now."
            />
          ) : (
            <div className="priority-list">
              {upcomingAssignments.map((assignment) => (
                <div
                  className="priority-item"
                  key={assignment.id}
                >
                  <div className="priority-marker" />

                  <div className="priority-content">
                    <strong>{assignment.title}</strong>

                    <span>
                      {assignment.course_code ||
                        "Course"}
                    </span>
                  </div>

                  <div className="priority-date">
                    {formatDate(
                      assignment.due_date
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">ACADEMIC</p>
              <h3>Upcoming exams</h3>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("study")}
            >
              Plan study
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <EmptyState
              title="No exams scheduled."
              description="Your upcoming exams will appear here."
            />
          ) : (
            <div className="priority-list">
              {upcomingExams.map((exam) => (
                <div
                  className="priority-item"
                  key={exam.id}
                >
                  <div className="exam-date-block">
                    <strong>
                      {new Date(
                        exam.exam_date
                      ).getDate()}
                    </strong>

                    <span>
                      {new Date(
                        exam.exam_date
                      ).toLocaleDateString([], {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="priority-content">
                    <strong>{exam.title}</strong>

                    <span>
                      {exam.course_code ||
                        "Course"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">TODAY</p>
          <h3>Today's focus</h3>
        </div>
        <span>{todaysFocus.length} priorities</span>
      </div>

      <section className="content-card dashboard-focus-card">
        {todaysFocus.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">✓</div>
            <div>
              <strong>You're clear for now.</strong>
              <p>No upcoming assignments or exams need your attention.</p>
            </div>
          </div>
        ) : (
          <div className="focus-list">
            {todaysFocus.map((item, index) => (
              <button
                type="button"
                className="focus-item"
                key={item.id}
                onClick={() => onNavigate(item.action)}
              >
                <span className="focus-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="focus-content">
                  <strong>{item.title}</strong>
                  <span>
                    {item.type} · {item.course}
                  </span>
                </span>
                <span className="focus-date">{formatDate(item.date)}</span>
                <span className="focus-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">ACTIVITY</p>
          <h3>Recent study</h3>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => onNavigate("study")}
        >
          Open study
        </button>
      </div>

      <section className="content-card">
        {studySessions.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">+</div>

            <div>
              <strong>Start your study history.</strong>
              <p>
                Log your first focused session and
                start building useful data about
                your study habits.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={onStudy}
            >
              Log first session
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {studySessions
              .slice(0, 5)
              .map((session) => (
                <div
                  className="activity-row"
                  key={session.id}
                >
                  <div className="activity-icon">
                    ◈
                  </div>

                  <div className="activity-info">
                    <strong>
                      {session.topic}
                    </strong>

                    <span>
                      {session.course_code ||
                        "Course"}{" "}
                      ·{" "}
                      {formatDateTime(
                        session.session_date
                      )}
                    </span>
                  </div>

                  <strong className="activity-duration">
                    {session.duration_minutes}m
                  </strong>
                </div>
              ))}
          </div>
        )}
      </section>
    </section>
  );
}

/* =========================================================
   TASKS
========================================================= */

function CalendarPage({
  events,
  showForm,
  form,
  saving,
  onOpenForm,
  onCloseForm,
  onChange,
  onSubmit,
  onDelete,
}) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const monthName = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  function previousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function formatEventTime(event) {
    if (!event.start_time) return "";

    const date = new Date(event.start_time);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function eventsForDay(day) {
    if (!day) return [];

    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return events.filter((event) => event.start_time?.slice(0, 10) === date);
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">PLANNING</p>
          <h1>Calendar</h1>
          <p className="page-description">
            Keep classes, study sessions, exams, work, and personal events in
            one place.
          </p>
        </div>

        <button className="primary-button" onClick={onOpenForm}>
          + Add Event
        </button>
      </section>

      {showForm && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NEW EVENT</p>
              <h2>Add Calendar Event</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g. CSE 220 Exam"
                required
              />
            </label>

            <label>
              Start Date & Time
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={onChange}
                required
              />
            </label>

            <label>
              End Time
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={onChange}
              />
            </label>

            <label>
              Event Type
              <select
                name="event_type"
                value={form.event_type || "Personal"}
                onChange={onChange}
              >
                <option value="Class">Class</option>
                <option value="Study">Study</option>
                <option value="Exam">Exam</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                placeholder="Optional"
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Optional"
                rows="3"
              />
            </label>

            <div className="form-actions full-width">
              <button
                type="button"
                className="secondary-button"
                onClick={onCloseForm}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : "Save Event"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card calendar-card">
        <div className="calendar-header">
          <button className="secondary-button" onClick={previousMonth}>
            ←
          </button>

          <h2>{monthName}</h2>

          <button className="secondary-button" onClick={nextMonth}>
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((day, index) => {
            const dayEvents = eventsForDay(day);

            return (
              <div
                className={`calendar-day ${day ? "" : "calendar-day-empty"}`}
                key={`${year}-${month}-${index}`}
              >
                {day && (
                  <>
                    <div className="calendar-day-number">{day}</div>

                    <div className="calendar-events">
                      {dayEvents.map((event) => (
                        <div className="calendar-event" key={event.id}>
                          <div>
                            <strong>{event.title}</strong>

                            {event.start_time && (
                              <span>{formatEventTime(event)}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onDelete(event.id)}
                            aria-label={`Delete ${event.title}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TasksPage({
  assignments,
  courses,
  showForm,
  form,
  saving,
  onOpenForm,
  onCloseForm,
  onChange,
  onSubmit,
  onToggle,
  onDelete,
}) {
  const pendingAssignments = assignments
    .filter((assignment) => !assignment.completed)
    .sort(
      (a, b) =>
        new Date(a.due_date || 0) - new Date(b.due_date || 0)
    );

  const completedAssignments = assignments
    .filter((assignment) => assignment.completed)
    .sort(
      (a, b) =>
        new Date(b.due_date || 0) - new Date(a.due_date || 0)
    );

  return (
    <section className="page tasks-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">ACADEMIC SYSTEM</p>
          <h2>Stay ahead of your work.</h2>
          <p>
            Keep assignments organized, connected to your courses, and easy
            to check off.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onOpenForm}
        >
          + Add assignment
        </button>
      </div>

      {showForm && (
        <section className="content-card form-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">NEW TASK</p>
              <h3>Add assignment</h3>
            </div>
          </div>

          <form className="stacked-form" onSubmit={onSubmit}>
            <div className="form-grid">
              <label>
                Assignment title
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="e.g. Database project"
                  required
                />
              </label>

              <label>
                Course
                <select
                  name="course_id"
                  value={form.course_id}
                  onChange={onChange}
                  required
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} — {course.course_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Due date
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="form-field-wide">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows="3"
                  placeholder="Optional notes about the assignment"
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onCloseForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save assignment"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="section-heading">
        <div>
          <p className="eyebrow">PENDING</p>
          <h3>Assignments to finish</h3>
        </div>
        <span>{pendingAssignments.length} open</span>
      </div>

      <section className="content-card">
        {pendingAssignments.length === 0 ? (
          <EmptyState
            title="You're caught up."
            description="No pending assignments right now."
          />
        ) : (
          <div className="task-list">
            {pendingAssignments.map((assignment) => (
              <div className="task-row" key={assignment.id}>
                <label className="task-check">
                  <input
                    type="checkbox"
                    checked={Boolean(assignment.completed)}
                    onChange={() => onToggle(assignment)}
                  />
                  <span className="task-checkmark" />
                </label>

                <div className="task-content">
                  <strong>{assignment.title}</strong>
                  <span>
                    {assignment.course_code || "Course"}
                    {" · "}
                    Due {formatDate(assignment.due_date)}
                  </span>
                  {assignment.description && (
                    <p>{assignment.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDelete(assignment.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {completedAssignments.length > 0 && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMPLETED</p>
              <h3>Finished work</h3>
            </div>
            <span>{completedAssignments.length} done</span>
          </div>

          <section className="content-card">
            <div className="task-list">
              {completedAssignments.map((assignment) => (
                <div className="task-row task-row-completed" key={assignment.id}>
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => onToggle(assignment)}
                    />
                    <span className="task-checkmark" />
                  </label>

                  <div className="task-content">
                    <strong>{assignment.title}</strong>
                    <span>
                      {assignment.course_code || "Course"}
                      {" · "}
                      Completed
                    </span>
                  </div>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(assignment.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

/* =========================================================
   STUDY
========================================================= */

function StudyPage({
  courses,
  studySessions,
  showForm,
  form,
  saving,
  onOpenForm,
  onCloseForm,
  onChange,
  onSubmit,
  onDelete,
}) {
  const totalMinutes = studySessions.reduce(
    (total, session) =>
      total + Number(session.duration_minutes || 0),
    0
  );

  return (
    <section className="page study-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">ACADEMIC SYSTEM</p>
          <h2>Study with intention.</h2>
          <p>
            Build a history of focused work so your
            future planning can be based on real data.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onOpenForm}
        >
          + Log study session
        </button>
      </div>

      <div className="study-summary">
        <MiniMetric
          value={studySessions.length}
          label="Sessions"
        />

        <MiniMetric
          value={`${Math.floor(
            totalMinutes / 60
          )}h ${totalMinutes % 60}m`}
          label="Total study"
        />

        <MiniMetric
          value={
            studySessions.length
              ? Math.round(
                  totalMinutes /
                    studySessions.length
                )
              : 0
          }
          label="Avg. minutes"
        />
      </div>

      {showForm && (
        <StudySessionForm
          courses={courses}
          form={form}
          saving={saving}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCloseForm}
        />
      )}

      <section className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">HISTORY</p>
            <h3>Study sessions</h3>
          </div>

          <span className="card-count">
            {studySessions.length}
          </span>
        </div>

        {studySessions.length === 0 ? (
          <EmptyState
            title="No sessions yet."
            description="Your study history will appear here."
          />
        ) : (
          <div className="study-history">
            {studySessions.map((session) => (
              <div
                className="study-history-row"
                key={session.id}
              >
                <div className="study-time">
                  <strong>
                    {session.duration_minutes}
                  </strong>
                  <span>min</span>
                </div>

                <div className="study-history-info">
                  <strong>{session.topic}</strong>

                  <span>
                    {session.course_code ||
                      "Course"}{" "}
                    ·{" "}
                    {formatDateTime(
                      session.session_date
                    )}
                  </span>

                  {session.notes && (
                    <p>{session.notes}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="icon-danger"
                  onClick={() =>
                    onDelete(session.id)
                  }
                  aria-label="Delete study session"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

/* =========================================================
   STUDY FORM
========================================================= */

function StudySessionForm({
  courses,
  form,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="content-card form-card">
      <div className="form-card-heading">
        <div>
          <p className="eyebrow">NEW SESSION</p>
          <h3>Log focused work</h3>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={onCancel}
          disabled={saving}
        >
          ×
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>Course</span>

            <select
              name="course_id"
              value={form.course_id}
              onChange={onChange}
            >
              <option value="">
                Select a course
              </option>

              {courses.map((course) => (
                <option
                  value={course.id}
                  key={course.id}
                >
                  {course.course_code} —{" "}
                  {course.course_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>What did you study?</span>

            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={onChange}
              placeholder="e.g. Binary Search Trees"
            />
          </label>

          <label>
            <span>Date & time</span>

            <input
              type="datetime-local"
              name="session_date"
              value={form.session_date}
              onChange={onChange}
            />
          </label>

          <label>
            <span>Duration</span>

            <div className="input-with-suffix">
              <input
                type="number"
                name="duration_minutes"
                min="1"
                step="1"
                value={form.duration_minutes}
                onChange={onChange}
              />

              <span>minutes</span>
            </div>
          </label>

          <label className="full-column">
            <span>Notes</span>

            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder="Optional notes about this session..."
              rows="4"
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save session"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* =========================================================
   COURSES
========================================================= */

function CoursesPage({
  courses,
  showForm,
  form,
  saving,
  onOpenForm,
  onCloseForm,
  onChange,
  onSubmit,
}) {
  return (
    <section className="page coming-soon-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">ACADEMICS</p>
          <h2>Your courses.</h2>
          <p>
            These courses will become the foundation
            for your academic planning system.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onOpenForm}
        >
          + Add course
        </button>
      </div>

      {showForm && (
        <section className="content-card form-card">
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">NEW COURSE</p>
              <h3>Add a course</h3>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={onCloseForm}
              disabled={saving}
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="form-grid">
              <label>
                <span>Course code</span>

                <input
                  type="text"
                  name="course_code"
                  value={form.course_code}
                  onChange={onChange}
                  placeholder="CSE 220"
                />
              </label>

              <label>
                <span>Course name</span>

                <input
                  type="text"
                  name="course_name"
                  value={form.course_name}
                  onChange={onChange}
                  placeholder="System Fundamentals"
                />
              </label>

              <label>
                <span>Professor</span>

                <input
                  type="text"
                  name="professor"
                  value={form.professor}
                  onChange={onChange}
                  placeholder="Professor name"
                />
              </label>

              <label>
                <span>Semester</span>

                <input
                  type="text"
                  name="semester"
                  value={form.semester}
                  onChange={onChange}
                  placeholder="Fall 2026"
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onCloseForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save course"}
              </button>
            </div>
          </form>
        </section>
      )}

      {courses.length === 0 ? (
        <section className="content-card">
          <EmptyState
            title="No courses yet."
            description="Add your first course to start building your academic system."
          />
        </section>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <article
              className="course-card"
              key={course.id}
            >
              <div className="course-card-top">
                <span className="course-code">
                  {course.course_code}
                </span>

                {course.semester && (
                  <span className="course-semester">
                    {course.semester}
                  </span>
                )}
              </div>

              <h3>{course.course_name}</h3>

              {course.professor && (
                <p>{course.professor}</p>
              )}

              <div className="course-card-footer">
                <span>Academic</span>
                <span>→</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   NUTRITION
========================================================= */

function getTodayDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function NutritionPage() {
  const [date, setDate] = useState(getTodayDate());
  const [goals, setGoals] = useState(null);
  const [foods, setFoods] = useState([]);
  const [meals, setMeals] = useState([]);
  const [daily, setDaily] = useState({
    calories: 0,
    protein_grams: 0,
    carbs_grams: 0,
    fat_grams: 0,
    meal_count: 0,
  });
  const [waterEntries, setWaterEntries] = useState([]);
  const [waterTotal, setWaterTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [goalForm, setGoalForm] = useState({
    daily_calories: "",
    protein_grams: "",
    carbs_grams: "",
    fat_grams: "",
    water_ml: "",
  });

  const [foodForm, setFoodForm] = useState({
    name: "",
    serving_size: "",
    calories: "",
    protein_grams: "",
    carbs_grams: "",
    fat_grams: "",
  });

  const [mealForm, setMealForm] = useState({
    meal_type: "Breakfast",
    notes: "",
  });

  const [mealItems, setMealItems] = useState([
    {
      food_id: "",
      food_name: "",
      servings: "1",
      calories: "",
      protein_grams: "",
      carbs_grams: "",
      fat_grams: "",
    },
  ]);

  const [waterAmount, setWaterAmount] = useState("250");

  function getToken() {
    return localStorage.getItem("token");
  }

  async function nutritionFetch(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Nutrition request failed.");
    }

    return data;
  }

  async function loadNutrition() {
    setLoading(true);
    setError("");

    try {
      const [goalsData, foodsData, mealsData, dailyData, waterData] =
        await Promise.all([
          nutritionFetch("/api/nutrition/goals"),
          nutritionFetch("/api/nutrition/foods"),
          nutritionFetch(`/api/nutrition/meals?date=${date}`),
          nutritionFetch(`/api/nutrition/daily?date=${date}`),
          nutritionFetch(`/api/nutrition/water?date=${date}`),
        ]);

      setGoals(goalsData.goals || null);
      setFoods(foodsData.foods || []);
      setMeals(mealsData.meals || []);
      setDaily(
        dailyData.totals || {
          calories: 0,
          protein_grams: 0,
          carbs_grams: 0,
          fat_grams: 0,
          meal_count: 0,
        }
      );
      setWaterEntries(waterData.entries || []);
      setWaterTotal(Number(waterData.total_ml || 0));

      const savedGoals = goalsData.goals;
      if (savedGoals) {
        setGoalForm({
          daily_calories: savedGoals.daily_calories ?? "",
          protein_grams: savedGoals.protein_grams ?? "",
          carbs_grams: savedGoals.carbs_grams ?? "",
          fat_grams: savedGoals.fat_grams ?? "",
          water_ml: savedGoals.water_ml ?? "",
        });
      }
    } catch (err) {
      console.error("Load nutrition error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load nutrition data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNutrition();
  }, [date]);

  function handleGoalChange(event) {
    const { name, value } = event.target;
    setGoalForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveGoals(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = await nutritionFetch("/api/nutrition/goals", {
        method: "PUT",
        body: JSON.stringify(goalForm),
      });

      setGoals(data.goals);
      setGoalForm({
        daily_calories: data.goals.daily_calories ?? "",
        protein_grams: data.goals.protein_grams ?? "",
        carbs_grams: data.goals.carbs_grams ?? "",
        fat_grams: data.goals.fat_grams ?? "",
        water_ml: data.goals.water_ml ?? "",
      });
    } catch (err) {
      console.error("Save nutrition goals error:", err);
      setError(err instanceof Error ? err.message : "Unable to save goals.");
    } finally {
      setSaving(false);
    }
  }

  function handleFoodChange(event) {
    const { name, value } = event.target;
    setFoodForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function createFood(event) {
    event.preventDefault();

    if (!foodForm.name.trim()) {
      setError("Food name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await nutritionFetch("/api/nutrition/foods", {
        method: "POST",
        body: JSON.stringify(foodForm),
      });

      setFoods((current) =>
        [...current, data.food].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setFoodForm({
        name: "",
        serving_size: "",
        calories: "",
        protein_grams: "",
        carbs_grams: "",
        fat_grams: "",
      });
    } catch (err) {
      console.error("Create food error:", err);
      setError(err instanceof Error ? err.message : "Unable to create food.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFood(id) {
    try {
      setError("");

      await nutritionFetch(`/api/nutrition/foods/${id}`, {
        method: "DELETE",
      });

      setFoods((current) => current.filter((food) => food.id !== id));
    } catch (err) {
      console.error("Delete food error:", err);
      setError(err instanceof Error ? err.message : "Unable to delete food.");
    }
  }

  function handleMealChange(event) {
    const { name, value } = event.target;
    setMealForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleMealItemChange(index, event) {
    const { name, value } = event.target;

    setMealItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [name]: value }
          : item
      )
    );
  }

  function selectFood(index, foodId) {
    const food = foods.find((item) => String(item.id) === String(foodId));

    setMealItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? food
            ? {
                ...item,
                food_id: food.id,
                food_name: food.name,
                calories: food.calories ?? "",
                protein_grams: food.protein_grams ?? "",
                carbs_grams: food.carbs_grams ?? "",
                fat_grams: food.fat_grams ?? "",
              }
            : {
                ...item,
                food_id: "",
              }
          : item
      )
    );
  }

  function addMealItem() {
    setMealItems((current) => [
      ...current,
      {
        food_id: "",
        food_name: "",
        servings: "1",
        calories: "",
        protein_grams: "",
        carbs_grams: "",
        fat_grams: "",
      },
    ]);
  }

  function removeMealItem(index) {
    setMealItems((current) => {
      if (current.length === 1) return current;
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function createMeal(event) {
    event.preventDefault();

    const validItems = mealItems.filter(
      (item) => item.food_name.trim()
    );

    if (validItems.length === 0) {
      setError("Add at least one food item to the meal.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await nutritionFetch("/api/nutrition/meals", {
        method: "POST",
        body: JSON.stringify({
          meal_type: mealForm.meal_type,
          meal_date: date,
          notes: mealForm.notes.trim() || null,
          items: validItems,
        }),
      });

      setMealForm({
        meal_type: "Breakfast",
        notes: "",
      });

      setMealItems([
        {
          food_id: "",
          food_name: "",
          servings: "1",
          calories: "",
          protein_grams: "",
          carbs_grams: "",
          fat_grams: "",
        },
      ]);

      await loadNutrition();
    } catch (err) {
      console.error("Create meal error:", err);
      setError(err instanceof Error ? err.message : "Unable to save meal.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMeal(id) {
    try {
      setError("");

      await nutritionFetch(`/api/nutrition/meals/${id}`, {
        method: "DELETE",
      });

      await loadNutrition();
    } catch (err) {
      console.error("Delete meal error:", err);
      setError(err instanceof Error ? err.message : "Unable to delete meal.");
    }
  }

  async function addWater(event) {
    event.preventDefault();

    const amount = Number(waterAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Water amount must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await nutritionFetch("/api/nutrition/water", {
        method: "POST",
        body: JSON.stringify({
          amount_ml: amount,
          intake_date: date,
        }),
      });

      setWaterAmount("250");
      await loadNutrition();
    } catch (err) {
      console.error("Add water error:", err);
      setError(err instanceof Error ? err.message : "Unable to save water.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteWater(id) {
    try {
      setError("");

      await nutritionFetch(`/api/nutrition/water/${id}`, {
        method: "DELETE",
      });

      await loadNutrition();
    } catch (err) {
      console.error("Delete water error:", err);
      setError(err instanceof Error ? err.message : "Unable to delete water.");
    }
  }

  function progress(value, target) {
    const current = Number(value || 0);
    const goal = Number(target || 0);

    if (!goal) return 0;

    return Math.min(100, Math.round((current / goal) * 100));
  }

  const calorieGoal = Number(goals?.daily_calories || 0);
  const proteinGoal = Number(goals?.protein_grams || 0);
  const carbsGoal = Number(goals?.carbs_grams || 0);
  const fatGoal = Number(goals?.fat_grams || 0);
  const waterGoal = Number(goals?.water_ml || 0);

  if (loading) {
    return (
      <section className="page-section">
        <div className="page-header">
          <div>
            <p className="eyebrow">NUTRITION</p>
            <h1>Nutrition</h1>
            <p className="page-subtitle">
              Track meals, nutrition goals, and hydration in one place.
            </p>
          </div>
        </div>
        <div className="empty-state">
          <strong>Loading nutrition...</strong>
          <p>Your nutrition data is being loaded.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section nutrition-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">NUTRITION</p>
          <h1>Nutrition</h1>
          <p className="page-subtitle">
            Keep meals, macros, calories, and hydration organized.
          </p>
        </div>

        <div className="nutrition-date-picker">
          <label htmlFor="nutrition-date">Tracking date</label>
          <input
            id="nutrition-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="nutrition-alert">
          {error}
        </div>
      )}

      <div className="nutrition-summary-grid">
        <div className="nutrition-stat-card">
          <span>Calories</span>
          <strong>{Math.round(Number(daily.calories || 0))}</strong>
          <small>
            {calorieGoal ? `of ${calorieGoal} kcal goal` : "Set a daily goal"}
          </small>
          <div className="nutrition-progress">
            <span style={{ width: `${progress(daily.calories, calorieGoal)}%` }} />
          </div>
        </div>

        <div className="nutrition-stat-card">
          <span>Protein</span>
          <strong>{Number(daily.protein_grams || 0).toFixed(1)} g</strong>
          <small>
            {proteinGoal ? `of ${proteinGoal} g goal` : "Set a protein goal"}
          </small>
          <div className="nutrition-progress">
            <span style={{ width: `${progress(daily.protein_grams, proteinGoal)}%` }} />
          </div>
        </div>

        <div className="nutrition-stat-card">
          <span>Carbs</span>
          <strong>{Number(daily.carbs_grams || 0).toFixed(1)} g</strong>
          <small>
            {carbsGoal ? `of ${carbsGoal} g goal` : "Set a carbs goal"}
          </small>
          <div className="nutrition-progress">
            <span style={{ width: `${progress(daily.carbs_grams, carbsGoal)}%` }} />
          </div>
        </div>

        <div className="nutrition-stat-card">
          <span>Fat</span>
          <strong>{Number(daily.fat_grams || 0).toFixed(1)} g</strong>
          <small>
            {fatGoal ? `of ${fatGoal} g goal` : "Set a fat goal"}
          </small>
          <div className="nutrition-progress">
            <span style={{ width: `${progress(daily.fat_grams, fatGoal)}%` }} />
          </div>
        </div>
      </div>

      <div className="nutrition-layout">
        <div className="nutrition-main-column">
          <div className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">DAILY LOG</p>
                <h2>Meals</h2>
              </div>
              <span className="section-count">
                {meals.length} {meals.length === 1 ? "meal" : "meals"}
              </span>
            </div>

            <form className="nutrition-form" onSubmit={createMeal}>
              <div className="form-grid">
                <label>
                  Meal type
                  <select
                    name="meal_type"
                    value={mealForm.meal_type}
                    onChange={handleMealChange}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                </label>

                <label>
                  Notes
                  <input
                    name="notes"
                    value={mealForm.notes}
                    onChange={handleMealChange}
                    placeholder="Optional note"
                  />
                </label>
              </div>

              <div className="meal-item-list">
                {mealItems.map((item, index) => (
                  <div className="meal-item-row" key={index}>
                    <label>
                      Food
                      <select
                        value={item.food_id}
                        onChange={(event) =>
                          selectFood(index, event.target.value)
                        }
                      >
                        <option value="">Select saved food</option>
                        {foods.map((food) => (
                          <option key={food.id} value={food.id}>
                            {food.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Name
                      <input
                        name="food_name"
                        value={item.food_name}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                        placeholder="Food name"
                      />
                    </label>

                    <label>
                      Servings
                      <input
                        name="servings"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.servings}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                      />
                    </label>

                    <label>
                      Calories
                      <input
                        name="calories"
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.calories}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                      />
                    </label>

                    <label>
                      Protein (g)
                      <input
                        name="protein_grams"
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.protein_grams}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                      />
                    </label>

                    <label>
                      Carbs (g)
                      <input
                        name="carbs_grams"
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.carbs_grams}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                      />
                    </label>

                    <label>
                      Fat (g)
                      <input
                        name="fat_grams"
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.fat_grams}
                        onChange={(event) =>
                          handleMealItemChange(index, event)
                        }
                      />
                    </label>

                    {mealItems.length > 1 && (
                      <button
                        type="button"
                        className="secondary-button compact-button"
                        onClick={() => removeMealItem(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={addMealItem}
                >
                  + Add food
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Log meal"}
                </button>
              </div>
            </form>

            <div className="nutrition-record-list">
              {meals.length === 0 ? (
                <div className="empty-state compact-empty">
                  <strong>No meals logged yet.</strong>
                  <p>Add your first meal for this date above.</p>
                </div>
              ) : (
                meals.map((meal) => (
                  <div className="nutrition-record" key={meal.id}>
                    <div>
                      <div className="nutrition-record-title">
                        {meal.meal_type}
                      </div>
                      <div className="nutrition-record-meta">
                        {(meal.items || []).map((item) => item.food_name).join(", ")}
                      </div>
                      {meal.notes && (
                        <div className="nutrition-record-note">
                          {meal.notes}
                        </div>
                      )}
                    </div>

                    <div className="nutrition-record-actions">
                      <span>
                        {Math.round(
                          (meal.items || []).reduce(
                            (sum, item) => sum + Number(item.calories || 0),
                            0
                          )
                        )}{" "}
                        kcal
                      </span>
                      <button
                        type="button"
                        className="text-button danger-text"
                        onClick={() => deleteMeal(meal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FOOD LIBRARY</p>
                <h2>Saved foods</h2>
              </div>
              <span className="section-count">{foods.length}</span>
            </div>

            <form className="nutrition-form" onSubmit={createFood}>
              <div className="form-grid nutrition-food-grid">
                <label>
                  Food name
                  <input
                    name="name"
                    value={foodForm.name}
                    onChange={handleFoodChange}
                    placeholder="e.g. Oatmeal"
                  />
                </label>

                <label>
                  Serving size
                  <input
                    name="serving_size"
                    value={foodForm.serving_size}
                    onChange={handleFoodChange}
                    placeholder="e.g. 1 cup"
                  />
                </label>

                <label>
                  Calories
                  <input
                    name="calories"
                    type="number"
                    min="0"
                    step="0.1"
                    value={foodForm.calories}
                    onChange={handleFoodChange}
                  />
                </label>

                <label>
                  Protein (g)
                  <input
                    name="protein_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    value={foodForm.protein_grams}
                    onChange={handleFoodChange}
                  />
                </label>

                <label>
                  Carbs (g)
                  <input
                    name="carbs_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    value={foodForm.carbs_grams}
                    onChange={handleFoodChange}
                  />
                </label>

                <label>
                  Fat (g)
                  <input
                    name="fat_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    value={foodForm.fat_grams}
                    onChange={handleFoodChange}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  Add saved food
                </button>
              </div>
            </form>

            {foods.length > 0 && (
              <div className="nutrition-record-list">
                {foods.map((food) => (
                  <div className="nutrition-record" key={food.id}>
                    <div>
                      <div className="nutrition-record-title">
                        {food.name}
                      </div>
                      <div className="nutrition-record-meta">
                        {food.serving_size || "Serving not specified"} ·{" "}
                        {Number(food.calories || 0)} kcal ·{" "}
                        {Number(food.protein_grams || 0)} g protein
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-button danger-text"
                      onClick={() => deleteFood(food.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nutrition-side-column">
          <div className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TARGETS</p>
                <h2>Nutrition goals</h2>
              </div>
            </div>

            <form className="nutrition-form" onSubmit={saveGoals}>
              <label>
                Daily calories
                <input
                  name="daily_calories"
                  type="number"
                  min="0"
                  value={goalForm.daily_calories}
                  onChange={handleGoalChange}
                  placeholder="e.g. 2200"
                />
              </label>

              <label>
                Protein (g)
                <input
                  name="protein_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  value={goalForm.protein_grams}
                  onChange={handleGoalChange}
                  placeholder="e.g. 150"
                />
              </label>

              <label>
                Carbs (g)
                <input
                  name="carbs_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  value={goalForm.carbs_grams}
                  onChange={handleGoalChange}
                  placeholder="e.g. 250"
                />
              </label>

              <label>
                Fat (g)
                <input
                  name="fat_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  value={goalForm.fat_grams}
                  onChange={handleGoalChange}
                  placeholder="e.g. 70"
                />
              </label>

              <label>
                Water (ml)
                <input
                  name="water_ml"
                  type="number"
                  min="0"
                  value={goalForm.water_ml}
                  onChange={handleGoalChange}
                  placeholder="e.g. 2500"
                />
              </label>

              <button
                type="submit"
                className="primary-button full-width-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save goals"}
              </button>
            </form>
          </div>

          <div className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">HYDRATION</p>
                <h2>Water</h2>
              </div>
              <span className="section-count">
                {Math.round(waterTotal)} ml
              </span>
            </div>

            <div className="water-progress">
              <div
                className="water-progress-fill"
                style={{
                  width: `${progress(waterTotal, waterGoal)}%`,
                }}
              />
            </div>

            <p className="water-goal-text">
              {waterGoal
                ? `${Math.round(waterTotal)} of ${waterGoal} ml`
                : `${Math.round(waterTotal)} ml logged`}
            </p>

            <form className="water-form" onSubmit={addWater}>
              <input
                type="number"
                min="1"
                step="1"
                value={waterAmount}
                onChange={(event) => setWaterAmount(event.target.value)}
                aria-label="Water amount in milliliters"
              />
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                + Add water
              </button>
            </form>

            {waterEntries.length > 0 && (
              <div className="water-entry-list">
                {waterEntries.map((entry) => (
                  <div className="water-entry" key={entry.id}>
                    <span>{entry.amount_ml} ml</span>
                    <button
                      type="button"
                      className="text-button danger-text"
                      onClick={() => deleteWater(entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="content-card nutrition-note-card">
            <p className="eyebrow">DAILY SNAPSHOT</p>
            <h2>Keep it simple</h2>
            <p>
              Use this page to organize meals and personal nutrition targets.
              Values are for general tracking and planning, not medical advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FITNESS
========================================================= */

function FitnessPage({
  workouts,
  exercises,
  loading,
  error,
  showWorkoutForm,
  showExerciseForm,
  workoutForm,
  exerciseForm,
  savingWorkout,
  savingExercise,
  onOpenWorkout,
  onCloseWorkout,
  onOpenExercise,
  onCloseExercise,
  onWorkoutChange,
  onExerciseChange,
  onCreateWorkout,
  onCreateExercise,
  onDeleteWorkout,
  onRefresh,
}) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [addingExercise, setAddingExercise] = useState(false);
  const [setForms, setSetForms] = useState({});
  const [addingSet, setAddingSet] = useState({});
  const [fitnessBuilderError, setFitnessBuilderError] = useState("");

  const [detailWorkoutId, setDetailWorkoutId] = useState("");
  const [detailExercises, setDetailExercises] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [historyDetails, setHistoryDetails] = useState({});
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("studentLifeFitnessProfile") ||
          '{"goal":"Build consistency","targetWorkouts":4,"targetMinutes":240}'
      );
    } catch {
      return {
        goal: "Build consistency",
        targetWorkouts: 4,
        targetMinutes: 240,
      };
    }
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const workoutsThisWeek = workouts.filter((workout) => {
    const date = new Date(workout.workout_date);
    return !Number.isNaN(date.getTime()) && date >= startOfWeek;
  }).length;

  const workoutsLast30Days = workouts.filter((workout) => {
    const date = new Date(workout.workout_date);
    return !Number.isNaN(date.getTime()) && date >= thirtyDaysAgo;
  }).length;

  const totalMinutes = workouts.reduce(
    (total, workout) =>
      total + Number(workout.duration_minutes || 0),
    0
  );

  const minutesLast30Days = workouts
    .filter((workout) => {
      const date = new Date(workout.workout_date);
      return !Number.isNaN(date.getTime()) && date >= thirtyDaysAgo;
    })
    .reduce(
      (total, workout) =>
        total + Number(workout.duration_minutes || 0),
      0
    );

  const consistencyPercent = Math.min(
    100,
    Math.round(
      (workoutsLast30Days /
        Math.max(1, Number(profile.targetWorkouts || 4) * 4)) *
        100
    )
  );

  const selectedWorkout = workouts.find(
    (workout) =>
      String(workout.id) === String(selectedWorkoutId)
  );

  const detailWorkout = workouts.find(
    (workout) =>
      String(workout.id) === String(detailWorkoutId)
  );

  function normalizeWorkoutExercises(data) {
    const rows =
      data?.workout_exercises ||
      data?.exercises ||
      [];

    return rows.map((row) => ({
      ...row,
      workout_exercise_id:
        row.workout_exercise_id ??
        row.id,
      exercise_id:
        row.exercise_id ??
        row.exercise?.id,
      name:
        row.name ||
        row.exercise_name ||
        row.exercise?.name ||
        "Exercise",
      muscle_group:
        row.muscle_group ||
        row.exercise?.muscle_group ||
        "",
      sets: Array.isArray(row.sets)
        ? row.sets
        : [],
    }));
  }

  async function loadWorkoutDetails(workoutId) {
    if (!workoutId) return [];

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(
      `/api/workout-exercises?workout_id=${encodeURIComponent(
        workoutId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load workout details."
      );
    }

    return normalizeWorkoutExercises(data);
  }

  async function handleSelectWorkout(event) {
    const id = event.target.value;

    setSelectedWorkoutId(id);
    setWorkoutExercises([]);
    setSetForms({});
    setFitnessBuilderError("");

    if (!id) return;

    try {
      const details = await loadWorkoutDetails(id);
      setWorkoutExercises(details);
    } catch (error) {
      setFitnessBuilderError(error.message);
    }
  }

  async function handleOpenDetails(workoutId) {
    setDetailWorkoutId(String(workoutId));
    setDetailExercises([]);
    setDetailError("");
    setDetailLoading(true);

    try {
      const details = await loadWorkoutDetails(workoutId);
      setDetailExercises(details);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddExerciseToWorkout(exercise) {
    if (!selectedWorkoutId) {
      setFitnessBuilderError(
        "Please select a workout first."
      );
      return;
    }

    if (
      workoutExercises.some(
        (item) =>
          String(item.exercise_id) ===
          String(exercise.id)
      )
    ) {
      setFitnessBuilderError(
        "This exercise is already in the workout."
      );
      return;
    }

    setAddingExercise(true);
    setFitnessBuilderError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        "/api/workout-exercises",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            workout_id: Number(selectedWorkoutId),
            exercise_id: Number(exercise.id),
            exercise_order:
              workoutExercises.length + 1,
            notes: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to add exercise."
        );
      }

      const details = await loadWorkoutDetails(
        selectedWorkoutId
      );

      setWorkoutExercises(details);
    } catch (error) {
      setFitnessBuilderError(error.message);
    } finally {
      setAddingExercise(false);
    }
  }

  function handleSetFormChange(
    workoutExerciseId,
    field,
    value
  ) {
    setSetForms((current) => ({
      ...current,
      [workoutExerciseId]: {
        ...(current[workoutExerciseId] || {}),
        [field]: value,
      },
    }));
  }

  async function handleAddSet(workoutExercise) {
    const form =
      setForms[workoutExercise.workout_exercise_id] ||
      {};

    const reps = Number(form.reps);

    const weight =
      form.weight === "" ||
      form.weight === undefined
        ? null
        : Number(form.weight);

    if (!Number.isInteger(reps) || reps <= 0) {
      setFitnessBuilderError(
        "Enter a valid positive number of reps."
      );
      return;
    }

    if (
      weight !== null &&
      (!Number.isFinite(weight) || weight < 0)
    ) {
      setFitnessBuilderError("Enter a valid weight.");
      return;
    }

    setAddingSet((current) => ({
      ...current,
      [workoutExercise.workout_exercise_id]: true,
    }));

    setFitnessBuilderError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        "/api/workout-sets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            workout_exercise_id: Number(
              workoutExercise.workout_exercise_id
            ),
            set_number:
              (workoutExercise.sets?.length || 0) + 1,
            reps,
            weight,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to add set."
        );
      }

      const details = await loadWorkoutDetails(
        selectedWorkoutId
      );

      setWorkoutExercises(details);

      setSetForms((current) => ({
        ...current,
        [workoutExercise.workout_exercise_id]: {
          reps: "",
          weight: "",
        },
      }));
    } catch (error) {
      setFitnessBuilderError(error.message);
    } finally {
      setAddingSet((current) => ({
        ...current,
        [workoutExercise.workout_exercise_id]: false,
      }));
    }
  }

  async function refreshHistoryDetails() {
    if (!workouts.length) {
      setHistoryDetails({});
      return;
    }

    const results = await Promise.all(
      workouts.map(async (workout) => {
        try {
          const details =
            await loadWorkoutDetails(workout.id);

          return [String(workout.id), details];
        } catch {
          return [String(workout.id), []];
        }
      })
    );

    setHistoryDetails(
      Object.fromEntries(results)
    );
  }

  useEffect(() => {
    refreshHistoryDetails();
  }, [workouts]);

  const personalRecords = {};

  Object.values(historyDetails)
    .flat()
    .forEach((exercise) => {
      (exercise.sets || []).forEach((set) => {
        const weight = Number(set.weight);

        if (!Number.isFinite(weight)) return;

        const name =
          exercise.name || "Exercise";

        if (
          !personalRecords[name] ||
          weight >
            personalRecords[name].weight
        ) {
          personalRecords[name] = {
            name,
            weight,
            reps: Number(set.reps || 0),
          };
        }
      });
    });

  const records = Object.values(personalRecords)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  const uniqueWorkoutDates = [
    ...new Set(
      workouts
        .map((workout) => {
          const date = new Date(
            workout.workout_date
          );

          if (Number.isNaN(date.getTime())) {
            return null;
          }

          return date.toISOString().slice(0, 10);
        })
        .filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 0;

  if (uniqueWorkoutDates.length > 0) {
    const dateCursor = new Date(
      uniqueWorkoutDates[0] + "T00:00:00"
    );

    for (const dateString of uniqueWorkoutDates) {
      const current =
        new Date(dateString + "T00:00:00");

      const difference = Math.round(
        (dateCursor - current) /
          (1000 * 60 * 60 * 24)
      );

      if (difference === streak) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  function saveProfile(event) {
    event.preventDefault();

    localStorage.setItem(
      "studentLifeFitnessProfile",
      JSON.stringify(profile)
    );

    setProfileSaved(true);

    window.setTimeout(
      () => setProfileSaved(false),
      2000
    );
  }

  return (
    <section className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">FITNESS SYSTEM</p>
          <h2>Train with consistency.</h2>
          <p>
            Track workouts, understand your progress,
            and build a training history you can actually
            learn from.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onOpenExercise}
          >
            + Exercise
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onOpenWorkout}
          >
            + Workout
          </button>
        </div>
      </div>

      {error && (
        <div className="data-error">
          <div>
            <strong>Fitness error</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => onRefresh()}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <section className="content-card">
          <div className="empty-state">
            <div className="empty-state-mark">↻</div>
            <strong>Loading fitness...</strong>
            <p>
              Getting your workouts and exercise
              library.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total workouts"
              value={workouts.length}
              description="All recorded workouts"
            />

            <StatCard
              label="This week"
              value={workoutsThisWeek}
              description="Workouts this week"
            />

            <StatCard
              label="30-day consistency"
              value={`${consistencyPercent}%`}
              description={`${workoutsLast30Days} workouts in 30 days`}
            />

            <StatCard
              label="Training"
              value={`${Math.floor(
                totalMinutes / 60
              )}h ${totalMinutes % 60}m`}
              description="Total logged duration"
            />
          </div>

          <div className="content-grid">
            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">MOMENTUM</p>
                  <h3>Workout streak</h3>
                </div>
              </div>

              <div className="overview-value">
                {streak}
                <span> days</span>
              </div>

              <p>
                Keep stacking consistent training days.
              </p>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      streak * 10
                    )}%`,
                  }}
                />
              </div>
            </section>

            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">PROGRESS</p>
                  <h3>Last 30 days</h3>
                </div>
              </div>

              <div className="mini-metric">
                <strong>
                  {Math.floor(
                    minutesLast30Days / 60
                  )}
                  h {minutesLast30Days % 60}m
                </strong>
                <span>Training time</span>
              </div>

              <div className="mini-metric">
                <strong>
                  {workoutsLast30Days}
                </strong>
                <span>Workouts completed</span>
              </div>
            </section>
          </div>

          {showWorkoutForm && (
            <section className="content-card form-card">
              <div className="form-card-heading">
                <div>
                  <p className="eyebrow">NEW WORKOUT</p>
                  <h3>Log a workout</h3>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={onCloseWorkout}
                  disabled={savingWorkout}
                >
                  ×
                </button>
              </div>

              <form onSubmit={onCreateWorkout}>
                <div className="form-grid">
                  <label>
                    <span>Workout name</span>
                    <input
                      type="text"
                      name="name"
                      value={workoutForm.name}
                      onChange={onWorkoutChange}
                      placeholder="e.g. Push Day"
                    />
                  </label>

                  <label>
                    <span>Workout type</span>
                    <input
                      type="text"
                      name="workout_type"
                      value={
                        workoutForm.workout_type
                      }
                      onChange={onWorkoutChange}
                      placeholder="e.g. Strength"
                    />
                  </label>

                  <label>
                    <span>Date & time</span>
                    <input
                      type="datetime-local"
                      name="workout_date"
                      value={
                        workoutForm.workout_date
                      }
                      onChange={onWorkoutChange}
                    />
                  </label>

                  <label>
                    <span>Duration (minutes)</span>
                    <input
                      type="number"
                      name="duration_minutes"
                      value={
                        workoutForm.duration_minutes
                      }
                      onChange={onWorkoutChange}
                      min="0"
                      step="1"
                      placeholder="e.g. 60"
                    />
                  </label>

                  <label className="full-column">
                    <span>Notes</span>
                    <textarea
                      name="notes"
                      value={workoutForm.notes}
                      onChange={onWorkoutChange}
                      placeholder="Optional notes about the workout..."
                      rows="4"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onCloseWorkout}
                    disabled={savingWorkout}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingWorkout}
                  >
                    {savingWorkout
                      ? "Saving..."
                      : "Save workout"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {showExerciseForm && (
            <section className="content-card form-card">
              <div className="form-card-heading">
                <div>
                  <p className="eyebrow">
                    EXERCISE LIBRARY
                  </p>
                  <h3>Add an exercise</h3>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={onCloseExercise}
                  disabled={savingExercise}
                >
                  ×
                </button>
              </div>

              <form onSubmit={onCreateExercise}>
                <div className="form-grid">
                  <label>
                    <span>Exercise name</span>
                    <input
                      type="text"
                      name="name"
                      value={exerciseForm.name}
                      onChange={onExerciseChange}
                      placeholder="e.g. Bench Press"
                    />
                  </label>

                  <label>
                    <span>Muscle group</span>
                    <input
                      type="text"
                      name="muscle_group"
                      value={
                        exerciseForm.muscle_group
                      }
                      onChange={onExerciseChange}
                      placeholder="e.g. Chest"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={onCloseExercise}
                    disabled={savingExercise}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingExercise}
                  >
                    {savingExercise
                      ? "Saving..."
                      : "Add exercise"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="content-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">WORKOUT BUILDER</p>
                <h3>Build your workout</h3>
              </div>
            </div>

            <div className="form-grid">
              <label>
                <span>Select workout</span>
                <select
                  value={selectedWorkoutId}
                  onChange={handleSelectWorkout}
                >
                  <option value="">
                    Choose a workout...
                  </option>

                  {workouts.map((workout) => (
                    <option
                      key={workout.id}
                      value={workout.id}
                    >
                      {workout.name} ·{" "}
                      {formatDateTime(
                        workout.workout_date
                      )}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {fitnessBuilderError && (
              <div className="data-error">
                <div>
                  <strong>Builder error</strong>
                  <p>{fitnessBuilderError}</p>
                </div>
              </div>
            )}

            {selectedWorkout && (
              <div className="content-grid">
                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">
                        EXERCISE LIBRARY
                      </p>
                      <h3>Add exercises</h3>
                    </div>
                  </div>

                  {exercises.length === 0 ? (
                    <EmptyState
                      title="No exercises yet."
                      description="Create an exercise first."
                    />
                  ) : (
                    <div className="exercise-list">
                      {exercises.map((exercise) => {
                        const alreadyAdded =
                          workoutExercises.some(
                            (item) =>
                              String(
                                item.exercise_id
                              ) ===
                              String(exercise.id)
                          );

                        return (
                          <div
                            className="exercise-row"
                            key={exercise.id}
                          >
                            <div>
                              <strong>
                                {exercise.name}
                              </strong>
                              <span>
                                {exercise.muscle_group ||
                                  "Muscle group not set"}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                handleAddExerciseToWorkout(
                                  exercise
                                )
                              }
                              disabled={
                                addingExercise ||
                                alreadyAdded
                              }
                            >
                              {alreadyAdded
                                ? "Added"
                                : addingExercise
                                  ? "Adding..."
                                  : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">
                        CURRENT WORKOUT
                      </p>
                      <h3>{selectedWorkout.name}</h3>
                    </div>
                  </div>

                  {workoutExercises.length === 0 ? (
                    <EmptyState
                      title="No exercises added."
                      description="Choose an exercise from the library."
                    />
                  ) : (
                    <div className="exercise-list">
                      {workoutExercises.map(
                        (exercise) => {
                          const form =
                            setForms[
                              exercise
                                .workout_exercise_id
                            ] || {};

                          return (
                            <div
                              className="exercise-row"
                              key={
                                exercise
                                  .workout_exercise_id
                              }
                            >
                              <div>
                                <strong>
                                  {exercise.name}
                                </strong>

                                <span>
                                  {exercise.muscle_group ||
                                    "Muscle group not set"}
                                </span>

                                {exercise.sets?.length >
                                  0 && (
                                  <div className="set-list">
                                    {exercise.sets.map(
                                      (set) => (
                                        <span
                                          key={set.id}
                                        >
                                          Set{" "}
                                          {
                                            set.set_number
                                          }
                                          :{" "}
                                          {set.reps}{" "}
                                          reps
                                          {set.weight !==
                                            null &&
                                          set.weight !==
                                            undefined
                                            ? ` · ${set.weight} lb`
                                            : " · Bodyweight"}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}

                                <div className="form-grid">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Reps"
                                    value={
                                      form.reps || ""
                                    }
                                    onChange={(event) =>
                                      handleSetFormChange(
                                        exercise.workout_exercise_id,
                                        "reps",
                                        event.target.value
                                      )
                                    }
                                  />

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="Weight (lb)"
                                    value={
                                      form.weight || ""
                                    }
                                    onChange={(event) =>
                                      handleSetFormChange(
                                        exercise.workout_exercise_id,
                                        "weight",
                                        event.target.value
                                      )
                                    }
                                  />

                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                      handleAddSet(
                                        exercise
                                      )
                                    }
                                    disabled={
                                      addingSet[
                                        exercise
                                          .workout_exercise_id
                                      ]
                                    }
                                  >
                                    {addingSet[
                                      exercise
                                        .workout_exercise_id
                                    ]
                                      ? "Saving..."
                                      : "+ Add Set"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>

          <div className="content-grid">
            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">HISTORY</p>
                  <h3>Workout history</h3>
                </div>

                <span className="card-count">
                  {workouts.length}
                </span>
              </div>

              {workouts.length === 0 ? (
                <EmptyState
                  title="No workouts yet."
                  description="Log your first workout to start building your training history."
                />
              ) : (
                <div className="exercise-list">
                  {workouts.map((workout) => (
                    <div
                      className="exercise-row"
                      key={workout.id}
                    >
                      <div>
                        <strong>
                          {workout.name}
                        </strong>

                        <span>
                          {workout.workout_type ||
                            "Workout"}{" "}
                          ·{" "}
                          {formatDateTime(
                            workout.workout_date
                          )}
                        </span>

                        <span>
                          {Number(
                            workout.duration_minutes || 0
                          )}{" "}
                          min ·{" "}
                          {workout.exercise_count || 0}{" "}
                          exercises
                        </span>

                        {workout.notes && (
                          <p>{workout.notes}</p>
                        )}
                      </div>

                      <div className="page-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleOpenDetails(
                              workout.id
                            )
                          }
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          className="icon-danger"
                          onClick={() =>
                            onDeleteWorkout(
                              workout.id
                            )
                          }
                          aria-label={`Delete ${workout.name}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">LIBRARY</p>
                  <h3>Exercises</h3>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={onOpenExercise}
                >
                  Add
                </button>
              </div>

              {exercises.length === 0 ? (
                <EmptyState
                  title="Your library is empty."
                  description="Add exercises you regularly use in your workouts."
                />
              ) : (
                <div className="exercise-list">
                  {exercises.map((exercise) => (
                    <div
                      className="exercise-row"
                      key={exercise.id}
                    >
                      <div>
                        <strong>
                          {exercise.name}
                        </strong>

                        <span>
                          {exercise.muscle_group ||
                            "Muscle group not set"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {detailWorkout && (
            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">
                    WORKOUT DETAILS
                  </p>
                  <h3>{detailWorkout.name}</h3>
                  <span>
                    {formatDateTime(
                      detailWorkout.workout_date
                    )}{" "}
                    ·{" "}
                    {Number(
                      detailWorkout.duration_minutes || 0
                    )}{" "}
                    minutes
                  </span>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={() => {
                    setDetailWorkoutId("");
                    setDetailExercises([]);
                  }}
                >
                  ×
                </button>
              </div>

              {detailLoading ? (
                <div className="empty-state">
                  <strong>
                    Loading workout details...
                  </strong>
                </div>
              ) : detailError ? (
                <div className="data-error">
                  <p>{detailError}</p>
                </div>
              ) : detailExercises.length === 0 ? (
                <EmptyState
                  title="No exercises recorded."
                  description="Use the workout builder to add exercises and sets."
                />
              ) : (
                <div className="exercise-list">
                  {detailExercises.map(
                    (exercise) => (
                      <div
                        className="exercise-row"
                        key={
                          exercise.workout_exercise_id
                        }
                      >
                        <div>
                          <strong>
                            {exercise.name}
                          </strong>

                          <span>
                            {exercise.muscle_group ||
                              "Muscle group not set"}
                          </span>

                          {exercise.sets?.length >
                          0 ? (
                            <div className="set-list">
                              {exercise.sets.map(
                                (set) => (
                                  <span
                                    key={set.id}
                                  >
                                    Set{" "}
                                    {set.set_number}
                                    : {set.reps} reps
                                    {set.weight !==
                                      null &&
                                    set.weight !==
                                      undefined
                                      ? ` · ${set.weight} lb`
                                      : " · Bodyweight"}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span>
                              No sets recorded
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          <div className="content-grid">
            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">
                    PERSONAL RECORDS
                  </p>
                  <h3>Your best lifts</h3>
                </div>
              </div>

              {records.length === 0 ? (
                <EmptyState
                  title="No records yet."
                  description="Add weighted sets to start tracking personal records."
                />
              ) : (
                <div className="exercise-list">
                  {records.map((record) => (
                    <div
                      className="exercise-row"
                      key={record.name}
                    >
                      <div>
                        <strong>
                          {record.name}
                        </strong>
                        <span>
                          {record.reps} reps
                        </span>
                      </div>

                      <strong>
                        {record.weight} lb
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="content-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">
                    FITNESS PROFILE
                  </p>
                  <h3>Goals & targets</h3>
                </div>
              </div>

              <form
                onSubmit={saveProfile}
                className="form-grid"
              >
                <label className="full-column">
                  <span>Primary goal</span>
                  <input
                    type="text"
                    value={profile.goal}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        goal: event.target.value,
                      })
                    }
                    placeholder="e.g. Build strength"
                  />
                </label>

                <label>
                  <span>Workouts / week</span>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={
                      profile.targetWorkouts
                    }
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        targetWorkouts:
                          Number(
                            event.target.value
                          ),
                      })
                    }
                  />
                </label>

                <label>
                  <span>Minutes / week</span>
                  <input
                    type="number"
                    min="1"
                    value={
                      profile.targetMinutes
                    }
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        targetMinutes:
                          Number(
                            event.target.value
                          ),
                      })
                    }
                  />
                </label>

                <div className="form-actions full-column">
                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Save fitness goals
                  </button>

                  {profileSaved && (
                    <span>
                      Goals saved.
                    </span>
                  )}
                </div>
              </form>
            </section>
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================
   COMING SOON
========================================================= */

function StatCard({ label, value, description }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

function ComingSoon({
  icon,
  eyebrow,
  title,
  description,
  count,
}) {
  return (
    <section className="page coming-soon-page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <section className="coming-soon-card">
        <div className="coming-soon-icon">
          {icon}
        </div>

        <p className="eyebrow">BUILDING THE SYSTEM</p>

        <h3>{title} is coming next.</h3>

        <p>
          This module is intentionally being built
          step by step so it becomes a useful part of
          the overall Student Life OS instead of
          another disconnected feature.
        </p>

        <span>
          Current data: {count}
        </span>
      </section>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function MiniMetric({ value, label }) {
  return (
    <div className="mini-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark">+</div>

      <strong>{title}</strong>

      <p>{description}</p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

async function parseResponse(response) {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      message: raw,
    };
  }
}

function getDefaultDateTime() {
  const now = new Date();
  const offset =
    now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLongDate(value) {
  return value.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getDashboardProgress(
  completedAssignments,
  totalAssignments,
  studySessions
) {
  if (totalAssignments === 0 && studySessions === 0) {
    return 0;
  }

  const assignmentProgress =
    totalAssignments > 0
      ? completedAssignments / totalAssignments
      : 0;

  const activityProgress =
    studySessions > 0 ? 1 : 0;

  return Math.round(
    ((assignmentProgress + activityProgress) / 2) *
      100
  );
}

function getPageTitle(page) {
  const titles = {
    dashboard: "Dashboard",
    calendar: "Calendar",
    study: "Study",
    courses: "Courses",
    tasks: "Tasks",
    fitness: "Fitness",
    nutrition: "Nutrition",
    finance: "Finance",
    "self-care": "Self-Care",
    goals: "Goals",
    career: "Career",
    analytics: "Analytics",
    ai: "AI Assistant",
  };

  return titles[page] || "Dashboard";
}

function getNavIcon(id) {
  const icons = {
    dashboard: "⌂",
    calendar: "□",
    study: "◈",
    courses: "▣",
    tasks: "✓",
    fitness: "◇",
    nutrition: "◌",
    finance: "$",
    "self-care": "♡",
    goals: "◎",
    career: "↗",
    analytics: "▥",
    ai: "✦",
  };

  return icons[id] || "•";
}

export default App;
