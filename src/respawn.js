let creepUtil = require('./creep.util');

module.exports = {
    run: function() {
        let builderMax = 1;
        let constructionArray = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
        let damagedBuildings = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES,
            {filter: (structure) => {return structure.hits < structure.hitsMax}});
        if (constructionArray.length === 0 && damagedBuildings.length === 0) {
            builderMax = 0;
        }
        let roleArray = {"miner": 4, "harvester": 1, "courier": 2, "upgrader": 3 + 1 - builderMax, "builder": builderMax};

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
                let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
                let creepData = creepUtil.buildBestCreep(key, energy);
                Game.spawns['Spawn1'].spawnCreep(creepData.bodyArray, newName,
                    creepData.memory);
            }
        });
    }
};