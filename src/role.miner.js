let Util = require('./util');
let creepUtil = require('./creep.util');
let builderScript = require('./role.builder');

module.exports = {

    run: function(creep) {
        if (builderScript.originRoom(creep)) {
            return;
        }
        let reservedController = creep.room.controller && creep.room.controller.reservation &&
            creep.room.controller.reservation.username === 'Multitallented';

        if (!creep.memory.inPosition) {
            if (creep.memory.currentOrder === undefined) {
                creep.say('🔄 harvest');
            }

            let source = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, Util.HARVEST, (resource) => {
                return creep.room.find(FIND_CREEPS, {filter: (c) => {
                        return c.memory && c.memory.role && c.memory.role === creepUtil.roles.MINER &&
                            c.memory.inPosition === resource.id;
                    }
            })});
            if (source !== undefined) {
                let canHarvest = creep.harvest(source);
                if (canHarvest === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + source.id;
                } else {
                    creep.memory.inPosition = source.id;
                    creep.memory.currentOrder = Util.HARVEST + ":" + source.id;
                }
            }
        } else {
            if (_.filter(Game.creeps, (c) => {
                    return c.id !== creep.id && c.memory && c.memory.role === creepUtil.roles.MINER &&
                        c.memory.inPosition === creep.memory.inPosition;
                    }).length) {
                creep.memory.inPosition = undefined;
                return;
            }
            // if (_.filter(Game.creeps, (c) => {
            //         return c.id !== creep.id && c.memory && c.memory.role === creepUtil.roles.MINER &&
            //             c.memory.adjacentContainer === creep.memory.adjacentContainer;
            //         }).length) {
            //     creep.memory.adjacentContainer = undefined;
            //     return;
            // }

            if (creep.carry.energy < creep.carryCapacity) {
                if (creep.harvest(Game.getObjectById(creep.memory.inPosition)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.inPosition), {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE +":" + creep.memory.inPosition;
                }
                creep.memory.currentOrder = Util.HARVEST + ":" + creep.memory.inPosition;
            } else {
                if (creep.memory.adjacentContainer === undefined) {
                    let targetSources = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (c) => {
                        return c.type === 'structure' && c.structure.structureType === STRUCTURE_CONTAINER;
                    });

                    if (targetSources.length) {
                        creep.memory.adjacentContainer = targetSources[0].structure.id;
                    } else {
                        let targetSource = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => {
                                return s.structureType === STRUCTURE_CONTAINER;
                            }});
                        if (targetSource) {
                            creep.memory.adjacentContainer = targetSource.id;
                        }
                    }
                }
                let transfer = creep.transfer(Game.getObjectById(creep.memory.adjacentContainer), RESOURCE_ENERGY);
                creep.memory.currentOrder = Util.TRANSFER + ":" + creep.memory.adjacentContainer;
                if (transfer !== OK) {
                    creep.moveTo(Game.getObjectById(creep.memory.adjacentContainer));
                }
                if (creep.carry.energy === creep.carryCapacity && creep.memory.wasScout) {
                    let container = Game.getObjectById(creep.memory.adjacentContainer);
                    if (container && container.store.energy === container.storeCapacity) {
                        creep.memory.role = creepUtil.roles.HOMING;
                        creep.memory.currentOrder = undefined;
                        return;
                    }
                }
            }
        }
    },
};