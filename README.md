# Screeps Script

[![Build Status](https://www.travis-ci.com/slothsoft/screeps-script.svg?branch=main)](https://www.travis-ci.com/slothsoft/screeps-script)

My scripts for the game [Screeps](https://screeps.com/). The official API is located [here](https://docs.screeps.com/api).

- [Features](#features)
    - [Creeps](#creeps)
- [Console Commands](#console-commands)
- [Memory](#memory)
    - [Room Memory](#room-memory)
    - [Link Memory](#link-memory)
    - [Creep Memory](#creep-memory)
- [Dev Notes](#dev-notes)
- [Open Tasks](#open-tasks)


## Features

<img align="right" width="202" height="236" src="readme/fancy-gui.png">

- each room has a fancy overview GUI
- each room has a console which prints most info


### Creeps

- will follow their role until there is nothing else to do
- if they don't find work in their role, they'll take on an arbitrary other role
- display their role next to their circle (→ `DEBUG_ROLES`)
- will be respawned with as many parts as possible after their death
- can self-destruct (console command `selfdestruct(<creepName>)`)



## Console Commands

| Memory                                              | Description  |
| --------------------------------------------------- | ------------ |
| `fetchOldestCreep(<baseName>)`             | fetches the oldest creep in the world (the one with the lowest `ticksToLive`); fetches the oldest creep in the base if &lt;baseName&gt; was set |
| `makeLinkSource(<id>)`                       | makes a link with a specific ID an source |
| `makeLinkTarget(<id>)`                       | makes a link with a specific ID an target |
| `selfdestruct(<creepName>)`                 | the creep will go to the next spawn and recycle itself |
| `spawnCreepForRoom(<roomName>, <roleName>)` | spawns a new creep in a room with a specific role |
| `spawnExplorer(<spawnId>, <flagName>)`   | spawns a new explorer for a spawn ID and a flag name|
| `spawnMiner(<spawnId>, <sourceId>)`       | spawns a new miner for a spawn ID and a source ID |



## Memory

Documentation on which memory is used for which information. Mandatory elements are **bold**.



### Room Memory

| Memory                | Type          | Description  |
| --------------------- | ------------- | ------------ |
| base                  | `object`    | used to configure the base that started in this room |
| ..name                | `string`    | display name |
| ..outsourceSpawn      | `boolean`   | if `true`, another base will spawn creeps if this base has no free spawns |
| ..roleConfig          | `object`    | used to configure the creeps in this base |
| ....partsMinMultiplier| `number`    | used to configure how many parts new creeps have at least |
| ....partsMaxMultiplier| `number`    | used to configure how many parts new creeps have at most |
| ....&lt;role&gt;            | `object`    | used to configure a specific role in this base |
| ......requiredNumber  | `number`    | the required number of creeps for this role |
| console               | `object`    | used to collect config of the console & other GUI elements |
| ..height              | `number`    | height of the console in lines |
| ..x                   | `number`    | x coordinate to show the console at |
| ..y                   | `number`    | y coordinate to show the console at |
| ..roleInfoX           | `number`    | x coordinate to show the role info at |
| ..roleInfoY           | `number`    | y coordinate to show the role info at |
| roleInfo              | `object`    | used to collect information about creeps on this room; _overwritten each round_ |
| ..&lt;role&gt;              | `object`    | used to collect information about the role with the name &lt;role&gt; |
| ....currentNumber     | `number`    | the current number of the role |
| ....requiredNumber    | `number`    | the required number of the role |
| ....symbol            | `number`    | the symbol of the role |


### Link Memory

| Memory                | Type          | Description  |
| --------------------- | ------------- | ------------ |
| type                  | `string`    | `source` if link is a source, `target` if it is a target |
| transferId            | `string`    | sources and targets of a specific `transferId` are matched, so you can have multiple source→target pairs per room  |


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


## Courier Implementation

For the question how to implement couriers, two option present itself: routes stored for each room / base, or for each creep.

| Room                  | Creep Based           |
| --------------------- | --------------------- |
| ➕ the number of routes and couriers must not be identical | ➖ the number of couriers and routes should be identical |
| ➕ better option for respawning - especially if creeps get killed before spawning their replacement | ➖ creeps need to spawn their replacement before dying |
| ➕ information stays even if all creepy die  | ➖ information gets lost if creeps die unexpectedly |



## Open Tasks

- road builders
- don't switch to roles where you missing parts
- remove console entries after a while
- creeps are displayed even if they are not on map
- finish Explorer
- findTargets() sometimes depends on the creep, not the room (then probably findSources() too)
- TODOs in code
- creeps cannot work on other maps than the base's
- constants might be better of being base memory variables
- creeps should pickup close resources
- make Courier more universal
- Creep#dismantle !!!
