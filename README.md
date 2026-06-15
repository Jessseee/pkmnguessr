# PKMN Guessr

A Pokémon guessing game built with SvelteKit. guess Pokémon using clues like generation, type, height and weight. Featuring game data and custom sprites from [`pokeapi`](https://github.com/PokeAPI/pokeapi) and a basic search filtering syntax. Project inspired by [Squirdle](https://squirdle.fireblend.com) by [@Fireblend](https://github.com/fireblend).

## Getting Started

Install dependencies:

```bash
pnpm install
```

Compile data from `pokeapi` and put into local KV store:

```bash
pnpm run build:pokemon
```

Run the development server:

```bash
pnpm run dev
```

Open the app in your browser:

```txt
http://localhost:5173
```

## Deploy

Deploy compiled Pokémon data into remote KV store:

```bash
pnpm run build:pokemon
```

Deploy to Cloudflare using Wrangler:

```bash
pnpm run deploy
```
