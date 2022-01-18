# Braintree Payments Sandbox

This sandbox is used for testing our Braintree Gateway.

## Installation

1. Use the terminal to clone this repo to your desired location.

```console
git clone https://github.com/malewis5/payment-sandbox.git
```

2. Create an .npmrc file

```.npmrc
@peakactivity:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<TOKEN>
```

3. Create an .env file
```
REACT_APP_PAYMENT_MS_ENDPOINT = <microservice endpoint>
```

4. Navigate your terminal to the new directory and install dependencies.

```console
cd payment-sandbox 
npm install
```

5. Start the local development server.

```console
npm start
```
6. Use ngrok to run using HTTPS.

```console
ngrok http --region=us --hostname=revcommerce.ngrok.io 3000
```

7. The sandbox is now live at https://revcommerce.ngrok.io ✨. 

## Support
For questions regarding the sandbox please see our [payments documentation](https://peakactivity.atlassian.net/wiki/spaces/MDD/pages/2032238593/RevCommerce+Payments "RevCommerce Payments Documentation").
