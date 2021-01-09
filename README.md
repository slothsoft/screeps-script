# Screeps Script

My scripts for the game [Screeps](https://screeps.com/).

- [Features](#features)
     - [Creeps](#creeps)
- [Open Tasks](#open-tasks)


## Features

- each room has a fancy overview GUI:

![fancy GUI](readme/fancy-gui.png)



### Creeps

- will follow their role until there is nothing else to do
- if they don't find work in their role, they'll take on an arbitrary other role
- display their role next to their circle (-> `DEBUG_ROLES`)
- will be respawned with as many parts as possible after their death
- can self-destruct (console command `selfdestruct(<creepName>)`)


## Game Phases

### Phase 1 - Harvesters

- game starts in this phase
- all config for base is in memory under `rooms.<A12B3>.base`
- role infos configure which roles are present in which quantity
- the initial setup is based on Harvesters


### Phase 2 - Miner & Storekeeper

- after the storage is available the setup should be 
	1. Miner puts stuff into storage
	2. Storekeeper takes it out and distributes it
- since Miner need only work parts and storekeeper mostly move parts this setup seems to be cheaper
- spawn miners for each source with console command`spawnMiner(<spawnName>, <sourceName>)`
- phase Harvesters out
- replace Handymen with Towers
- use Link for Room Controller





## Open Tasks

- make watchtower useful
- road builders?
- test if we can skip phase 1 with the use of containers
- make links useful
- don't switch to roles where you missing parts
- remove console entries after a while
- try to refactor to have common methods at central place
- document what is undocumented
- test is now necessary
- the role info is for the room, not the base?