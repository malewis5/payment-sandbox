const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const TaxJar = require("taxjar");
const cors = require("cors");
const app = express();
const port = 8001;

const jsonParser = bodyParser.json();
app.use(cors());

app.post("/taxes", jsonParser, async (req, res) => {
  const apiKey = process.env.TAX_JAR_TOKEN;

  const client = new TaxJar({
    apiKey: apiKey,
    apiUrl: TaxJar.SANDBOX_API_URL,
  });

  const {
    from_country,
    from_zip,
    from_state,
    from_city,
    from_street,
    to_country,
    to_zip,
    to_state,
    to_city,
    to_street,
    amount,
    shipping,
  } = req.body;

  console.log(req.body);

  const taxData = await client
    .taxForOrder({
      from_country,
      from_zip,
      from_state,
      from_city,
      from_street,
      to_country,
      to_zip,
      to_state,
      to_city,
      to_street,
      amount,
      shipping,
    })
    .then((res) => {
      return {
        taxObject: res.tax, // Tax object
        taxAmount: res.tax.amount_to_collect, // Amount to collect
      };
    })
    .catch((e) => e);
  res.send(taxData);
});

app.listen(port, () => {
  console.log(`TaxJar server listening at http://localhost:${port}`);
});
