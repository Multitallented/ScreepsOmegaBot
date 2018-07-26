let Util = require('../../util/util');
let builderScript = require('./role.builder');
let scoutScript = require('../exploration/role.scout');

let roleUpgrader = {
    moveByCache: function(creep, cachePath, target) {
        let x = creep.pos.x;
        let y = creep.pos.y;
        let movePath = creep.moveByPath(cachePath);
        if (movePath === ERR_NOT_FOUND) {
            creep.moveTo(cachePath[0].x, cachePath[0].y);
        }
        if (movePath !== ERR_TIRED && x === creep.pos.x && y === creep.pos.y) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.say(":(");
        }
    },

    storeInCache: function(creep, key, target, from) {
        let creepTypePath = creep.memory.role + "Path";
        if (!creep.room.memory[creepTypePath] || !creep.room.memory[creepTypePath][key]
                || !creep.room.memory[creepTypePath][key].from) {
            if (!creep.room.memory[creepTypePath]) {
                creep.room.memory[creepTypePath] = {};
            }
            if (!creep.room.memory[creepTypePath][key]) {
                creep.room.memory[creepTypePath][key] = {to: null, from: null};
            }
            if (from) {
                creep.room.memory[creepTypePath][key].from = creep.pos.findPathTo(target);
            } else {
                creep.room.memory[creepTypePath][key].to = creep.pos.findPathTo(target);
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if (builderScript.originRoom(creep)) {
            return;
        }
        scoutScript.moveCreepIntoRoom(creep);

        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                let previousHarvest = null;
                if (creep.memory.currentOrder) {
                    let splitOrder = creep.memory.currentOrder.split(":");
                    if (splitOrder[0] === Util.WITHDRAW || splitOrder[0] === Util.HARVEST) {
                        let obj = Game.getObjectById(splitOrder[1]);
                        if (obj) {
                            previousHarvest = obj.id;
                        }
                    }
                }
                if (previousHarvest == null) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + creep.room.controller.id;
                    return;
                }
                this.storeInCache(creep, previousHarvest, creep.room.controller, true);

                this.moveByCache(creep, creep.room.memory.upgraderPath[previousHarvest].from, creep.room.controller);
            } else {
                creep.memory.currentOrder = Util.UPGRADE_CONTROLLER + ":" + creep.room.controller.id;
            }
        }
        else {
            let container = Util.checkIfInUse(creep.room, FIND_STRUCTURES, creep, Util.WITHDRAW,
                (structure) => { return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store.energy > 0; });
            if (container !== undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + container.id;
                } else {
                    creep.memory.currentOrder = Util.WITHDRAW + ":" + container.id;
                }
            } else {
                let targetSource = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, Util.HARVEST);
                if (targetSource !== undefined) {
                    if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targetSource.id;
                    } else {
                        creep.memory.currentOrder = Util.HARVEST + ":" + targetSource.id;
                    }
                } else {
                    creep.memory.currentOrder = undefined;
                }
            }
        }
    }
};

module.exports = roleUpgrader;