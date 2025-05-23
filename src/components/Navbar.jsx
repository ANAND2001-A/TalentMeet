import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserCircle } from "lucide-react";
import CustomButton from "./InputAndButton/CustomButton";

export default function Navbar() {
  const [userInfo, setUserInfo] = useState({});
  const [isInterviewer, setIsInterviewer] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(userInfo);

    // Auth state change handling
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          console.log("jhgf", userData);
          setUserInfo(userData);

          if (userData.isInterviewer === true) {
            setIsInterviewer(true);
          } else {
            setIsInterviewer(false);
          }
        }
      } else {
        setUserInfo(null);
        setIsInterviewer(false);
      }
    });

    // Click outside handling
    const handleClickOutside = (event) => {
      const profileButton = document.getElementById("profile-button");
      if (
        isProfileMenuOpen &&
        profileButton &&
        !profileButton.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    console.log("Logout clicked");
    await signOut(auth);
    setUserInfo(null);
    setIsInterviewer(false);
    navigate("/auth/signin");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-transparent shadow-none" style={{ paddingBottom: '20px' }}>

      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        InterviewApp
      </h1>

      {userInfo ? (
        <div className="flex items-center space-x-4">
          {!isInterviewer && (
            <button
              onClick={() => navigate("/become-interviewer")}
              className="px-4 py-2 text-sm text-white bg-button rounded hover:bg-green-700"
            >
              Become Interviewer
            </button>
          )}

          <span className="text-sm font-medium text-gray-700">
            {userInfo.name || userInfo.email}
          </span>

          <div className="relative">
            <button
              id="profile-button"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
            >
              <i className="fas fa-user"></i>
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a
                  href="/profile/:id"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-user-circle mr-2 "></i>
                  My Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Account Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-calendar-check mr-2"></i>
                  My Bookings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Payment Methods
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  Help Center
                </a>
              </div>
            )}
          </div>

          <CustomButton
            text="Logout"
            onClick={handleLogout}
            className="bg-button"
          />
        </div>
      ) : (
        <div className="space-x-4">
          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 text-sm text-white bg-primary rounded"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm text-white bg-secondary rounded"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
