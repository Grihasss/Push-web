before launch npm i and generate VAPID keys from terminal using npx web-push generate-vapid-keys

then add .env to both server and client with keys recieved from generator

.env example:
VAPID_PUBLIC_KEY="BKiwTvD9HA…"
VAPID_PRIVATE_KEY="4mXG9jBUaU…"
VAPID_SUBJECT="mailto:test@test.test"
