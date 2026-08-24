import axiosClient from "./axiosClient";

export const submitReview = (formData) =>
  axiosClient.post("/reviews/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const editReview = (formData) =>
  axiosClient.post("/edit-review", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteReview = (review_id) =>
  axiosClient.post("/delete-review", { review_id });
