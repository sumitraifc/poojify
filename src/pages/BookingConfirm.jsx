import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Wallet, ShieldCheck, CheckCircle2, XCircle, Loader2, CreditCard, Banknote, Plus, Home, Briefcase, Tag } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { formatINR, formatDate } from "../utils/format";
import { showToast } from "../components/common/Toast";
import { checkAvailability, bookPandit, initiatePaytmBooking } from "../api/panditApi";
import { getGstPaymode } from "../api/cartApi";
import { getAddressList } from "../api/userApi";
import { openPaytmCheckout } from "../utils/paytmHelper";

const TYPE_ICON = { home: Home, work: Briefcase, other: Tag };

export default function BookingConfirm() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentType, setPaymentType] = useState(null);

  const date = state?.date || new Date().toISOString().slice(0, 10);
  const selected = state?.selected || [];
  const purohit = state?.purohit || null;
  const specializations = state?.specializations || [];

  const selectedOptions = specializations.filter((o) => selected.includes(o.id));
  const itemsTotal = selectedOptions.reduce((sum, o) => sum + Number(o.price), 0);

  // Fetch GST & payment config
  const { data: gstData } = useQuery({
    queryKey: ["gst-paymode"],
    queryFn: getGstPaymode,
    staleTime: 1000 * 60 * 10,
  });

  const gstConfig = gstData?.data ?? {};
  const gstPct = gstConfig.gst_percentage ?? 0;
  const paymentMethods = gstConfig.payment_methods ?? [];
  const deliveryCharge = gstConfig.charges?.find((c) => c.name === "DELIVERY_CHARGE")?.value ?? 0;
  const gstAmount = Math.round(itemsTotal * gstPct) / 100;
  const grandTotal = itemsTotal + gstAmount + deliveryCharge;

  // Set default payment method from API
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentType) {
      setPaymentType(paymentMethods[0].name.toLowerCase());
    }
  }, [paymentMethods.length]);

  // Fetch addresses
  const { data: addressData, isLoading: addressLoading } = useQuery({
    queryKey: ["address-list"],
    queryFn: getAddressList,
  });

  const addresses = (() => {
    const d = addressData?.data;
    if (!d) return [];
    return Array.isArray(d) ? d : d.addresses || [];
  })();

  // Auto-select first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  // If no addresses after loading, redirect to manage address
  useEffect(() => {
    if (!addressLoading && addresses.length === 0) {
      showToast.error("Please add a delivery address first");
      navigate("/profile/address", {
        state: {
          redirectTo: `/purohit-booking/${id}/confirm`,
          bookingState: state,
        },
      });
    }
  }, [addressLoading, addresses.length]);

  const { data: availData, isLoading: checking } = useQuery({
    queryKey: ["check-availability", id, date],
    queryFn: () => checkAvailability(Number(id), date),
    enabled: !!id && !!date,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const availability = availData?.available ?? null;

async function handleConfirm() {
  if (!agreed) {
    return showToast.error("Please accept Terms & Conditions");
  }

  if (!availability) {
    return showToast.error(
      "Pandit is not available on selected date"
    );
  }

  if (!selectedAddressId) {
    return showToast.error(
      "Please select a delivery address"
    );
  }

  setConfirming(true);

  try {
    // 1. Create booking
    const res = await bookPandit({
      pandit_id: Number(id),
      booking_date: date,
      address_id: selectedAddressId,
      pooja_ids: JSON.stringify(selected),
      payment_type: paymentType,
    });

    console.log("Booking response:", res);

    const bookingId =
      res?.data?.booking_id ??
      res?.booking_id;

    const totalAmount =
      res?.data?.total_amount ??
      grandTotal;

    // =========================================
    // ONLINE PAYMENT
    // =========================================
    if (paymentType === "online" && bookingId) {
      const paytmOrderId =
        res?.data?.orderId ??
        res?.data?.order_id;

      const txnToken =
        res?.data?.txnToken;

      const paytmMid =
        res?.data?.mid;

      const paytmAmount =
        res?.data?.amount;

      if (
        !paytmOrderId ||
        !txnToken ||
        !paytmMid ||
        !paytmAmount
      ) {
        console.error("Invalid Paytm response:", res);

        showToast.error(
          "Invalid payment details received from server"
        );

        setConfirming(false);
        return;
      }

      console.log("Paytm Payment Details:", {
        bookingId,
        paytmOrderId,
        txnToken,
        paytmMid,
        paytmAmount,
      });

      try {
        openPaytmCheckout({
          orderId: paytmOrderId,
          txnToken: txnToken,
          amount: paytmAmount,
          mid: paytmMid,

          onSuccess: (paymentData) => {
            console.log(
              "Paytm Payment Success:",
              paymentData
            );

            showToast.success(
              "Payment successful!"
            );

            setConfirming(false);

            navigate(
              `/purohit-booking/${id}/success`,
              {
                state: {
                  bookingId,
                  orderId: paytmOrderId,
                  txnId: paymentData?.txnId,
                  date,
                  selectedOptions,
                  grandTotal: paytmAmount,
                  purohit,
                },
              }
            );
          },

          onFailure: (msg) => {
            console.error(
              "Paytm Payment Failed:",
              msg
            );

            showToast.error(
              msg || "Payment failed"
            );

            setConfirming(false);
          },
        });

      } catch (error) {
        console.error(
          "Paytm checkout error:",
          error
        );

        showToast.error(
          "Unable to open payment checkout"
        );

        setConfirming(false);
      }

      return;
    }

    // =========================================
    // COD / OFFLINE PAYMENT
    // =========================================

    setConfirming(false);

    navigate(
      `/purohit-booking/${id}/success`,
      {
        state: {
          bookingId,
          date,
          selectedOptions,
          grandTotal: totalAmount,
          purohit,
        },
      }
    );

  } catch (err) {
    console.error("Booking error:", err);

    showToast.error(
      err?.message ||
      "Booking failed. Please try again."
    );

    setConfirming(false);
  }
}

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "Confirm Booking" }]} />

          {/* Purohit info */}
          {purohit && (
            <div className="card mb-6 flex items-center gap-4">
              <img src={purohit.profile_image} alt={purohit.full_name} className="h-20 w-20 rounded-full object-cover" />
              <div>
                <h1 className="font-bold">{purohit.full_name}</h1>
                <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={13} /> {purohit.area}, {purohit.city}</p>
              </div>
            </div>
          )}

          {/* Availability badge */}
          <div className="mb-6">
            {checking ? (
              <div className="flex items-center gap-2 rounded-xl border border-ink-500/10 bg-cream-100 px-4 py-3 text-sm text-ink-500">
                <Loader2 size={16} className="animate-spin text-primary-500" /> Checking availability...
              </div>
            ) : availability === true ? (
              <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                <CheckCircle2 size={16} /> Pandit is available on {formatDate(date, { day: "numeric", month: "short", year: "numeric" })}
              </div>
            ) : availability === false ? (
              <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                <XCircle size={16} /> Pandit is not available on this date. Please go back and select another date.
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <SectionCard title="Booking Details" icon={CalendarDays}>
                <p className="text-sm">Booking Date: <span className="font-medium">{formatDate(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span></p>
              </SectionCard>

              <SectionCard title="Selected Pooja">
                {selectedOptions.length === 0 ? (
                  <p className="text-sm text-ink-500">No pooja selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedOptions.map((o) => (
                      <div key={o.id} className="flex justify-between text-sm">
                        <span>✦ {o.name}</span>
                        <span className="font-medium">{formatINR(o.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Address Selection */}
              <SectionCard title="Delivery Address" icon={MapPin}>
                {addressLoading ? (
                  <div className="flex items-center gap-2 text-sm text-ink-500">
                    <Loader2 size={14} className="animate-spin text-primary-500" /> Loading addresses...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const Icon = TYPE_ICON[addr.address_type] || MapPin;
                      return (
                        <label
                          key={addr.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                            selectedAddressId === addr.id
                              ? "border-primary-500 bg-primary-50"
                              : "border-ink-500/15 hover:border-primary-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            className="mt-1 accent-primary-500"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <div className="flex-1">
                            <p className="flex items-center gap-1.5 text-sm font-semibold capitalize">
                              <Icon size={13} className="text-primary-500" /> {addr.address_type}
                            </p>
                            <p className="text-sm text-ink-600">
                              {addr.house_no}{addr.landmark ? `, Near ${addr.landmark}` : ""}
                            </p>
                            <p className="text-xs text-ink-500">{addr.city}, {addr.state} {addr.pincode}</p>
                          </div>
                        </label>
                      );
                    })}
                    <button
                      onClick={() =>
                        navigate("/profile/address", {
                          state: { redirectTo: `/purohit-booking/${id}/confirm`, bookingState: state },
                        })
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
                    >
                      <Plus size={16} /> Add New Address
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* Payment Method */}
              <SectionCard title="Payment Method" icon={Wallet}>
                <div className="flex gap-3">
                  {paymentMethods.map((method) => {
                    const val = method.name.toLowerCase();
                    const isCod = val === "cod";
                    return (
                      <label key={method.id} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${paymentType === val ? "border-primary-500 bg-primary-50" : "border-ink-500/15 hover:border-primary-300"}`}>
                        <input type="radio" name="payment" className="accent-primary-500" checked={paymentType === val} onChange={() => setPaymentType(val)} />
                        {isCod ? <Banknote size={16} className="text-primary-500" /> : <CreditCard size={16} className="text-primary-500" />}
                        <div>
                          <p className="text-sm font-semibold">{isCod ? "Cash on Delivery" : "Online Payment"}</p>
                          <p className="text-xs text-ink-500">{isCod ? "Pay when Pandit Ji arrives" : "UPI / Card / Net Banking"}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            {/* Bill */}
            <div className="card h-fit">
              <h3 className="mb-4 font-semibold">Bill Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Items Total ({selectedOptions.length})</span><span>{formatINR(itemsTotal)}</span></div>
                {deliveryCharge > 0 && <div className="flex justify-between"><span className="text-ink-500">Delivery Charge</span><span>{formatINR(deliveryCharge)}</span></div>}
                {/* {gstPct > 0 && <div className="flex justify-between"><span className="text-ink-500">GST ({gstPct}%)</span><span>{formatINR(gstAmount)}</span></div>} */}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                <span className="font-semibold">Grand Total <span className="text-[9px]">(include all tax)</span></span>
                <span className="text-lg font-bold text-primary-600">{formatINR(grandTotal)}</span>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-success/10 p-3 text-xs">
                <ShieldCheck size={14} className="mt-0.5 text-success" />
                <div>
                  <p className="font-semibold text-success">100% Secure Booking</p>
                  <p className="text-ink-500">Your information and booking are safe with us.</p>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2 text-xs text-ink-500">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary-500" />
                I agree to the Terms & Conditions and Privacy Policy of Poojify.
              </label>

              <Button fullWidth className="mt-4" loading={confirming} onClick={handleConfirm}
                disabled={availability === false || checking || !selectedAddressId}>
                🪔 Confirm Booking
              </Button>
              <button onClick={() => navigate(-1)} className="mt-2 w-full text-center text-sm text-ink-500 hover:text-primary-600">← Go Back</button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="card">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        {Icon && <Icon size={16} className="text-primary-500" />} {title}
      </h3>
      {children}
    </div>
  );
}
