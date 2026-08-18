import axiosClient from "./axiosClient";

export const getComboList = ({ limit = 10, offset = 0 } = {}) =>
  axiosClient.get("/combo-list", { params: { limit, offset } });
