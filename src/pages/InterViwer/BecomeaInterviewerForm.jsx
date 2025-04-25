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

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update progress dynamically based on filled fields
    const filledFields = Object.values(formData).filter((val) => val.trim() !== "").length;
    const totalFields = Object.keys(formData).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    setFormProgress(progress);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleExpertiseChange = (skill) => {
    setFormData((prev) => {
      const expertise = prev.expertise.includes(skill)
        ? prev.expertise.filter((item) => item !== skill)
        : [...prev.expertise, skill];
      return { ...prev, expertise };
    });
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
            className={`px-4 py-3 font-medium text-sm mr-2 !rounded-button whitespace-nowrap cursor-pointer ${
              activeSection === section.id
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
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>
        </div>

        {renderSectionNav()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeSection === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                placeholder="Full Name"
                className="p-2 border rounded"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <input
                name="professionalTitle"
                placeholder="Professional Title"
                className="p-2 border rounded"
                value={formData.professionalTitle}
                onChange={handleInputChange}
                required
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                className="p-2 border rounded"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                className="p-2 border rounded"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
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
              <input
                type="number"
                name="yearsOfExperience"
                placeholder="Years of Experience"
                className="p-2 border rounded"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                required
              />
              <input
                name="currentRole"
                placeholder="Current Role"
                className="p-2 border rounded"
                value={formData.currentRole}
                onChange={handleInputChange}
                required
              />
              <input
                name="currentCompany"
                placeholder="Current Company"
                className="p-2 border rounded"
                value={formData.currentCompany}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {activeSection === "availability" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="hourlyRate"
                placeholder="Hourly Rate (USD)"
                className="p-2 border rounded"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                required
              />
              <select
                name="interviewDuration"
                className="p-2 border rounded"
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
          )}

          {activeSection === "experience" && (
            <textarea
              name="workHistory"
              placeholder="Describe your work experience..."
              rows={5}
              className="w-full p-2 border rounded"
              value={formData.workHistory}
              onChange={handleInputChange}
              required
            />
          )}

          {activeSection === "credentials" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                name="education"
                placeholder="Education background"
                rows={4}
                className="p-2 border rounded"
                value={formData.education}
                onChange={handleInputChange}
                required
              />
              <input
                type="url"
                name="linkedinUrl"
                placeholder="LinkedIn Profile"
                className="p-2 border rounded"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                required
              />
              <input
                type="url"
                name="githubUrl"
                placeholder="GitHub Profile (optional)"
                className="p-2 border rounded"
                value={formData.githubUrl}
                onChange={handleInputChange}
              />
              <div className="col-span-2 space-y-2 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleCheckboxChange}
                    required
                  />
                  <span>I agree to the terms and conditions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="infoAccurate"
                    checked={formData.infoAccurate}
                    onChange={handleCheckboxChange}
                    required
                  />
                  <span>All information is accurate</span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-full"
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
