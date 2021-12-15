import { Client } from "braintree-web";

export interface IApplePayButton {
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

export type Payment = {
  subtotal: string;
  tax?: string;
  shipping?: string;
};

export type shippingHandlerFunction = (
  event: ApplePayJS.ApplePayShippingContactSelectedEvent
) => Promise<ApplePayJS.ApplePayShippingMethod[]>;
export type taxHandlerFunction = (
  event: ApplePayJS.ApplePayShippingContactSelectedEvent
) => Promise<string>;
