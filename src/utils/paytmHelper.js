/**
 * Loads Paytm JS checkout script (test env) and opens payment modal.
 * @param {string} orderId   - Your order/booking ID
 * @param {string} txnToken  - Transaction token from your backend
 * @param {number} amount    - Amount in INR
 * @param {function} onSuccess - Called with { orderId, txnId } on success
 * @param {function} onFailure - Called with error message on failure
 */
// export function openPaytmCheckout({
//   orderId,
//   txnToken,
//   amount,
//   mid,
//   onSuccess,
//   onFailure,
// }) {
//   if (!orderId || !txnToken || !mid || !amount) {
//     onFailure?.("Invalid payment details");
//     return;
//   }

//   const scriptSrc = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`;

//   const existing = document.getElementById("paytm-script");
//   if (existing) existing.remove();

//   const script = document.createElement("script");
//   script.id = "paytm-script";
//   script.src = scriptSrc;
//   script.crossOrigin = "anonymous";

//   script.onload = () => {
//     if (!window.Paytm?.CheckoutJS) {
//       onFailure?.("Paytm SDK failed to load");
//       return;
//     }

//     window.Paytm.CheckoutJS.init({
//       merchant: {
//         mid: mid,
//         name: "Poojify",
//         logo: "/assets/logo.png",
//         redirect: false,
//       },

//       order: {
//         id: String(orderId),
//         amount: String(amount),
//         token: txnToken,
//         currency: "INR",
//       },

//       flow: "DEFAULT",

//       handler: {
//         notifyMerchant(eventName) {
//           console.log("Paytm event:", eventName);

//           if (eventName === "APP_CLOSED") {
//             onFailure?.("Payment cancelled");
//           }
//         },

//         transactionStatus(data) {
//           console.log("Paytm transaction status:", data);

//           if (data?.STATUS === "TXN_SUCCESS") {
//             onSuccess?.({
//               orderId: data.ORDERID || orderId,
//               txnId: data.TXNID,
//               status: data.STATUS,
//             });
//           } else {
//             onFailure?.(
//               data?.RESPMSG ||
//               data?.STATUSMSG ||
//               "Payment failed"
//             );
//           }
//         },
//       },
//     })
//       .then(() => {
//         return window.Paytm.CheckoutJS.invoke();
//       })
//       .catch((error) => {
//         console.error("Paytm Checkout Error:", error);
//         onFailure?.("Unable to open Paytm checkout");
//       });
//   };

//   script.onerror = () => {
//     onFailure?.("Failed to load Paytm script");
//   };

//   document.body.appendChild(script);
// }

export function openPaytmCheckout({
  orderId,
  txnToken,
  amount,
  mid,
  onSuccess,
  onFailure,
}) {
  console.log("========== PAYTM START ==========");

  console.log("orderId:", orderId);
  console.log("txnToken:", txnToken);
  console.log("amount:", amount);
  console.log("mid:", mid);

  // -----------------------------------------
  // Validate
  // -----------------------------------------

  if (!orderId || !txnToken || !mid || amount == null) {
    console.error("❌ Missing Paytm details");

    onFailure?.("Invalid payment details");
    return;
  }

  // -----------------------------------------
  // Paytm Stage CheckoutJS
  // -----------------------------------------

    const scriptSrc =`https://secure.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${mid}.js`;

  console.log("Paytm Script:", scriptSrc);

  // -----------------------------------------
  // Remove old script
  // -----------------------------------------

  const existingScript =
    document.getElementById("paytm-script");

  if (existingScript) {
    existingScript.remove();
  }

  // -----------------------------------------
  // Create script
  // -----------------------------------------

  const script = document.createElement("script");

  script.id = "paytm-script";
  script.src = scriptSrc;
  script.crossOrigin = "anonymous";

  // -----------------------------------------
  // Script loaded
  // -----------------------------------------

  script.onload = () => {
    console.log(" Paytm script loaded");

    console.log(
      "Paytm object:",
      window.Paytm
    );

    const checkout =
      window.Paytm?.CheckoutJS;

    if (!checkout) {
      console.error(
        "❌ CheckoutJS not found"
      );

      onFailure?.(
        "Paytm SDK failed to load"
      );

      return;
    }

    console.log(
      "CheckoutJS:",
      checkout
    );

    console.log(
      "onLoad type:",
      typeof checkout.onLoad
    );

    // ---------------------------------------
    // Wait for CheckoutJS
    // ---------------------------------------

    checkout.onLoad(function () {
      console.log(
        "✅ Paytm CheckoutJS ready"
      );

      console.log(
        "init type:",
        typeof checkout.init
      );

      console.log(
        "invoke type:",
        typeof checkout.invoke
      );

      if (
        typeof checkout.init !==
        "function"
      ) {
        console.error(
          "❌ CheckoutJS.init unavailable"
        );

        onFailure?.(
          "Paytm initialization failed"
        );

        return;
      }

      if (
        typeof checkout.invoke !==
        "function"
      ) {
        console.error(
          "❌ CheckoutJS.invoke unavailable"
        );

        onFailure?.(
          "Paytm invoke unavailable"
        );

        return;
      }

      // ---------------------------------------
      // IMPORTANT:
      // Paytm JS Checkout config
      // ---------------------------------------

      const config = {
        root: "",

        flow: "DEFAULT",

        data: {
          orderId: String(orderId),

          token: String(txnToken),

          tokenType: "TXN_TOKEN",

          amount: String(amount),
        },

        merchant: {
          mid: String(mid),

          name: "Poojify",

          logo: "/assets/logo.png",

          redirect: false,
        },

        handler: {
          // -----------------------------------
          // Paytm events
          // -----------------------------------

          notifyMerchant(
            eventName,
            data
          ) {
            console.log(
              "📢 Paytm Event:",
              eventName
            );

            console.log(
              "📢 Paytm Event Data:",
              data
            );

            if (
              eventName ===
              "APP_CLOSED"
            ) {
              console.log(
                "❌ Paytm checkout closed"
              );

              onFailure?.(
                "Payment cancelled"
              );
            }
          },

          // -----------------------------------
          // Transaction status
          // -----------------------------------

          transactionStatus(data) {
            console.log(
              "🔥 Paytm Transaction Status:",
              data
            );

            if (
              data?.STATUS ===
              "TXN_SUCCESS"
            ) {
              console.log(
                "✅ Paytm Payment Successful"
              );

              onSuccess?.({
                orderId:
                  data.ORDERID ||
                  orderId,

                txnId: data.TXNID,

                status: data.STATUS,
              });

              return;
            }

            console.error(
              "❌ Paytm Payment Failed:",
              data
            );

            onFailure?.(
              data?.RESPMSG ||
                data?.STATUSMSG ||
                "Payment failed"
            );
          },
        },
      };

      console.log(
        "🚀 Paytm Init Config:",
        config
      );

      // ---------------------------------------
      // INIT
      // ---------------------------------------

      checkout
        .init(config)

        .then((result) => {
          console.log(
            "✅ Paytm INIT success:",
            result
          );

          console.log(
            "🚀 Opening Paytm checkout..."
          );

          // -----------------------------------
          // INVOKE
          // -----------------------------------

          return checkout.invoke();
        })

        .then((result) => {
          console.log(
            "✅ Paytm INVOKE result:",
            result
          );
        })

        .catch((error) => {
          console.error(
            "❌ Paytm Init/Invoke Error:",
            error
          );

          onFailure?.(
            error?.message ||
              "Unable to open Paytm checkout"
          );
        });
    });
  };

  // -----------------------------------------
  // Script Error
  // -----------------------------------------

  script.onerror = (error) => {
    console.error(
      "❌ Paytm script failed:",
      error
    );

    console.error(
      "Paytm URL:",
      scriptSrc
    );

    onFailure?.(
      "Failed to load Paytm script"
    );
  };

  // -----------------------------------------
  // Append Script
  // -----------------------------------------

  document.body.appendChild(script);

  console.log(
    "📦 Paytm script appended"
  );
}