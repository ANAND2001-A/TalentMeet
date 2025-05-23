import { useInterviewerFormStore } from '../../stores/interviewerFormStore';

export default function SectionNav() {
  const { activeSection, setActiveSection } = useInterviewerFormStore();

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'availability', label: 'Availability & Pricing' },
    { id: 'experience', label: 'Experience' },
    { id: 'credentials', label: 'Credentials' },
  ];

  return (
    <div className="flex flex-wrap mb-8 border-b">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`px-4 py-3 font-medium text-sm mr-2 rounded-t-lg transition-colors ${
            activeSection === section.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}