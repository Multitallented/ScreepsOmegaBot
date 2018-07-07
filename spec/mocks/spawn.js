module.exports = function(room) {
    return {
        spawnCreep: function(partArray, name, memory) {
            if (this.spawning != null) {
                return;
            }
            let newCreep = require('./creep')(partArray, name, memory, this.room);
            this.spawning = newCreep;
            Game.creeps[name] = newCreep;
            Memory.creeps[name] = newCreep;
        },
        room: room,
        spawning : null,
        pos: {
            x: 12,
            y: 25
        }
    };
};