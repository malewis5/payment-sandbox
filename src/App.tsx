import "./App.scss";
import { ApplePayButton } from "./components/Payments/ApplePay/ApplePayButton";
import { PayPalButton } from "./components/Payments/PayPal/PayPalButton";
import CurrentInput from "./components/Input";
import React from "react";

function App() {
  const [amount, setAmount] = React.useState<string>("");

  return (
    <div className="App">
      <header className="App-header">
        <div className="dollar-input">
          <p>Amount must be greater than $0</p>
          <CurrentInput setAmount={setAmount} />
        </div>

        <div className="button-container">
          <ApplePayButton
            onPaymentSuccess={() => {}}
            payment={{ subtotal: amount ?? "" }}
            storeName="Demo"
          />
          <PayPalButton amount={amount} />
        </div>
      </header>
    </div>
  );
}

export default App;
