// screens/auth/useSignUpForm.js
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { signUpValidationSchema } from "./authValidationSchemas";
import { auth, db } from "../../firebase";
import useAuthStore from "../../stores/authStore";

const useSignUpForm = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        const newUser = {
          uid: user.uid,
          name: values.name,
          email: user.email,
          isInterviewer: false,
          createdAt: new Date(),
        };

        await addDoc(collection(db, "mockUsers"), newUser);
        setUser(newUser);
        navigate("/");
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return { formik, errorMessage, loading };
};

export default useSignUpForm;
