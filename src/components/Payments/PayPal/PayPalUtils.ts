import { Client, paypalCheckout } from "braintree-web";
import { PayPalCheckout } from "braintree-web/modules/paypal-checkout";

// Create PayPal instance
export const authPayPal = async (instance: Client): Promise<PayPalCheckout> => {
  const payPalInstance = await paypalCheckout
    .create({
      client: instance,
    })
    .then((payPalCheckoutInstance) => {
      return payPalCheckoutInstance;
    })
    .catch((e) => {
      throw new Error(e);
    });
  return payPalInstance;
};

export const postNonce = async (payload: any) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nonce: payload?.payload?.nonce,
      payment: {
        total: {
          amount: "205.00",
        },
      },
      postalCode: payload?.details?.shipping_address?.postalCode,
      shippingContact: payload?.details?.shippingAddress,
    }),
  };
  fetch(
    "https://payment-microservice.ngrok.io/payment-nonce",
    requestOptions
  ).then((res) => {
    if (res.status !== 200) {
      throw Error("Error posting nonce");
    }
  });
};

export const renderPayPalButton = async (
  payPalInstance: PayPalCheckout,
  amount?: string,
  setPayload?: any
) => {
  payPalInstance
    ?.loadPayPalSDK({
      currency: "USD",
      intent: "capture",
      debug: false,
      commit: false,
    })
    .then(function (paypalCheckoutInstance) {
      //@ts-ignore
      return (
        window.paypal
          //@ts-ignore
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "checkout",
              height: 30,
            },
            //@ts-ignore
            fundingSource: paypal.FUNDING.PAYPAL,
            createOrder: function () {
              return paypalCheckoutInstance.createPayment({
                //@ts-ignore
                flow: "checkout", // Required
                amount: amount, // Required
                currency: "USD", // Required, must match the currency passed in with loadPayPalSDK
                //@ts-ignore
                intent: "capture", // Must match the intent passed in with loadPayPalSDK
                enableShippingAddress: true,
                shippingAddressEditable: true,
              });
            },

            onShippingChange: function (data: any, actions: any) {
              // Patch the shipping amount
              const shippingAmount =
                data.shipping_address.state === "CA" ? "0.00" : "5.00";
              return actions.order.patch([
                {
                  op: "replace",
                  path: "/purchase_units/@reference_id=='default'/amount",
                  value: {
                    currency_code: "USD",
                    value: (
                      parseFloat(amount ?? "") + parseFloat(shippingAmount)
                    ).toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: "USD",
                        value: amount,
                      },
                      shipping: {
                        currency_code: "USD",
                        value: shippingAmount,
                      },
                    },
                  },
                },
              ]);
            },

            onApprove: async function (data: any, actions: any) {
              const payload = await paypalCheckoutInstance.tokenizePayment(
                data
              );
              const totalAmount = await actions.order
                .get([
                  {
                    path: "/purchase_units/@reference_id=='default'/amount",
                  },
                ])
                .then((res: any) => res.purchase_units[0].amount.value)
                .catch((err: any) => {
                  throw new Error(err);
                });
              setPayload({
                payload: payload,
                totalAmount: totalAmount,
              });

              const transactionDetails = await fetch(
                "https://payment-microservice.ngrok.io/get-paypal-transaction",
                {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    orderID: data.orderID,
                  }),
                }
              )
                .then((res) => {
                  return res.json();
                })
                .then((data) => {
                  return data.result;
                })
                .catch((e) => {
                  throw Error(e);
                });

              console.log(transactionDetails);
            },

            onCancel: (data: any) => {
              console.log("PayPal payment cancelled", JSON.stringify(data));
            },

            onError: (err: any) => {
              throw Error(err);
            },
          })
          .render("#paypal-button")
      );
    });
};
