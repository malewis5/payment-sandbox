import "./App.scss";
import { PayPalButton } from "./components/Payments/PayPal/PayPalButton";
import CurrentInput from "./components/Input";
import React from "react";
import SubmitButton from "./components/SubmitButton";
import { GenerateClientToken } from "./components/Payments/Braintree/braintreeHooks";
import { IsApplePaySupported } from "./components/Payments/ApplePay/ApplePayUtils";
import { ApplePayButton } from "./components/Payments/ApplePay/ApplePayButton";

function App() {
  const [amount, setAmount] = React.useState<string>("");
  const [payload, setPayload] = React.useState<any>("");
  const { clientInstance, serverError, isLoading } = GenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );
  const isSupported = IsApplePaySupported();

  return (
    <div className="App">
      <header className="App-header">
        <div className="dollar-input">
          <p>Amount must be greater than $0</p>
          <CurrentInput setAmount={setAmount} />
        </div>

        <div className="button-container">
          {isLoading && <p>Loading...</p>}
          {!isLoading && (
            <>
              {isSupported && (
                <ApplePayButton
                  onPaymentSuccess={() => {}}
                  payment={{ subtotal: amount ?? "" }}
                  storeName="Demo"
                  client={clientInstance}
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
