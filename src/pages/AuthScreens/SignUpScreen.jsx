// screens/auth/SignUpScreen.jsx
import React from "react";
import useSignUpForm from "./useSignUpForm";
import CustomInput from "../../components/InputAndButton/CustomInput";
import CustomButton from "../../components/InputAndButton/CustomButton";

export default function SignUpScreen() {
  const { formik, errorMessage, loading } = useSignUpForm();

  return (
    <form onSubmit={formik.handleSubmit}>
      <CustomInput
        placeholder="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.name && formik.errors.name && <p>{formik.errors.name}</p>}

      <CustomInput
        placeholder="Email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email && <p>{formik.errors.email}</p>}

      <CustomInput
        placeholder="Password"
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <CustomButton type="submit" disabled={loading} text={loading ? "Registering..." : "Register"} />
    </form>
  );
}
