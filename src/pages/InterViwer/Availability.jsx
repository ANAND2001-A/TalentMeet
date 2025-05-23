import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function Availability() {
  const { formData, availability, setFormData, updateAvailability } = useInterviewerFormStore();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
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
                        onClick={() => updateAvailability(day, hour)}
                        className={`w-6 h-6 rounded-sm ${
                          availability[day][hour] ? 'bg-blue-600' : 'bg-gray-200'
                        } hover:opacity-80 transition-colors`}
                        aria-label={`${day} at ${hour}:00 ${
                          availability[day][hour] ? 'available' : 'unavailable'
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
  );
}