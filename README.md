# nanopush [![Build Status](https://travis-ci.org/rahatarmanahmed/nanopush.svg?branch=master)](https://travis-ci.org/rahatarmanahmed/nanopush)
A tiny push notification app.

## Setup

nanopush requires at least node `v6`.

First copy .env to .env.local, and edit it to include your email. Then run:

```sh
npm install
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
SERVICE_OWNER_EMAIL=you@email.com npm run start-prod
```
