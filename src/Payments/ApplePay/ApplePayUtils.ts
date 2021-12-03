// @ts-nocheck
import { ApplePay } from "braintree-web";
import { shippingHandlerFunction, taxHandlerFunction } from "./ApplePayButton";

export const createLineItems = (
  subtotal: string,
  shipping?: string,
  shippingMethods?: ApplePayJS.ApplePayShippingMethod[],
  tax?: string
): Array<ApplePayJS.ApplePayLineItem> => {
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

export const createPaymentRequest = (
  subtotal: string,
  storeName: string,
  applePayInstance: ApplePay,
  shipping?: string,
  shippingMethods?: Array<ApplePayJS.ApplePayShippingMethod>,
  tax?: string
): ApplePayJS.ApplePayPaymentRequest => {
  if (applePayInstance) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const paymentRequest: ApplePayJS.ApplePayPayment =
      applePayInstance.createPaymentRequest({
        total: {
          label: storeName,
          amount: calculateApplePayTotal(subtotal, shipping, tax),
        },
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return paymentRequest;
  } else throw Error("Apple pay instance not authorized");
};

export const calculateApplePayTotal = (
  subtotal: string,
  shipping?: string,
  tax?: string
): string => {
  const subtotalFloat = parseFloat(subtotal) ?? "0";
  const shippingFloat = parseFloat(shipping ?? "0") ?? "0";
  const taxFloat = parseFloat(tax ?? "0") ?? "0";
  return (subtotalFloat + shippingFloat + taxFloat).toString();
};

export const createApplePaySession = (
  paymentRequest: ApplePayJS.ApplePayPaymentRequest,
  applePayInstance: ApplePay,
  onPaymentSuccess: (response: any) => void,
  shippingHandler?: shippingHandlerFunction,
  taxHandler?: taxHandlerFunction
  // shippingMethods?: Array<ApplePayJS.ApplePayShippingMethod>,
): void => {
  const session: ApplePaySession = new (
    window as unknown as ApplePayJS.ApplePayWindow
  ).ApplePaySession(3, paymentRequest);

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
            session.completePayment(
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
                  (window as unknown as ApplePayJS.ApplePayWindow)
                    .ApplePaySession.STATUS_SUCCESS
                );
                onPaymentSuccess(response);
              } else {
                session.completePayment(
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

  // This is called when a user selects a shipping method. Use this to update cart totals.
  // Make sure to update paymentRequest with any changes.
  // if (shippingHandler) {
  //   session.onshippingmethodselected = function(event: ApplePayJS.ApplePayShippingMethodSelectedEvent) {
  //     const update: ApplePayJS.ApplePayShippingMethodUpdate = shippingHandler(event, paymentRequest)
  //     session.completeShippingMethodSelection(update)
  //   }
  // }
  if (shippingHandler) {
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
    session.onshippingcontactselected = function (
      event: ApplePayJS.ApplePayShippingContactSelectedEvent
    ) {
      const shippingMethods = shippingHandler
        ? shippingHandler(event)
        : undefined;
      const shipping = shippingMethods?.[0]?.amount ?? "0";
      const tax = taxHandler ? taxHandler(event) : "0";

      const prevSubtotal = paymentRequest?.lineItems?.[0]?.amount ?? "0";
      const newTotal = {
        amount: calculateApplePayTotal(prevSubtotal, shipping, tax),
        label: paymentRequest.total.label,
      };

      const update: ApplePayJS.ApplePayShippingContactUpdate = {
        newTotal: newTotal,
        newShippingMethods: shippingMethods,
        newLineItems: createLineItems(
          prevSubtotal,
          shipping,
          shippingMethods,
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
