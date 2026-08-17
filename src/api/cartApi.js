import axiosClient from "./axiosClient";

export const getCartList = () => axiosClient.get("/cart-list");
export const updateCart = (item_id, type, action) => axiosClient.post("/cart", { item_id, type, action });
export const clearCartApi = () => axiosClient.post("/clear-cart");
export const getCouponList = () => axiosClient.get("/coupon-list");
export const getGstPaymode = () => axiosClient.get("/gst-paymode-charges");
export const placeOrder = (body) => axiosClient.post("/place-order", body);
