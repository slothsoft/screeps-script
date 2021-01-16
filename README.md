# Screeps Script

[![Build Status](https://www.travis-ci.com/slothsoft/screeps-script.svg?branch=main)](https://www.travis-ci.com/slothsoft/screeps-script)

My scripts for the game [Screeps](https://screeps.com/). The official API is located [here](https://docs.screeps.com/api).

- [Features](#features)
    - [Creeps](#creeps)
- [Game Phases](#game-phases)
- [Console Commands](#console-commands)
- [Memory](#memory)
    - [Room Memory](#room-memory)
    - [Creep Memory](#creep-memory)
- [Dev Notes](#dev-notes)
- [Open Tasks](#open-tasks)


## Features

<img align="right" width="170" height="160" src="readme/fancy-gui.png">

- each room has a fancy overview GUI
- each room has a console which prints most info


### Creeps

- will follow their role until there is nothing else to do
- if they don't find work in their role, they'll take on an arbitrary other role
- display their role next to their circle (→ `DEBUG_ROLES`)
- will be respawned with as many parts as possible after their death
- can self-destruct (console command `selfdestruct(&lt;creepName&gt;)`)


## Game Phases

### Phase 1 - Harvesters

- game starts in this phase
- all config for base is in memory under `rooms.&lt;A12B3&gt;.base`
- role infos configure which roles are present in which quantity
- the initial setup is based on Harvesters


### Phase 2 - Miner & Storekeeper

- after the storage is available the setup should be 
	1. Miner puts stuff into storage
	2. Storekeeper takes it out and distributes it
- since Miner need only work parts and storekeeper mostly move parts this setup seems to be cheaper
- spawn miners for each source with console command`spawnMiner(&lt;spawnName&gt;, &lt;sourceName&gt;)`
- phase Harvesters out
- replace Handymen with Towers
- use Link for Room Controller



## Console Commands

| Memory                                              | Description  |
| --------------------------------------------------- | ------------ |
| `fetchOldestCreep(&lt;baseName&gt;)`             | fetches the oldest creep in the world (the one with the lowest `ticksToLive`); fetches the oldest creep in the base if &lt;baseName&gt; was set |
| `selfdestruct(&lt;creepName&gt;)`                 | the creep will go to the next spawn and recycle itself |
| `spawnMiner(&lt;spawnId&gt;, &lt;sourceId&gt;)`       | spawns a new miner for a spawn ID and a source ID |



## Memory

Documentation on which memory is used for which information. Mandatory elements are **bold**.



### Room Memory

| Memory                | Type          | Description  |
| --------------------- | ------------- | ------------ |
| base                  | `object`    | used to configure the base that started in this room |
| ..name                | `string`    | display name |
| ..outsourceSpawn      | `boolean`   | if `true`, another base will spawn creeps if this base has no free spawns |
| ..roleConfig          | `object`    | used to configure the creeps in this base |
| ....&lt;role&gt;            | `object`    | used to configure a specific role in this base |
| ......requiredNumber  | `number`    | the required number of creeps for this role |
| console               | `object`    | used to collect config of the console |
| ..height              | `number`    | height of the console in lines |
| ..x                   | `number`    | x coordinate to show the console at |
| ..y                   | `number`    | y coordinate to show the console at |
| roleInfo              | `object`    | used to collect information about creeps on this room |
| ..&lt;role&gt;              | `object`    | used to collect information about the role with the name &lt;role&gt; |
| ....currentNumber     | `number`    | the current number of the role |
| ....requiredNumber    | `number`    | the required number of the role |
| ....symbol            | `number`    | the symbol of the role |
| ..x                   | `number`    | x coordinate to show the role info at |
| ..y                   | `number`    | y coordinate to show the role info at |



### Creep Memory

| Memory                | Role          | Type          | Description  |
| --------------------- | ------------- | ------------- | ------------ |
| debug                 |               | `boolean`   | if `true`, the creep will print each tick what it is doing |
| **role**              |               | `string`    | the role this creep fulfills (if it is necessary) |
| **home**              |               | `string`    | the base this creep belongs too |
| selfdestruct          |               | `boolean`   | if `true`, the creep will go to the next spawn and recycle itself |
| target                | Handyman      | `string`    | the ID of the target for the repair |



#### Miner Memory   

| Memory                | Type          | Description  |
| --------------------- | ------------- | ------------ |
| **homeSource**        | `string`    | the source this miner is claiming |
| **homeSpawn**         | `string`     | the spawn that created this miner |
| initialTicksToLive    | `number`    | the `ticksToLive` this creep had initially |
| ticksToSource         | `number`    | the `ticksToLive` when this creep first reached the source|
| trainedReplacement    | `number`    | if the creep has already trained its replacement |



## Dev Notes

- Tests run against a mock of the original game: [mock folder](./test/mock)



## Open Tasks

- make watchtower useful
- road builders?
- test if we can skip phase 1 with the use of containers
- make links useful
- don't switch to roles where you missing parts
- remove console entries after a while
- 🛑 refactor init() system as to not run into NPE as much
- creeps are displayed even if they are not on map
- finish explorer
-  🛑 role info is not correct "x/y" not working
-  🛑 role info x/y is overriden
- if there is no spawn in base, use different base