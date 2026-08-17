import axiosClient from "./axiosClient";

export const sendOtp = (mobile) =>
  axiosClient.post("/send-otp", { mobile });

export const verifyOtp = (mobile, otp, fcm_token = "web-fcm-token") =>
  axiosClient.post("/verify-otp", { mobile, otp, fcm_token });
