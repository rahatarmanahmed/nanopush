# nanopush [![Build Status](https://travis-ci.org/rahatarmanahmed/nanopush.svg?branch=master)](https://travis-ci.org/rahatarmanahmed/nanopush)
A tiny push notification app.

## Setup

nanopush requires at least node `v6`.

```sh
npm install
cp .env .env.local
node generateKeys.js >> .env.local
```

Edit `.env.local` and fill in your email for `SERVICE_OWNER_EMAIL`. Then to start the app, run:

```sh
npm start
```

## Testing

```sh
npm test
```

## Deployment

This needs to be deployed and proxied on https, or else the push API won't work.

*TODO: instructions on setting up nginx or whatever*

Once you have all that set up, you can start the app in production mode with

```sh
# Set these environment variables how you like
export VAPID_PUBLIC_KEY={the public key you generated earlier}
export VAPID_PRIVATE_KEY={the private key you generated earlier}
export SERVICE_OWNER_EMAIL={your email}

npm run start-prod
```
