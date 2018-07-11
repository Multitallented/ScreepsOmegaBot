let Util = require('./util');
let roleScout = require('./role.scout');
let creepUtil = require('./creep.util');

module.exports = {
    getRandomAdjacentRoom: function(creep) {
        let randDirection = {
            0: FIND_EXIT_TOP, 1: FIND_EXIT_LEFT, 2: FIND_EXIT_RIGHT, 3: FIND_EXIT_BOTTOM
        };
        let direction = randDirection[Math.floor(Math.random() * 4)];
        creep.say(direction);
        return this.getRoomName(creep.room.name, direction);
    },

    run: function(creep) {
        if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            creep.say("Don't shoot", true);
        }

        if (creep.memory.currentOrder && creep.memory.currentOrder.split(":")[0] === Util.RESERVE && creep.room.controller.my) {
            creep.memory.currentOrder = undefined;
        }

        let claimedRoom = creep.room.controller && creep.room.controller.my;
        let claimUnnecessary = creep.room && creep.room.controller && creep.room.controller.reservation &&
            creep.room.controller.reservation.ticksToEnd > 3000;
        let claimConsistent = creep.room && creep.room.controller && creep.room.controller.reservation &&
            creep.memory.currentOrder && creep.memory.currentOrder.split(":")[0] === Util.RESERVE;
        if ((claimedRoom || (claimUnnecessary && !claimConsistent)) && (!creep.memory.currentOrder || creep.memory.currentOrder.split(":")[1] === creep.room.name)) {
            let targetRoomName = this.getRandomAdjacentRoom(creep);
            if (creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoomName)), {visualizePathStyle: {stroke: '#ffffff'}}) === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            }
        }
        else if ((claimedRoom || (claimUnnecessary && !claimConsistent) || (!claimedRoom && !creep.room.controller)) && creep.memory.currentOrder) {
            let targetRoomName = creep.memory.currentOrder.split(":")[1];
            let direction = creep.room.findExitTo(targetRoomName);
            let move = creep.moveTo(creep.pos.findClosestByRange(direction), {visualizePathStyle: {stroke: '#ffffff'}});
            if (move === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            } else if (move === ERR_NO_PATH) {
                creep.memory.currentOrder = undefined;
                creep.moveTo(25,25, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if (move !== -11) {
                roleScout.moveCreepIntoRoom(creep);
                return;
            }
        } else if (creep.room.controller && !creep.room.controller.my) {
            roleScout.moveCreepIntoRoom(creep);
            let reserve = creep.reserveController(creep.room.controller);
            if (reserve !== OK) {
                let move = creep.moveTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + creep.room.name;
            } else {
                creep.memory.currentOrder = Util.RESERVE + ":" + creep.room.name;
            }
        }
    },

    getRoomName: function(roomName, direction) {
        if (direction === FIND_EXIT_TOP) {
            return roomName.slice(0,1) + (Number(roomName.charAt(1)) - 1) + roomName.slice(2, 4);
        } else if (direction === FIND_EXIT_LEFT) {
            return roomName.slice(0,3) + (Number(roomName.charAt(3)) - 1);
        } else if (direction === FIND_EXIT_RIGHT) {
            return roomName.slice(0,3) + (Number(roomName.charAt(3)) + 1);
        } else if (direction === FIND_EXIT_BOTTOM) {
            return roomName.slice(0,1) + (Number(roomName.charAt(1)) + 1) + roomName.slice(2, 4);
        }
    }
};