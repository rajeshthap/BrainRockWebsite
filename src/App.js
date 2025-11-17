// App.js

import './App.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "@fontsource/poppins";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "../src/componets/custom/style.css";

import Home from './componets/pages/Home';
import Footer from './componets/footer/Footer';
import NavBar from './componets/topnav/NavBar';
import HrDashBoard from './componets/hr_dashboard/HrDashBoard';
import EmployeeManagement from './componets/hr_dashboard/hr_iinerpage/EmployeeManagement';
import Login from './componets/all_login/Login';
import { AuthProvider } from './componets/context/AuthContext'; 
import HrRegistration from './componets/all_registration/HrRegistration';
import EmployeeRegistration from './componets/all_registration/EmployeeRegistration';
import ProtectedRoute from './componets/context/ProtectedRoute';
import DailyAttendance from './componets/hr_dashboard/attendance/DailyAttendance';
import HrProfile from './componets/all_profile/HrProfile';
import ForgotPassword from './componets/all_login/ForgotPassword';



//Hr Payroll
import AddEmployeeForm from './componets/Payroll_dashboard/AddEmployeeForm';
import EmployeeList from './componets/Payroll_dashboard/EmployeeList';
import { PayrollCalculations, calculateTotals } from "./utils/PayrollCalculations";


import PayrollCharts from './componets/Payroll_dashboard/PayrollCharts';
import PayDashBoard from './componets/Payroll_dashboard/PayDashBoard';



function AppContent() {
  const location = useLocation();

  const hiddenPaths = new Set([
    "/HrDashBoard",
    "/EmployeeManagement",
    "/EmployeeRegistration",
    "/HrRegistration",
    "/DailyAttendance",
    "/HrProfile",
    "/AddEmployeeForm",
    "/EmployeeList",
    "/PayrollCalculations",
    "/MockData",
    "/PayrollCharts",
    "/PayDashBoard"

  ]);

  const hiddenFooter1 = new Set([
    "",
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  const shouldHideFooter1 = hiddenFooter1.has(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/HrRegistration" element={<HrRegistration />} />
        <Route path="/EmployeeRegistration" element={<EmployeeRegistration />} />
        {/* <Route path="/HrDashBoard" element={<HrDashBoard />} /> */}
        <Route path="/DailyAttendance" element={<DailyAttendance />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* Hr  Payroll */}
        <Route path="/AddEmployeeForm" element={<AddEmployeeForm />} />
        <Route path="/PayrollCalculations" element={<PayrollCalculations />} />
        <Route path="/EmployeeList" element={<EmployeeList />} />
        {/* <Route path="/MockData" element={<MockData />} /> */}
        <Route path="/EmployeeList" element={<EmployeeList />} />
        <Route path="/PayrollCharts" element={<PayrollCharts />} />
        <Route path="/PayDashBoard" element={<PayDashBoard />} />

        {/* Protected Routes */}
        { <Route 
          path="/HrDashBoard" 
          element={
            <ProtectedRoute>
              <HrDashBoard />
            </ProtectedRoute>
          } 
        /> }
        <Route 
          path="/EmployeeManagement" 
          element={
            <ProtectedRoute>
              <EmployeeManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/HrProfile" 
          element={
            <ProtectedRoute>
              <HrProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>

      
      {!shouldHideFooter1 && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;