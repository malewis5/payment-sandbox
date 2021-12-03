import "./App.scss";
import { ApplePayButton } from "./Payments/ApplePay/ApplePayButton";
import { PayPalButton } from "./Payments/PayPal/PayPalButton";
import CurrentInput from "./Input";
import React from "react";

function App() {
  const [amount, setAmount] = React.useState<string>("");
  const disabled = parseFloat(amount) > 0 ? false : true;
  return (
    <div className="App">
      <header className="App-header">
        <div className="dollar-input">
          {disabled && <p>Amount must be greater than $0</p>}
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
