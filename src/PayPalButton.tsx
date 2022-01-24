import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { payPalShipping } from "./utils/shipping";

interface IPayPalButton {
  amount: string;
  style: any;
}

const intitialOptions = {
  "client-id":
    "ARA8IyE2GN8PzkiPREtapt9ej1nLeUD-Qeb9sZsfmbmRL-uEd3Nl1oC_a-L1BD7DPSXc_b6uEJmBGvVf",
  currency: "USD",
  intent: "capture",
  "disable-funding": "card,credit",
  "enable-funding": "venmo",
};

export const PayPalButton: React.FC<IPayPalButton> = ({ amount, style }) => {
  const createOrder = async (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: "USD",
          },
          shipping: {
            options: await payPalShipping(),
          },
        },
      ],
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      console.log(details);
    });
  };

  const onShippingChange = async (data: any, actions: any): Promise<void> => {
    const shippingAmount = data.selected_shipping_option.amount.value;
    return actions.order.patch([
      {
        op: "replace",
        path: "/purchase_units/@reference_id=='default'/amount",
        value: {
          currency_code: "USD",
          value: (
            parseFloat(amount ?? "") + parseFloat(shippingAmount)
          ).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: amount,
            },
            shipping: {
              currency_code: "USD",
              value: shippingAmount,
            },
          },
        },
      },
    ]);
  };

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
