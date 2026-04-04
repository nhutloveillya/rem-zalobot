# Examples and tests

## Polling example

Reference file: `examples/polling.ts`

Use this when you want a simple token-based bot with command and text handlers.

Best fit when:

- you are developing locally
- you do not have a public webhook URL yet
- you want the simplest debug loop possible

## Webhook example

Reference file: `examples/webhook.ts`

This example uses `node:http` to create a minimal webhook server and calls `setWebhook()`.

Best fit when:

- you already run a public server
- you want push-based updates instead of polling
- you are moving toward a longer-running deployment

## Token test

Reference file: `test/check-token.ts`

Run:

```bash
npm run test:token
```

This script only verifies the token and bot profile. It is the recommended first check after creating `.env`.

## Hello bot test

Reference file: `test/hello-bot.ts`

Run:

```bash
npm run test:hello-bot
```

The bot responds to:

- `/start`
- `hello`

This test is useful when you want to validate:

- token loading
- polling
- handler matching
- reply flow

## Useful scripts

- `npm run build`
- `npm run check`
- `npm run test`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:preview`

## Suggested workflow

1. create `.env`
2. run `npm run test:token`
3. run `npm run test:hello-bot`
4. move to `examples/polling.ts` or `examples/webhook.ts` for your own bot logic
