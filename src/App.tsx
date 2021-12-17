import "./App.scss";
import { PayPalButton } from "@peakactivity/revcom-payment-components";
import React from "react";
import { GenerateClientToken } from "@peakactivity/revcom-payment-components";
import { IsApplePaySupported } from "@peakactivity/revcom-payment-components";
import { ApplePayButton } from "@peakactivity/revcom-payment-components";

function App() {
  const [amount, setAmount] = React.useState<string>("1");
  const { clientInstance, serverError, isLoading } = GenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );

  const isSupported = IsApplePaySupported();

  const handleShipping = async (
    e: ApplePayJS.ApplePayShippingContactSelectedEvent
  ): Promise<ApplePayJS.ApplePayShippingMethod[]> => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingContact: e?.shippingContact ?? "",
      }),
    };
    const fetchShippingOptions = await fetch(
      "https://payment-microservice.ngrok.io/get-mock-ship",
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
      "https://payment-microservice.ngrok.io/get-mock-tax",
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
                  // buttonType={ApplePayButtonLabel.checkout}
                />
              )}

              <PayPalButton client={clientInstance} amount={amount} />
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
