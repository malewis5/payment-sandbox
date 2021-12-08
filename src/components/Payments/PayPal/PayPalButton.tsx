import * as React from "react";
import "./PayPalButton.scss";
import {
  GenerateClientToken,
  renderPayPalButton,
} from "../Braintree/braintreeHooks";

interface IPayPalButton {
  label?: string;
  amount: string;
  setPayload?: any;
}

const PayPalButton: React.FC<IPayPalButton> = ({ amount, setPayload }) => {
  const { payPalInstance } = GenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );

  React.useEffect(() => {
    if (payPalInstance) renderPayPalButton(payPalInstance, amount, setPayload);
  });

  return (
    <div>
      <div id="paypal-button" />
    </div>
  );
};

export { PayPalButton };
