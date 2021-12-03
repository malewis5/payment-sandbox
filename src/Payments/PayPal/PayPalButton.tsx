import * as React from "react";
import "./PayPalButton.scss";
import {
  GenerateClientToken,
  renderPayPalButton,
} from "../Braintree/braintreeHooks";

interface IPayPalButton {
  label?: string;
}

const PayPalButton: React.FC<IPayPalButton> = () => {
  const [amount, setAmount] = React.useState<string>();
  const { payPalInstance } = GenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );

  React.useEffect(() => {
    if (payPalInstance) renderPayPalButton(payPalInstance, amount);
  });

  return (
    <div>
      <div className="cart">
        <p>Amount: </p>
        <input
          type="number"
          min="0.01"
          max="9999.99"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
        />
      </div>

      <div id="paypal-button" />
    </div>
  );
};

export { PayPalButton };
