import {
  ApplePay,
  applePay,
  Client,
  client,
  paypalCheckout,
  PayPalCheckout,
} from "braintree-web";
import { useEffect, useState } from "react";
import { postNonce } from "../PayPal/PayPalUtils";

type ClientTokenReturnType = {
  token: string | undefined;
  isLoading: boolean;
  serverError: boolean;
  applePayInstance: ApplePay | undefined;
  payPalInstance: PayPalCheckout | undefined;
};

// React Hook to generate Braintree authorization token
export const GenerateClientToken = (
  endpoint: string
): ClientTokenReturnType => {
  const [token, setToken] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [applePayInstance, setApplePayInstance] = useState<ApplePay>();
  const [payPalInstance, setPayPalInstance] = useState<PayPalCheckout>();

  useEffect(() => {
    setIsLoading(true);
    const fetchToken = async () => {
      try {
        await fetch(endpoint)
          .then((res) => res.json())
          .then((data) => {
            setToken(data.token);
            return data.token;
          })
          .then(async (token) => await authenticateInstance(token))
          .then(async (instance) => {
            await authApplePay(instance);
            await authPayPal(instance);
          })
          .catch((err: Error) => {
            setServerError(true);
            throw new Error(err.message);
          })
          .finally(() => setIsLoading(false));
      } catch (e: any) {
        setServerError(true);
        setIsLoading(false);
        throw Error(e.message);
      }
    };

    // Authenticate Braintree client-side SDK
    const authenticateInstance = async (token: string) => {
      try {
        const clientInstance = await client
          .create({
            authorization: token ?? "",
          })
          .then((instance: Client) => {
            return instance;
          });
        return clientInstance;
      } catch (e: any) {
        throw new Error(e);
      }
    };

    // Create Apple Pay instance
    const authApplePay = async (instance: Client) => {
      try {
        const applePayInstance = await applePay.create({
          client: instance,
        });
        setApplePayInstance(applePayInstance);
      } catch (e: any) {
        throw Error(e);
      }
    };

    // Create PayPal instance
    const authPayPal = async (instance: Client) => {
      const payPalInstance = await paypalCheckout
        .create({
          client: instance,
        })
        .then((payPalCheckoutInstance) => {
          setPayPalInstance(payPalCheckoutInstance);
          return payPalCheckoutInstance;
        })
        .catch((e) => {
          throw new Error(e);
        });
      return payPalInstance;
    };

    fetchToken();
  }, [endpoint]);

  return { token, isLoading, serverError, applePayInstance, payPalInstance };
};

// Check to see if the browser supports Apple Pay
export const IsApplePaySupported: () => boolean | undefined = () => {
  const [isSupported, setIsSupported] = useState<boolean>();
  useEffect(() => {
    const checkApplePaySupport = () => {
      return (
        //@ts-ignore
        (window as unknown as ApplePayWindow).ApplePaySession &&
        //@ts-ignore
        (window as unknown as ApplePayWindow).ApplePaySession.supportsVersion(
          3
        ) &&
        //@ts-ignore
        (window as unknown as ApplePayWindow).ApplePaySession.canMakePayments()
      );
    };
    const isSupported = checkApplePaySupport();
    setIsSupported(isSupported);
  }, []);
  return isSupported;
};

// Check if user has Apple Pay setup
export const IsApplePaySetup: () => boolean | undefined = () => {
  const [isSetup, setIsSetup] = useState<boolean>();
  useEffect(() => {
    const checkIsSetup = () => {
      //TODO: Merchant ID env variable
      return (
        window as unknown as ApplePayJS.ApplePayWindow
      ).ApplePaySession.canMakePaymentsWithActiveCard(
        "merchant.revcommerce.com"
      );
    };
    const isSupported = checkIsSetup();
    setIsSetup(isSupported);
  }, []);
  return isSetup;
};

export const renderPayPalButton = async (
  payPalInstance: PayPalCheckout,
  amount: string,
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
                      parseFloat(amount) + parseFloat(shippingAmount)
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
              paypalCheckoutInstance
                .tokenizePayment(data)
                .then(function (payload) {
                  setPayload(payload);
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
