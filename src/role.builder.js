let Util = require('./util');
let structUtil = require('./structure.util');
let creepUtil = require('./creep.util');
let roomBuilder = require('./room.builder');
let roleBuilder = {

    actionById: function(creep) {
        let target = Game.getObjectById(creep.memory.currentOrder.split(":")[1]);
        if (target === null) {
            creep.memory.currentOrder = undefined;
            return;
        }
        if (target.progressTotal && (target.progress < target.progressTotal)) {
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + target.id;
            } else {
                creep.memory.currentOrder = Util.BUILD + ":" + target.id;
            }
        } else if (target.hits < target.hitsMax) {
            if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + target.id;
            } else {
                creep.memory.currentOrder = Util.REPAIR + ":" + target.id;
            }
        } else {
            creep.memory.currentOrder = undefined;
        }
    },

    originRoom: function(creep) {
        if (!creep.memory.wasScout && creep.memory.originRoom !== creep.room.name) {
            if (!creep.memory.originName) {
                creep.memory.originName = creep.room.name;
            }
            let room = Game.rooms[creep.memory.originName];
            if (room !== undefined && room !== null && creep.room !== room) {
                let pos = room.getPositionAt(creep.pos.x, creep.pos.y);
                if (pos !== null) {
                    let move = creep.moveTo(pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                    if (move === OK) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if (this.originRoom(creep)) {
            return;
        }

        if (creep.memory && creep.memory.wasScout &&
            creep.room.find(FIND_CREEPS, {filter: (c) => {
                    return c.memory && c.memory.role === creepUtil.roles.BUILDER;
                }}).length > 1) {
            creep.say("scout");
            creep.memory.role = creepUtil.roles.SCOUT;
            return;
        }

        if (creep.room.controller && !creep.room.controller.my && (!creep.room.controller.reservation ||
                creep.room.controller.reservation.username !== 'Multitallented')) {
            creep.memory.role = creepUtil.roles.SCOUT;
            creep.memory.currentOrder = undefined;
            return;
        }
        let reservedController = creep.room.controller && creep.room.controller.reservation &&
            creep.room.controller.reservation.username === 'Multitallented';
        if (reservedController) {
            if (creep.memory.currentOrder && creep.memory.currentOrder.split(":")[0] === Util.HARVEST &&
                    _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
                        return s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER;
                    }).length < 1 && creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (s) => {
                        return s.structureType === STRUCTURE_CONTAINER;
                    }}).length < 1) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            }
        }


        if (creep.carry.energy < 1 || (creep.memory.currentOrder !== undefined &&
            creep.memory.currentOrder.split(":")[0] === Util.HARVEST && creep.carry.energy < creep.carryCapacity)) {
            let container = Util.checkIfInUse(creep.room, FIND_STRUCTURES, creep, Util.WITHDRAW,
                (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER &&
                        structure.store.energy > 0;
                });
            if (container !== undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + container.id;
                } else {
                    creep.memory.currentOrder = Util.WITHDRAW + ":" + container.id;
                }
            } else {
                let targetSource = Util.checkIfInUse(creep.room, FIND_SOURCES, creep, Util.HARVEST);
                if (targetSource !== undefined) {
                    let harvest = creep.harvest(targetSource);
                    if (harvest === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targetSource.id;
                    } else {
                        creep.memory.currentOrder = Util.HARVEST + ":" + targetSource.id;
                    }
                } else {
                    creep.memory.currentOrder = undefined;
                }
            }
        } else if (creep.carry.energy > 0 && creep.memory.currentOrder !== undefined &&
            (creep.memory.currentOrder.split(":")[0] === Util.REPAIR || creep.memory.currentOrder.split(":")[0] === Util.MOVE ||
                creep.memory.currentOrder.split(":")[0] === Util.BUILD)) {
            this.actionById(creep);
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) => {
                    let belowMax = target.hits < target.hitsMax;
                    let belowRepairAt = structUtil.getRepairPoints().repairPoints[target.structureType] === undefined ||
                        target.hits < structUtil.getRepairPoints().repairPoints[target.structureType].repairAt;
                    let belowRepairUntil = structUtil.getRepairPoints().repairPoints[target.structureType] === undefined ||
                        ((creep.memory.currentOrder === Util.MOVE + target.id ||
                            creep.memory.currentOrder === Util.REPAIR + target.id) &&
                            target.hits < structUtil.getRepairPoints().repairPoints[target.structureType].repairUntil);
                    return belowMax && (belowRepairAt || belowRepairUntil);
                }
            });
            targets = _.sortBy(targets, (o) => o.hits * -1);
            if (targets.length) {
                creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                this.actionById(creep);
            } else {
                let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (sites.length) {
                    let site = creep.pos.findClosestByPath(sites);
                    if (site !== null) {
                        creep.memory.currentOrder = Util.BUILD + ":" + site.id;
                        this.actionById(creep);
                    }
                } else {
                    // if (creep.room.controller && creep.room.controller.my &&
                    //         creep.room.controller.owner !== undefined &&
                    //         creep.room.controller.owner.username === 'Multitallented') {
                    //     let constructionArray = roomBuilder.buildRoom(creep.room);
                    //     if (constructionArray.length) {
                    //         creep.room.createConstructionSite(constructionArray.pos.x,
                    //             constructionArray.pos.y, constructionArray.type);
                    //         return;
                    //     }
                    // } else {
                        targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (target) => {
                                return target.hits < target.hitsMax;
                            }
                        });
                        if (targets.length) {
                            targets = _.sortBy(targets, (o) => o.hits);
                            creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                            this.actionById(creep);
                        } else if (reservedController) {
                            creep.memory.role = creepUtil.roles.SCOUT;
                            creep.memory.currentOrder = undefined;
                            return;
                        }
                    // }

                }
            }
        }
    }
};

module.exports = roleBuilder;