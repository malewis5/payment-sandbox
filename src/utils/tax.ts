import { PAYMENT_MS_ENDPOINT } from "../env";

export const payPalTax = async (data: any, amount: any, shipping: any) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    shipping: shipping,
    amount: amount,
    to_zip: data.shipping_address.postal_code,
    to_state: data.shipping_address.state,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };
  const tax = await fetch(`${PAYMENT_MS_ENDPOINT}/get-mock-tax`, requestOptions)
    .then((res) => res.json())
    .then((data) => data.taxData.taxAmount.toString());

  return tax;
};

export const appleTax = async (e: any): Promise<string> => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shippingContact: e?.shippingContact ?? "",
    }),
  };
  const fetchTax = await fetch(
    `${PAYMENT_MS_ENDPOINT}/get-mock-tax`,
    requestOptions
  ).then((data: any) => data.json());

  return fetchTax;
};
