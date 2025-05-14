import {API_URL} from '@env';

export const LoginUrl = `${API_URL}/users/login`;
export const SignupUrl = `${API_URL}/users/signup`;
export const GetUserDetailsUrl = `${API_URL}/users/me`;
export const UpdateAccountUrl = `${API_URL}/users/me`;
export const DeleteAccountUrl = `${API_URL}/users/me`;
export const ChangePasswordUrl = `${API_URL}/users/change-password`;
export const SendOtpUrl = `${API_URL}/users/sendOtp`;
export const ForgotPasswordUrl = `${API_URL}/users/forgot-password`;
export const GoogleLoginSignupUrl = `${API_URL}/users/google`;
