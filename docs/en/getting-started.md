# Getting started

## Requirements

- Node.js 18 or newer
- a valid Zalo Bot token

## Install dependencies

```bash
npm install
```

## Create `.env`

Create a `.env` file in the project root:

```env
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
```

`ZALO_BOT_LANG` supports:

- `vi`: runtime logs and helper messages in Vietnamese
- `en`: runtime logs and helper messages in English

If unset, the current default is `vi`.

## Verify the token

```bash
npm run test:token
```

This script:

- loads `.env`
- reads `ZALO_BOT_TOKEN`
- creates `Bot`
- calls `getMe()`
- prints the bot profile in the selected runtime language

## Run the hello bot

```bash
npm run test:hello-bot
```

Then send:

- `/start`
- `hello`

to validate the basic message flow.

This test script uses:

- `ApplicationBuilder`
- `CommandHandler("start", ...)`
- `MessageHandler(...)`

It is the fastest way to confirm polling, update parsing, handler matching, and message replies.

## Minimal startup example

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Hello!");
}));

void app.runPolling();
```

## When to use each test script

- `test:token`: validate token and bot identity only
- `test:hello-bot`: validate token, polling, handlers, and reply flow together
