let Util = require('./util');

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

        let discoveredRoom = (creep.room.controller && creep.room.controller.my) ||
            _.filter(Game.flags, (f) => f.room === creep.room).length === 1;
        if (discoveredRoom && (!creep.memory.currentOrder || creep.memory.currentOrder.split(":")[1] === creep.room.name)) {
            let targetRoomName = this.getRandomAdjacentRoom(creep);
            if (creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoomName)), {visualizePathStyle: {stroke: '#ffffff'}}) === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            }
        } else if (discoveredRoom && creep.memory.currentOrder) {
            let targetRoomName = creep.memory.currentOrder.split(":")[1];
            let direction = creep.room.findExitTo(targetRoomName);
            let move = creep.moveTo(creep.pos.findClosestByRange(direction), {visualizePathStyle: {stroke: '#ffffff'}});
            if (move === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            } else if (move !== -11) {
                console.log("failed move: " + move);
            }
        } else if (!discoveredRoom) {
            if (creep.room.controller && creep.room.controller.owner === undefined) {
                creep.room.createFlag(25,25,'Unclaimed' + ":" + Game.time);
            } else if (creep.room.controller && creep.room.controller.owner) {
                creep.room.createFlag(25,25, 'Claimed' + ":" + creep.room.controller.owner.username + ":" + Game.time);
            } else {
                creep.room.createFlag(25,25, 'Unclaimable:' + Game.time);
            }
            creep.memory.currentOrder = undefined;
        }

        // _.forEach(_.filter(Game.flags, (flag) => {
        //     if (flag.room.controller && flag.room.controller.owner === undefined) {
        //         flag.name = 'Unclaimed' + ":" + flag.name.split(":")[1];
        //     } else if (flag.room.controller && flag.room.controller.owner) {
        //         flag.name = 'Claimed' + ":" + flag.name.split(":")[1] + ":" + flag.room.controller.owner.username;
        //     } else {
        //         flag.name = 'Unclaimable:' + flag.name.split(":")[1];
        //     }
        // });
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