// screens/auth/authValidationSchemas.js
import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 chars").required("Password is required"),
});

export const signUpValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 chars").required("Password is required"),
});
