// App.js

import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useVersionChecker } from "./utils/versionChecker";
import UpdateNotification from "./components/UpdateNotification";
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

import Login from "./componets/all_login/Login";
import { AuthProvider } from "./componets/context/AuthContext";
import { UserProfileProvider } from "./componets/context/UserProfileContext";

import ProtectedRoute from "./componets/context/ProtectedRoute";

import ForgotPassword from "./componets/all_login/ForgotPassword";

import {
  PayrollCalculations,
  calculateTotals,
} from "./utils/PayrollCalculations";

import CompanyProfile from "./componets/pages/aboutus/CompanyProfile";
import OurTeam from "./componets/pages/aboutus/OurTeam";
import Careers from "./componets/pages/aboutus/RunningProjects";

import Courses from "./componets/topnav/navigationpages/Courses";
import Gallery from "./componets/topnav/navigationpages/Gallery";

import TrainingRegistration from "./componets/topnav/navigationpages/TrainingRegistration";

import WebsiteManagement from "./componets/adminpanel/WebsiteManagement";
import LeftNavManagement from "./componets/adminpanel/LeftNavManagement";
import AddServices from "./componets/adminpanel/Services/AddServices";
import ViewServices from "./componets/adminpanel/Services/ViewServices";
import AddCarousel from "./componets/adminpanel/carousel/AddCarousel";
import EditCarousel from "./componets/adminpanel/carousel/EditCarousel";
import AddCourses from "./componets/adminpanel/courses/AddCourses";
import EditCourses from "./componets/adminpanel/courses/EditCourses";
import ManageStudent from "./componets/adminpanel/gallery/ManageStudent";
import ManagePaymentsRefunds from "./componets/adminpanel/gallery/ManagePaymentsRefunds";
import EditAboutUs from "./componets/adminpanel/aboutus/EditAboutUs";
import Contact from "./componets/topnav/navigationpages/Contact";

import EditContactUs from "./componets/adminpanel/aboutus/EditContactUs";
import ContactUsQuery from "./componets/adminpanel/aboutus/ContactUsQuery";

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
import ViewCertified from "./componets/adminpanel/Candidate/ViewCertified";
import ServicesDetails from "./componets/pages/ServicesDetails";
import Certificate from "./componets/topnav/navigationpages/Certificate";
import ManageFirm from "./componets/adminpanel/addfirm/ManageFirm";
import AddFirm from "./componets/adminpanel/addfirm/AddFirm";

import Career from "./componets/topnav/navigationpages/Career";

import AllStudentsData from "./componets/adminpanel/Candidate/AllStudentsData";

import AddNotification from "./componets/adminpanel/Notification/AddNotification";
import EditNotification from "./componets/adminpanel/Notification/EditNotification";
import AddStudent from "./componets/adminpanel/gallery/AddStudent";
import ProjectDetail from "./componets/pages/aboutus/ProjectDetails";
import AddAwards from "./componets/adminpanel/awards/AddAwards";
import ManageAwards from "./componets/adminpanel/awards/ManageAwards";
import GenerateBill from "./componets/adminpanel/billgeneration/GenerateBill";
import ManageBills from "./componets/adminpanel/billgeneration/ManageBills";
import BillUpload from "./componets/adminpanel/billgeneration/BillUpload";
import Terms from "./componets/pdf_page/Terms";
import Faq from "./componets/pdf_page/Faq";
import KheloJito from "./componets/Play_and_Win/KheloJito";
import Test from "./componets/Play_and_Win/Test";
import AddPlay from "./componets/adminpanel/khelo_jito/AddPlay";
import ManagePlay from "./componets/adminpanel/khelo_jito/ManagePlay";
import AddQuiz from "./componets/adminpanel/khelo_jito/AddQuiz";
import ManageQuiz from "./componets/adminpanel/khelo_jito/ManageQuiz";
import Registerduser from "./componets/adminpanel/khelo_jito_registerd_user/Registerduser";
import UserDashBoard from "./componets/khelo_jito_panel/UserDashBoard";
import UserProfile from "./componets/khelo_jito_panel/user_profile/UserProfile";
import TestWinner from "./componets/khelo_jito_panel/TestWinner";
import WalletPaymentStatus from "./componets/khelo_jito_panel/WalletPaymentStatus";
import Quiz from "./componets/khelo_jito_panel/Quiz";
import QuizTest from "./componets/Play_and_Win/QuizTest";

// import Terms from "./componets/pdf_page/Terms";
function AppContent() {
  const location = useLocation();
  const { updateAvailable, handleRefresh } = useVersionChecker();

  const hiddenPaths = new Set([
    "/PayrollCalculations",
    "/MockData",

    "/SalaryCalculation",

    "/SalaryStructure",

    "/DepartmentHierarchy",

    "/ManageTeam",

    "/test",
    "/WebsiteManagement",
    "LeftNavManagement",
    "/AddServices",
    "/ViewServices",
    "/AddCarousel",
    "/EditCarousel",
    "/AddCourses",
    "/EditCourses",
    "/ManageStudent",
    "/ManagePaymentsRefunds",
    "/AddStudent",
    "/EditAboutUs",
    "/EditContactUs",
    "/ContactUsQuery",
    "/AddOurTeam",
    "/ManageOurTeam",
    "/AddDesAndDev",
    "/ManageDesAndDev",
    "/ManageTechStack",
    "/ManageItServices",
    "/AddItServices",
    "/Feedbackget",
    "/AddAwards",
    "/ManageAwards",
    "/AddClient",
    "/EditClient",
    "/AddProject",
    "/ManageProject",
    "/ViewCertified",
    "/AddNotification",
    "/EditNotification",
    "/AddFirm",
    "/ManageFirm",

    "/AllStudentsData",
    "/GenerateBill",
    "/ManageBills",
    "/BillUpload",
    "/AddPlay",
    "/ManagePlay",
    "/AddQuiz",
    "/ManageQuiz",
    "/Registerduser",
    "/UserDashBoard",
    "/UserProfile",
    "/TestWinner",
    "/WalletPaymentStatus",
    "/Quiz",
    "/QuizTest",
  ]);

  const hiddenFooter1 = new Set([""]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  const shouldHideFooter1 = hiddenFooter1.has(location.pathname);

  return (
    <>
      {updateAvailable && <UpdateNotification onRefresh={handleRefresh} />}
      {!shouldHideNavbar && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        <Route path="/Courses" element={<Courses />} />
        <Route path="/Gallery" element={<Gallery />} />
        <Route path="/Training" element={<Training />} />
        <Route
          path="/TrainingRegistration"
          element={<TrainingRegistration />}
        />

        <Route path="/LeftNavManagement" element={<LeftNavManagement />} />
        <Route path="/AddServices" element={<AddServices />} />
        <Route path="/ViewServices" element={<ViewServices />} />

        <Route path="/Contact" element={<Contact />} />
        <Route path="/Feedback" element={<Feedback />} />

        {/* <Route path="/Services" element={<Services />} /> */}
        <Route path="/RunningProjects" element={<RunningProjects />} />
        <Route path="/ServicesPage" element={<ServicesPage />} />
        <Route path="/Certificate" element={<Certificate />} />
        <Route path="/ProjectDetail" element={<ProjectDetail />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/WalletPaymentStatus" element={<WalletPaymentStatus />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/KheloJito" element={<KheloJito />} />
        <Route path="/test" element={<Test />} />

        {/* Hr  Payroll (protected) */}
        <Route
          path="/WebsiteManagement"
          element={
            <ProtectedRoute>
              <WebsiteManagement />
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
          path="/Registerduser"
          element={
            <ProtectedRoute>
              <Registerduser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/UserProfile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/CompanyProfile" element={<CompanyProfile />} />
        <Route path="/OurTeam" element={<OurTeam />} />
        <Route path="/Career" element={<Career />} />
        <Route path="/ServicesDetails" element={<ServicesDetails />} />
        {/* Protected Routes */}

        <Route
          path="/TestWinner"
          element={
            <ProtectedRoute>
              <TestWinner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/QuizTest"
          element={
            <ProtectedRoute>
              <QuizTest />
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
          path="/AllStudentsData"
          element={
            <ProtectedRoute>
              <AllStudentsData />
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
          path="/ManagePaymentsRefunds"
          element={
            <ProtectedRoute>
              <ManagePaymentsRefunds />
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
              <Feedbackget />
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
          path="/AddAwards"
          element={
            <ProtectedRoute>
              <AddAwards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ManageAwards"
          element={
            <ProtectedRoute>
              <ManageAwards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/GenerateBill"
          element={
            <ProtectedRoute>
              <GenerateBill />
            </ProtectedRoute>
          }
        />

        <Route
          path="/BillUpload"
          element={
            <ProtectedRoute>
              <BillUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ManageBills"
          element={
            <ProtectedRoute>
              <ManageBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UserDashBoard"
          element={
            <ProtectedRoute>
              <UserDashBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AddClient"
          element={
            <ProtectedRoute>
              <AddClient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/EditClient"
          element={
            <ProtectedRoute>
              <EditClient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AddProject"
          element={
            <ProtectedRoute>
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageProject"
          element={
            <ProtectedRoute>
              <ManageProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AddNotification"
          element={
            <ProtectedRoute>
              <AddNotification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/EditNotification"
          element={
            <ProtectedRoute>
              <EditNotification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ViewCertified"
          element={
            <ProtectedRoute>
              <ViewCertified />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddFirm"
          element={
            <ProtectedRoute>
              <AddFirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageFirm"
          element={
            <ProtectedRoute>
              <ManageFirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddPlay"
          element={
            <ProtectedRoute>
              <AddPlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManagePlay"
          element={
            <ProtectedRoute>
              <ManagePlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddQuiz"
          element={
            <ProtectedRoute>
              <AddQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManageQuiz"
          element={
            <ProtectedRoute>
              <ManageQuiz />
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
      <UserProfileProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProfileProvider>
    </AuthProvider>
  );
}

export default App;
