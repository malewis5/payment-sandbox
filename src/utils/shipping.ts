import { PAYMENT_MS_ENDPOINT } from "../env";

export const payPalShipping = async () => {
  const shippingOptions = [
    {
      id: "SHIP_123",
      label: "Free Shipping",
      type: "SHIPPING",
      selected: true,
      amount: {
        value: "3.00",
        currency_code: "USD",
      },
    },
    {
      id: "SHIP_456",
      label: "Expedited Shipping",
      type: "SHIPPING",
      selected: false,
      amount: {
        value: "9.99",
        currency_code: "USD",
      },
    },
  ];
  return shippingOptions;
};

export const appleShipping = async (e: any): Promise<[]> => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shippingContact: e?.shippingContact ?? "",
    }),
  };
  const fetchShippingOptions = await fetch(
    `${PAYMENT_MS_ENDPOINT}/get-mock-ship`,
    requestOptions
  ).then((data: any) => data.json());
  return fetchShippingOptions;
};
