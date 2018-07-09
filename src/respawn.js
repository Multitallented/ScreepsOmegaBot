let creepUtil = require('./creep.util');

module.exports = {
    spawnCreep: function(spawn, key, energy) {
        let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
        let creepData = creepUtil.buildBestCreep(key, energy);
        spawn.spawnCreep(creepData.bodyArray, newName,
            creepData.memory);
    },

    run: function() {
        let creepCount = {};
        _.forEach(Game.spawns, (spawn) => {
            creepCount[spawn.id] = {};
            creepCount[spawn.id]['energyAvailable'] = spawn.room.energyAvailable;
            creepCount[spawn.id]['energyCapacity'] = spawn.room.energyCapacityAvailable;
            creepCount[spawn.id]['numSources'] = spawn.room.find(FIND_SOURCES).length;
            creepCount[spawn.id]['numContainers'] = spawn.room.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType === STRUCTURE_CONTAINER}});
            _.forEach(creepUtil.roles, (role) => {
                creepCount[spawn.id][role] =
                    spawn.room.find(FIND_CREEPS, {filter: (creep) => {return creep.memory.role === role;}}).length;
            });
        });

        _.forEach(creepCount, (count, spawnId) => {
            if (count[creepUtil.roles.HARVESTER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.HARVESTER, 200);
            } else if (count[creepUtil.roles.UPGRADER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.UPGRADER, count['energyAvailable']);
            } else if (count[creepUtil.roles.BUILDER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.BUILDER, count['energyAvailable']);
            } else if (count[creepUtil.roles.MINER] < 1 && count[creepUtil.roles.HARVESTER] < 2) {
                if (count['energyAvailable'] < count['energyCapacity']) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.HARVESTER, count['energyAvailable']);
            } else if (count['numContainers'] > 0 && count['numSources'] * 2 > count[creepUtil.roles.MINER]) {
                if (count[creepUtil.roles.MINER] < 1 && count['energyAvailable'] < 499) {
                    return;
                } else if (count['energyAvailable'] < 1000) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.MINER, count['energyAvailable']);
            } else if (count['numContainers'] > 0 && count[creepUtil.roles.COURIER] < 2) {
                if (count['energyAvailable'] < 300) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.COURIER, count['energyAvailable']);
            } else if (count[creepUtil.roles.UPGRADER] < 2) {
                if (count['energyAvailable'] < count['energyCapacity']) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.UPGRADER, count['energyAvailable']);
            } else if (count[creepUtil.roles.BUILDER] < 2) {
                if (count['energyAvailable'] < count['energyCapacity']) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.BUILDER, count['energyAvailable']);
            } else if (count[creepUtil.roles.UPGRADER] < 3) {
                if (count['energyAvailable'] < count['energyCapacity']) {
                    return;
                }
                this.spawnCreep(Game.spawns[spawnId], creepUtil.roles.UPGRADER, count['energyAvailable']);
            }
        });

        _.forEach(Game.spawns, (spawn) => {
            if(spawn.spawning) {
                var spawningCreep = Game.creeps[spawn.spawning.name];
                spawn.room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        });
        //
        // let builderMax = 1;
        // let constructionArray = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
        // let damagedBuildings = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES,
        //     {filter: (structure) => {return structure.hits < structure.hitsMax}});
        // if (constructionArray.length === 0 && damagedBuildings.length === 0) {
        //     builderMax = 0;
        // }
        // let roleArray = {"miner": 4, "harvester": 1, "courier": 2, "upgrader": 3 + 1 - builderMax, "builder": builderMax};
        //
        // let energyByRoom = {};
        // _.forEach(Game.rooms, (room) => {
        //     if (room.controller.my) {
        //         energyByRoom[room.name] = {};
        //         energyByRoom[room.name].energy = room.energyAvailable;
        //         energyByRoom[room.name].energyMax = room.energyCapacityAvailable;
        //     }
        // });
        // let energy = energyByRoom[Game.spawns['Spawn1'].room.name].energy;
        // let energyMax = energyByRoom[Game.spawns['Spawn1'].room.name].energyMax;
        // let isMaxEnergy = energy === energyMax;
        //
        // _.forEach(roleArray, (value, key) => {
        //     let creeps = _.filter(Game.creeps, (creep) => creep.memory.role === key);
        //     if((creeps.length < value && isMaxEnergy) ||
        //         (key === creepUtil.roles.HARVESTER && creeps.length === 0 && energy > 199)) {
        //         let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
        //         let creepData = creepUtil.buildBestCreep(key, energy);
        //         Game.spawns['Spawn1'].spawnCreep(creepData.bodyArray, newName,
        //             creepData.memory);
        //     }
        // });
    }
};