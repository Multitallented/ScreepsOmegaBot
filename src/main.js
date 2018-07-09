let roleHarvester = require('./role.harvester');
let roleUpgrader = require('./role.upgrader');
let roleBuilder = require('./role.builder');
let roleMiner = require('./role.miner');
let roleCourier = require('./role.courier');
let respawn = require('./respawn');
let creepUtil = require('./creep.util');

module.exports = {
    loop: function () {

        let damagedCreeps = _.filter(Game.creeps, (creep) => creep.hits < creep.hitsMax);
        for (let i=0; i< damagedCreeps.length; i++) {
            let creep = damagedCreeps[i];
            if (creep.room.controller.safeMode === undefined &&
                creep.room.controller.safeModeAvailable > 0) {
                creep.room.controller.activateSafeMode();
            }
        }

        var tower = Game.getObjectById('TOWER_ID');
        if (tower) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }

            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        let builderMax = 1;
        let constructionArray = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
        let damagedBuildings = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES,
            {filter: (structure) => {return structure.hits < structure.hitsMax}});
        if (constructionArray.length === 0 && damagedBuildings.length === 0) {
            builderMax = 0;
        }
        respawn.run({"miner": 4, "harvester": 1, "courier": 2, "upgrader": 3 + 1 - builderMax, "builder": builderMax});

        if(Game.spawns['Spawn1'].spawning) {
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1,
                Game.spawns['Spawn1'].pos.y,
                {align: 'left', opacity: 0.8});
        }

        _.forEach(Game.creeps, (creep) => {
            if(creep.memory.role === 'harvester') {
                roleHarvester.run(creep);
            } else if(creep.memory.role === 'upgrader') {
                roleUpgrader.run(creep);
            } else if(creep.memory.role === 'builder') {
                roleBuilder.run(creep);
            } else if (creep.memory.role === 'miner') {
                roleMiner.run(creep);
            } else if (creep.memory.role === 'courier') {
                roleCourier.run(creep);
            }
        });
    }
};