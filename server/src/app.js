/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(".data/db.json");
require("dotenv").config();
const db = low(adapter);
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT,
};

db.defaults({
  subscriptions: [],
}).write();

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

app.get("/status", (req, res) => {
  res.send({
    message: "hello world",
  });
});

function sendNotifications(subscriptions) {
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
    },
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails,
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach((subscription) => {
    console.log(vapidDetails);
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

app.post("/add-subscription", (request, response) => {
  console.log(`Subscribing ${request.body.subscription}`);
  db.get("subscriptions").push(request.body).write();
  response.sendStatus(200);
});

app.post("/remove-subscription", (request, response) => {
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.get("subscriptions").remove({ endpoint: request.body.endpoint }).write();
  response.sendStatus(200);
});

app.post("/notify-me", (request, response) => {
  console.log(`Notifying ${request.body.endpoint}`);
  const subscription = db
    .get("subscriptions")
    .find({ endpoint: request.body.endpoint })
    .value();
  console.log(subscription);
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post("/notify-all", (request, response) => {
  console.log("Notifying all subscribers");
  const subscriptions = db.get("subscriptions").cloneDeep().value();
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.listen(process.env.PORT || 8081);
