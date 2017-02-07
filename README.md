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

This needs to be deployed and proxied on https, or else the push API won't work. I suggest Caddy or nginx.

Once you have all that set up, you can start the app in production mode like so

```sh
# Set these environment variables how you like
export VAPID_PUBLIC_KEY={the public key you generated earlier in .env.local}
export VAPID_PRIVATE_KEY={the private key you generated earlier in .env.local}
export SERVICE_OWNER_EMAIL={your email}

export HOST=0.0.0.0 # Default: 127.0.0.1
export PORT=8080 # Default: 3000

node index.js
```

I use a [`pm2` config](http://pm2.keymetrics.io/docs/usage/application-declaration/) to keep the app always running.
