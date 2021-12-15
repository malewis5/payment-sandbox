import { ApplePay, Client } from "braintree-web";
import React from "react";
import "./ApplePayButton.scss";
import {
  authApplePay,
  createApplePaySession,
  createPaymentRequest,
} from "./ApplePayUtils";
import {
  IApplePayButton,
  Payment,
  shippingHandlerFunction,
  taxHandlerFunction,
} from "./types";

const handleApplePayClick = (
  applePayInstance: ApplePay | undefined,
  payment: Payment,
  storeName: string,
  onPaymentSuccess: (response: any) => void,
  onPaymentError: (e: any) => void,
  shippingHandler?: shippingHandlerFunction,
  taxHandler?: taxHandlerFunction,
  shippingMethods?: Array<ApplePayJS.ApplePayShippingMethod>
) => {
  const { subtotal, tax, shipping } = payment;

  if (applePayInstance) {
    const paymentRequest = createPaymentRequest(
      subtotal,
      storeName,
      applePayInstance,
      shipping,
      shippingMethods,
      tax
    );
    if (paymentRequest) {
      createApplePaySession(
        paymentRequest,
        applePayInstance,
        onPaymentSuccess,
        onPaymentError,
        shippingHandler,
        taxHandler,
        shippingMethods
      );
    }
  } else throw new Error("Error creating Payment Request");
};

const ApplePayButton: React.FC<IApplePayButton> = ({
  payment,
  storeName,
  onPaymentSuccess,
  onPaymentError,
  taxHandler,
  client,
  shippingHandler,
  shippingMethods,
}) => {
  const [applePayInstance, setApplePayInstance] = React.useState<ApplePay>();

  React.useEffect(() => {
    const createApplePayInstance = async (instance?: Client) => {
      if (instance) {
        const applePayInstance = await authApplePay(instance);
        setApplePayInstance(applePayInstance);
      }
    };
    createApplePayInstance(client);
  }, [client]);
  return (
    <div
      className={"applePayButton applePayButtonBlack checkout"}
      onClick={() =>
        handleApplePayClick(
          applePayInstance,
          payment,
          storeName,
          onPaymentSuccess,
          onPaymentError,
          shippingHandler,
          taxHandler,
          shippingMethods
        )
      }
    />
  );
};

export { ApplePayButton };
