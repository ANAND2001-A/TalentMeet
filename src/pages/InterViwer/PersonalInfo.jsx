import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function PersonalInfo() {
  const { formData, setFormData } = useInterviewerFormStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:w-1/2 mx-auto">
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
  );
}