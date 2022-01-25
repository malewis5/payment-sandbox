import "./App.scss";
import React from "react";
import { PayPalButton } from "./PayPalButton";

function App() {
  const [amount, setAmount] = React.useState<string>("5291");
  const [customerDetails, setCustomerDetails] = React.useState<any>();

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
          <PayPalButton
            amount={amount}
            style={style}
            setCustomerDetails={setCustomerDetails}
          />
        </div>
        <div
          className="customer-info"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <input
            type={"string"}
            value={customerDetails?.payer?.name.given_name ?? null}
            placeholder="First Name"
          />
          <input
            type={"string"}
            value={customerDetails?.payer?.name.surname ?? null}
            placeholder="Last Name"
          />
          <input
            type={"string"}
            value={
              customerDetails?.purchase_units?.[0]?.shipping.address
                .address_line_1 ?? null
            }
            placeholder="Street Address"
          />
          <input
            type={"string"}
            value={
              customerDetails?.purchase_units?.[0]?.shipping.address
                .address_line_2 ?? null
            }
            placeholder="Apt, Suite, etc."
          />
          <input
            type={"string"}
            value={
              customerDetails?.purchase_units?.[0]?.shipping.address
                .postal_code ?? null
            }
            placeholder="Zip Code"
          />
          <input
            type={"string"}
            value={
              customerDetails?.purchase_units?.[0]?.shipping.address
                .admin_area_2 ?? null
            }
            placeholder="City"
          />
          <input
            type={"string"}
            value={
              customerDetails?.purchase_units?.[0]?.shipping.address
                .admin_area_1 ?? null
            }
            placeholder="State"
          />
          <input type={"string"} value={""} placeholder="Phone Number" />
        </div>
      </header>
    </div>
  );
}

export default App;
