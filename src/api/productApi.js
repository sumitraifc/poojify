import axiosClient from "./axiosClient";

// type: "product" | "combo"
export const getProductDetail = (id, type = "product") =>
  axiosClient.post("/product-detail-with-reviews", {
    ...(type === "combo" ? { combo_id: String(id) } : { product_id: String(id) }),
  });

export const getYouMightLike = (id, type = "product") =>
  axiosClient.post("/you-might-like", {
    ...(type === "combo" ? { combo_id: String(id) } : { product_id: String(id) }),
  });

export const getCategories = ({ limit = 50, offset = 0 } = {}) =>
  axiosClient.get("/categories", { params: { limit, offset } });

export const getSubCategories = (category_id) =>
  axiosClient.get(`/subcategories/${category_id}`);

export const getProductsBySub = (sub_category_id, { limit = 20, offset = 0 } = {}) =>
  axiosClient.get(`/products-by-sub/${sub_category_id}`, { params: { limit, offset } });

export const getProductDetailSimple = (id, type = "product") =>
  axiosClient.post("/product-detail", {
    ...(type === "combo" ? { combo_id: String(id) } : { product_id: String(id) }),
  });
