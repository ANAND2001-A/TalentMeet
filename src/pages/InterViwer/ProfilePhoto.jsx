import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function ProfilePhoto() {
  const { profileImage, profileImagePreview, setProfileImage, setProfileImagePreview, setError } =
    useInterviewerFormStore();

  const handleProfileImageChange = (event) => {
    const file = event.target.files ? event.target.files[0] : event;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile image must be less than 5MB');
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

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleProfileImageChange(file);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:w-1/2 mx-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('profile-image-input')?.click()}
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
                setProfileImagePreview('');
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
    </div>
  );
}