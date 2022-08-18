const express = require("express");
const serverless = require("serverless-http");
const { APIClient } = require("ig-trading-api");
require("dotenv").config();

const app = express();
const router = express.Router();

router.get("/", async (req, res) => {
  const client = new APIClient(APIClient.URL_DEMO, process.env.IG_APIKEY);
  const session = await client.rest.login.createSession(
    process.env.IG_USERNAME,
    process.env.IG_PASSWORD
  );
  console.time("Start");
  // Get account
  const accounts = await client.rest.account.getAccounts();

  // Get positions
  const positions = await client.rest.dealing.getAllOpenPositions();
  console.timeEnd("Start");

  // Get previous trading history
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const history = await client.rest.account.getActivityHistory({
    detailed: true,
    from: yesterday.toISOString(),
    to: now.toISOString(),
  });

  res.status(200).json({
    account: accounts,
    positions: positions,
    //history: history,
  });
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
