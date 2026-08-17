import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Lock, Smartphone, CreditCard, Truck, ShieldCheck } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getCartList, getGstPaymode, placeOrder } from "../api/cartApi";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

const addresses = [
  { id: "a1", label: "Home", isDefault: true, name: "Harsh Singh", line: "123, Shree Ram Nagar, Patel Road, Jaipur, Rajasthan - 302001", phone: "+91 98765 43210" },
  { id: "a2", label: "Work", isDefault: false, name: "Harsh Singh", line: "Plot No. 45, Malviya Nagar, Jaipur, Rajasthan - 302017", phone: "+91 91234 56789" },
];

const payIconMap = {
  COD: Truck,
  ONLINE: CreditCard,
};

export default function Checkout() {
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState("a1");
  const [payment, setPayment] = useState(null);

  const { mutate: submitOrder, isLoading: placing } = useMutation({
    mutationFn: (body) => placeOrder(body),
    onSuccess: () => {
      showToast.success("Order placed successfully!");
      navigate("/orders");
    },
    onError: (err) => showToast.error(err?.message ?? "Failed to place order"),
  });

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart-list"],
    queryFn: getCartList,
    select: (res) => res?.data ?? [],
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["gst-paymode"],
    queryFn: getGstPaymode,
    select: (res) => res?.data,
    onSuccess: (data) => {
      if (data?.payment_methods?.length && !payment)
        setPayment(data.payment_methods[0].name);
    },
  });

  const items = (Array.isArray(cartData) ? cartData : []).map((i) => ({
    id: i.item_id,
    name: i.name,
    image: i.main_image,
    price: Number(i.discount_price ?? i.price ?? 0),
    mrp: Number(i.price ?? 0),
    qty: Number(i.quantity ?? 1),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gstPct = config?.gst_percentage ?? 0;
  const deliveryCharge = config?.charges?.find((c) => c.name === "DELIVERY_CHARGE")?.value ?? 0;
  const gstAmount = Math.round(subtotal * gstPct / 100);
  const grandTotal = subtotal + gstAmount + Number(deliveryCharge);

  // Set default payment once config loads
  const paymentMethods = config?.payment_methods ?? [];
  if (paymentMethods.length && !payment) setPayment(paymentMethods[0].name);

  function handlePlaceOrder() {
    if (!payment) return showToast.error("Select a payment method");
    if (!addressId) return showToast.error("Select a delivery address");
    submitOrder({
      coupon_id: 0,
      payment_method: payment,
      address_id: addressId,
    });
  }

  if (cartLoading || configLoading) return <PageLoader />;

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
                  {paymentMethods.map((pm) => {
                    const Icon = payIconMap[pm.name] ?? Smartphone;
                    const subtitle = pm.name === "COD" ? "Pay when you receive" : "UPI, Card, Net Banking & more";
                    return (
                      <label
                        key={pm.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                          payment === pm.name ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"
                        }`}
                      >
                        <input type="radio" name="payment" className="accent-primary-500" checked={payment === pm.name} onChange={() => setPayment(pm.name)} />
                        <Icon size={18} className="text-primary-500" />
                        <div>
                          <p className="text-sm font-medium">{pm.name === "COD" ? "Cash on Delivery" : "Pay Online"}</p>
                          <p className="text-xs text-ink-500">{subtitle}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-xs text-success">
                  <ShieldCheck size={14} /> Your payment is safe and secure with us.
                </div>
              </div>
            </div>

            {/* Order Summary */}
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
                <Row label={`Subtotal (${items.length} Items)`} value={formatINR(subtotal)} />
                {gstPct > 0 && <Row label={`GST (${gstPct}%)`} value={formatINR(gstAmount)} />}
                <Row
                  label="Delivery Charges"
                  value={Number(deliveryCharge) === 0 ? "FREE" : formatINR(deliveryCharge)}
                  valueClass={Number(deliveryCharge) === 0 ? "text-success" : ""}
                />
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

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
