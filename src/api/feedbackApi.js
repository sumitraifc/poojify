import axiosClient from "./axiosClient";

export const submitFeedback = (payload) =>
  axiosClient.post("/reviews/submit", payload);
