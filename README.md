# Braintree Payments Sandbox

This sandbox is used for testing our Braintree Gateway.

## Installation

1. Use the terminal to clone this repo to your desired location.

```console
git clone https://github.com/malewis5/payment-sandbox.git
```
2. Navigate your terminal to the new directory and install dependencies.

```console
cd payment-sandbox 
npm install
```
3. Start the local development server.

```console
npm start
```
5. Use ngrok to run using HTTPS.

```console
ngrok http --region=us --hostname=revcommerce.ngrok.io 3000
```

6. The sandbox is now live at https://revcommerce.ngrok.io ✨. 

## Support
For questions regarding the sandbox please see our [payments documentation](https://peakactivity.atlassian.net/wiki/spaces/MDD/pages/2032238593/RevCommerce+Payments "RevCommerce Payments Documentation").
