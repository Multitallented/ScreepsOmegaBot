module.exports = {
    run: function(roleArray) {
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        if(harvesters.length < roleArray.harvester) {
            let newName = 'Harvester' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
                {memory: {role: 'harvester'}});
        }


        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if(upgraders.length < roleArray.upgrader) {
            let newName = 'Upgrader' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
                {memory: {role: 'upgrader'}});
        }

        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if(builders.length < roleArray.builder) {
            let newName = 'Builder' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
                {memory: {role: 'builder'}});
        }
    }
};