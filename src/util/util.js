module.exports = {
    HARVEST: "HARVEST",
    MOVE: "MOVE",
    TRANSFER: "TRANSFER",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    BUILD: "BUILD",
    REPAIR: "REPAIR",
    WITHDRAW: "WITHDRAW",
    CLAIM: "CLAIM",
    RESERVE: "RESERVE",
    PICKUP: "PICKUP",

    USERNAME: 'Multitallented',

    /** @param {Room} room **/
    /** @param string find **/
    /** @param {Creep} callingCreep **/
    /** @param {Object} actionArray **/
    checkIfInUse: function(room, find, callingCreep, action, filter) {
        let sourcesArray = [];
        if (filter) {
            sourcesArray = room.find(find, {filter: filter});
        } else {
            sourcesArray = room.find(find);
        }
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
        let resourceArray = [];
        _.forEach(sourcesArray, (currentResource) => {
            let creepsUsingThisResource = this.findAnyCreepsUsingObject(currentResource.id, callingCreep,
                this.getActionArray(callingCreep, currentResource, action));
            if (creepsUsingThisResource.length === 0) {
                resourceArray.push(currentResource);
            }
        });
        let returnResource = callingCreep.pos.findClosestByPath(resourceArray);
        if (returnResource === null) {
            returnResource = undefined;
        }
        return returnResource;
    },

    findAnyCreepsUsingObject: function(id, callingCreep, actionArray) {
        let creepArray = [];
        _.forEach(actionArray, (value, key) => {
            let currentCreepArray = _.filter(Game.creeps, (creep) => creep !== callingCreep &&
                !creep.spawning &&
                creep.memory.currentOrder === key + ":" + id);
            if (currentCreepArray.length > value) {
                _.merge(creepArray, currentCreepArray);
            }
        });
        return creepArray;
    },

    getActionArray: function(creep, target, action) {
        let actionArray = {};
        if (action === this.WITHDRAW) {
            actionArray[action] = 2;
            actionArray[this.MOVE] = 5;
        } else {
            let emptySquares = this.getEmptyAdjacentSpaces(creep.room, target.pos);
            actionArray[action] = emptySquares;
            actionArray[this.MOVE] = emptySquares + 1;
        }
        return actionArray;
    },

    getEmptyAdjacentSpaces: function(room, position, countCreeps) {
        let runningTotal = 0;
        _.forEach(room.lookAtArea(position.y-1, position.x-1, position.y+1, position.x+1, true), (s) => {
            if (s.type === 'terrain' && s.terrain !== 'wall') {
                runningTotal++;
            } else if (s.type === 'structure' && s.structure.structureType !== STRUCTURE_CONTAINER) {
                runningTotal--;
            } else if (s.type === 'creep' && countCreeps) {
                runningTotal--;
            }
        });

        return runningTotal;
    },

    findHarvestSpace: function(room) {
        let runningTotal = 0;
        _.forEach(room.find(FIND_SOURCES), (source) => {
            runningTotal += this.getEmptyAdjacentSpaces(room, source.pos, false);
        });
        return runningTotal;
    },

    getRoomDistance: function(roomName, destName) {
        let x = Number(roomName.charAt(1));
        let y = Number(roomName.charAt(3));
        let dx = Number(destName.charAt(1));
        let dy = Number(destName.charAt(3));

        return Math.max(Math.abs(x-dx), Math.abs(y-dy));
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
    },

    distance: function(entity1, entity2) {
        // if (entity1.room.name !== entity2.room.name) {
        //     return -1;
        // }
        return Math.max(Math.abs(entity1.pos.x - entity2.pos.x), Math.abs(entity1.pos.y - entity2.pos.y));
    }
};