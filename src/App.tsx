import "./App.scss";
import { PayPalButton } from "./components/Payments/PayPal/PayPalButton";
import React from "react";
import SubmitButton from "./components/SubmitButton";
import { GenerateClientToken } from "./components/Payments/Braintree/braintreeHooks";
import { IsApplePaySupported } from "./components/Payments/ApplePay/ApplePayUtils";
import { ApplePayButton } from "./components/Payments/ApplePay/ApplePayButton";

function App() {
  const [amount, setAmount] = React.useState<string>("1");
  const [payload, setPayload] = React.useState<any>("");
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
                />
              )}

              <PayPalButton
                client={clientInstance}
                amount={amount}
                setPayload={setPayload}
              />

              <SubmitButton payload={payload} setPayload={setPayload} />
            </>
          )}
        </div>
        {serverError && <p className="error">Error connecting to server</p>}
      </header>
    </div>
  );
}

export default App;
