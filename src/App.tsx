import "./App.scss";
import React from "react";
import {
  useGenerateClientToken,
  IsApplePaySupported,
  ApplePayButton,
  PayPalButton,
  ApplePayButtonLabel,
} from "@peakactivity/revcom-payment-components";

function App() {
  const [amount, setAmount] = React.useState<string>("1");
  const { clientInstance, serverError, isLoading } = useGenerateClientToken(
    "https://payment-microservice.ngrok.io/client-token"
  );

  const isSupported = IsApplePaySupported();

  const handleShipping = async (e: any): Promise<any> => {
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
                  buttonType={ApplePayButtonLabel.checkout}
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
