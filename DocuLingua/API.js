// DocuLingua/API.js

// Assuming you have a BaseURL defined, e.g.,
const BaseURL = 'https://api-docu-lingua.vercel.app/auth/v1'; // Replace with your actual backend URL

export const LoginUrl = `${BaseURL}/users/login`;
export const SignupUrl = `${BaseURL}/users/signup`;
export const GetUserDetailsUrl = `${BaseURL}/users/me`;
export const UpdateAccountUrl = `${BaseURL}/users/me`;
export const DeleteAccountUrl = `${BaseURL}/users/me`;
export const ChangePasswordUrl = `${BaseURL}/users/change-password`;
export const SendOtpUrl = `${BaseURL}/users/sendOtp`;
export const ForgotPasswordUrl = `${BaseURL}/users/forgot-password`;
export const GoogleLoginSignupUrl = `${BaseURL}/users/google`;
