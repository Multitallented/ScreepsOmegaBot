let Util = require('./util');

let roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
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
        } else {
            let targets = creep.room.find(FIND_STRUCTURES);
            targets = _.filter(targets, (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity) ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity);
            });
            if(targets.length > 0) {
                let canTransfer = creep.transfer(targets[0], RESOURCE_ENERGY);
                if(canTransfer === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                } else if (canTransfer === OK) {
                    creep.memory.currentOrder = Util.TRANSFER + ":" + targets[0].id;
                } else {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                }
            }
        }
    }
};

module.exports = roleHarvester;