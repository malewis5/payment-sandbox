import { PAYMENT_MS_ENDPOINT } from "../env";

export const payPalShipping = async () => {
  const shippingOptions = [
    {
      id: "SHIP_123",
      label: "Free Shipping",
      type: "SHIPPING",
      selected: true,
      amount: {
        value: "0.00",
        currency: "USD",
      },
    },
    {
      id: "SHIP_456",
      label: "Pick up in Store",
      type: "PICKUP",
      selected: false,
      amount: {
        value: "0.00",
        currency: "USD",
      },
    },
    {
      id: "SHIP_789",
      label: "Expedited Shipping",
      type: "SHIPPING",
      selected: false,
      amount: {
        value: "9.99",
        currency: "USD",
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
