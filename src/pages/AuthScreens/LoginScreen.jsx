// screens/auth/LoginScreen.jsx
import React from "react";
import useLoginForm from "./useLoginForm";
import CustomInput from "../../components/InputAndButton/CustomInput";
import CustomButton from "../../components/InputAndButton/CustomButton";

export default function LoginScreen() {
  const { formik, errorMessage, loading } = useLoginForm();

  return (
    <form onSubmit={formik.handleSubmit}>
      <CustomInput
        placeholder="Enter email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email && <p>{formik.errors.email}</p>}

      <CustomInput
        placeholder="Enter password"
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <CustomButton text={loading ? "Logging in..." : "Login"} type="submit" disabled={loading} />
    </form>
  );
}
