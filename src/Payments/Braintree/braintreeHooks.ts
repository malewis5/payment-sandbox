//@ts-nocheck
import {
  ApplePay,
  applePay,
  Client,
  client,
  paypalCheckout,
  PayPalCheckout,
} from "braintree-web";
import { useEffect, useState } from "react";

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
  amount
) => {
  payPalInstance
    ?.loadPayPalSDK({
      currency: "USD",
      intent: "capture",
    })
    .then(function (paypalCheckoutInstance) {
      return paypal
        .Buttons({
          fundingSource: paypal.FUNDING.PAYPAL,
          createOrder: function () {
            return paypalCheckoutInstance.createPayment({
              flow: "checkout", // Required
              amount: amount, // Required
              currency: "USD", // Required, must match the currency passed in with loadPayPalSDK
              intent: "capture", // Must match the intent passed in with loadPayPalSDK
              enableShippingAddress: true,
              shippingAddressEditable: true,
              shippingOptions: [
                {
                  id: "FreeShip",
                  label: "Free Shipping",
                  selected: true,
                  type: "SHIPPING",
                  amount: {
                    currency: "USD",
                    value: "0",
                  },
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const payload = await paypalCheckoutInstance.tokenizePayment(data);
            const postNonce = async () => {
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nonce: payload.nonce,
                  payment: { total: { amount: "10" } },
                  postalCode: payload.details.billingAddress?.postalCode,
                  shippingContact: payload.details.shippingAddress ?? "",
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
            postNonce();
          },

          onCancel: (data: any) => {
            console.log("PayPal payment cancelled", JSON.stringify(data));
          },

          onError: (err: any) => {
            throw Error(err);
          },
        })
        .render("#paypal-button");
    });
};
