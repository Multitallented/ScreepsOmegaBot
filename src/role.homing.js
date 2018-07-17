let Util = require('./util');
let creepUtil = require('./creep.util');
let scoutScript = require('./role.scout');

module.exports = {
    moveCreepToNearestSpawn: function(creep) {
        let move = creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffffff'}});
    },

    run: function(creep) {
        if (creep.memory.wasBuilder) {
            creep.memory.wasBuilder = undefined;
        }


        if (creep.room.controller && creep.room.controller.my) {
            scoutScript.moveCreepIntoRoom(creep);
            if (creep.carry.energy > 0) {
                if (creep.memory.wasXCourier) {
                    creep.memory.role = creepUtil.roles.XCOURIER;
                } else {
                    creep.memory.role = creepUtil.roles.COURIER;
                }
            } else if (creep.memory.wasScout) {
                creep.memory.role = creepUtil.roles.SCOUT;
            } else if (creep.memory.wasXCourier) {
                creep.memory.role = creepUtil.roles.XCOURIER;
            }
            return;
        }

        if(creep.carry.energy < 1 || (creep.memory.currentOrder !== undefined &&
            creep.memory.currentOrder.split(":")[0] === Util.HARVEST && creep.carry.energy < creep.carryCapacity)) {
            let container = creep.pos.findClosestByPath(creep.room.find(FIND_STRUCTURES, {filter:
                    (structure) => { return (structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE) &&
                        structure.store.energy > 0; }}));
            if (container !== undefined && container !== null) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + container.id;
                } else {
                    creep.memory.currentOrder = Util.WITHDRAW + ":" + container.id;
                }
            } else {
                this.moveCreepToNearestSpawn(creep);
                return;
            }
        } else {
            this.moveCreepToNearestSpawn(creep);
            return;
        }
    }
};