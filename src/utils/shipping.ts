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

export const appleStaticShipping = [
  {
    // The label shown in the payment sheet
    label: "Free Shipping",
    // Text shown below the label used to indicate timing
    detail: "5-7 days",
    // A unique identifier for this shipping method
    identifier: "FreeShip",
    // The total cost of this shipping method
    amount: "0",
  },
  {
    label: "Expedited Shipping",
    detail: "2 days",
    identifier: "ExpShip",
    amount: "9.99",
  },
];
