let Util = require('./util');
let creepUtil = require('./creep.util');
let scoutScript = require("./role.scout");

module.exports = {

    run: function(creep) {
        if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            creep.say("Dont shoot", true);
        }

        creep.memory.wasXCourier = true;
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
            scoutScript.moveCreepIntoRoom(creep);
            if (creep.room.find(FIND_STRUCTURES, {filter: (c) => {
                    return c.structureType === STRUCTURE_CONTAINER && c.store.energy > c.storeCapacity / 2;
                }}).length) {
                creep.memory.role = creepUtil.roles.HOMING;
                creep.say("homing");
                return;
            }
        }
        if (creep.room.controller && !creep.room.controller.reservation &&
                (!creep.room.controller.owner || creep.room.controller.owner.username !== 'Multitallented')) {
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
        console.log(discoveredRoom + ":" + (!creep.memory.currentOrder) + ":" + (creep.memory.currentOrder.split(":")[1] === creep.room.name));
        if (discoveredRoom && (!creep.memory.currentOrder || creep.memory.currentOrder.split(":")[1] === creep.room.name)) {
            let targetRoomName = scoutScript.getRandomAdjacentRoom(creep);
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
                scoutScript.moveCreepIntoRoom(creep);
                return;
            }
        }
    },
};