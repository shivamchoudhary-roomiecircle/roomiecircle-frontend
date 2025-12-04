import { apiClient } from "./core";
import {
    ApiResponse,
    SignupInitiateResponse,
    AuthResponse,
    ResendVerificationResponse,
    OtpLoginInitiateResponse,
} from "@/types/api.types";

export const initiateSignup = async (email: string, password: string, name: string): Promise<SignupInitiateResponse> => {
    const response = await apiClient.request<ApiResponse<SignupInitiateResponse>>("/api/v1/auth/signup/initiate-verification", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        skipAuth: true,
    });
    return response.data!;
};

export const verifySignup = async (tempId: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.request<ApiResponse<AuthResponse>>("/api/v1/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({ tempId, code }),
        skipAuth: true,
    });
    return response.data!;
};

export const resendVerification = async (tempId: string): Promise<ResendVerificationResponse> => {
    const response = await apiClient.request<ApiResponse<ResendVerificationResponse>>("/api/v1/auth/signup/resend-verification", {
        method: "POST",
        body: JSON.stringify({ tempId }),
        skipAuth: true,
    });
    return response.data!;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.request<ApiResponse<AuthResponse>>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });
    return response.data!;
};

export const initiateOtpLogin = async (email: string): Promise<OtpLoginInitiateResponse> => {
    const response = await apiClient.request<ApiResponse<OtpLoginInitiateResponse>>("/api/v1/auth/login/otp/initiate", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true,
    });
    return response.data!;
};

export const verifyOtpLogin = async (tempId: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.request<ApiResponse<AuthResponse>>("/api/v1/auth/login/otp/verify", {
        method: "POST",
        body: JSON.stringify({ tempId, code }),
        skipAuth: true,
    });
    return response.data!;
};

export const googleSignup = async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.request<ApiResponse<AuthResponse>>("/api/v1/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        skipAuth: true,
    });
    return response.data!;
};

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.request<ApiResponse<AuthResponse>>("/api/v1/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        skipAuth: true,
    });
    return response.data!;
};

export const deleteAccount = async (): Promise<void> => {
    await apiClient.request<ApiResponse<null>>("/api/v1/users/me", {
        method: "DELETE",
    });
};

export const refreshToken = async (): Promise<boolean> => {
    return await apiClient.refreshToken();
};
