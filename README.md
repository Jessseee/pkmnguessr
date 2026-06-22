<h1 align="center"> 
<a href="https://pkmnguessr.jessseee.nl">
<img src="https://github.com/Jessseee/pkmnguessr/blob/main/readme-banner.png?raw=true" alt="PkmnGuessr logo">
</a>
<br>
</h1>
<p align="center">
A Pokémon guessing game built with SvelteKit. Guess Pokémon using clues like generation, type, height, weight and shape. Featuring game data and custom sprites from <a href="https://github.com/PokeAPI/pokeapi">PokéAPI</a> and a basic search filtering syntax.
</p>
<p align="center">
Project inspired by <a href="https://squirdle.fireblend.com">Squirdle</a> by <a href="https://github.com/fireblend">@Fireblend</a>
</p>

## Development

Want to fork the project or help improve the game, here are some instruction to get started developing on your device.

Clone the repository:

```bash
git clone git@github.com:Jessseee/pkmnguessr.git
```

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

## Deployment

Deploy compiled Pokémon data into remote KV store:

```bash
pnpm run deploy:pokemon
```

Deploy to Cloudflare using Wrangler:

```bash
pnpm run deploy
```

## Fair Use

This is a non-commercial fan project, the author believed the names and assets used in this project to be [fair use](https://en.wikipedia.org/wiki/Fair_use). All assets and data are sourced through [PokéAPI](https://pokeapi.co) and [Bulbapedia](https://bulbapedia.bulbagarden.net).
