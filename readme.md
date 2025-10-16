# Battlefield 6 Vehicle Training map

This repo holds the "source files" for the "**Florent's Vehicle Training**" Portal experience (code 3374).  

## Current features (for the published "v10")

- Mirak Valley
- Two or more of every vehicles on each side (except SU59 which doesn't spawn)
- Infinite, no objective custom game mode
- Much bigger combat area
- No bots

![vehicles.jpg](imgs/readme.jpg)

## Future features (maybe)

- Bot vehicules (ground and air) that moves on predetermined paths, to use as target practice
- TOW and tank shooting range
- Infinite ammunitions
- Protection against idle players
- show position on screen
- UI to teleport
- UI to change team anytime
- UI to spawn any vehicles in front of player

## Content of the repo

- the `experience` folder contain the export of the experience created through Portal
- the `godot` folder contain the scene (`.tscn`) file
- the `portal` folder contain the generated `code.ts` script, the `string.json` file, and the `.spatial.json` files to be uploaded in portal
- the `src` folder contain the various `.ts` scripts that will be combined into `portal/code.ts`
- the `tools` folder contain bash and pythons script
