let Util = require('../../util/util');
let creepUtil = require('../../util/creep.util');

module.exports = {
    getRandomAdjacentRoom: function(creep) {
        let randDirection = [];
        if (creep.pos.x !== 1) {
            randDirection.push(FIND_EXIT_LEFT);
        }
        if (creep.pos.y !== 1) {
            randDirection.push(FIND_EXIT_TOP);
        }
        if (creep.pos.x !== 49) {
            randDirection.push(FIND_EXIT_RIGHT);
        }
        if (creep.pos.y !== 49) {
            randDirection.push(FIND_EXIT_BOTTOM);
        }
        let direction = randDirection[Math.floor(Math.random() * randDirection.length)];
        creep.say(this.getRoomName(creep.room.name, direction));
        return this.getRoomName(creep.room.name, direction);
    },

    moveCreepIntoRoom: function(creep) {
        creep.memory.currentOrder = undefined;
        if (creep.pos.x === 0) {
            creep.moveTo(1, creep.pos.y);
        } else if (creep.pos.x === 49) {
            creep.moveTo(48, creep.pos.y);
        } else if (creep.pos.y === 0) {
            creep.moveTo(creep.pos.x, 1);
        } else if (creep.pos.y === 49) {
            creep.moveTo(creep.pos.x, 48);
        } else {
            return false;
        }
        return true;
    },

    run: function(creep) {
        if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            creep.say("Dont shoot", true);
        }
        if (!creep.memory || !creep.memory.wasScout) {
            creep.memory.wasScout = true;
        }
        let claimers = _.filter(Game.creeps, (c) => {
                return c.memory && c.memory.role && c.memory.role === creepUtil.roles.CLAIMER;
            });
        if (claimers.length) {
            // claimers[Math.floor(Math.random() * claimers.length)];
            // let move = creep.moveTo(creep.pos.findClosestByPath(claimers), {visualizePathStyle: {stroke: '#ffffff'}});
            // if (move === OK) {
            //     return;
            // }
        }

        if (creep.carry.energy < creep.carryCapacity) {
            let energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (r) => {
                    return r.resourceType && r.resourceType === RESOURCE_ENERGY;
                }});
            if (energy !== undefined && energy !== null && energy.energy > 100) {
                let pickup = creep.pickup(energy);
                if (pickup === OK) {
                    creep.memory.currentOrder = Util.PICKUP + ":" + "energy";
                    return;
                } else {
                    let move = creep.moveTo(energy, {visualizePathStyle: {stroke: '#ffffff'}});
                    if (move === OK) {
                        return;
                    }
                }
            }
        } else if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.role = creepUtil.roles.HOMING;
            creep.say("homing");
            return;
        }

        if (creep.room.controller && creep.room.controller.reservation && creep.room.controller.reservation.username === 'Multitallented') {
            this.moveCreepIntoRoom(creep);
            if (creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return s.structureType === STRUCTURE_CONTAINER && s.store.energy < s.storeCapacity / 2;
                }}).length && creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.MINER;
                }}).length < creep.room.find(FIND_SOURCES).length) {
                creep.memory.role = creepUtil.roles.MINER;
                creep.say("miner");
                return;
            }
            else if (!creep.memory.wasBuilder && creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.BUILDER;
                }}).length === 0) {
                creep.memory.role = creepUtil.roles.BUILDER;
                creep.say("builder");
                return;
            }
            else if (creep.room.find(FIND_STRUCTURES, {filter: (c) => {
                    return c.structureType === STRUCTURE_CONTAINER && c.store.energy > c.storeCapacity / 2;
                }}).length) {
                creep.memory.role = creepUtil.roles.HOMING;
                creep.say("homing");
                return;
            }
        } else if (creep.room.controller && creep.room.controller.my && creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType === STRUCTURE_SPAWN && s.my;
            }}).length === 0) {

            if (creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return s.structureType === STRUCTURE_CONTAINER && s.store.energy < s.storeCapacity / 2;
                }}).length && creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.MINER;
                }}).length < creep.room.find(FIND_SOURCES).length) {
                creep.memory.role = creepUtil.roles.MINER;
                creep.say("miner");
                return;
            }
            else if (!creep.memory.wasBuilder && creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.BUILDER;
                }}).length === 0) {
                creep.say("builder");
                creep.memory.role = creepUtil.roles.BUILDER;
                return;
            }
            else if (creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.UPGRADER;
                }}).length === 0) {
                creep.say("upgrader");
                creep.memory.role = creepUtil.roles.UPGRADER;
                return;
            }
        }
        if (creep.room.controller && (!creep.room.controller.owner || creep.room.controller.owner.username !== 'Multitallented')) {
            if (creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType && s.structureType === STRUCTURE_CONTAINER &&
                    s.store.energy > 0;
                }})) {
                creep.memory.role = creepUtil.roles.HOMING;
                creep.say("homing");
                return;
            }
        }

        let discoveredRoom = (creep.room.controller && creep.room.controller.my) ||
            _.filter(Game.flags, (f) => f.room === creep.room).length === 1;
        if (!creep.memory.currentOrder || creep.memory.currentOrder.split(":")[1] === creep.room.name) {
            let targetRoomName = this.getRandomAdjacentRoom(creep);
            if (creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoomName)), {reusePath: 3, visualizePathStyle: {stroke: '#ffffff'}}) === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            }
        } else if (creep.memory.currentOrder) {
            let targetRoomName = creep.memory.currentOrder.split(":")[1];
            let direction = creep.room.findExitTo(targetRoomName);
            let move = creep.moveTo(creep.pos.findClosestByRange(direction), {reusePath: 3, visualizePathStyle: {stroke: '#ffffff'}});
            if (move === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            } else if (move === ERR_NO_PATH) {
                creep.memory.currentOrder = undefined;
                creep.moveTo(25, 25, {reusePath: 3, visualizePathStyle: {stroke: '#ffffff'}});
            } else if (move !== -11) {
                this.moveCreepIntoRoom(creep);
                return;
            }
        }
        if (!discoveredRoom) {
            // 0 = claim status
            // 1 = owner name | game time
            // 2 = room name
            // 3 = undefined | game time
            if (creep.room.controller && creep.room.controller.owner === undefined) {
                creep.room.createFlag(25,25,'Unclaimed' + ":" + Game.time + ":" + creep.room.name);
            } else if (creep.room.controller && creep.room.controller.owner) {
                creep.room.createFlag(25,25, 'Claimed' + ":" + creep.room.controller.owner.username + ":" + creep.room.name + ":" + Game.time);
            } else {
                creep.room.createFlag(25,25, 'Unclaimable:' + Game.time + ":" + creep.room.name);
            }
            creep.memory.currentOrder = undefined;
        }

        if (discoveredRoom && !(creep.room.controller && creep.room.controller.my)) {
            let unclaimFlag = _.filter(Game.flags, (f) => {
                let splitName = f.name.split(":");
                if (splitName.length < 3) {
                    return false;
                }
                return splitName[2] === creep.room.name && (splitName[0] === 'Unclaimed' ||
                    splitName[0] === 'Claimed');
            });
            if (unclaimFlag.length) {
                if (creep.room.controller && creep.room.controller.owner === undefined) {
                    unclaimFlag[0].name = 'Unclaimed' + ":" + Game.time + ":" + creep.room.name;
                } else if (creep.room.controller && creep.room.controller.owner) {
                    unclaimFlag[0].name = 'Claimed' + ":" + creep.room.controller.owner.username + ":" + creep.room.name + ":" + Game.time;
                }
            }
        }
    },

    getRoomName: function(roomName, direction) {
        if (direction === FIND_EXIT_TOP) {
            return roomName.slice(0,1) + (Number(roomName.charAt(1)) - 1) + roomName.slice(2, 4);
        } else if (direction === FIND_EXIT_LEFT) {
            return roomName.slice(0,3) + (Number(roomName.charAt(3)) - 1);
        } else if (direction === FIND_EXIT_RIGHT) {
            return roomName.slice(0,3) + (Number(roomName.charAt(3)) + 1);
        } else if (direction === FIND_EXIT_BOTTOM) {
            return roomName.slice(0,1) + (Number(roomName.charAt(1)) + 1) + roomName.slice(2, 4);
        }
    }
};