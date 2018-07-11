let Util = require('./util');
let creepUtil = require('./creep.util');

module.exports = {

    run: function(creep) {
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
            if (creep.carry.energy < creep.carryCapacity) {
                if (creep.harvest(Game.getObjectById(creep.memory.inPosition)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.inPosition), {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE +":" + creep.memory.inPosition;
                }
                creep.memory.currentOrder = Util.HARVEST + ":" + creep.memory.inPosition;
            } else {
                if (creep.memory.adjacentContainer === undefined) {
                    creep.memory.adjacentContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => {
                            return s.structureType === STRUCTURE_CONTAINER;
                        }}).id;
                }
                let transfer = creep.transfer(Game.getObjectById(creep.memory.adjacentContainer), RESOURCE_ENERGY);
                creep.memory.currentOrder = Util.TRANSFER + ":" + creep.memory.adjacentContainer;
                if (transfer === ERR_FULL && reservedController) {
                    creep.memory.role = creepUtil.roles.HOMING;
                    creep.memory.currentOrder = undefined;
                    return;
                }
            }
        }
    },
    //
    // findAdjacentContainer: function(creep) {
    //     let containers = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {
    //             return structure.structureType === STRUCTURE_CONTAINER
    //         }});
    //     let returnContainer = undefined;
    //     _.forEach(containers, (container) => {
    //         if (returnContainer !== undefined) {
    //             return;
    //         }
    //         let distance = Util.distance(creep, container);
    //         if (distance < 2 && distance !== -1) {
    //             returnContainer = container;
    //         }
    //     });
    //     return returnContainer;
    // },
};