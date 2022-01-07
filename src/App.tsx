import "./App.scss";
import React from "react";
import {
  useGenerateClientToken,
  IsApplePaySupported,
  ApplePayButton,
  PayPalButton,
  ApplePayButtonLabel,
} from "@peakactivity/revcom-payment-components";
import "@peakactivity/revcom-payment-components/lib/index.css";
import { PAYMENT_MS_ENDPOINT } from "./env";

function App() {
  const [amount, setAmount] = React.useState<string>("1");
  const { clientInstance, serverError, isLoading } = useGenerateClientToken();

  const isSupported = IsApplePaySupported();

  const handleShipping = async (e: any): Promise<any> => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingContact: e?.shippingContact ?? "",
      }),
    };
    const fetchShippingOptions = await fetch(
      `${PAYMENT_MS_ENDPOINT}/get-mock-ship`,
      requestOptions
    ).then((data: any) => data.json());
    return fetchShippingOptions;
  };

  const handleTax = async (e: any): Promise<string> => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingContact: e?.shippingContact ?? "",
      }),
    };
    const fetchTax = await fetch(
      `${PAYMENT_MS_ENDPOINT}/get-mock-tax`,
      requestOptions
    ).then((data: any) => data.json());
    console.log(fetchTax);
    return fetchTax;
  };

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
                  payment={{ subtotal: amount ?? "" }}
                  storeName="Sandbox Demo"
                  client={clientInstance}
                  shippingHandler={handleShipping}
                  taxHandler={handleTax}
                  buttonType={ApplePayButtonLabel.checkout}
                />
              )}

              <PayPalButton client={clientInstance} amount={amount} />
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
