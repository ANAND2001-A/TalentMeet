import { useNavigate } from 'react-router-dom';
import { useInterviewerFormStore } from '../../stores/interviewerFormStore';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Header() {
  const navigate = useNavigate();
  const { isProfileMenuOpen, setIsProfileMenuOpen, userId, setError } = useInterviewerFormStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth/signin');
    } catch (err) {
      setError('Failed to log out: ' + err.message);
    }
  };

  return (
    <header className="bg-white shadow-sm rounded-lg mb-8">
      <div className="flex justify-between items-center p-4">
        <div className="text-2xl font-bold text-gray-900">InterviewApp</div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </button>
          <div className="relative">
            <button
              id="profile-button"
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              <i className="fas fa-user"></i>
            </button>
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                role="menu"
              >
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate(`/profile/${userId}`);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  My Profile
                </button>
                <button
                  disabled
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  role="menuitem"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Account Settings
                </button>
                <button
                  disabled
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  role="menuitem"
                >
                  <i className="fas fa-calendar-check mr-2"></i>
                  My Bookings
                </button>
                <button
                  disabled
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  role="menuitem"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Payment Methods
                </button>
                <button
                  disabled
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  title="Coming soon"
                  role="menuitem"
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  Help Center
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}