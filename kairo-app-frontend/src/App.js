import "./App.css";
import MainPage from "./mainpage.js";
import SignUp from "./signup.js";
import TaskManagementSystem from "./managerTasks.js";
import Login from "./login.js";
import EmployeeDashboard from "./employeeTasks.js";
import AdminDashboard from "./systemAdmin.js";
import HRDashboard from "./HR.js";

import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* <nav style={{ padding: "20px" }}>
          <Link to="/">
            <button>Home</button>
          </Link>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>SignUp</button>
          </Link>
        </nav> */}
        {/* <AdminDashboard /> */}
        {/* <EmployeeDashboard /> */}
        {/* <TaskManagementSystem /> */}
        <MainPage />

        {/* <HRDashboard /> */}

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
