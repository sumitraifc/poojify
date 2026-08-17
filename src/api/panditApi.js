import axiosClient from "./axiosClient";

export const getPandits = ({ limit = 10, offset = 0 } = {}) =>
  axiosClient.get("/pandits", { params: { limit, offset } });

export const getPanditById = (id) => axiosClient.get(`/pandits/${id}`);
