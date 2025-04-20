// DocuLingua/API.js

// Assuming you have a BaseURL defined, e.g.,
const BaseURL = 'https://api-docu-lingua.vercel.app'; // Replace with your actual backend URL

export const LoginUrl = `${BaseURL}/api/users/login`;
export const SignupUrl = `${BaseURL}/api/users/signup`;
export const GetUserDetailsUrl = `${BaseURL}/api/users/me`;
export const UpdateAccountUrl = `${BaseURL}/api/users/me`;
export const DeleteAccountUrl = `${BaseURL}/api/users/me`;
export const ChangePasswordUrl = `${BaseURL}/api/users/change-password`;
export const SendOtpUrl = `${BaseURL}/api/users/sendOtp`;
export const ForgotPasswordUrl = `${BaseURL}/api/users/forgot-password`;
