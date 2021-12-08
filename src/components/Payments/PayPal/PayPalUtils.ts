export const postNonce = async (payload: any) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: payload,
    }),
  };
  fetch("https://payment-microservice.ngrok.io/payment-nonce", requestOptions);
};
