import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import img from "../assets/bg/orang.svg";
import img2 from "../assets/bg/pink.svg";

export default function InterviewerList() {
  const [userInfo, setUserInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "mockUsers"));
        const snapshot = await getDocs(q);
        const allUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentUser = allUsers.find((u) => u.uid === user.uid);
        setUserInfo(currentUser);

        setUsers(allUsers);
      } else {
        setUserInfo(null);
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    setUserInfo(null);
    navigate("/auth/signin");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "students" && user.role === "student") ||
      (activeTab === "teachers" && user.role === "teacher");

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8EBEB] via-[#FCF3F2] to-[#F5F7FA]">
      {/* Top-left SVG */}

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userInfo && (
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {userInfo.name}
          </h1>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4 sm:mb-0">
            {["all", "students", "teachers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
            key={user.id}
            className="relative bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Top-left decoration */}
            <img
              src={img}
              alt="Top Left Decoration"
              className="absolute top-20 left-[-40px] w-16 h-16"
            />
          
            {/* Top-right decoration */}
            <img
              src={img2}
              alt="Top Right Decoration"
              className="absolute bottom-[10px] right-[-30px] w-16 h-16"
            />
          

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.name}
                    </h3>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "teacher"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {user.role === "teacher" ? "Teacher" : "Student"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    <i className="fas fa-envelope mr-2 text-primary"></i>
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    <i className="fas fa-brain mr-2 text-primary"></i>
                    <span className="font-medium">Skills:</span>{" "}
                    {user.skills?.join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    <i className="fas fa-tag mr-2 text-primary"></i>
                    <span className="font-medium">Price:</span> ₹{user.price}/hr
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/chatbox/${user.uid}`)}
                    className="flex items-center px-4 py-2 bg-white text-button rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition duration-150"
                  >
                    <span className="flex items-center justify-center w-8 h-8 bg-secondary text-white rounded-full mr-2">
                      <i className="fas fa-comment-alt" />
                    </span>
                    Chat
                  </button>

                  <button
                    onClick={() => navigate(`/videochat/${user.uid}`)}
                    className="flex items-center px-4 py-2 bg-white text-button rounded-md text-sm font-medium whitespace-nowrap cursor-pointer"
                  >
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-2">
                      <i className="fas fa-video" />
                    </span>
                    Video Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-8">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-search text-5xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No users found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
