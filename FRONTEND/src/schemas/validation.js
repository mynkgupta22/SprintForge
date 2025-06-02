import * as yup from 'yup';

// Common field validations
export const emailSchema = yup
  .string()
  .email('Please enter a valid email')
  .required('Email is required');

export const passwordSchema = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .required('Password is required');

export const nameSchema = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .required('Name is required');

export const phoneSchema = yup
  .string()
  .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format')
  .required('Mobile number is required');

export const usernameSchema = yup
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .required('Username is required');

// Form Schemas
export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object().shape({
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  mobileNumber: phoneSchema,
  role: yup
    .string()
    .oneOf(['ADMIN', 'PM', 'DEVELOPER'])
    .default('DEVELOPER'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

