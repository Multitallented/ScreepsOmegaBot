module.exports = {
    HARVEST: "HARVEST",
    MOVE: "MOVE",
    TRANSFER: "TRANSFER",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    BUILD: "BUILD",

    /** @param {Room} room **/
    /** @param {Creep} callingCreep **/
    /** @param {} actionArray **/
    checkIfInUse: function(room, find, callingCreep, actionArray) {
        let sourcesArray = room.find(find);
        for (let resource in sourcesArray) {
            if (!resource || !sourcesArray.hasOwnProperty(resource)) {
                continue;
            }
            let currentResource = sourcesArray[resource];
            let creepsUsingThisResource = this.findAnyCreepsUsingObject(currentResource.id, callingCreep, actionArray);
            if (creepsUsingThisResource.length === 0) {
                return currentResource;
            }
        }
    },

    findAnyCreepsUsingObject: function(id, callingCreep, actionArray) {
        let creepArray = [];
        _.forEach(actionArray, (value, key) => {
            let currentCreepArray = _.filter(Game.creeps, (creep) => creep !== callingCreep &&
                creep.memory.currentOrder === key + ":" + id);
            if (currentCreepArray.length > value) {
                _.merge(creepArray, currentCreepArray);
            }
        });
        return creepArray;
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