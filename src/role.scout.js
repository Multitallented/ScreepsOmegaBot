let Util = require('./util');

module.exports = {
    run: function(creep) {

        if (creep.room.controller.my) {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(roomName)));
        }
    },

    getRoomName: function(roomName
                          , direction) {
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