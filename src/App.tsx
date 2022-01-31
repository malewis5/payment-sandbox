import "./App.scss";
import React from "react";
import {
  PayPalScriptProvider,
  BraintreePayPalButtons,
} from "@paypal/react-paypal-js";

function App() {
  const [amount, setAmount] = React.useState<string>("1");

  const postNonce = async (payload: any, amount: string): Promise<any> => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nonce: payload?.nonce,
        payment: {
          total: {
            amount: amount,
          },
        },
        postalCode: payload?.details?.shipping_address?.postalCode ?? null,
        shippingContact: payload?.details?.shippingAddress ?? null,
        billingContact: payload?.details?.billingContact ?? null,
      }),
    };

    await fetch(
      `${process.env.REACT_APP_PAYMENT_MS_ENDPOINT}/payment-nonce`,
      requestOptions
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Error posting nonce");
        }
        return res.json();
      })
      .catch((e: any) => e);
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "test",
        "data-user-id-token": "sandbox_q7gs6p9p_zr7jhjxy86w6tch3",
        "disable-funding": "venmo,credit,card",
      }}
    >
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
            <BraintreePayPalButtons
              forceReRender={[amount]}
              createOrder={(data, actions) => {
                return actions.braintree.createPayment({
                  flow: "checkout",
                  amount: "10.0",
                  currency: "USD",
                  intent: "capture",
                });
              }}
              onApprove={(data, actions) => {
                return actions.braintree
                  .tokenizePayment(data)
                  .then((payload) => {
                    postNonce(payload, amount);
                  });
              }}
            />
          </div>
        </header>
      </div>
    </PayPalScriptProvider>
  );
}

export default App;
