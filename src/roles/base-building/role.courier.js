let Util = require('../../util/util');
let creepUtil = require('../../util/creep.util');
let builderScript = require('./role.builder');

//TODO have courier equalize all containers
let roleCourier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.currentOrder === Util.HARVEST && creep.carry.energy >= creep.carryCapacity) {
            creep.memory.currentOrder = undefined;
        }

        if (builderScript.originRoom(creep)) {
            return;
        }

        if (creep.memory.wasXCourier && creep.carry.energy < 1) {
            creep.memory.role = creepUtil.roles.XCOURIER;
            creep.memory.currentOrder = undefined;
            return;
        }

        if (creep.memory.wasScout) {
            if (creep.carry.energy < 1) {
                creep.memory.role = creepUtil.roles.SCOUT;
                creep.memory.currentOrder = undefined;
                return;
            } else {
                let targets = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return s.structureType && s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity;
                    }});
                if (!targets.length) {
                    targets = _.filter(creep.room.find(FIND_STRUCTURES), (structure) => {
                        return ((structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                            (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity) ||
                            (structure.structureType === STRUCTURE_STORAGE && structure.store.energy < structure.storeCapacity) ||
                            (structure.structureType === STRUCTURE_CONTAINER && structure.store.energy < structure.storeCapacity));
                    });
                }
                if (targets.length) {
                    let bestTarget = creep.pos.findClosestByPath(targets);
                    let canTransfer = creep.transfer(bestTarget, RESOURCE_ENERGY);
                    if (canTransfer === ERR_NOT_IN_RANGE) {
                        creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                    } else if (canTransfer === OK) {
                        creep.memory.currentOrder = Util.TRANSFER + ":" + bestTarget.id;
                    }
                    return;
                }

            }
        }

        if(creep.carry.energy < 1 || (creep.memory.currentOrder !== undefined &&
            creep.memory.currentOrder.split(":")[0] === Util.HARVEST && creep.carry.energy < creep.carryCapacity)) {
            let energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (r) => {
                    return r.resourceType && r.resourceType === RESOURCE_ENERGY;
                }});
            if (energy !== undefined && energy !== null && energy.energy > 20) {
                let pickup = creep.pickup(energy);
                if (pickup === OK) {
                    creep.memory.currentOrder = Util.PICKUP + ":" + "energy";
                    return;
                } else {
                    let move = creep.moveTo(energy, {visualizePathStyle: {stroke: '#ffffff'}});
                    if (move === OK) {
                        return;
                    }
                }
            }
            let containers = creep.room.find(FIND_STRUCTURES, {filter:
                    (structure) => { return (structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE) && structure.store.energy > creep.carryCapacity; }});
            if (!containers.length) {
                containers = creep.room.find(FIND_STRUCTURES, {filter:
                        (structure) => { return (structure.structureType === STRUCTURE_CONTAINER ||
                            structure.structureType === STRUCTURE_STORAGE) && structure.store.energy > 0; }});
            }

            if (!containers.length) {
                let spawns = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType && s.structureType === STRUCTURE_SPAWN;
                    }});
                if (spawns.length) {
                    creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + spawns[0].id;
                }
                return;
            }
            let container = creep.pos.findClosestByPath(containers);
            if (container !== undefined && container !== null) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + container.id;
                } else {
                    creep.memory.currentOrder = Util.WITHDRAW + ":" + container.id;
                }
            } else {
                let spawns = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType && s.structureType === STRUCTURE_SPAWN;
                    }});
                if (spawns.length) {
                    creep.moveTo(spawns[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + spawns[0].id;
                }
            }
        } else {
            let targets = creep.room.find(FIND_STRUCTURES);
            targets = _.filter(targets, (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity));
            });
            if(targets.length > 0) {
                let bestTarget = creep.pos.findClosestByPath(targets);
                if (targets.length > 1 && (!bestTarget || bestTarget.structureType === STRUCTURE_SPAWN)) {
                    bestTarget = targets[1];
                }
                let canTransfer = creep.transfer(bestTarget, RESOURCE_ENERGY);
                if (canTransfer === ERR_NOT_IN_RANGE) {
                    creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                } else if (canTransfer === OK) {
                    creep.memory.currentOrder = Util.TRANSFER + ":" + bestTarget.id;
                } else if (canTransfer === ERR_FULL) {
                    let spawn = creep.room.find(FIND_STRUCTURES, {filter: (structure) =>
                        {return structure.structureType === STRUCTURE_SPAWN}});
                    if (spawn.length > 0 && spawn[0].my && spawn[0].renewCreep(creep) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                    }
                } else if (bestTarget !== undefined && bestTarget !== null) {
                    creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                }
            } else {
                targets = _.sortBy(creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType && (s.structureType === STRUCTURE_CONTAINER ||
                            s.structureType === STRUCTURE_STORAGE) && s.store.energy < s.storeCapacity;
                    }}), (s) => {
                    return s.store.energy;
                });
                if (targets.length) {
                    let canTransfer = creep.transfer(targets[0], RESOURCE_ENERGY);
                    if (canTransfer === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                    } else if (canTransfer === OK) {
                        creep.memory.currentOrder = Util.TRANSFER + ":" + targets[0].id;
                    }
                }
            }
        }
    }
};

module.exports = roleCourier;