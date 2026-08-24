import axiosClient from "./axiosClient";

export const submitFeedback = (payload) =>
  axiosClient.post("/submit-feedback", payload);
  
