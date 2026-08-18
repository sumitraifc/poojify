import axiosClient from "./axiosClient";

export const getProfile = () => axiosClient.get("/profile");

export const getAddressList = () => axiosClient.get("/address-list");

export const addAddress = (payload) => axiosClient.post("/add-address", payload);

export const updateProfile = (formData) =>
  axiosClient.post("/profile/update", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateAddress = (payload) =>
  axiosClient.post("/update-address", payload);

export const deleteAddress = (address_id) =>
  axiosClient.delete("/delete-address", { data: { address_id } });
