import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function Expertise() {
  const { formData, setFormData, updateExpertise } = useInterviewerFormStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Expertise</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {['React', 'Node.js', 'Python', 'Java', 'SQL', 'DevOps'].map((skill) => (
          <label key={skill} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.expertise.includes(skill)}
              onChange={() => updateExpertise(skill)}
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
  );
}