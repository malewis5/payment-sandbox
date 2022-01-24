import "./App.scss";
import React from "react";
import { PayPalButton } from "./PayPalButton";

function App() {
  const [amount, setAmount] = React.useState<string>("1");

  const style = {
    layout: "horizontal",
    color: "blue",
    shape: "pill",
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
          <PayPalButton amount={amount} style={style} />
        </div>
      </header>
    </div>
  );
}

export default App;
