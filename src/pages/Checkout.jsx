import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Plus, Pencil, Trash2, Lock, Smartphone, CreditCard, Landmark, Wallet, Truck, ShieldCheck } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

const addresses = [
  { id: "a1", label: "Home", isDefault: true, name: "Harsh Singh", line: "123, Shree Ram Nagar, Patel Road, Jaipur, Rajasthan - 302001", phone: "+91 98765 43210" },
  { id: "a2", label: "Work", isDefault: false, name: "Harsh Singh", line: "Plot No. 45, Malviya Nagar, Jaipur, Rajasthan - 302017", phone: "+91 91234 56789" },
];

const paymentMethods = [
  { id: "upi", icon: Smartphone, title: "UPI / QR Code", subtitle: "Pay using any UPI App" },
  { id: "card", icon: CreditCard, title: "Credit / Debit Card", subtitle: "Visa, Mastercard, RuPay & more" },
  { id: "netbanking", icon: Landmark, title: "Net Banking", subtitle: "All major banks supported" },
  { id: "wallet", icon: Wallet, title: "Wallets", subtitle: "Paytm Wallet, PhonePe & more" },
  { id: "cod", icon: Truck, title: "Cash on Delivery (COD)", subtitle: "Pay when you receive" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, discount, clearCart } = useCartStore();
  const [addressId, setAddressId] = useState("a1");
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);

  const deliveryCharge = 0;
  const grandTotal = subtotal() + deliveryCharge;

  function handlePlaceOrder() {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      clearCart();
      showToast.success("Order placed successfully!");
      navigate("/orders");
    }, 900);
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]} />

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              {/* Address */}
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold"><MapPin size={17} className="text-primary-500" /> Delivery Address</h3>
                  <button className="flex items-center gap-1 text-sm font-medium text-primary-600"><Plus size={14} /> Add New Address</button>
                </div>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        addressId === addr.id ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input type="radio" name="address" className="mt-1 accent-primary-500" checked={addressId === addr.id} onChange={() => setAddressId(addr.id)} />
                          <div>
                            <p className="flex items-center gap-2 font-semibold">
                              {addr.label} {addr.isDefault && <span className="badge-success">Default</span>}
                            </p>
                            <p className="text-sm">{addr.name}</p>
                            <p className="text-sm text-ink-500">{addr.line}</p>
                            <p className="text-sm text-ink-500">Phone: {addr.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-ink-500">
                          <button aria-label="Edit address"><Pencil size={14} /></button>
                          <button aria-label="Delete address" className="text-danger"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="label">Delivery Instructions (Optional)</label>
                  <textarea className="input" rows={2} placeholder="E.g. Please leave the package at the door." />
                </div>
              </div>

              {/* Payment */}
              <div className="card">
                <h3 className="mb-4 font-semibold">Payment Method</h3>
                <div className="space-y-2.5">
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        payment === pm.id ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"
                      }`}
                    >
                      <input type="radio" name="payment" className="accent-primary-500" checked={payment === pm.id} onChange={() => setPayment(pm.id)} />
                      <pm.icon size={18} className="text-primary-500" />
                      <div>
                        <p className="text-sm font-medium">{pm.title}</p>
                        <p className="text-xs text-ink-500">{pm.subtitle}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-xs text-success">
                  <ShieldCheck size={14} /> Your payment is safe and secure with us.
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="card h-fit">
              <h3 className="mb-4 font-semibold">Order Summary</h3>
              <div className="mb-3 max-h-56 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} className="h-12 w-12 rounded-lg object-cover" alt={item.name} />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-ink-500">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatINR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-ink-500/10 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Subtotal ({items.length} Items)</span><span>{formatINR(subtotal())}</span></div>
                {discount() > 0 && <div className="flex justify-between"><span className="text-ink-500">Discount</span><span className="text-success">- {formatINR(discount())}</span></div>}
                <div className="flex justify-between"><span className="text-ink-500">Delivery Charges</span><span className="text-success">FREE</span></div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary-600">{formatINR(grandTotal)}</span>
              </div>
              <Button fullWidth className="mt-4" loading={placing} onClick={handlePlaceOrder}>
                <Lock size={15} /> Place Order Securely
              </Button>
              <p className="mt-2 text-center text-xs text-ink-500">
                By placing this order, you agree to our <a className="link">Terms & Conditions</a> and <a className="link">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
