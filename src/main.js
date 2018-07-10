let roleHarvester = require('./role.harvester');
let roleUpgrader = require('./role.upgrader');
let roleBuilder = require('./role.builder');
let roleMiner = require('./role.miner');
let roleCourier = require('./role.courier');
let roleClaimer = require('./role.claimer');
let roleScout = require('./role.scout');
let roleTower = require('./role.tower');
let respawn = require('./respawn');
let creepUtil = require('./creep.util');

module.exports = {
    loop: function () {

        let damagedCreeps = _.filter(Game.creeps, (creep) => creep.hits < creep.hitsMax && creep.my);
        for (let i=0; i< damagedCreeps.length; i++) {
            let creep = damagedCreeps[i];
            if (creep.room.controller &&
                creep.room.controller.my &&
                creep.room.controller.safeMode === undefined &&
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
            } else if (creep.memory.role === 'scout') {
                roleScout.run(creep);
            } else if (creep.memory.role === 'claimer') {
                roleClaimer.run(creep);
            }
        });
    }
};