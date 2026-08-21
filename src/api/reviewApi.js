import axiosClient from "./axiosClient";

export const submitReview = (formData) =>
  axiosClient.post("/reviews/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
