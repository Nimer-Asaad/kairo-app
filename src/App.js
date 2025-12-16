// src/App.js
import "./App.css";
import MainPage from "./mainpage.js";
import SignUp from "./signup.js";
import Login from "./login.js";
import EmailsForm from "./emailsForm.js";
import TaskManagementSystem from "./managerTasks.js";
import EmployeeDashboard from "./employeeTasks.js";
import AdminDashboard from "./systemAdmin.js";
import HRDashboard from "./HR.js";
import PersonPage from "./personPage.js";
import FeaturesPage from "./FeaturesPage.js";
import SubscriptionFormPage from "./SubscriptionFormPage.js";

import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav
          style={{
            padding: "20px",
            display: "flex",
            gap: "10px",
            borderBottom: "1px solid #ccc",
            marginBottom: "20px",
          }}
        >
          <Link to="/">
            <button>Home</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
          <Link to="/emailsForm">
            <button>Form</button>
          </Link>
          <Link to="/FeaturesPage">
            <button>feature</button>
          </Link>
          <Link to="/SubscriptionFormPage">
            <button>sub</button>
          </Link>
        </nav>
        {/* <TaskManagementSystem /> */}

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* صفحات الأدوار بعد اللوج إن */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/person" element={<PersonPage />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/employeeTasks" element={<EmployeeDashboard />} />
          <Route path="/manager" element={<TaskManagementSystem />} />
          <Route path="/emailsForm" element={<EmailsForm />} />
          <Route path="/FeaturesPage" element={<FeaturesPage />} />
          <Route
            path="/SubscriptionFormPage"
            element={<SubscriptionFormPage />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
