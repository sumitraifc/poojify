export const categories = [
  { id: "pooja-samagri", name: "Pooja Samagri", image: "/assets/categories/samagri.jpg" },
  { id: "pooja-kits", name: "Pooja Kits", image: "/assets/categories/kits.jpg" },
  { id: "flowers-garlands", name: "Flowers & Garlands", image: "/assets/categories/flowers.jpg" },
  { id: "havan-essentials", name: "Havan Essentials", image: "/assets/categories/havan.jpg" },
  { id: "agarbatti-dhoop", name: "Agarbatti & Dhoop", image: "/assets/categories/agarbatti.jpg" },
  { id: "diyas-lighting", name: "Diyas & Lighting", image: "/assets/categories/diyas.jpg" },
  { id: "kalash-coconut", name: "Kalash & Coconut", image: "/assets/categories/kalash.jpg" },
  { id: "pooja-vastra", name: "Pooja Vastra & Aasan", image: "/assets/categories/vastra.jpg" },
];

export const products = [
  { id: "p1", name: "Ganesh Pooja Kit - Deluxe", price: 299, mrp: 449, image: "/assets/products/ganesh-kit.jpg", rating: 4.9, reviews: 65, category: "pooja-kits" },
  { id: "p2", name: "Sawan Pooja Kit", price: 499, mrp: 549, image: "/assets/products/sawan-kit.jpg", rating: 4.6, reviews: 65, category: "pooja-kits" },
  { id: "p3", name: "Lakshmi Pooja Kit", price: 349, mrp: 499, image: "/assets/products/lakshmi-kit.jpg", rating: 4.7, reviews: 88, category: "pooja-kits" },
  { id: "p4", name: "Navratri Pooja Kit", price: 499, mrp: 699, image: "/assets/products/navratri-kit.jpg", rating: 4.8, reviews: 112, category: "pooja-kits" },
  { id: "p5", name: "Roli & Kumkum", price: 45, mrp: 50, image: "/assets/products/roli-kumkum.jpg", rating: 4.5, reviews: 40, category: "pooja-samagri" },
  { id: "p6", name: "Nirmala Agarbatti", price: 43, mrp: 50, image: "/assets/products/agarbatti.jpg", rating: 4.4, reviews: 30, category: "agarbatti-dhoop" },
  { id: "p7", name: "Camphor (Kapoor)", price: 30, mrp: 35, image: "/assets/products/camphor.jpg", rating: 4.7, reviews: 55, category: "pooja-samagri" },
  { id: "p8", name: "Havan Samagri Kit", price: 299, mrp: 330, image: "/assets/products/havan-kit.jpg", rating: 4.6, reviews: 72, category: "havan-essentials" },
  { id: "p9", name: "MahaShivratri Kit", price: 549, mrp: 699, image: "/assets/products/mahashivratri-kit.jpg", rating: 4.8, reviews: 51, category: "pooja-kits" },
  { id: "p10", name: "Vastu Pooja Kit", price: 299, mrp: 399, image: "/assets/products/vastu-kit.jpg", rating: 4.5, reviews: 44, category: "pooja-kits" },
  { id: "p11", name: "Rudrabhishek Kit", price: 599, mrp: 799, image: "/assets/products/rudrabhishek-kit.jpg", rating: 4.6, reviews: 38, category: "pooja-kits" },
  { id: "p12", name: "Premium Incense Sticks", price: 198, mrp: 220, image: "/assets/products/incense.jpg", rating: 4.4, reviews: 26, category: "agarbatti-dhoop" },
  { id: "p13", name: "Premium Lavender Dhoop Sticks Box - 1 Pack", price: 11, mrp: 15, image: "/assets/products/agarbatti.jpg", rating: 4.6, reviews: 34, category: "agarbatti-dhoop" },
  { id: "p14", name: "Premium Rose-Dhoop Sticks - 1 pack", price: 11, mrp: 15, image: "/assets/products/agarbatti.jpg", rating: 4.5, reviews: 28, category: "agarbatti-dhoop" },
  { id: "p15", name: "Premium Chandan Dry Stick Dhoop - 1 Pack", price: 11, mrp: 15, image: "/assets/products/agarbatti.jpg", rating: 4.7, reviews: 41, category: "agarbatti-dhoop" },
  { id: "p16", name: "Hari-Darshan Kapur - Bamboo Less Dhoop Stick", price: 113, mrp: 125, image: "/assets/products/camphor.jpg", rating: 4.5, reviews: 19, category: "agarbatti-dhoop" },
  { id: "p17", name: "Hari-Darshan Tulsi Dhoop Sticks", price: 99, mrp: 120, image: "/assets/products/agarbatti.jpg", rating: 4.6, reviews: 22, category: "agarbatti-dhoop" },
  { id: "p18", name: "Hari-Darshan Havan Dhoop Sticks", price: 105, mrp: 130, image: "/assets/products/havan-kit.jpg", rating: 4.4, reviews: 17, category: "agarbatti-dhoop" },
];

export const comboOffers = [
  { id: "c1", name: "Diya Combo Testing", desc: "Pooja Thali, Diya, Agarbatti, Roli Kumkum & more", price: 599, mrp: 699, image: "/assets/products/ganesh-kit.jpg", off: 10 },
  { id: "c2", name: "Complete Pooja Kit", desc: "All essential items for complete puja at home", price: 849, mrp: 949, image: "/assets/products/navratri-kit.jpg", off: 10 },
  { id: "c3", name: "Havan Pooja Combo", desc: "Havan Kund, Samagri, Ghee, Sticks & more", price: 1199, mrp: 1399, image: "/assets/products/havan-kit.jpg", off: 15 },
  { id: "c4", name: "Festive Pooja Combo", desc: "Pooja Samagri, Decor, Diya, Flowers & more", price: 999, mrp: 1199, image: "/assets/products/sawan-kit.jpg", off: 17 },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}
