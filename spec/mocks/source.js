module.exports = function(id, x, y, room) {
    return {
        pos: {
            x: x,
            y: y,
            findPathTo: function() {
                return [];
            }
        },
        room: room,
        energy: 3000,
        energyCapacity: 3000,
        id: id,
        ticksToRegeneration: 0
    }
};