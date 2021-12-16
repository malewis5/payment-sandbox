# Braintree Payments Sandbox

This sandbox is used for testing our Braintree Gateway.

## Installation

1. Use the terminal to clone this repo to your desired location.

```console
git clone https://github.com/malewis5/payment-sandbox.git
```
2. Navigate your terminal to the new directory and install dependencies.

```console
cd payment-sandox 
npm install
```
3. Use ngrok to run using HTTPS.

```console
ngrok http --region=us --hostname=revcommerce.ngrok.io 3000
```
4. Start the payment microservice using ngrok and HTTPS.
```console
ngrok http --region=us --hostname=payment-microservice.ngrok.io 8082
```
**Note:** Instructions for setting up the payment microservice can be found <a href="https://github.com/PeakActivity/revcommerce-payment-ms" target="_blank">here</a>.

5. The sandbox is now available at <a href="https://www.revcommerce.ngrok.io" alt="RevCommerce Payments Sandbox" target="_blank">https://www.revcommerce.ngrok.io</a> ✨. 

## Support
For questions regarding the sandbox reach out to [Matthew Lewis](mailto:mlewis@peakactivity.com "Send email to Matthew Lewis").
