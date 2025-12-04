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

import MyTeam from "./componets/hr_dashboard/teammanagement/MyTeam";
import PayrollCharts from './componets/Payroll_dashboard/PayrollCharts';
import PayDashBoard from './componets/Payroll_dashboard/PayDashBoard';
import LeaveCalendar from "./componets/hr_dashboard/hr_iinerpage/LeaveCalendar";
import EmpList from "./componets/hr_dashboard/pay_roll/EmpList";
import SalaryCalculation from "./componets/hr_dashboard/pay_roll/SalaryCalculation";
import LeaveManagement from "./componets/hr_dashboard/Leave/LeaveManagement";
import CompanyProfile from "./componets/pages/aboutus/CompanyProfile";
import OurTeam from "./componets/pages/aboutus/OurTeam";
import Careers from "./componets/pages/aboutus/RunningProjects";
import ApplyLeaveCalendar from "./componets/hr_dashboard/Leave/ApplyLeaveCalendar";
import LeaveStatus from "./componets/hr_dashboard/Leave/LeaveStatus";
import SalaryStructure from "./componets/hr_dashboard/pay_roll/SalaryStructure";
import LeaveHistory from "./componets/hr_dashboard/Leave/LeaveHistory";
import AttendanceRegularization from "./componets/hr_dashboard/attendance/AttendanceRegularization";
import DepartmentHierarchy from "./componets/hr_dashboard/Departments/DepartmentHierarchy";

import CreateTeam from "./componets/hr_dashboard/teammanagement/CreateTeam";
import ManageTeam from "./componets/hr_dashboard/teammanagement/ManageTeam";
import Courses from "./componets/topnav/navigationpages/Courses";
import Gallery from "./componets/topnav/navigationpages/Gallery";

import TrainingRegistration from "./componets/topnav/navigationpages/TrainingRegistration";
import Python from "./componets/topnav/navigationpages/Python";
import TrainingPHP from "./componets/topnav/navigationpages/TrainingPHP";
import UIUXTraining from "./componets/topnav/navigationpages/UIUXTraining";
import TrainingBootstrap from "./componets/topnav/navigationpages/TrainingBootstrap";
import TrainingMySql from "./componets/topnav/navigationpages/TrainingMySql";
import TrainingWebDesign from "./componets/topnav/navigationpages/TrainingWebDesign";
import PayslipGenerator from "./componets/hr_dashboard/pay_roll/PayslipGenerator";
import WebsiteManagement from "./componets/adminpanel/WebsiteManagement";
import LeftNavManagement from "./componets/adminpanel/LeftNavManagement";
import AddServices from "./componets/adminpanel/Services/AddServices";
import ViewServices from "./componets/adminpanel/Services/ViewServices";
import AddCarousel from "./componets/adminpanel/carousel/AddCarousel";
import EditCarousel from "./componets/adminpanel/carousel/EditCarousel";
import AddCourses from "./componets/adminpanel/courses/AddCourses";
import EditCourses from "./componets/adminpanel/courses/EditCourses";
import AddStudent from "./componets/adminpanel/gallery/AddStudent";
import ManageStudent from "./componets/adminpanel/gallery/ManageStudent";
import EditAboutUs from "./componets/adminpanel/aboutus/EditAboutUs";
import Contact from "./componets/topnav/navigationpages/Contact";
import TrainingDashBoard from "./componets/training_dashboard/TrainingDashBoard";
import TrainingLeftnav from "./componets/training_dashboard/TrainingLeftnav";
import EditContactUs from "./componets/adminpanel/aboutus/EditContactUs";
import ContactUsQuery from "./componets/adminpanel/aboutus/ContactUsQuery";
import TrainingVideoPlayer from "./componets/training_dashboard/TrainingVideoPlayer";
import AddOurTeam from "./componets/adminpanel/ourteam/AddOurTeam";
import ManageOurTeam from "./componets/adminpanel/ourteam/ManageOurTeam";
// import Services from "./componets/topnav/navigationpages/Services";
import AddDesAndDev from "./componets/adminpanel/designanddevelopment/AddDesAndDev";
import ManageDesAndDev from "./componets/adminpanel/designanddevelopment/ManageDesAndDev";
import RunningProjects from "./componets/pages/aboutus/RunningProjects";
// import Services from "./componets/pages/ServicesPage";
import ServicesPage from "./componets/pages/ServicesPage";
import ManageTechStack from "./componets/adminpanel/ourtechstack/ManageTechStack";
import ManageItServices from "./componets/adminpanel/itservices/ManageItServices";
import AddItServices from "./componets/adminpanel/itservices/AddItServices";
import Feedback from "./componets/topnav/navigationpages/Feedback";
import Feedbackget from "./componets/adminpanel/Feedback/Feedbackget";
import AddClient from "./componets/adminpanel/Client/AddClient";
import EditClient from "./componets/adminpanel/Client/EditClient";
import AddProject from "./componets/adminpanel/ourproject/AddProject";
import ManageProject from "./componets/adminpanel/ourproject/ManageProject";
import Training from "./componets/topnav/navigationpages/Training";
import AddCertification from "./componets/adminpanel/Candidate/AddCertification";
import ViewCertified from "./componets/adminpanel/Candidate/ViewCertified";


function AppContent() {
  const location = useLocation();

  const hiddenPaths = new Set([
    "/HrDashBoard",
    "/EmployeeManagement",
    "/EmployeeRegistration",
    "/DailyAttendance",
    "/HrProfile",
    "/AttendanceRegularization",
    "/AddEmployeeForm",
    "/EmployeeList",
    "/PayrollCalculations",
    "/MockData",
    "/PayrollCharts",
    "/PayDashBoard",
    "/SalaryCalculation",
    "/EmpList",
    "/LeaveManagement",
    "/ApplyLeaveCalendar",
    "/LeaveStatus",
    "/SalaryStructure",
    "/LeaveHistory",
    "/DepartmentHierarchy",
    "/CreateTeam",
    "/ManageTeam",
    "/MyTeam",
    "/PayslipGenerator",
    "/WebsiteManagement",
    "LeftNavManagement",
    "/AddServices",
    "/ViewServices",
    "/AddCarousel",
    "/EditCarousel",
    "/AddCourses",
    "/EditCourses",
    "/AddStudent",
    "/ManageStudent",
    "/EditAboutUs",
    "/TrainingDashBoard",
    "/TrainingLeftnav",
    "/EditContactUs",
    "/ContactUsQuery",
    "/TrainingVideoPlayer",
    "/AddOurTeam",
    "/ManageOurTeam",
    "/AddDesAndDev",
    "/ManageDesAndDev",
    "/ManageTechStack",
    "/ManageItServices",
    "/AddItServices",
    "/Feedbackget",
    "/AddClient",
    "/EditClient",
    "/AddProject",
    "/ManageProject",
    "/AddCertification",
    "/ViewCertified",

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
        <Route path="/ApplyLeaveCalendar" element={<ApplyLeaveCalendar />} />
        <Route path="/Courses" element={<Courses />} />
        <Route path="/Gallery" element={<Gallery />} />
        <Route path="/Training" element={<Training />} />
        <Route path="/TrainingRegistration" element={<TrainingRegistration />} />
        <Route path="/Python" element={<Python />} />
        <Route path="/TrainingPHP" element={<TrainingPHP />} />
        <Route path="/TrainingBootstrap" element={<TrainingBootstrap />} />
        <Route path="/TrainingMySql" element={<TrainingMySql />} />
        <Route path="/TrainingPHP" element={<TrainingPHP />} />
        <Route path="/TrainingWebDesign" element={<TrainingWebDesign />} />
        <Route path="/UIUXTraining" element={<UIUXTraining />} />
        <Route path="/WebsiteManagement" element={<WebsiteManagement />} />
        <Route path="/LeftNavManagement" element={<LeftNavManagement />} />
        <Route path="/AddServices" element={<AddServices />} />
        <Route path="/ViewServices" element={<ViewServices />} />
        <Route path="/TrainingDashBoard" element={<TrainingDashBoard />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Feedback" element={<Feedback/>} />
        <Route path="/TrainingLeftnav" element={<TrainingLeftnav />} />
        <Route path="/TrainingVideoPlayer" element={<TrainingVideoPlayer />} />
        {/* <Route path="/Services" element={<Services />} /> */}
        <Route path="/RunningProjects" element={<RunningProjects />} />
        <Route path="/ServicesPage" element={<ServicesPage />} />
    

        

        {/* Hr  Payroll (protected) */}
        <Route
          path="/LeaveStatus"
          element={
            <ProtectedRoute>
              <LeaveStatus />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/LeaveHistory"
          element={
            <ProtectedRoute>
              < LeaveHistory />
            </ProtectedRoute>
          }
        />
       
         <Route
          path="/AddEmployeeForm"
          element={
            <ProtectedRoute>
              <AddEmployeeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PayrollCalculations"
          element={
            <ProtectedRoute>
              <PayrollCalculations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EmployeeList"
          element={
            <ProtectedRoute>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PayrollCharts"
          element={
            <ProtectedRoute>
              <PayrollCharts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SalaryStructure"
          element={
            <ProtectedRoute>
              <SalaryStructure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PayslipGenerator"
          element={
            <ProtectedRoute>
              <PayslipGenerator />
            </ProtectedRoute>
          }
        />
        
        
        <Route
          path="/PayDashBoard"
          element={
            <ProtectedRoute>
              <PayDashBoard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/CreateTeam"
          element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          }
        />
         <Route
          path="/ManageTeam"
          element={
            <ProtectedRoute>
              <ManageTeam />
            </ProtectedRoute>
          }
        />
         <Route
          path="/MyTeam"
          element={
            <ProtectedRoute>
              <MyTeam />
            </ProtectedRoute>
          }
        />
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
          path="/AttendanceRegularization"
          element={
            <ProtectedRoute>
              <AttendanceRegularization />
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
          path="/DepartmentHierarchy"
          element={
            <ProtectedRoute>
              <DepartmentHierarchy/>
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
        {/* Admin Panel Routes */}
        <Route
          path="/AddCarousel"
          element={
            <ProtectedRoute>
              <AddCarousel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditCarousel"
          element={
            <ProtectedRoute>
              <EditCarousel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddCourses"
          element={
            <ProtectedRoute>
              <AddCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditCourses"
          element={
            <ProtectedRoute>
              <EditCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddStudent"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageStudent"
          element={
            <ProtectedRoute>
              <ManageStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditAboutUs"
          element={
            <ProtectedRoute>
              <EditAboutUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/EditContactUs"
          element={
            <ProtectedRoute>
              <EditContactUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ContactUsQuery"
          element={
            <ProtectedRoute>
              <ContactUsQuery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddOurTeam"
          element={
            <ProtectedRoute>
              <AddOurTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageOurTeam"
          element={
            <ProtectedRoute>
              <ManageOurTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddDesAndDev"
          element={
            <ProtectedRoute>
              <AddDesAndDev />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageDesAndDev"
          element={
            <ProtectedRoute>
              <ManageDesAndDev />
            </ProtectedRoute>
          }
        />
         <Route
          path="/ManageTechStack"
          element={
            <ProtectedRoute>
              <ManageTechStack />
            </ProtectedRoute>
          }
        />
         <Route
          path="/AddItServices"
          element={
            <ProtectedRoute>
              <AddItServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Feedbackget"
          element={
            <ProtectedRoute>
              <Feedbackget/>
            </ProtectedRoute>
          }
        />

         <Route
          path="/ManageItServices"
          element={
            <ProtectedRoute>
              <ManageItServices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AddClient"
          element={
            <ProtectedRoute>
              <AddClient/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/EditClient"
          element={
            <ProtectedRoute>
              <EditClient/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddProject"
          element={
            <ProtectedRoute>
              <AddProject/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageProject"
          element={
            <ProtectedRoute>
              <ManageProject/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddCertification"
          element={
            <ProtectedRoute>
              <AddCertification/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ViewCertified"
          element={
            <ProtectedRoute>
              <ViewCertified/>
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
