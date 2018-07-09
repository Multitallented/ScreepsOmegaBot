let Util = require('./util');
let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if((creep.memory.building || creep.memory.repairing) && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && !creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.repairing = true;
            // creep.say('🚧 repair');
        }

        if (creep.memory.repairing) {
            let targets = creep.room.find(FIND_STRUCTURES);
            targets = _.filter(targets, (target) => {
                return target.hits < target.hitsMax && target.structureType !== STRUCTURE_WALL &&
                    (target.structureType !== STRUCTURE_RAMPART || target.hits < 200000);
            });
            targets = _.orderBy(targets, ['hits'], ['asc']);
            if(targets.length) {
                if(creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                } else {
                    creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                }
            } else {
                creep.memory.repairing = false;
                creep.memory.building = true;
                creep.say('🚧 build');
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
                    return target.hits < 200000 && target.structureType === STRUCTURE_RAMPART;
                });
                if(targets.length) {
                    if(creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.memory.currentOrder = Util.MOVE + ":" + targets[0].id;
                    } else {
                        creep.memory.currentOrder = Util.REPAIR + ":" + targets[0].id;
                    }
                } else {
                    let targets = creep.room.find(FIND_STRUCTURES);
                    targets = _.filter(targets, (target) => {
                        return target.hits < 200000;
                    });
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
            }
        }
        else if (!creep.memory.repairing) {
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
};

module.exports = roleBuilder;