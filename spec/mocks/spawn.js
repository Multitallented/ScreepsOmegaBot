module.exports = function() {
    return {
        spawnCreep: function(partArray, name, memory) {
            if (this.spawning != null) {
                return;
            }
            let newCreep = require('./creep')(partArray, name, memory);
            this.spawning = newCreep;
            Game.creeps[name] = newCreep;
            Memory.creeps[name] = newCreep;
        },
        room: {
            visual: {
                text: function(message, x, y, options) {}
            }
        },
        spawning : null,
        pos: {
            x: 12,
            y: 25
        }
    };
};