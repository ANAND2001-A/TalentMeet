import { create } from 'zustand';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const initialAvailability = days.reduce((acc, day) => {
  acc[day] = hours.reduce((hourAcc, hour) => {
    hourAcc[hour] = false;
    return hourAcc;
  }, {});
  return acc;
}, {});

export const useInterviewerFormStore = create((set) => ({
  formData: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phoneNumber: '',
    expertise: [],
    yearsOfExperience: '',
    currentRole: '',
    currentCompany: '',
    hourlyRate: '',
    interviewDuration: '60',
    workHistory: '',
    education: '',
    linkedinUrl: '',
    githubUrl: '',
    termsAgreed: false,
    infoAccurate: false,
  },
  profileImage: null,
  profileImagePreview: '',
  certifications: [],
  existingCertUrls: [],
  availability: initialAvailability,
  formProgress: 0,
  activeSection: 'personal',
  isEditing: false,
  loading: true,
  submitting: false,
  error: '',
  isProfileMenuOpen: false,
  userId: null,

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
    formProgress: calculateFormProgress({ ...state.formData, ...data }),
  })),
  setProfileImage: (image) => set({ profileImage: image }),
  setProfileImagePreview: (preview) => set({ profileImagePreview: preview }),
  setCertifications: (certs) => set({ certifications: certs }),
  setExistingCertUrls: (urls) => set({ existingCertUrls: urls }),
  setAvailability: (availability) => set({ availability }),
  setFormProgress: (progress) => set({ formProgress: progress }),
  setActiveSection: (section) => set({ activeSection: section }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setIsProfileMenuOpen: (open) => set({ isProfileMenuOpen: open }),
  setUserId: (id) => set({ userId: id }),

  updateExpertise: (skill) => set((state) => {
    const expertise = state.formData.expertise.includes(skill)
      ? state.formData.expertise.filter((item) => item !== skill)
      : [...state.formData.expertise, skill];
    const updatedForm = { ...state.formData, expertise };
    return {
      formData: updatedForm,
      formProgress: calculateFormProgress(updatedForm),
    };
  }),

  updateAvailability: (day, hour) => set((state) => ({
    availability: {
      ...state.availability,
      [day]: {
        ...state.availability[day],
        [hour]: !state.availability[day][hour],
      },
    },
  })),

  resetForm: () => set({
    formData: {
      fullName: '',
      professionalTitle: '',
      email: '',
      phoneNumber: '',
      expertise: [],
      yearsOfExperience: '',
      currentRole: '',
      currentCompany: '',
      hourlyRate: '',
      interviewDuration: '60',
      workHistory: '',
      education: '',
      linkedinUrl: '',
      githubUrl: '',
      termsAgreed: false,
      infoAccurate: false,
    },
    profileImage: null,
    profileImagePreview: '',
    certifications: [],
    existingCertUrls: [],
    availability: initialAvailability,
    formProgress: 0,
    activeSection: 'personal',
    isEditing: false,
    loading: true,
    submitting: false,
    error: '',
    isProfileMenuOpen: false,
    userId: null,
  }),
}));

const calculateFormProgress = (form) => {
  const filledFields = Object.entries(form).filter(([key, val]) => {
    if (key === 'githubUrl') return false;
    if (typeof val === 'string') return val.trim() !== '';
    if (Array.isArray(val)) return val.length > 0;
    return val === true;
  }).length;

  const totalFields = Object.keys(form).length - 1;
  return Math.round((filledFields / totalFields) * 100);
};