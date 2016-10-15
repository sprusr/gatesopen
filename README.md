# gatesopen

Telegram bot that uses crowdsourced data to tell you whether the ticket barriers at a UK train station are open or not. Enables, but does not condone fare evasion.

## Setup

You need to create the file `secrets.js` in the root of the project. This needs to contain `module.exports.telegram.token = 'YOUR_TELEGRAM_BOT_TOKEN'`. The app also needs access to a local redis db, and you need to run `util/populate-redis.js` (it will hang after finishing, just give it like 5 seconds).
