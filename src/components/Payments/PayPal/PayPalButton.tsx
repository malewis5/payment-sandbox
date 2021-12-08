import { Client } from "braintree-web";
import * as React from "react";
import "./PayPalButton.scss";
import { authPayPal, renderPayPalButton } from "./PayPalUtils";

interface IPayPalButton {
  label?: string;
  amount: string;
  setPayload?: any;
  client?: Client;
}

const PayPalButton: React.FC<IPayPalButton> = ({
  amount,
  setPayload,
  client,
}) => {
  React.useEffect(() => {
    console.log("Fetched paypal instance");
    console.log(client);
    const createPayPalInstance = async () => {
      if (client) {
        await authPayPal(client).then((paypalInstance) => {
          renderPayPalButton(paypalInstance, "19.99");
        });
      }
    };
    createPayPalInstance();
  }, [client]);

  return (
    <div>
      <div id="paypal-button" />
    </div>
  );
};

export { PayPalButton };
