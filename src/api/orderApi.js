import axiosClient from "./axiosClient";

export const getOrderStatus = (order_id) =>
  axiosClient.get("/order-status", { params: { order_id } });

export const getOrderHistory = ({ limit = 10, offset = 0 } = {}) =>
  axiosClient.get("/order-history", { params: { limit, offset } });

export const cancelOrder = (order_id, reason) =>
  axiosClient.post("/cancel-order", { order_id, reason });

export const initiatePaytmOrder = (order_id) =>
  axiosClient.post("/paytm/initiate", { order_id });
