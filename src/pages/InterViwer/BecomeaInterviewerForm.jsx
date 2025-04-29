import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase"; // Firebase services
import { doc, setDoc, getDoc } from "firebase/firestore"; // Firestore methods
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage methods
import { onAuthStateChanged } from "firebase/auth"; // Auth state listener

export default function BecomeInterviewerForm() {
  // State for form progress, active section, and edit mode
  const [formProgress, setFormProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false); // Track if editing existing profile
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [error, setError] = useState(""); // Error state for Firebase operations

  // State for form data
  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    email: "",
    phoneNumber: "",
    expertise: [],
    yearsOfExperience: "",
    currentRole: "",
    currentCompany: "",
    hourlyRate: "",
    interviewDuration: "60",
    workHistory: "",
    education: "",
    linkedinUrl: "",
    githubUrl: "",
    termsAgreed: false,
    infoAccurate: false,
  });

  // State for profile image, certifications, and availability
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [certifications, setCertifications] = useState([]);
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = hours.reduce((hourAcc, hour) => {
        hourAcc[hour] = false;
        return hourAcc;
      }, {});
      return acc;
    }, {})
  );

  const navigate = useNavigate();

  // Fetch existing profile data on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch profile from Firestore using user's UID
          const profileRef = doc(db, "interviewersProfile", user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            // Pre-populate form data
            setFormData({
              fullName: data.fullName || "",
              professionalTitle: data.professionalTitle || "",
              email: data.email || "",
              phoneNumber: data.phoneNumber || "",
              expertise: data.expertise || [],
              yearsOfExperience: data.yearsOfExperience || "",
              currentRole: data.currentRole || "",
              currentCompany: data.currentCompany || "",
              hourlyRate: data.hourlyRate || "",
              interviewDuration: data.interviewDuration || "60",
              workHistory: data.workHistory || "",
              education: data.education || "",
              linkedinUrl: data.linkedinUrl || "",
              githubUrl: data.githubUrl || "",
              termsAgreed: data.termsAgreed || false,
              infoAccurate: data.infoAccurate || false,
            });
            // Pre-populate availability
            if (data.availability) {
              setAvailability(data.availability);
            }
            // Set profile image preview (URL from Firestore)
            if (data.profileImageUrl) {
              setProfileImagePreview(data.profileImageUrl);
            }
            // Set edit mode
            setIsEditing(true);
            // Update form progress
            updateFormProgress({
              ...data,
              expertise: data.expertise || [],
              termsAgreed: data.termsAgreed || false,
              infoAccurate: data.infoAccurate || false,
            });
          }
        } catch (err) {
          setError("Failed to load profile: " + err.message);
        }
      } else {
        setError("Please log in to access this form.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      updateFormProgress(updatedForm);
      return updatedForm;
    });
  };

  // Handle checkbox changes (e.g., termsAgreed)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: checked };
      updateFormProgress(updatedForm);
      return updatedForm;
    });
  };

  // Calculate form completion progress
  const updateFormProgress = (form) => {
    const filledFields = Object.entries(form).filter(([key, val]) => {
      if (key === "githubUrl") return false; // Optional field
      if (typeof val === "string") return val.trim() !== "";
      if (Array.isArray(val)) return val.length > 0;
      return val === true;
    }).length;

    const totalFields = Object.keys(form).length - 1; // Exclude githubUrl
    const progress = Math.round((filledFields / totalFields) * 100);
    setFormProgress(progress);
  };

  // Handle expertise checkbox changes
  const handleExpertiseChange = (skill) => {
    setFormData((prev) => {
      const expertise = prev.expertise.includes(skill)
        ? prev.expertise.filter((item) => item !== skill)
        : [...prev.expertise, skill];
      const updatedForm = { ...prev, expertise };
      updateFormProgress(updatedForm);
      return updatedForm;
    });
  };

  // Handle certification file uploads
  const handleCertificationsChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCertifications((prev) => [...prev, ...newFiles]);
    }
  };

  // Toggle availability for a day and hour
  const handleAvailabilityChange = (day, hour) => {
    setAvailability((prevAvailability) => ({
      ...prevAvailability,
      [day]: {
        ...prevAvailability[day],
        [hour]: !prevAvailability[day][hour],
      },
    }));
  };

  // Handle profile image selection and preview
  const handleProfileImageChange = (event) => {
    const file = event.target.files ? event.target.files[0] : event;
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Profile image must be less than 5MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission (create or update profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;
    if (!user) {
      setError("Please log in to submit the application");
      return;
    }

    try {
      // Upload profile image to Firebase Storage
      let profileImageUrl = profileImagePreview; // Preserve existing URL if no new image
      if (profileImage) {
        const imageRef = ref(storage, `mockinterviewProfileImages/${user.uid}/${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      // Upload certifications to Firebase Storage
      const certUrls = [];
      for (let cert of certifications) {
        if (cert.size > 10 * 1024 * 1024) { // 10MB limit
          setError(`Certification ${cert.name} must be less than 10MB`);
          return;
        }
        const certRef = ref(storage, `mockinterviewCertifications/${user.uid}/${cert.name}`);
        await uploadBytes(certRef, cert);
        const url = await getDownloadURL(certRef);
        certUrls.push(url);
      }

      // Save or update profile in Firestore
      const interviewerRef = doc(db, "interviewersProfile", user.uid);
      await setDoc(
        interviewerRef,
        {
          uid: user.uid,
          ...formData,
          profileImageUrl,
          availability,
          certifications: certUrls,
          isInterviewer: true,
          createdAt: isEditing ? formData.createdAt || new Date() : new Date(),
          updatedAt: new Date(), // Track last update time
        },
        { merge: true } // Merge to update existing fields
      );

      // Navigate to profile or interviewers page
      navigate(isEditing ? "/profile" : "/interviewers");
    } catch (err) {
      setError("Failed to submit application: " + err.message);
    }
  };

  // Handle drag-over for profile image
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle drop for profile image
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleProfileImageChange(file);
    }
  };

  // Render navigation tabs for form sections
  const renderSectionNav = () => {
    const sections = [
      { id: "personal", label: "Personal Info" },
      { id: "expertise", label: "Expertise" },
      { id: "availability", label: "Availability & Pricing" },
      { id: "experience", label: "Experience" },
      { id: "credentials", label: "Credentials" },
    ];

    return (
      <div className="flex flex-wrap mb-8 border-b">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-3 font-medium text-sm mr-2 rounded-t-lg transition-colors ${
              activeSection === section.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    );
  };

  // Conditional rendering for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-sm rounded-lg mb-8">
          <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-bold text-gray-900">InterviewApp</div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </button>
              <div className="relative">
                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <i className="fas fa-user"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Hero Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <h1 className="text-3xl font-bold mb-4">
                {isEditing ? "Edit Profile" : "Become an Interviewer"}
              </h1>
              <p className="text-lg mb-6">
                {isEditing
                  ? "Update your details to keep your profile current."
                  : "Share your expertise, help others grow, and earn income on your own schedule."}
              </p>
              {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-3">
                      <i className="fas fa-money-bill-wave text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Competitive Earnings</h3>
                      <p className="text-sm text-blue-100">Set your own rates and availability</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-3">
                      <i className="fas fa-laptop text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Remote Flexibility</h3>
                      <p className="text-sm text-blue-100">
                        Work from anywhere with an internet connection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-3">
                      <i className="fas fa-users text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Impact Careers</h3>
                      <p className="text-sm text-blue-100">
                        Help students achieve their professional goals
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Update Your Profile" : "Interviewer Application"}
            </h2>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${formProgress}%`,
                  backgroundColor:
                    formProgress < 33
                      ? "#f87171"
                      : formProgress < 66
                      ? "#facc15"
                      : "#10b981",
                }}
              ></div>
            </div>
          </div>

          {/* Section Navigation */}
          {renderSectionNav()}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info Section */}
            {activeSection === "personal" && (
              <div className="bg-white shadow-lg rounded-lg p-6 md:w-1/2 mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("profile-image-input")?.click()}
                >
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileImage(null);
                          setProfileImagePreview("");
                        }}
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <i className="fas fa-user-plus text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Drag and drop your photo here or click to browse
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG or GIF (Max. 5MB)</p>
                    </>
                  )}
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="relative">
                    <input
                      name="fullName"
                      placeholder="Full Name"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      name="professionalTitle"
                      placeholder="Professional Title"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.professionalTitle}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="fas fa-briefcase absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      name="email"
                      placeholder="Email"
                      type="email"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      name="phoneNumber"
                      placeholder="Phone Number"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <i className="fas fa-phone-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
              </div>
            )}

            {/* Expertise Section */}
            {activeSection === "expertise" && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expertise</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {["React", "Node.js", "Python", "Java", "SQL", "DevOps"].map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(skill)}
                        onChange={() => handleExpertiseChange(skill)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="yearsOfExperience"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="currentRole"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Role *
                    </label>
                    <input
                      type="text"
                      id="currentRole"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Senior Developer"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="currentCompany"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Company *
                    </label>
                    <input
                      type="text"
                      id="currentCompany"
                      name="currentCompany"
                      value={formData.currentCompany}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Google"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Availability Section */}
            {activeSection === "availability" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Schedule</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select all time slots when you're available to conduct interviews (in your local time zone)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left w-24">Day</th>
                          {hours.map((hour) => (
                            <th key={hour} className="py-2 px-1 text-center w-8">
                              {hour}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {days.map((day) => (
                          <tr key={day} className="border-t border-gray-200">
                            <td className="py-2 px-3 text-sm font-medium text-gray-900 capitalize">
                              {day}
                            </td>
                            {hours.map((hour) => (
                              <td key={`${day}-${hour}`} className="py-1 px-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleAvailabilityChange(day, hour)}
                                  className={`w-6 h-6 rounded-sm ${
                                    availability[day][hour] ? "bg-blue-600" : "bg-gray-200"
                                  } hover:opacity-80 transition-colors`}
                                  aria-label={`${day} at ${hour}:00 ${
                                    availability[day][hour] ? "available" : "unavailable"
                                  }`}
                                ></button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Duration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="hourlyRate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Hourly Rate (USD) *
                      </label>
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        placeholder="Hourly Rate (USD)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="interviewDuration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Interview Duration *
                      </label>
                      <select
                        id="interviewDuration"
                        name="interviewDuration"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.interviewDuration}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Duration</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === "experience" && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Experience</h3>
                <div className="mb-6">
                  <label
                    htmlFor="workHistory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Work History *
                  </label>
                  <textarea
                    id="workHistory"
                    name="workHistory"
                    value={formData.workHistory}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your relevant work experience, including roles, responsibilities, and achievements..."
                    required
                  ></textarea>
                </div>
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-3 text-sm text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                  Import from LinkedIn
                </button>
              </div>
            )}

            {/* Credentials Section */}
            {activeSection === "credentials" && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Education & Certifications
                </h3>
                <div className="mb-6">
                  <label
                    htmlFor="education"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Education Background *
                  </label>
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List your degrees, institutions, and graduation years..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications
                  </label>
                  <div className="border border-gray-300 rounded-md p-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, PNG or JPG (MAX. 10MB)</p>
                        </div>
                        <input
                          id="certifications"
                          name="certifications"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleCertificationsChange}
                        />
                      </label>
                    </div>
                    {certifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Files:
                        </h4>
                        <ul className="space-y-2">
                          {certifications.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between text-sm text-gray-600 bg-gray-100 p-2 rounded"
                            >
                              <div className="flex items-center">
                                <i className="fas fa-file-alt text-blue-500 mr-2"></i>
                                {file.name}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setCertifications((prev) => prev.filter((_, i) => i !== index))
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label
                      htmlFor="linkedinUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      LinkedIn Profile URL *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fab fa-linkedin text-gray-400"></i>
                      </div>
                      <input
                        type="url"
                        id="linkedinUrl"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/yourprofile"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="githubUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      GitHub Profile URL (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fab fa-github text-gray-400"></i>
                      </div>
                      <input
                        type="url"
                        id="githubUrl"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <div className="mb-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="termsAgreed"
                            name="termsAgreed"
                            type="checkbox"
                            checked={formData.termsAgreed}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="termsAgreed" className="font-medium text-gray-700">
                            I agree to the interviewer guidelines *
                          </label>
                          <p className="text-gray-500">
                            I will maintain professional conduct, be punctual for scheduled
                            interviews, and provide constructive feedback to candidates.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="infoAccurate"
                            name="infoAccurate"
                            type="checkbox"
                            checked={formData.infoAccurate}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="infoAccurate" className="font-medium text-gray-700">
                            I confirm all information is accurate *
                          </label>
                          <p className="text-gray-500">
                            The information provided in this application is true and accurate to
                            the best of my knowledge.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {isEditing ? "Update Profile" : "Submit Application"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}