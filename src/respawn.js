let creepUtil = require('./creep.util');

module.exports = {
    run: function(roleArray) {
        let energyByRoom = {};
        _.forEach(Game.rooms, (room) => {
            if (room.controller.my) {
                energyByRoom[room.name] = {};
                energyByRoom[room.name].energy = room.energyAvailable;
                energyByRoom[room.name].energyMax = room.energyCapacityAvailable;
            }
        });
        let energy = energyByRoom[Game.spawns['Spawn1'].room.name].energy;
        let energyMax = energyByRoom[Game.spawns['Spawn1'].room.name].energyMax;
        let isMaxEnergy = energy === energyMax;

        _.forEach(roleArray, (value, key) => {
            let creeps = _.filter(Game.creeps, (creep) => creep.memory.role === key);
            if((creeps.length < value && isMaxEnergy) ||
                (key === creepUtil.roles.HARVESTER && creeps.length === 0 && energy > 199)) {
                let newName = key.charAt(0).toUpperCase() + Game.time;
                let creepData = creepUtil.buildBestCreep(key, energy);
                Game.spawns['Spawn1'].spawnCreep(creepData.bodyArray, newName,
                    creepData.memory);
            }
        });
    }
};