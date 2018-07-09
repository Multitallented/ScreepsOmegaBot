let Util = require('./util');
let structUtil = require('./structure.util');
let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if((creep.memory.building || creep.memory.repairing) && creep.carry.energy === 0) {
            if (!creep.memory.harvesting) {
                creep.say('🔄 harvest');
            }
            creep.memory.building = false;
            creep.memory.harvesting = true;
        }
        if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
        }
        if (!creep.memory.repairing && !creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.repairing = true;
            // creep.say('🚧 repair');
        }

        if (creep.memory.repairing && !creep.memory.harvesting) {
            if (creep.memory.repairing === true) {
                let targets = creep.room.find(FIND_STRUCTURES, { filter: (target) => {
                        let belowMax = target.hits < target.hitsMax;
                        let belowRepairAt = structUtil.getRepairPoints().repairPoints[target.structureType] === undefined ||
                            target.hits < structUtil.getRepairPoints().repairPoints[target.structureType].repairAt;
                        let belowRepairUntil = structUtil.getRepairPoints().repairPoints[target.structureType] === undefined ||
                            ((creep.memory.currentOrder === Util.MOVE + target.id ||
                                creep.memory.currentOrder === Util.REPAIR + target.id) &&
                            target.hits < structUtil.getRepairPoints().repairPoints[target.structureType].repairUntil);
                        return belowMax && (belowRepairAt || belowRepairUntil);
                    }});
                targets = _.sortBy(targets, o => o.hitsMax - o.hits);
                if (targets.length) {
                    creep.memory.repairing = targets[0].id;
                }
            }
            if (creep.memory.repairing && creep.memory.repairing !== true) {
                if(creep.repair(Game.getObjectById(creep.memory.repairing)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.repairing), {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + creep.memory.repairing;
                } else {
                    creep.memory.currentOrder = Util.REPAIR + ":" + creep.memory.repairing;
                }
            } else {
                creep.memory.repairing = false;
                creep.memory.building = true;
                // creep.say('🚧 build');
            }
        }
        if(creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                } else {
                    creep.memory.currentOrder = Util.BUILD + ":" + targets[0].id;
                }
            } else {
                let targets = creep.room.find(FIND_STRUCTURES);
                targets = _.filter(targets, (target) => {
                    return target.hits < target.hitsMax;
                });
                targets = _.sortBy(targets, o => o.hitsMax - o.hits);
                if(targets.length) {
                    if(creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                    } else {
                        creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                    }
                } else {
                    creep.memory.role = 'upgrader';
                }
            }
        } else if (creep.memory.harvesting) {
            let container = Util.checkIfInUse(creep.room, FIND_STRUCTURES, creep, Util.WITHDRAW,
                (structure) => { return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store.energy > 0; });
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
        }
    }
};

module.exports = roleBuilder;