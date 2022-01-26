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
import {
  appleShipping,
  appleStaticShipping,
  payPalShipping,
} from "./utils/shipping";
import { appleTax, payPalTax } from "./utils/tax";
import { applePaymentError, applePaymentSuccess } from "./utils/paymentSuccess";

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
                  onPaymentSuccess={applePaymentSuccess}
                  onPaymentError={applePaymentError}
                  payment={{
                    subtotal: amount,
                    shipping: "0",
                    tax: "0",
                  }}
                  storeName="Sandbox Demo"
                  client={clientInstance}
                  shippingMethods={appleStaticShipping}
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
                onPaymentSuccess={(data: any) => console.log(data)}
                onPaymentError={(err: any) => console.log(err)}
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
