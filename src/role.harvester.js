let Util = require('./util');

let roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.currentOrder === Util.HARVEST && creep.carry.energy >= creep.carryCapacity) {
            creep.memory.currentOrder = undefined;
        }

        if(creep.carry.energy < 1 || (creep.memory.currentOrder !== undefined &&
            creep.memory.currentOrder.split(":")[0] === Util.HARVEST && creep.carry.energy < creep.carryCapacity)) {
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
        } else {
            let targets = creep.room.find(FIND_STRUCTURES);
            targets = _.filter(targets, (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity));
            });
            if(targets.length > 0) {
                let bestTarget = creep.pos.findClosestByPath(targets);
                if (targets.length > 1 && bestTarget && bestTarget.structureType === STRUCTURE_SPAWN) {
                    bestTarget = targets[1];
                }
                let canTransfer = creep.transfer(bestTarget, RESOURCE_ENERGY);
                if (canTransfer === ERR_NOT_IN_RANGE) {
                    creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                } else if (canTransfer === OK) {
                    creep.memory.currentOrder = Util.TRANSFER + ":" + bestTarget.id;
                } else if (canTransfer === ERR_FULL) {
                    let spawn = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return structure.structureType === STRUCTURE_SPAWN}});
                    if (spawn.length > 0 && spawn[0].my && spawn[0].renewCreep(creep) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                    }
                } else if (bestTarget !== undefined && bestTarget !== null) {
                    creep.moveTo(bestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + bestTarget.id;
                }
            }
        }
    }
};

module.exports = roleHarvester;