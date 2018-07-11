let Util = require('./util');
let creepUtil = require('./creep.util');

module.exports = {
    getRandomAdjacentRoom: function(creep) {
        let randDirection = {
            0: FIND_EXIT_TOP, 1: FIND_EXIT_LEFT, 2: FIND_EXIT_RIGHT, 3: FIND_EXIT_BOTTOM
        };
        let direction = randDirection[Math.floor(Math.random() * 4)];
        creep.say(direction);
        return this.getRoomName(creep.room.name, direction);
    },

    moveCreepIntoRoom: function(creep) {
        if (creep.pos.x === 0) {
            creep.moveTo(1, creep.pos.y);
        } else if (creep.pos.x === 49) {
            creep.moveTo(48, creep.pos.y);
        } else if (creep.pos.y === 0) {
            creep.moveTo(creep.pos.x, 1);
        } else if (creep.pos.y === 49) {
            creep.moveTo(creep.pos.x, 48);
        }
        creep.memory.currentOrder = undefined;
    },

    run: function(creep) {
        if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            creep.say("Don't shoot", true);
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
            creep.memory.role = creepUtil.roles.COURIER;
            creep.memory.wasScout = true;
            return;
        }

        if (creep.room.controller && creep.room.controller.reservation && creep.room.controller.reservation.username === 'Multitallented') {
            this.moveCreepIntoRoom(creep);
            if (creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return s.structureType === STRUCTURE_CONTAINER;
                }}).length && creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.MINER;
                }}).length < creep.room.find(FIND_SOURCES)) {
                creep.memory.role = creepUtil.roles.MINER;
                return;
            }
            else if (creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role && c.memory.role === creepUtil.roles.BUILDER;
                }}).length === 0) {
                creep.memory.role = creepUtil.roles.BUILDER;
                return;
            }
            else if (creep.room.find(FIND_STRUCTURES, {filter: (c) => {
                    return c.structureType === STRUCTURE_CONTAINER && c.store.energy > c.storeCapacity / 2;
                }}).length) {
                creep.memory.role = creepUtil.roles.HOMING;
                return;
            }
            else {
                creep.memory.role = creepUtil.roles.BUILDER;
                return;
            }
        }

        let discoveredRoom = (creep.room.controller && creep.room.controller.my) ||
            _.filter(Game.flags, (f) => f.room === creep.room).length === 1;
        if (discoveredRoom && (!creep.memory.currentOrder || creep.memory.currentOrder.split(":")[1] === creep.room.name)) {
            let targetRoomName = this.getRandomAdjacentRoom(creep);
            if (creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoomName)), {visualizePathStyle: {stroke: '#ffffff'}}) === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            }
        } else if (discoveredRoom && creep.memory.currentOrder) {
            let targetRoomName = creep.memory.currentOrder.split(":")[1];
            let direction = creep.room.findExitTo(targetRoomName);
            let move = creep.moveTo(creep.pos.findClosestByRange(direction), {visualizePathStyle: {stroke: '#ffffff'}});
            if (move === OK) {
                creep.memory.currentOrder = Util.MOVE + ":" + targetRoomName;
            } else if (move === ERR_NO_PATH) {
                creep.memory.currentOrder = undefined;
                creep.moveTo(25, 25, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if (move !== -11) {
                this.moveCreepIntoRoom(creep);
                return;
            }
        } else if (!discoveredRoom) {
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