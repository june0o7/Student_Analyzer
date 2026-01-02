import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import StudentLogin from './pages/Auth/StudentLogin';
import StudentSignup from './pages/Auth/StudentSignup';
import TeacherLogin from './pages/Auth/TeacherLogin';
import TeacherSignup from './pages/Auth/TeacherSignup';
import StudentDashboard from './pages/Dashboard/Sdashboard';
import TeacherDashboard from './pages/Dashboard/Dashboard';
import StudentProfile from './pages/Dashboard/StudentProfile';
import StudentForm from './pages/StudentForm/StudentForm';
import DSAExam from './pages/DSA/DSAexam';
import DSAReport from './pages/DSA/DSAReport';
import AptitudeExam from './pages/Aptitude/AptitudeExam';
import AptitudeReport from './pages/Aptitude/AptitudeReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-signup" element={<TeacherSignup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-form" element={<StudentForm />} />
        <Route path="/DSAexam" element={<DSAExam />} />
        <Route path="/dsa-report" element={<DSAReport />} />
        <Route path="/aptitude-exam" element={<AptitudeExam />} />
<Route path="/aptitude-report" element={<AptitudeReport />} />
      </Routes>
    </Router>
  );
}

export default App;