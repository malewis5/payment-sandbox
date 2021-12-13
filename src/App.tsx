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

  const handleShipping = (e: any) => {
    let price = "0";
    if (e.shippingContact.administrativeArea === "FL") {
      price = "2.99";
    }
    return [
      {
        label: "Free Shipping",
        detail: "5-7 days",
        amount: "0",
        identifier: "FreeShip",
      },
      {
        label: "Expedited Shipping",
        detail: "2 days",
        amount: price,
        identifier: "ExpShip",
      },
    ];
  };

  const handleTax = (e: any) => {
    return "3.26";
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
            </>
          )}
          <SubmitButton payload={payload} setPayload={setPayload} />
        </div>
        {serverError && <p className="error">Error connecting to server</p>}
      </header>
    </div>
  );
}

export default App;
