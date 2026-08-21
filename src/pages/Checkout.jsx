import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Home, Briefcase, Tag, Lock, Smartphone, CreditCard, Truck, ShieldCheck } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getCartList, getGstPaymode, placeOrder } from "../api/cartApi";
import { getAddressList } from "../api/userApi";
import { initiatePaytmOrder } from "../api/orderApi";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";
import { openPaytmCheckout } from "../utils/paytmHelper";

import { useCartStore } from "../store/cartStore";

const TYPE_ICON = { home: Home, work: Briefcase, other: Tag };

const payIconMap = {
  COD: Truck,
  ONLINE: CreditCard,
};

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);
  const [addressId, setAddressId] = useState(null);
  const [payment, setPayment] = useState(null);

  const { data: addressData, isLoading: addrLoading } = useQuery({
    queryKey: ["address-list"],
    queryFn: getAddressList,
  });

  const addresses = (() => {
    const d = addressData?.data;
    if (!d) return [];
    return Array.isArray(d) ? d : d.addresses ?? [];
  })();

  // auto-select first address
  if (addresses.length && !addressId) setAddressId(addresses[0].id);

  const [placing, setPlacing] = useState(false);

  // const { mutate: submitOrder } = useMutation({
  //   mutationFn: (body) => placeOrder(body),
  //   onSuccess: async (res) => {
  //     const orderId = res?.data?.order_id ?? res?.order_id;
  //     if (payment === "ONLINE" && orderId) {
  //       try {
  //         const txnRes = await initiatePaytmOrder(orderId);
  //         const txnToken = txnRes?.data?.txnToken ?? txnRes?.txnToken;
  //         openPaytmCheckout({
  //           orderId,
  //           txnToken,
  //           amount: grandTotal,
  //           onSuccess: () => {
  //             showToast.success("Payment successful!");
  //             clearCart();
  //             queryClient.invalidateQueries({ queryKey: ["cart-list"] });
  //             setPlacing(false);
  //             navigate("/orders");
  //           },
  //           onFailure: (msg) => {
  //             showToast.error(msg || "Payment failed");
  //             setPlacing(false);
  //           },
  //         });
  //       } catch {
  //         showToast.error("Failed to initiate payment");
  //         setPlacing(false);
  //       }
  //     } else {
  //       showToast.success("Order placed successfully!");
  //       clearCart();
  //       queryClient.invalidateQueries({ queryKey: ["cart-list"] });
  //       setPlacing(false);
  //       navigate("/orders");
  //     }
  //   },
  //   onError: (err) => {
  //     showToast.error(err?.message ?? "Failed to place order");
  //     setPlacing(false);
  //   },
  // });


  const { mutate: submitOrder } = useMutation({
  mutationFn: (body) => placeOrder(body),
  onSuccess: async (res) => {
    const data = res?.data;
    const isOnline = payment === "ONLINE" && data?.txnToken;

    if (isOnline) {
      openPaytmCheckout({
        orderId: data.orderId,     
        txnToken: data.txnToken,
        amount: data.amount,         
        mid: data.mid,              
        onSuccess: () => {
          showToast.success("Payment successful!");
          clearCart();
          queryClient.invalidateQueries({ queryKey: ["cart-list"] });
          setPlacing(false);
          navigate("/orders");
        },
        onFailure: (msg) => {
          showToast.error(msg || "Payment failed");
          setPlacing(false);
        },
      });
    } else {
      showToast.success(res?.message || "Order placed successfully!");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart-list"] });
      setPlacing(false);
      navigate("/orders");
    }
  },
  onError: (err) => {
    showToast.error(err?.message ?? "Failed to place order");
    setPlacing(false);
  },
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
    setPlacing(true);
    submitOrder({
      coupon_id: 0,
      payment_method: payment,
      address_id: addressId,
    });
  }

  if (cartLoading || configLoading || addrLoading) return <PageLoader />;;

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
                  <button
                    onClick={() => navigate("/profile/address", { state: { redirectTo: "/checkout" } })}
                    className="flex items-center gap-1 text-sm font-medium text-primary-600"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-primary-300 py-6 text-center">
                    <p className="mb-2 text-sm text-ink-500">No saved addresses</p>
                    <button
                      onClick={() => navigate("/profile/address", { state: { redirectTo: "/checkout" } })}
                      className="text-sm font-semibold text-primary-600"
                    >
                      + Add Address
                    </button>
                  </div>
                ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const Icon = TYPE_ICON[addr.address_type] ?? MapPin;
                    return (
                    <label
                      key={addr.id}
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        addressId === addr.id ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input type="radio" name="address" className="mt-1 accent-primary-500" checked={addressId === addr.id} onChange={() => setAddressId(addr.id)} />
                        <Icon size={14} className="mt-1 shrink-0 text-primary-500" />
                        <div>
                          <p className="font-semibold capitalize">{addr.address_type}</p>
                          <p className="text-sm text-ink-600">{addr.house_no}{addr.landmark ? `, Near ${addr.landmark}` : ""}</p>
                          <p className="text-xs text-ink-500">{addr.city}, {addr.state} {addr.pincode}</p>
                        </div>
                      </div>
                    </label>
                    );
                  })}
                </div>
                )}
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
                {/* {gstPct > 0 && <Row label={`GST (${gstPct}%)`} value={formatINR(gstAmount)} />} */}
                <Row
                  label="Delivery Charges"
                  value={Number(deliveryCharge) === 0 ? "FREE" : formatINR(deliveryCharge)}
                  valueClass={Number(deliveryCharge) === 0 ? "text-success" : ""}
                />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                <div>
                  <span className="font-semibold">Grand Total</span>
                  <p className="text-[10px] text-ink-500">(incl. all taxes & charges)</p>
                </div>
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
