import { applePay, ApplePay, Client } from "braintree-web";
import React from "react";
import { shippingHandlerFunction, taxHandlerFunction } from "./types";

// Create Apple Pay instance
export const authApplePay = async (instance: Client): Promise<ApplePay> => {
  const applePayInstance = await applePay
    .create({
      client: instance,
    })
    .then((instance) => instance)
    .catch((e: any) => {
      throw Error(e);
    });
  return applePayInstance;
};

// Create line items for Payment Sheet
//TODO: Make this more performant
export const createLineItems = (
  subtotal: string,
  shipping?: string,
  shippingMethods?: ApplePayJS.ApplePayShippingMethod[],
  tax?: string
): ApplePayJS.ApplePayLineItem[] => {
  const lineItems: Array<ApplePayJS.ApplePayLineItem> = [];
  if (subtotal) {
    lineItems.push({ label: "Subtotal", amount: subtotal, type: "final" });
  }
  if (shipping) {
    lineItems.push({ label: "Shipping", amount: shipping, type: "final" });
  } else if (shippingMethods) {
    lineItems.push({
      label: "Shipping",
      amount: shippingMethods[0].amount,
      type: "final",
    });
  }
  if (tax) {
    lineItems.push({ label: "Tax", amount: tax, type: "final" });
  }
  return lineItems;
};

export const calculateApplePayTotal = (
  subtotal: string,
  shipping?: string,
  tax?: string
): string => {
  const subtotalFloat = parseFloat(subtotal) ?? "0";
  const shippingFloat = parseFloat(shipping ?? "0") ?? "0";
  const taxFloat = parseFloat(tax ?? "0") ?? "0";
  return (subtotalFloat + shippingFloat + taxFloat).toFixed(2).toString();
};

export const createPaymentRequest = (
  subtotal: string,
  storeName: string,
  applePayInstance: ApplePay,
  shipping?: string,
  shippingMethods?: Array<ApplePayJS.ApplePayShippingMethod>,
  tax?: string
): ApplePayJS.ApplePayPaymentRequest => {
  if (applePayInstance) {
    const paymentRequest = applePayInstance.createPaymentRequest({
      total: {
        label: storeName,
        amount: calculateApplePayTotal(subtotal, shipping, tax),
      },
      //@ts-ignore
      lineItems: createLineItems(subtotal, shipping, shippingMethods, tax),
      shippingMethods: shippingMethods,
      requiredBillingContactFields: ["postalAddress"],
      requiredShippingContactFields: [
        "postalAddress",
        "name",
        "phone",
        "email",
      ],
    });
    //@ts-ignore
    return paymentRequest;
  } else throw Error("Apple pay instance not authorized");
};

export const createApplePaySession = (
  paymentRequest: ApplePayJS.ApplePayPaymentRequest,
  applePayInstance: ApplePay,
  onPaymentSuccess: (response: any) => void,
  onPaymentError: (e: any) => void,
  shippingHandler?: shippingHandlerFunction,
  taxHandler?: taxHandlerFunction,
  shippingMethods?: ApplePayJS.ApplePayShippingMethod[]
): void => {
  const session: ApplePaySession = new //@ts-ignore
  (window as unknown as ApplePayJS.ApplePayWindow).ApplePaySession(
    3,
    paymentRequest
  );

  session.onvalidatemerchant = function (
    event: ApplePayJS.ApplePayValidateMerchantEvent
  ) {
    if (applePayInstance) {
      applePayInstance.performValidation(
        {
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
        },
        function (err, merchantSession) {
          if (err) {
            session.abort();
            onPaymentError(err);
            throw Error(err.message);
          }
          session.completeMerchantValidation(merchantSession);
        }
      );
    } else throw Error("No apple pay instance.");
  };

  session.onpaymentauthorized = function (
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ) {
    if (applePayInstance) {
      applePayInstance.tokenize(
        {
          token: event.payment.token,
        },
        function (tokenizeErr, payload) {
          if (tokenizeErr) {
            onPaymentError(tokenizeErr);
            session.completePayment(
              //@ts-ignore
              (window as unknown as ApplePayJS.ApplePayWindow).ApplePaySession
                .STATUS_FAILURE
            );
            throw Error(tokenizeErr.message);
          }
          // Send payment nonce to micro-service
          const postNonce = async (
            nonce: string,
            applePayPayment: ApplePayJS.ApplePayPaymentRequest
          ) => {
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nonce: nonce,
                payment: applePayPayment,
                postalCode: event?.payment?.billingContact?.postalCode ?? "",
                shippingContact: event?.payment?.shippingContact ?? "",
              }),
            };
            // TODO: Add this to .env
            fetch(
              "https://payment-microservice.ngrok.io/payment-nonce",
              requestOptions
            ).then((response) => {
              if (response.status === 200) {
                session.completePayment(
                  //@ts-ignore
                  (window as unknown as ApplePayJS.ApplePayWindow)
                    .ApplePaySession.STATUS_SUCCESS
                );
                onPaymentSuccess(response);
              } else {
                onPaymentError(response);
                session.completePayment(
                  //@ts-ignore
                  (window as unknown as ApplePayJS.ApplePayWindow)
                    .ApplePaySession.STATUS_FAILURE
                );
                throw Error("Error posting payment nonce.");
              }
            });
          };
          postNonce(payload.nonce, paymentRequest);
        }
      );
    } else throw Error("No apple pay instance.");
  };

  if (shippingHandler || shippingMethods) {
    session.onshippingmethodselected = function (
      event: ApplePayJS.ApplePayShippingMethodSelectedEvent
    ) {
      const prevSubtotal = paymentRequest?.lineItems?.[0]?.amount ?? "0";
      const newShipping = event.shippingMethod.amount;
      const prevTax = paymentRequest?.lineItems?.[2]?.amount ?? "0";
      const newTotal = calculateApplePayTotal(
        prevSubtotal,
        newShipping,
        prevTax
      );

      const update: ApplePayJS.ApplePayShippingMethodUpdate = {
        newTotal: { amount: newTotal, label: paymentRequest.total.label },
        newLineItems: createLineItems(
          prevSubtotal,
          newShipping,
          paymentRequest.shippingMethods,
          prevTax
        ),
      };
      // Update Payment Request with new items
      paymentRequest.total = update.newTotal;
      paymentRequest.lineItems = update.newLineItems;

      session.completeShippingMethodSelection(update);
    };
  }

  // If user has shipping selected, this is called as soon as the payment sheet is presented. Otherwise it's called when the user selects an address.
  // This is where we calculate taxes.
  if (shippingHandler || taxHandler) {
    session.onshippingcontactselected = async function (
      event: ApplePayJS.ApplePayShippingContactSelectedEvent
    ) {
      const updatedShippingMethods = shippingHandler
        ? await shippingHandler(event)
        : shippingMethods;
      const shipping = updatedShippingMethods?.[0]?.amount ?? "0";
      const tax = taxHandler ? await taxHandler(event) : "0";

      const prevSubtotal = paymentRequest?.lineItems?.[0]?.amount ?? "0";
      const newTotal = {
        amount: calculateApplePayTotal(prevSubtotal, shipping, tax),
        label: paymentRequest.total.label,
      };

      const update: ApplePayJS.ApplePayShippingContactUpdate = {
        newTotal: newTotal,
        newShippingMethods: updatedShippingMethods,
        newLineItems: createLineItems(
          prevSubtotal,
          shipping,
          updatedShippingMethods,
          tax
        ),
      };
      // Update Payment Request with new items.
      paymentRequest.total = update.newTotal;
      paymentRequest.lineItems = update.newLineItems;

      session.completeShippingContactSelection(update);
    };
  }

  session.begin();
};

// Check to see if the browser supports Apple Pay
export const IsApplePaySupported: () => boolean | undefined = () => {
  const [isSupported, setIsSupported] = React.useState<boolean>();
  React.useEffect(() => {
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
  const [isSetup, setIsSetup] = React.useState<boolean>();
  React.useEffect(() => {
    const checkIsSetup = () => {
      //TODO: Merchant ID env variable
      //@ts-ignore
      return window.ApplePaySession.canMakePaymentsWithActiveCard(
        "merchant.revcommerce.com"
      );
    };
    const isSupported = checkIsSetup();
    setIsSetup(isSupported);
  }, []);
  return isSetup;
};
