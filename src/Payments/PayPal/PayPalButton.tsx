import * as React from "react";
import "./PayPalButton.scss";
import {
  GenerateClientToken,
  renderPayPalButton,
} from "../Braintree/braintreeHooks";

interface IPayPalButton {
  label?: string;
  amount?: string;
}

const PayPalButton: React.FC<IPayPalButton> = ({ amount }) => {
  const { payPalInstance } = GenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );

  React.useEffect(() => {
    if (payPalInstance) renderPayPalButton(payPalInstance, amount);
  });

  return (
    <div>
      <div id="paypal-button" />
    </div>
  );
};

export { PayPalButton };
