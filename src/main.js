let roleHarvester = require('./role.harvester');
let roleUpgrader = require('./role.upgrader');
let roleBuilder = require('./role.builder');
let roleMiner = require('./role.miner');
let roleCourier = require('./role.courier');
let roleTower = require('./role.tower');
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

        roleTower.run();

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        respawn.run();

        _.forEach(Game.spawns, (spawn) => {
            if(spawn.spawning) {
                var spawningCreep = Game.creeps[spawn.spawning.name];
                spawn.room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        });


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