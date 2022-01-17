import "./App.scss";
import React from "react";
import {
  useGenerateClientToken,
  IsApplePaySupported,
  ApplePayButton,
  PayPalButton,
  ApplePayButtonLabel,
  ApplePayColorLabel,
  PayPalButtonColor,
  PayPalButtonLabel,
  PayPalButtonShape,
} from "@peakactivity/revcom-payment-components";
import "@peakactivity/revcom-payment-components/lib/index.css";
import { appleShipping, payPalShipping } from "./utils/shipping";
import { appleTax, payPalTax } from "./utils/tax";

function App() {
  const [amount, setAmount] = React.useState<string>("1");
  const { clientInstance, serverError, isLoading } = useGenerateClientToken();
  const isSupported = IsApplePaySupported();

  return (
    <div className="App">
      <header className="App-header">
        <div className="dollar-input">
          <p>Amount must be greater than $0</p>
          <input
            type="number"
            pattern="[0-9]*"
            min="2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="button-container">
          {isLoading && <p>Loading...</p>}
          {!isLoading && (
            <>
              {isSupported && (
                <ApplePayButton
                  onPaymentSuccess={() => {}}
                  onPaymentError={() => {}}
                  payment={{
                    subtotal: amount ?? "",
                    tax: "1",
                    shipping: "0.99",
                  }}
                  storeName="Sandbox Demo"
                  client={clientInstance}
                  shippingHandler={appleShipping}
                  //@ts-ignore
                  taxHandler={appleTax}
                  buttonType={ApplePayButtonLabel.buy}
                  buttonColor={ApplePayColorLabel.white}
                />
              )}

              <PayPalButton
                client={clientInstance}
                amount={amount}
                color={PayPalButtonColor.gold}
                label={PayPalButtonLabel.checkout}
                shape={PayPalButtonShape.rect}
                height={30}
                //@ts-ignore
                shippingHandler={payPalShipping}
                taxHandler={payPalTax}
              />
              <button className="checkout-button">Submit Order</button>
            </>
          )}
        </div>
        {serverError && (
          <p className="error">Error connecting to payment microservice</p>
        )}
      </header>
    </div>
  );
}

export default App;
