// screens/auth/useLoginForm.js
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { loginValidationSchema } from "./authValidationSchemas";
import { auth, db } from "../../firebase";
import useAuthStore from "../../stores/authStore";

const useLoginForm = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        const q = query(collection(db, "mockUsers"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUser(userData);

          if (userData.isInterviewer) {
            navigate("/interview-home");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        setErrorMessage("Invalid email or password");
      } finally {
        setLoading(false);
      }
    },
  });

  return { formik, errorMessage, loading };
};

export default useLoginForm;
