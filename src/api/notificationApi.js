import axiosClient from "./axiosClient";

export const getNotifications = () => axiosClient.get("/notifications");
export const markNotificationRead = (notification_id) => axiosClient.post("/notification-read", { notification_id });
export const markAllNotificationsRead = () => axiosClient.post("/notification-read-all");
