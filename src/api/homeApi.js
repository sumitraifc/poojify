import axiosClient from "./axiosClient";

export const fetchHomeSections = (lat, lng, category_id = "1", sub_category_id = "1") =>
  axiosClient.post("/home", { lat, lng, category_id, sub_category_id });
