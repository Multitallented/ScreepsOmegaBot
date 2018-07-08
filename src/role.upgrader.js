let Util = require('./util');
let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let actionArray = {};
        actionArray[Util.MOVE] = 1;
        actionArray[Util.HARVEST] = 0;
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
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + creep.room.controller.id;
            } else {
                creep.memory.currentOrder = Util.UPGRADE_CONTROLLER + ":" + creep.room.controller.id;
            }
        }
        else {
            let targetSource = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, actionArray);
            if(creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                creep.memory.currentOrder = Util.MOVE + ":" + targetSource.id;
            } else {
                creep.memory.currentOrder = Util.HARVEST + ":" + targetSource.id;
            }
        }
    }
};

module.exports = roleUpgrader;