import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function Credentials() {
  const {
    formData,
    setFormData,
    certifications,
    setCertifications,
    existingCertUrls,
    setExistingCertUrls,
    submitting,
  } = useInterviewerFormStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ [name]: checked });
  };

  const handleCertificationsChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCertifications([...certifications, ...newFiles]);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Education & Certifications</h3>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
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
          {existingCertUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Certifications:</h4>
              <ul className="space-y-2">
                {existingCertUrls.map((url, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-600 bg-gray-100 p-2 rounded"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 truncate max-w-xs"
                    >
                      Certification {index + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setExistingCertUrls(existingCertUrls.filter((_, i) => i !== index))
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
          {certifications.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">New Uploaded Files:</h4>
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
                        setCertifications(certifications.filter((_, i) => i !== index))
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
          disabled={submitting}
          className={`w-full ${
            submitting
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}