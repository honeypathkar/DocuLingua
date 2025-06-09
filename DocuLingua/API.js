import {API_URL} from '@env';

//Auth apis
export const LoginUrl = `${API_URL}/users/login`;
export const SignupUrl = `${API_URL}/users/signup`;
export const GetUserDetailsUrl = `${API_URL}/users/me`;
export const UpdateAccountUrl = `${API_URL}/users/me`;
export const DeleteAccountUrl = `${API_URL}/users/me`;
export const ChangePasswordUrl = `${API_URL}/users/change-password`;
export const SendOtpUrl = `${API_URL}/users/sendOtp`;
export const ForgotPasswordUrl = `${API_URL}/users/forgot-password`;
export const GoogleLoginSignupUrl = `${API_URL}/users/google`;

//Document CURD APIs
export const UploadDocumentUrl = `${API_URL}/documents/upload`;
export const TranslateTextUrl = `${API_URL}/documents/translate`;
export const DocumentsUrl = `${API_URL}/documents`;
export const GetDocumentbyUserIdUrl = `${API_URL}/documents/user`;
