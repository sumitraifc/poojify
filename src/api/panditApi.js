import axiosClient from "./axiosClient";

export const getPandits = ({ limit = 10, offset = 0 } = {}) =>
  axiosClient.get("/pandits", { params: { limit, offset } });

export const getPanditById = (id) => axiosClient.post(`/pandit-detail`, { pandit_id: id });

export const getPanditMasterData = () => axiosClient.get("/pandit-list");

export const checkAvailability = (pandit_id, booking_date) =>
  axiosClient.post("/check-availability", { pandit_id, booking_date });

export const getPanditBookedDates = (pandit_id) =>
  axiosClient.post("/pandit-booked-dates", { pandit_id });

export const bookPandit = (body) =>
  axiosClient.post("/book-pandit", body);

export const initiatePaytmBooking = (booking_id) =>
  axiosClient.post("/paytm/initiate-booking", { booking_id });

export const getBookingHistory = () =>
  axiosClient.get("/pandit-booking-history");

export const getBookingStatus = (booking_id) =>
  axiosClient.get("/pandit-booking-status", { params: { booking_id } });

export const verifyBooking = (booking_id, pin) =>
  axiosClient.post("/verify-booking", { booking_id: String(booking_id), pin: String(pin) });

export const cancelBooking = (booking_id, reason) =>
  axiosClient.post("/cancel-cod-pandit-booking", { booking_id, reason });

export const getPanditBookHistory = () => axiosClient.get("/pandit_book_history");
export const getMyBookings = () => axiosClient.get("/my-bookings");
export const getWalletSummary = () => axiosClient.get("/wallet-summary");
export const getTransactions = () => axiosClient.get("/transactions");
export const getPanditAccount = () => axiosClient.get("/get-pandit-account");
export const addPanditAccount = (body) => axiosClient.post("/add-pandit-account", body);
export const updatePanditAccount = (body) => axiosClient.post("/update-pandit-account", body);
export const deletePanditAccount = () => axiosClient.delete("/delete-pandit-account");

export const registerPandit = (formData) =>
  axiosClient.post("/pandit/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
