let roleHarvester = require('./role.harvester');
let roleUpgrader = require('./role.upgrader');
let roleBuilder = require('./role.builder');
let roleMiner = require('./role.miner');
let roleCourier = require('./role.courier');
let roleClaimer = require('./role.claimer');
let roleScout = require('./role.scout');
let roleTower = require('./role.tower');
let roleHoming = require('./role.homing');
let respawn = require('./respawn');
let roleMelee = require('./role.melee');
let roleXCourier = require('./role.xcourier');
let roomBuilder = require('./room.builder');
let creepUtil = require('./creep.util');

module.exports = {
    loop: function () {

        _.forEach(_.filter(Game.structures, (s) => {
            return s.structureType && s.my &&
                (s.structureType === STRUCTURE_TOWER ||
                s.structureType === STRUCTURE_SPAWN) &&
                s.hits < s.hitsMax / 2;
            }), (structure) => {
            if (structure.room.controller &&
                structure.room.controller.my &&
                structure.room.controller.safeMode === undefined &&
                structure.room.controller.safeModeAvailable > 0) {
                structure.room.controller.activateSafeMode();
            }
        });

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
            } else if (creep.memory.role === 'homing') {
                roleHoming.run(creep);
            } else if (creep.memory.role === 'tank') {
                roleMelee.run(creep);
            } else if (creep.memory.role === 'melee') {
                roleMelee.run(creep);
            } else if (creep.memory.role === 'xcourier') {
                roleXCourier.run(creep);
            }
        });

        _.forEach(Game.rooms, (room) => {
            if (room.controller && room.controller.my && room.controller.owner &&
                room.controller.owner.username === Util.USERNAME && room.memory.controllerLevel < room.controller.level) {
                roomBuilder.buildRoom(room);
            }
        });
    }
};