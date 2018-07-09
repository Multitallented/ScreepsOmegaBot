module.exports = {
    HARVEST: "HARVEST",
    MOVE: "MOVE",
    TRANSFER: "TRANSFER",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    BUILD: "BUILD",

    /** @param {Room} room **/
    /** @param {Creep} callingCreep **/
    /** @param {} actionArray **/
    checkIfInUse: function(room, find, callingCreep, action) {
        let sourcesArray = room.find(find);
        if (callingCreep != null && callingCreep.memory.currentOrder !== undefined &&
                callingCreep.memory.currentOrder !== null) {
            let currentSource = callingCreep.memory.currentOrder.split(":")[1];
            let returnSource = null;
            _.forEach(sourcesArray, (source) => {
                if (source.id === currentSource &&
                        this.findAnyCreepsUsingObject(currentSource, callingCreep,
                                this.getActionArray(callingCreep, source, action)).length === 0) {
                    returnSource = source;
                }
            });
            if (returnSource != null) {
                return returnSource;
            }
        }
        for (let resource in sourcesArray) {
            if (!resource || !sourcesArray.hasOwnProperty(resource)) {
                continue;
            }
            let currentResource = sourcesArray[resource];
            let creepsUsingThisResource = this.findAnyCreepsUsingObject(currentResource.id, callingCreep,
                    this.getActionArray(callingCreep, currentResource, action));
            if (creepsUsingThisResource.length === 0) {
                return currentResource;
            }
        }
    },

    findAnyCreepsUsingObject: function(id, callingCreep, actionArray) {
        let creepArray = [];
        _.forEach(actionArray, (value, key) => {
            let currentCreepArray = _.filter(Game.creeps, (creep) => creep !== callingCreep &&
                Game.spawns['Spawn1'].spawning !== creep &&
                creep.memory.currentOrder === key + ":" + id);
            if (currentCreepArray.length > value) {
                _.merge(creepArray, currentCreepArray);
            }
        });
        return creepArray;
    },

    getActionArray: function(creep, target, action) {
        let actionArray = {};
        actionArray[action] = 0; //TODO make this dependent on distance and space available
        actionArray[this.MOVE] = 1; //TODO also make this dependent on distance and space available
        return actionArray;
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