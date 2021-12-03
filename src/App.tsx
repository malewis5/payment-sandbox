import "./App.scss";
import { ApplePayButton } from "./Payments/ApplePay/ApplePayButton";
import { PayPalButton } from "./Payments/PayPal/PayPalButton";
import CurrentInput from "./Input";
import React from "react";

function App() {
  const [amount, setAmount] = React.useState<string>();
  return (
    <div className="App">
      <header className="App-header">
        <div className="dollar-input">
          <CurrentInput setAmount={setAmount} />
        </div>
        <div>
          <ApplePayButton
            onPaymentSuccess={() => {}}
            payment={{ subtotal: "amount" }}
            storeName="Demo"
          />
          <PayPalButton amount={amount} />
        </div>
      </header>
    </div>
  );
}

export default App;
