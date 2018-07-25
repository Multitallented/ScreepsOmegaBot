let roleHarvester = require('./roles/base-building/role.harvester');
let roleUpgrader = require('./roles/base-building/role.upgrader');
let roleBuilder = require('./roles/base-building/role.builder');
let roleMiner = require('./roles/base-building/role.miner');
let roleCourier = require('./roles/base-building/role.courier');
let roleClaimer = require('./roles/exploration/role.claimer');
let roleScout = require('./roles/exploration/role.scout');
let roleTower = require('./roles/war/role.tower');
let roleHoming = require('./roles/exploration/role.homing');
let respawn = require('./respawn');
let roleMelee = require('./roles/war/role.melee');
let roleXCourier = require('./roles/exploration/role.xcourier');
let roomBuilder = require('./room.builder');
let roleManual = require('./roles/exploration/role.manual');
let creepUtil = require('./util/creep.util');
let Util = require('./util/util');

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
            } else if (creep.memory.role === 'manual') {
                roleManual.run(creep);
            }
        });

        _.forEach(Game.rooms, (room) => {
            if (room.controller && ((room.controller.my && room.controller.owner &&
                    room.controller.owner.username === 'Multitallented') ||
                    (room.controller.reservation && room.controller.reservation.username === 'Multitallented')) &&
                    (!room.memory || !room.memory.controllerLevel ||
                    room.memory.controllerLevel < room.controller.level)) {
                roomBuilder.buildRoom(room);
            }
        });
    }
};