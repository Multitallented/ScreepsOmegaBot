var roleHarvester = require('./role.harvester');
var roleUpgrader = require('./role.upgrader');
var roleBuilder = require('./role.builder');
var respawn = require('./respawn');

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

        respawn.run({"harvester": 1, "upgrader": 1, "builder": 3});

        if(Game.spawns['Spawn1'].spawning) {
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1,
                Game.spawns['Spawn1'].pos.y,
                {align: 'left', opacity: 0.8});
        }

        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
        }
    }
};