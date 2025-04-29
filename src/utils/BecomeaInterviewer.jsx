const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Create a new object with the updated form data
      const updatedForm = { ...prev, [name]: value };

      // Update progress based on updatedForm
      const filledFields = Object.values(updatedForm).filter((val) =>
        typeof val === "string" ? val.trim() !== "" :
          Array.isArray(val) ? val.length > 0 : val // Check for non-empty string/array
      ).length;

      const totalFields = Object.keys(updatedForm).length;
      const progress = Math.round((filledFields / totalFields) * 100);

      // Update the progress state
      setFormProgress(progress);

      // Return the updated form state
      return updatedForm;
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: checked };

      // Recalculate progress
      const filledFields = Object.values(updatedForm).filter((val) =>
        typeof val === "string"
          ? val.trim() !== ""
          : Array.isArray(val)
            ? val.length > 0
            : val === true
      ).length;

      const totalFields = Object.keys(updatedForm).length;
      const progress = Math.round((filledFields / totalFields) * 100);
      setFormProgress(progress);

      return updatedForm;
    });
  };




  // Handle expertise selection (multi-select for skills)
  const handleExpertiseChange = (skill) => {
    setFormData((prev) => {
      const expertise = prev.expertise.includes(skill)
        ? prev.expertise.filter((item) => item !== skill)
        : [...prev.expertise, skill];
      return { ...prev, expertise };
    });
  };


  // Handle certifications change (when certifications are uploaded)
  const handleCertificationsChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setCertifications((prev) => [...prev, ...newFiles]);
    }
  };



  // Initialize the availability state with all hours as unavailable
  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = hours.reduce((hourAcc, hour) => {
        hourAcc[hour] = false; // Set all hours to unavailable initially
        return hourAcc;
      }, {});
      return acc;
    }, {})
  );

  // Handle availability changes (toggle availability for specific time slots)
  const handleAvailabilityChange = (day, hour) => {
    setAvailability((prevAvailability) => ({
      ...prevAvailability,
      [day]: {
        ...prevAvailability[day],
        [hour]: !prevAvailability[day][hour], // Toggle availability for the hour
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "interviewersProfile"), where("uid", "==", user.uid));
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

  // Functions for handling profile image drag and drop
  const handleDragOver = (event) => {
    event.preventDefault(); // Allow dropping
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleProfileImageChange(file);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files ? event.target.files[0] : event;
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to render navigation for the form sections
  const renderSectionNav = () => {
    const sections = [
      { id: "personal", label: "Personal Info" },
      { id: "expertise", label: "Expertise" },
      { id: "availability", label: "Availability & Pricing" },
      { id: "experience", label: "Experience" },
      { id: "credentials", label: "Credentials" },
    ];
    return (
      <nav className="form-section-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(section.id)}
            className={currentSection === section.id ? "active" : ""}
          >
            {section.label}
          </button>
        ))}
      </nav>
    );
  };

export default BecomeaInterviewer;
