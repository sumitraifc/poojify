import axiosClient from "./axiosClient";

export const getWishlist = () => axiosClient.get("/wishlist");

export const toggleWishlistApi = (item_id, type, status) =>
  axiosClient.post("/wishlist", { item_id, type, status });
