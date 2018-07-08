module.exports = {
    spawnCreep: function(partArray, name, memory) {
        var newCreep = require('creep')(partArray, memory);
        Game.creeps[name] = newCreep;
        Memory.creeps[name] = newCreep;
    }
};