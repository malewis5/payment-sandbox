import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from "./env";
import { payPalShipping } from "./utils/shipping";

interface IPayPalButton {
  amount: string;
  style: any;
  setCustomerDetails: React.Dispatch<React.SetStateAction<undefined>>;
}

const intitialOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  "disable-funding": "card,credit",
};

export const PayPalButton: React.FC<IPayPalButton> = ({
  amount,
  style,
  setCustomerDetails,
}) => {
  const createOrder = async (data: any, actions: any) => {
    const shippingOptions = await payPalShipping();
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: "USD",
            breakdown: {
              item_total: { value: amount, currency_code: "USD" },
              shipping: {
                value: shippingOptions[0].amount.value,
                currency_code: "USD",
              },
              tax_total: {
                value: "0.00",
                currency_code: "USD",
              },
            },
          },
          shipping: {
            options: shippingOptions,
          },
          items: [
            {
              name: "Toto Neorest RH Dual-Flush Toilet",
              unit_amount: { value: amount, currency_code: "USD" },
              quantity: "1",
            },
          ],
        },
      ],
      application_context: {
        brand_name: "Payment Sandbox",
      },
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      setCustomerDetails(details);
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
