import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import AuthSwitch from "./components/AuthComponents/AuthSwitch.jsx";
import Homepage from "./components/Pages/Homepage.jsx"; // Import your Homepage component
import ProtectedRoute from "./utils/ProtectedRoutes.jsx";
import ProfileSwitch from "./components/MainComponents/ProfileSwitch.jsx";
import { Navigate } from "react-router-dom";

function App() {
  return (
  <Router>
      <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthSwitch />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/profilepage" element={<ProfileSwitch />} />
        </Route>
      </Routes>
    </Router>
  );
 
 
}

export default App;
