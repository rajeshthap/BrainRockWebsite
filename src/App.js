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
import EmployeeRegistration from './componets/hr_dashboard/emp_regis/EmployeeRegistration';
import Login from './componets/all_login/Login';
import { AuthProvider } from './componets/context/AuthContext';


function AppContent() {
  const location = useLocation();

  const hiddenPaths = new Set([
    "/HrDashBoard",
    "/EmployeeManagement",
    "/EmployeeRegistration"
  ]);

  const hiddenFooter1 = new Set([
    "/",
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  const shouldHideFooter1 = hiddenFooter1.has(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/HrDashBoard" element={<HrDashBoard/>} />
        <Route path="/EmployeeManagement" element={<EmployeeManagement/>} />
        <Route path="/EmployeeRegistration" element={<EmployeeRegistration/>} />
        <Route path="/Login" element={<Login/>} />
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