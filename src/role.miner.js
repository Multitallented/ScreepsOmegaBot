let Util = require('./util');

module.exports = {

    run: function(creep) {
        if (!creep.memory.inPosition) {
            if (creep.memory.currentOrder === undefined ||
                creep.memory.currentOrder.split(":")[0] !== Util.MOVE) {
                creep.say('🔄 harvest');
            }

            let source = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, Util.HARVEST);
            let canHarvest = creep.harvest(source);
            if (canHarvest === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + source.id;
            } else {
                creep.memory.inPosition = source.id;
                creep.memory.currentOrder = Util.HARVEST + ":" + source.id;
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
                    creep.memory.adjacentContainer = this.findAdjacentContainer(creep).id;
                }
                creep.transfer(Game.getObjectById(creep.memory.adjacentContainer), RESOURCE_ENERGY);
                creep.memory.currentOrder = Util.TRANSFER + ":" + creep.memory.adjacentContainer;
            }
        }
    },

    findAdjacentContainer: function(creep) {
        let containers = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
            }});
        let returnContainer = undefined;
        _.forEach(containers, (container) => {
            if (returnContainer !== undefined) {
                return;
            }
            let distance = Util.distance(creep, container);
            if (distance < 2 && distance !== -1) {
                returnContainer = container;
            }
        });
        return returnContainer;
    },
};