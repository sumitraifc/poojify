export const orders = [
  {
    id: "POJ123456",
    date: "16 May 2024, 10:30 AM",
    status: "Delivered",
    items: [{ name: "Sawan Pooja Kit", qty: 1, price: 499, image: "/assets/products/sawan-kit.jpg" }],
    amount: 499,
    expectedDelivery: null,
    deliveredOn: "18 May 2024",
  },
  {
    id: "POJ123455",
    date: "12 May 2024, 04:15 PM",
    status: "Shipped",
    items: [{ name: "Ganesh Pooja Kit", qty: 1, price: 299, image: "/assets/products/ganesh-kit.jpg" }],
    amount: 299,
    expectedDelivery: "20 May 2024",
  },
  {
    id: "POJ123454",
    date: "05 May 2024, 11:20 AM",
    status: "Confirmed",
    items: [{ name: "Navratri Pooja Kit", qty: 1, price: 699, image: "/assets/products/navratri-kit.jpg" }],
    amount: 699,
    expectedDelivery: "17 May 2024",
  },
  {
    id: "POJ123453",
    date: "28 Apr 2024, 09:45 AM",
    status: "Cancelled",
    items: [{ name: "Premium Incense Sticks (Pack of 100)", qty: 2, price: 198, image: "/assets/products/incense.jpg" }],
    amount: 198,
    cancelledOn: "29 Apr 2024",
  },
];

export const statusStyle = {
  Delivered: "badge-success",
  Shipped: "badge bg-primary-50 text-primary-600",
  Confirmed: "badge bg-primary-50 text-primary-600",
  Pending: "badge bg-primary-50 text-primary-600",
  Cancelled: "badge-danger",
  Returned: "badge bg-ink-500/10 text-ink-700",
};
