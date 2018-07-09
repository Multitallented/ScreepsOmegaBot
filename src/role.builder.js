let Util = require('./util');
let structUtil = require('./structure.util');
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


    /** @param {Creep} creep **/
    run: function(creep) {
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
                    if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
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
                    creep.memory.currentOrder = Util.BUILD + ":" + sites[0].id;
                    this.actionById(creep);
                } else {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (target) => {
                            return target.hits < target.hitsMax;
                        }
                    });
                    if (targets.length) {
                        targets = _.sortBy(targets, (o) => o.hits * -1);
                        creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                        this.actionById(creep);
                    }
                }
            }
        }
    }
};

module.exports = roleBuilder;