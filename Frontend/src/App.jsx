import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import AuthSwitch from "./components/AuthComponents/AuthSwitch.jsx";
import Homepage from "./components/Pages/Homepage.jsx";
import ProtectedRoute from "./utils/ProtectedRoutes.jsx";
import ProfileSwitch from "./components/MainComponents/ProfileSwitch.jsx";
import { Navigate } from "react-router-dom";
import CourseGenerator from "./components/Pages/CourseGenerator.jsx";
import CourseView from "./components/CourseComponents/CourseView.jsx";
import CourseLayout2 from "./components/CourseComponents/CourseLayout2.jsx";
import ChapterContent from "./components/CourseComponents/ChapterContent.jsx";


function App() {
  return (
  <Router>
      <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthSwitch />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/profilepage" element={<ProfileSwitch />} />
          <Route path="/generatepage" element={<CourseGenerator />} />
          <Route path="/viewcourse" element={<CourseView />} />
          <Route path="/viewlayout" element={<CourseLayout2 />} />
          <Route path="/viewcontent" element={<ChapterContent />} />
        </Route>
      </Routes>
    </Router>
  );
 
 
}

export default App;
