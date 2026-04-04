# zalo-bot-js

`zalo-bot-js` is a TypeScript SDK for the Zalo Bot API, designed for Node.js developers with a Vietnamese-first documentation experience and a clean English path.

## What you will find here

- How to install the project and create `.env`
- How to verify your bot token
- How to run a polling bot and test `/start` and `hello`
- How the SDK is structured today
- Examples, test scripts, and webhook basics

## Current status

The SDK currently includes:

- `Bot`, `Application`, `ApplicationBuilder`
- `CommandHandler`, `MessageHandler`, `filters`
- `getMe`, `getUpdate`, `sendMessage`, `sendPhoto`, `sendSticker`, `sendChatAction`
- basic webhook helpers
- real `.env`-based test scripts

Start with [Getting started](./getting-started.md).

The project is intentionally small and practical today: it focuses on a clean core, a predictable module layout, and a workable developer flow before covering every advanced API edge case.
