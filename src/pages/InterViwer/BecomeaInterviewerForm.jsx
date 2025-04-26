import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, updateDoc, query, where, collection, getDocs } from "firebase/firestore";

export default function BecomeInterviewerForm() {
  const [formProgress, setFormProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("personal");
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

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9 AM to 5 PM
  const [certifications, setCertifications] = useState([]);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Create a new object with the updated form data
      const updatedForm = { ...prev, [name]: value };
  
      // Update progress based on updatedForm
      const filledFields = Object.values(updatedForm).filter((val) =>
        typeof val === "string" ? val.trim() !== "" :
        Array.isArray(val) ? val.length > 0 : val // Check for non-empty string/array
      ).length;
  
      const totalFields = Object.keys(updatedForm).length;
      const progress = Math.round((filledFields / totalFields) * 100);
  
      // Update the progress state
      setFormProgress(progress);
  
      // Return the updated form state
      return updatedForm;
    });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: checked };
  
      // Recalculate progress
      const filledFields = Object.values(updatedForm).filter((val) =>
        typeof val === "string"
          ? val.trim() !== ""
          : Array.isArray(val)
          ? val.length > 0
          : val === true
      ).length;
  
      const totalFields = Object.keys(updatedForm).length;
      const progress = Math.round((filledFields / totalFields) * 100);
      setFormProgress(progress);
  
      return updatedForm;
    });
  };
  

  

  // Handle expertise selection (multi-select for skills)
  const handleExpertiseChange = (skill) => {
    setFormData((prev) => {
      const expertise = prev.expertise.includes(skill)
        ? prev.expertise.filter((item) => item !== skill)
        : [...prev.expertise, skill];
      return { ...prev, expertise };
    });
  };


  // Handle certifications change (when certifications are uploaded)
  const handleCertificationsChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCertifications((prev) => [...prev, ...newFiles]);
    }
  };



  // Initialize the availability state with all hours as unavailable
  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = hours.reduce((hourAcc, hour) => {
        hourAcc[hour] = false; // Set all hours to unavailable initially
        return hourAcc;
      }, {});
      return acc;
    }, {})
  );

  // Handle availability changes (toggle availability for specific time slots)
  const handleAvailabilityChange = (day, hour) => {
    setAvailability((prevAvailability) => ({
      ...prevAvailability,
      [day]: {
        ...prevAvailability[day],
        [hour]: !prevAvailability[day][hour], // Toggle availability for the hour
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "mockUsers"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        isInterviewer: true,
        bio: formData.fullName,
        experience: formData.yearsOfExperience,
        skills: formData.expertise,
        price: parseInt(formData.hourlyRate),
      });

      navigate("/interviewers");
    }
  };

  // Functions for handling profile image drag and drop
  const handleDragOver = (event) => {
    event.preventDefault(); // Allow dropping
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleProfileImageChange(file);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files ? event.target.files[0] : event;
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to render navigation for the form sections
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
            className={`px-4 py-3 font-medium text-sm mr-2 !rounded-button whitespace-nowrap cursor-pointer ${activeSection === section.id
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w mx-auto">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-xl font-bold text-gray-900">InterviewApp</div>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </a>
            <div className="relative">
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer">
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h1 className="text-3xl font-bold mb-4">Become an Interviewer</h1>
            <p className="text-lg mb-6">
              Share your expertise, help others grow, and earn income on your own schedule.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-full mr-3">
                  <i className="fas fa-money-bill-wave text-lg"></i>
                </div>
                <div>
                  <h3 className="font-medium">Competitive Earnings</h3>
                  <p className="text-sm text-blue-100">
                    Set your own rates and availability
                  </p>
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
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Interviewer Application
          </h2>
          <div className="w-32 bg-gray-200 rounded-full h-2.5">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className={`h-2.5 rounded-full transition-all duration-300`}
                style={{
                  width: `${formProgress}%`,
                  backgroundColor:
                    formProgress < 33
                      ? "#f87171" // red
                      : formProgress < 66
                        ? "#facc15" // yellow
                        : "#10b981", // green
                }}
              ></div>
            </div>

          </div>
        </div>

        {renderSectionNav()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeSection === "personal" && (
            <div className="grid grid-cols-1 gap-6 md:w-1/2 mx-auto">

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Photo
                </h3>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("profile-image-input")?.click()
                  }
                >
                  {profileImagePreview ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview}
                        alt="Profile Preview"
                        className="w-full h-32 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
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
                      <p className="text-xs text-gray-400">
                        JPG, PNG or GIF (Max. 5MB)
                      </p>
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
              </div>

              {/* Input Fields with Icons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="relative">
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    className="p-3 pl-10 border rounded-md w-full"
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
                    className="p-3 pl-10 border rounded-md w-full"
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
                    className="p-3 pl-10 border rounded-md w-full"
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
                    className="p-3 pl-10 border rounded-md w-full"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="fas fa-phone-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
          )}


          {activeSection === "expertise" && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["React", "Node.js", "Python", "Java", "SQL", "DevOps"].map(
                  (skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(skill)}
                        onChange={() => handleExpertiseChange(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  )
                )}
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

          {activeSection === "availability" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Availability Schedule Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Schedule</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select all time slots when you're available to conduct interviews (in your local time zone)
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Day
                        </th>
                        {hours.map((hour) => (
                          <th
                            key={hour}
                            className="py-2 px-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8"
                          >
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
                                className={`w-6 h-6 rounded-sm cursor-pointer ${availability[day][hour]
                                  ? "bg-blue-600"
                                  : "bg-gray-200"
                                  }`}
                                aria-label={`${day} at ${hour}:00 ${availability[day][hour] ? "available" : "unavailable"}`}
                              ></button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing & Duration Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="number"
                    name="hourlyRate"
                    placeholder="Hourly Rate (USD)"
                    className="p-3 border rounded w-full mb-4"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    required
                  />

                  <select
                    name="interviewDuration"
                    className="p-3 border rounded w-full"
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
          )}

          {activeSection === "experience" && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Professional Experience
              </h3>
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
                className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                Import from LinkedIn
              </button>
            </div>
          )}
          {/* Credentials Section */}

          {activeSection === "credentials" && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Education & Certifications
              </h3>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
              <div>
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
                          <span className="font-semibold">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, PNG or JPG (MAX. 10MB)
                        </p>
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
                                setCertifications((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                              className="text-red-500 hover:text-red-700 cursor-pointer"
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

                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Terms & Conditions
                  </h3>
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
                          <label
                            htmlFor="termsAgreed"
                            className="font-medium text-gray-700"
                          >
                            I agree to the interviewer guidelines *
                          </label>
                          <p className="text-gray-500">
                            I will maintain professional conduct, be punctual
                            for scheduled interviews, and provide constructive
                            feedback to candidates.
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
                          <label
                            htmlFor="infoAccurate"
                            className="font-medium text-gray-700"
                          >
                            I confirm all information is accurate *
                          </label>
                          <p className="text-gray-500">
                            The information provided in this application is
                            true and accurate to the best of my knowledge.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
