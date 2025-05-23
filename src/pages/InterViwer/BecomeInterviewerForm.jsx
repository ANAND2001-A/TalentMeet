import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useInterviewerFormStore } from '../../stores/interviewerFormStore';
import Header from './Header';
import SectionNav from './SectionNav';
import ProfilePhoto from './ProfilePhoto';
import PersonalInfo from './PersonalInfo';
import Expertise from './Expertise';
import Availability from './Availability';
import Experience from './Experience';
import Credentials from './Credentials';

export default function BecomeInterviewerForm() {
  const navigate = useNavigate();
  const {
    formData,
    profileImage,
    profileImagePreview,
    certifications,
    existingCertUrls,
    availability,
    activeSection,
    isEditing,
    loading,
    submitting,
    error,
    setFormData,
    setProfileImagePreview,
    setCertifications,
    setExistingCertUrls,
    setAvailability,
    setIsEditing,
    setLoading,
    setSubmitting,
    setError,
    setUserId,
    isProfileMenuOpen,
  } = useInterviewerFormStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#profile-button') && isProfileMenuOpen) {
        useInterviewerFormStore.setState({ isProfileMenuOpen: false });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const profileRef = doc(db, 'interviewersProfile', user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setFormData({
              fullName: data.fullName || '',
              professionalTitle: data.professionalTitle || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              expertise: data.expertise || [],
              yearsOfExperience: data.yearsOfExperience || '',
              currentRole: data.currentRole || '',
              currentCompany: data.currentCompany || '',
              hourlyRate: data.hourlyRate || '',
              interviewDuration: data.interviewDuration || '60',
              workHistory: data.workHistory || '',
              education: data.education || '',
              linkedinUrl: data.linkedinUrl || '',
              githubUrl: data.githubUrl || '',
              termsAgreed: data.termsAgreed || false,
              infoAccurate: data.infoAccurate || false,
            });
            if (data.availability) {
              setAvailability(data.availability);
            }
            if (data.profileImageUrl) {
              setProfileImagePreview(data.profileImageUrl);
            }
            if (data.certifications) {
              setExistingCertUrls(data.certifications);
            }
            setIsEditing(true);
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
          setError('Failed to load profile: ' + err.message);
        }
      } else {
        setError('Please log in to access this form.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFormData, setAvailability, setProfileImagePreview, setExistingCertUrls, setIsEditing, setUserId, setError, setLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const user = auth.currentUser;
    if (!user) {
      setError('Please log in to submit the application');
      setSubmitting(false);
      return;
    }

    try {
      let profileImageUrl = profileImagePreview;
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}/${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      const certUrls = [...existingCertUrls];
      for (let cert of certifications) {
        if (cert.size > 10 * 1024 * 1024) {
          setError(`Certification ${cert.name} must be less than 10MB`);
          setSubmitting(false);
          return;
        }
        const certRef = ref(storage, `certifications/${user.uid}/${cert.name}`);
        await uploadBytes(certRef, cert);
        const url = await getDownloadURL(certRef);
        certUrls.push(url);
      }

      const profileRef = doc(db, 'interviewersProfile', user.uid);
      const profileSnap = await getDoc(profileRef);
      await setDoc(
        profileRef,
        {
          uid: user.uid,
          ...formData,
          profileImageUrl,
          availability,
          certifications: certUrls,
          isInterviewer: true,
          createdAt: profileSnap.exists() ? profileSnap.data().createdAt || new Date() : new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      navigate(isEditing ? '/profile' : '/interviewers');
    } catch (err) {
      console.error('Failed to submit application:', err);
      setError('Failed to submit application: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        <Header />
        <main>
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <h1 className="text-3xl font-bold mb-4">
                {isEditing ? 'Edit Profile' : 'Become an Interviewer'}
              </h1>
              <p className="text-lg mb-6">
                {isEditing
                  ? 'Update your details to keep your profile current.'
                  : 'Share your expertise, help others grow, and earn income on your own schedule.'}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Update Your Profile' : 'Interviewer Application'}
            </h2>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${useInterviewerFormStore.getState().formProgress}%`,
                  backgroundColor:
                    useInterviewerFormStore.getState().formProgress < 33
                      ? '#f87171'
                      : useInterviewerFormStore.getState().formProgress < 66
                      ? '#facc15'
                      : '#10b981',
                }}
              ></div>
            </div>
          </div>
          <SectionNav />
          <form onSubmit={handleSubmit} className="space-y-8">
            {activeSection === 'personal' && (
              <>
                <ProfilePhoto />
                <PersonalInfo />
              </>
            )}
            {activeSection === 'expertise' && <Expertise />}
            {activeSection === 'availability' && <Availability />}
            {activeSection === 'experience' && <Experience />}
            {activeSection === 'credentials' && <Credentials />}
          </form>
        </main>
      </div>
    </div>
  );
}