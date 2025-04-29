import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Import Firebase auth and Firestore
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"; // Firestore methods for fetching and updating
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth state listener
import { useNavigate } from "react-router-dom";

export default function ProfileDetail() {
  // State for profile data, loading, error, and countdown timer
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  // Effect to fetch profile data when user is authenticated
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch profile directly using doc reference (optimized for single document)
          const profileRef = doc(db, "interviewersProfile", user.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setProfile({ id: profileSnap.id, ...profileSnap.data() });
          } else {
            setError("No profile found for this user.");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile: " + err.message);
        }
      } else {
        setError("Please log in to view your profile.");
      }
      setLoading(false);
    });

    // Update countdown timer every second
    const interval = setInterval(() => setNow(Date.now()), 1000);
    
    // Cleanup on component unmount
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Handle accepting an interview request
  const handleAcceptInterview = async () => {
    try {
      const interviewTime = Timestamp.fromDate(new Date(Date.now() + 2 * 60 * 1000)); // 2 minutes from now
      await updateDoc(doc(db, "interviewersProfile", profile.id), {
        isAccepted: true,
        interviewTime,
      });
      alert("Interview accepted and countdown started!");
      // Refresh profile data
      const profileRef = doc(db, "interviewersProfile", profile.id);
      const profileSnap = await getDoc(profileRef);
      setProfile({ id: profileSnap.id, ...profileSnap.data() });
    } catch (err) {
      setError("Failed to accept interview: " + err.message);
    }
  };

  // Format countdown time (hours, minutes, seconds)
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Render availability in a table format
  const renderAvailability = () => {
    if (!profile?.availability) {
      return <p className="text-gray-500">No availability set.</p>;
    }

    const days = Object.keys(profile.availability);
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="py-2 px-3">Day</th>
              {hours.map((hour) => (
                <th key={hour} className="py-2 px-1 text-center">{hour}:00</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-t">
                <td className="py-2 px-3 capitalize">{day}</td>
                {hours.map((hour) => (
                  <td key={`${day}-${hour}`} className="py-2 px-1 text-center">
                    {profile.availability[day][hour] ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">–</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Calculate countdown if applicable
  const showCountdown =
    profile?.isAccepted &&
    profile?.interviewTime &&
    new Date(profile.interviewTime.toDate()).getTime() > now;

  const remaining =
    showCountdown &&
    Math.floor((new Date(profile.interviewTime.toDate()).getTime() - now) / 1000);

  // Conditional rendering for loading, error, and no profile states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          {error || "No profile data found."}
        </div>
      </div>
    );
  }

  // Determine interview status
  const isInterviewer = profile.isInterviewer;
  const interviewScheduled =
    profile.isBooked && profile.bookedBy && !isInterviewer;
  const interviewerViewHasRequest =
    isInterviewer && profile.isBooked && !profile.isAccepted;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center space-x-4">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {profile.fullName?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{profile.fullName || "User"}</h1>
                <p className="text-lg">{profile.professionalTitle || "No title"}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong>Email:</strong> {profile.email || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.phoneNumber || "N/A"}</p>
              <p><strong>Current Role:</strong> {profile.currentRole || "N/A"}</p>
              <p><strong>Company:</strong> {profile.currentCompany || "N/A"}</p>
              <p><strong>Experience:</strong> {profile.yearsOfExperience || "N/A"} years</p>
              <p><strong>Hourly Rate:</strong> ₹{profile.hourlyRate || "N/A"}</p>
              <p><strong>Interview Duration:</strong> {profile.interviewDuration || "N/A"} mins</p>
              <p>
                <strong>LinkedIn:</strong>{" "}
                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {profile.linkedinUrl}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>GitHub:</strong>{" "}
                {profile.githubUrl ? (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {profile.githubUrl}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Expertise Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Expertise</h2>
          <p className="text-gray-600">
            {profile.expertise?.join(", ") || "No expertise listed"}
          </p>
        </div>

        {/* Education Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          <p className="text-gray-600">{profile.education || "Not specified"}</p>
        </div>

        {/* Work History Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Work History</h2>
          <p className="text-gray-600">{profile.workHistory || "Not specified"}</p>
        </div>

        {/* Certifications Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Certifications</h2>
          {profile.certifications && profile.certifications.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-600">
              {profile.certifications.map((cert, idx) => (
                <li key={idx}>
                  {cert.startsWith("http") ? (
                    <a
                      href={cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Certification {idx + 1}
                    </a>
                  ) : (
                    cert
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No certifications uploaded.</p>
          )}
        </div>

        {/* Availability Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Availability</h2>
          {renderAvailability()}
        </div>

        {/* Interview Status and Actions
        <div className="bg-white shadow-lg rounded-lg p-6">
          {interviewScheduled && (
            <p className="text-green-600 font-semibold mb-4">
              You have an upcoming interview!
            </p>
          )}

          {showCountdown && (
            <p className="text-blue-600 font-bold text-lg mb-4">
              Interview starts in: {formatTime(remaining)}
            </p>
          )}

          {interviewerViewHasRequest && (
            <button
              className="px-6 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleAcceptInterview}
            >
              Accept Interview Request
            </button>
          )}

          {profile.isAccepted &&
            profile.interviewTime &&
            new Date(profile.interviewTime.toDate()).getTime() <= now && (
              
              <button
                className="px-6 py-2 bg-purple-700 text-black rounded-lg hover:bg-purple-800 transition-colors"
                onClick={() => navigate(`/interview-room/${profile.bookedBy}`)}
              >
                Join Interview
              </button>
            )}
        </div> */}
      </div>
    </div>
  );
}