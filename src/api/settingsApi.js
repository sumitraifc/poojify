import axiosClient from "./axiosClient";

export const fetchSettings = () => axiosClient.get("/settings");
