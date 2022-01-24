import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface IPayPalButton {
  amount: string;
  style: any;
}

const intitialOptions = {
  "client-id":
    "AdrYZr9lTI-NgfuARhzrDXmAzoiUUpg__do8aU1fsY_4dtLoxngGB_PMgNRpRj6qroqN5JDw3jOXvQvF",
  currency: "USD",
  intent: "capture",
  "disable-funding": "card,credit",
  "enable-funding": "venmo",
};

export const PayPalButton: React.FC<IPayPalButton> = ({ amount, style }) => {
  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      console.log(`Details: ${details}`);
    });
  };

  const onShippingChange = async (data: any, actions: any) => {};

  const onCancel = (data: any, actions: any) => {
    console.log("PayPal payment cancelled", JSON.stringify(data));
  };

  const onError = (err: any) => {
    console.error(err);
  };

  return (
    <div>
      <PayPalScriptProvider options={intitialOptions}>
        <PayPalButtons
          createOrder={createOrder}
          style={style}
          forceReRender={[amount]}
          onApprove={onApprove}
          onShippingChange={onShippingChange}
          onError={onError}
          onCancel={onCancel}
        />
      </PayPalScriptProvider>
    </div>
  );
};
