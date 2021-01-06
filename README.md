# Screeps Script

My scripts for the game [Screeps](https://screeps.com/).

- [Features](#features)
     - [Creeps](#creeps)
- [Open Tasks](#open-tasks)


## Features

There are the following roles:

- 🔨 - Builder
- 🔧 - Handyman
- 🧺 - Harvester
- ⚡ - Upgrader 


### Creeps

- will follow their role until there is nothing else to do
- if they don't find work in their role, they'll take on an arbitrary other role
- display their role next to their circle (-> `DEBUG_ROLES`)
- will be respawned with as many parts as possible after their death


## Open Tasks

- _manager.role.js_ - do not always use spawn1 
- _manager.role.js_ - not all on the same resource 
- _role.handyman_ - stay with one structure until inventory empty (or fully repaired)
