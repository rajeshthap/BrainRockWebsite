// App.js

import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "../src/componets/custom/style.css";

import Home from "./componets/pages/Home";
import Footer from "./componets/footer/Footer";
import NavBar from "./componets/topnav/NavBar";
import HrDashBoard from "./componets/hr_dashboard/HrDashBoard";
import EmployeeManagement from "./componets/hr_dashboard/hr_iinerpage/EmployeeManagement";
import Login from "./componets/all_login/Login";
import { AuthProvider } from "./componets/context/AuthContext";
import EmployeeRegistration from "./componets/all_registration/EmployeeRegistration";
import ProtectedRoute from "./componets/context/ProtectedRoute";
import DailyAttendance from "./componets/hr_dashboard/attendance/DailyAttendance";
import HrProfile from "./componets/all_profile/HrProfile";
import ForgotPassword from "./componets/all_login/ForgotPassword";

//Hr Payroll
import AddEmployeeForm from './componets/Payroll_dashboard/AddEmployeeForm';
import EmployeeList from './componets/Payroll_dashboard/EmployeeList';
import { PayrollCalculations, calculateTotals } from "./utils/PayrollCalculations";


import PayrollCharts from './componets/Payroll_dashboard/PayrollCharts';
import PayDashBoard from './componets/Payroll_dashboard/PayDashBoard';
import LeaveCalendar from "./componets/hr_dashboard/hr_iinerpage/LeaveCalendar";
import EmpList from "./componets/hr_dashboard/pay_roll/EmpList";
import SalaryCalculation from "./componets/hr_dashboard/pay_roll/SalaryCalculation";
import LeaveManagement from "./componets/hr_dashboard/Leave/LeaveManagement";
import CompanyProfile from "./componets/pages/aboutus/CompanyProfile";
import OurTeam from "./componets/pages/aboutus/OurTeam";
import Careers from "./componets/pages/aboutus/Careers";



function AppContent() {
  const location = useLocation();

  const hiddenPaths = new Set([
    "/HrDashBoard",
    "/EmployeeManagement",
    "/EmployeeRegistration",
    "/DailyAttendance",
    "/HrProfile",

    "/AddEmployeeForm",
    "/EmployeeList",
    "/PayrollCalculations",
    "/MockData",
    "/PayrollCharts",
    "/PayDashBoard",
    "/SalaryCalculation",
    "/EmpList",
    "/LeaveManagement"

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
        {/* <Route path="/EmployeeRegistration" element={<EmployeeRegistration />} /> */}
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
        <Route path="/CompanyProfile" element={<CompanyProfile />} />
        <Route path="/OurTeam" element={<OurTeam />} />
        <Route path="/Careers" element={<Careers />} />

        {/* Protected Routes */}
        {
          <Route
            path="/HrDashBoard"
            element={
              <ProtectedRoute>
                <HrDashBoard />
              </ProtectedRoute>
            }
          />
        }

        <Route
          path="/EmployeeRegistration"
          element={
            <ProtectedRoute>
              <EmployeeRegistration />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/LeaveCalendar"
          element={
            <ProtectedRoute>
              <LeaveCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SalaryCalculation"
          element={
            <ProtectedRoute>
              <SalaryCalculation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EmpList"
          element={
            <ProtectedRoute>
              <EmpList />
            </ProtectedRoute>
          }
        />
         <Route
          path="/LeaveManagement"
          element={
            <ProtectedRoute>
              <LeaveManagement />
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
