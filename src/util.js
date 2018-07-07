module.exports = {
    findAvailableResource: function(room) {
        for (let resource in room.find(FIND_SOURCES)) {

        }
    },

    countCreeps: function() {
        let i = 0;
        let creepArray = {
            upgrader: 0,
            builder: 0,
            harvester: 0
        };
        for (let currentCreep in Game.creeps) {
            if (!currentCreep || !Game.creeps.hasOwnProperty(currentCreep)) {
                continue;
            }
            i++;
            let creep = Game.creeps[currentCreep];
            if (creep.memory.role === "builder") {
                creepArray.builder += 1;
            } else if (creep.memory.role === "harvester") {
                creepArray.harvester += 1;
            } else if (creep.memory.role === "upgrader") {
                creepArray.upgrader += 1;
            }
        }
        creepArray.total = i;
        return creepArray;
    }
};