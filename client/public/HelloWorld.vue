<template>
  <div>
    <h1>Push notifications client</h1>
    <noscript>
      You have JavaScript disabled. This app requires JavaScript to work.
    </noscript>
    <button 
      id="subscribe"
      @click="subscribeButtonHandler">
      Subscribe to push
    </button>
    <button 
      id="unsubscribe"
      @click="unsubscribeButtonHandler">
      Unsubscribe from push
    </button>
    <button  
      id="notify-me"
      @click="notifyMe"
      >
      Notify me
    </button>
    <button   
      id="notify-all"
      @click="notifyAll">
      Notify all
    </button>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import api, { notify, notifyAll, subscribe, unsubscribe } from "../services/api"
// Push notification logic.

async function subscribeButtonHandler() {
  const result = await Notification.requestPermission();
if (result === 'denied') {
  console.error('The user explicitly denied the permission request.');
  return;
}
if (result === 'granted') {
  console.info('The user accepted the permission request.');
}
const registration = await navigator.serviceWorker.getRegistration();
const subscribed = await registration.pushManager.getSubscription();
if (subscribed) {
  console.info('User is already subscribed.', subscribed);
  return;
}
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlB64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
});

subscribe(subscription)

}

async function unsubscribeButtonHandler() {
  const registration = await navigator.serviceWorker.getRegistration();
const subscription = await registration.pushManager.getSubscription();
unsubscribe(subscription)
const unsubscribed = await subscription.unsubscribe();
if (unsubscribed) {
  console.info('Successfully unsubscribed from push notifications.');
}

}

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray; 
}

// Startup logic.

// TODO add startup logic here
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('./service-worker.js').then(serviceWorkerRegistration => {
    console.info('Service worker was registered.');
    console.info({serviceWorkerRegistration});
  }).catch(error => {
    console.error('An error occurred while registering the service worker.');
    console.error(error);
  });
} else {
  console.error('Browser does not support service workers or push messages.');
}

// Logic for the "Notify me" and "Notify all" buttons.

const notifyMe = async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  notify(subscription)
};

const notifyEveryone = async () => {
  notifyAll()
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
