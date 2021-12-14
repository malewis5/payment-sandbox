import { ApplePay, Client } from "braintree-web";
import * as React from "react";
import "./ApplePayButton.scss";
import {
  authApplePay,
  createApplePaySession,
  createPaymentRequest,
} from "./ApplePayUtils";

type Payment = {
  subtotal: string;
  tax?: string;
  shipping?: string;
};

export type shippingHandlerFunction = (
  event: ApplePayJS.ApplePayShippingContactSelectedEvent
) => ApplePayJS.ApplePayShippingMethod[];
export type taxHandlerFunction = (
  event: ApplePayJS.ApplePayShippingContactSelectedEvent
) => string;

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
        taxHandler
        // shippingMethods,
      );
    }
  } else throw new Error("Error creating Payment Request");
};

interface IApplePayButton {
  onPaymentSuccess: (response: any) => void;
  onPaymentError: (e: any) => void;
  client?: Client;
  payment: Payment;
  storeName: string;
  taxHandler?: taxHandlerFunction;
  buttonType?: ApplePayButtonType;
  shippingHandler?: shippingHandlerFunction;
  shippingMethods?: Array<ApplePayJS.ApplePayShippingMethod>;
}

export enum ApplePayButtonLabel {
  checkout = "checkout",
  book = "book",
  buy = "buy",
  donate = "donate",
  plain = "plain",
  setup = "set-up",
  subscribe = "subscribe",
  addMoney = "add-money",
  contribute = "contribute",
  order = "order",
  reload = "reload",
  rent = "rent",
  support = "support",
  tip = "tip",
  topUp = "top-up",
}

type ApplePayButtonType = ApplePayButtonLabel;

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
    console.log("Fetched apple pay instance");
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
