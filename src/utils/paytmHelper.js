/**
 * Loads Paytm JS checkout script (test env) and opens payment modal.
 * @param {string} orderId   - Your order/booking ID
 * @param {string} txnToken  - Transaction token from your backend
 * @param {number} amount    - Amount in INR
 * @param {function} onSuccess - Called with { orderId, txnId } on success
 * @param {function} onFailure - Called with error message on failure
 */
export function openPaytmCheckout({ orderId, txnToken, amount, onSuccess, onFailure }) {
  const MID = import.meta.env.VITE_PAYTM_MID ?? "YOUR_TEST_MID";
  const scriptSrc = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${MID}.js`;

  // Remove old script if any
  const existing = document.getElementById("paytm-script");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = "paytm-script";
  script.src = scriptSrc;
  script.crossOrigin = "anonymous";
  script.onload = () => {
    if (!window.Paytm?.CheckoutJS) {
      onFailure?.("Paytm SDK failed to load");
      return;
    }
    window.Paytm.CheckoutJS.init({
      merchant: { mid: MID, name: "Poojify", logo: "/assets/logo.png", redirect: false },
      order: { id: String(orderId), amount: String(amount), token: txnToken, currency: "INR" },
      flow: "DEFAULT",
      handler: {
        notifyMerchant(eventName) {
          if (eventName === "APP_CLOSED") onFailure?.("Payment cancelled");
        },
        transactionStatus(data) {
          if (data?.STATUS === "TXN_SUCCESS") {
            onSuccess?.({ orderId, txnId: data.TXNID });
          } else {
            onFailure?.(data?.RESPMSG || "Payment failed");
          }
        },
      },
    }).then(() => window.Paytm.CheckoutJS.invoke());
  };
  script.onerror = () => onFailure?.("Failed to load Paytm script");
  document.body.appendChild(script);
}
