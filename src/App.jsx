import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProfileDetail from "./pages/ProfileDetails";
import LoginScreen from "./pages/AuthScreens/LoginScreen";
import SignUpScreen from "./pages/AuthScreens/SignUpScreen";
import BecomeInterviewerForm from "./pages/InterViwer/BecomeaInterviewerForm";
import InterviewerList from "./pages/Home";
import InterviewerProfile from "./pages/InterViwer/InterViwerProfile";
import InterviewHome from "./pages/InterViwer/InterViewerHome";
import InterviewRoom from "./pages/InterviewRoom";
import ChatBox from "./pages/MasegePage/ChatBox";
import VideoChatBox from "./pages/MasegePage/VideoChatBox";
"./pages/CorporateDashboard";
import '@fortawesome/fontawesome-free/css/all.min.css';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<ProfileDetail />} />
        {/* <Route path="/admin/dashboard" element={<CorporateDashboard />} /> */}

        <Route path="/" element={<Home />} />

        {/* 👤 Profile Detail for logged-in user */}
        <Route path="/profile" element={<ProfileDetail />} />

        {/* 🧑‍🏫 Become Interviewer Form */}
        <Route path="/become-interviewer" element={<BecomeInterviewerForm />} />

        {/* 📋 All Interviewers List (optional if already on home) */}
        <Route path="/interviewers" element={<InterviewerList />} />

        {/* 👤 Public Interviewer Profile */}
        <Route path="/interviewer/:id" element={<InterviewerProfile />} />

        {/* 404 Fallback (optional) */}
        <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />

        <Route path="/interview-home" element={<InterviewHome />} />
        <Route path="/interview-room/:id" element={<InterviewRoom />} />
        <Route path="/chatbox/:id" element={<ChatBox />} />
        <Route path="/videochat/:id" element={<VideoChatBox />} />

      </Routes>

    </Router>
  );
}

export default App;
