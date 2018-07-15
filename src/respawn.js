let creepUtil = require('./creep.util');

module.exports = {
    spawnACreep: function(spawn, key, energy, memory) {
        let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
        let creepData = creepUtil.buildBestCreep(key, energy, memory);
        spawn.spawnCreep(creepData.bodyArray, newName,
            creepData.memory);
    },

    rescueResponse: function() {
        let flagsToSend = [];
        let creepsUnderAttack = _.filter(Game.creeps, (c) => {
            return c.hits < c.hitsMax && c.my && c.memory && c.memory.role &&
                c.memory.role !== creepUtil.roles.SCOUT && c.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType && s.my && s.structureType === STRUCTURE_TOWER && s.energy > s.energyCapacity / 2;
                    }}).length < 1;
        });
        _.forEach(_.filter(Game.flags, (flag) => {
            let flagName = flag.name.split(":");
            return flagName[0] === "Rescue";
        }), (flag) => {
            flagsToSend.push(flag.name);
        });
        _.forEach(creepsUnderAttack, (c) => {
            if (!Game.flags['Rescue:' + c.room.name]) {
                c.room.createFlag(c.pos.x, c.pos.y, "Rescue:" + c.room.name);
                flagsToSend.push("Rescue:" + c.room.name);
            }
        });
        _.forEach(Game.rooms, (room) => {
            let flags = _.filter(Game.flags, (flag) => {
                let flagName = flag.name.split(":");
                return flagName[0] === "Rescue" && flagName[1] === room.name;
            });
            if (flags.length && !room.find(FIND_HOSTILE_CREEPS).length) {
                _.forEach(flags, (flag) => {
                    flag.remove();
                });
            }
        });

        return flagsToSend;
    },

    run: function() {
        let creepCount = {};

        let rescueFlags = this.rescueResponse();

        _.forEach(Game.spawns, (spawn) => {
            creepCount[spawn.id] = {};
            creepCount[spawn.id]['energyAvailable'] = spawn.room.energyAvailable;
            creepCount[spawn.id]['energyCapacity'] = spawn.room.energyCapacityAvailable;
            creepCount[spawn.id]['numSources'] = spawn.room.find(FIND_SOURCES).length;
            creepCount[spawn.id]['numContainers'] = spawn.room.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType === STRUCTURE_CONTAINER}}).length;
            _.forEach(creepUtil.roles, (role) => {
                creepCount[spawn.id][role] =
                    spawn.room.find(FIND_CREEPS, {filter: (creep) => {return creep.memory && creep.memory.role &&
                            creep.memory.role === role && !creep.memory.wasScout;}}).length;
                creepCount[role + ":X"] =
                    _.filter(Game.creeps, (c) => {return c.memory && c.memory.role === role}).length;
            });
        });

        _.forEach(creepCount, (count, spawnId) => {
            if (spawnId == null || count[creepUtil.roles.MELEE] > 7) {
                return;
            }

            if (count[creepUtil.roles.HARVESTER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.UPGRADER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.BUILDER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.BUILDER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.MINER] < 1 && count[creepUtil.roles.HARVESTER] < 2) {
                if (count['energyAvailable'] < 300) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, Math.min(600, count['energyAvailable']));
            } else if (count['numContainers'] > 0 && count['numSources'] > count[creepUtil.roles.MINER]) {
                if ((count[creepUtil.roles.MINER] < 1 || count[creepUtil.roles.COURIER] < 1) && count['energyAvailable'] < 400) {
                    return;
                } else if (!(count[creepUtil.roles.MINER] < 1 || count[creepUtil.roles.COURIER] < 1) &&
                        ((count['energyAvailable'] < 900 && count['energyCapacity'] > 899) || count['energyAvailable'] < 400)) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MINER, Math.min(count['energyAvailable'], 900));
            } else if (count[creepUtil.roles.MINER] < 1 && count[creepUtil.roles.HARVESTER] < 3) {
                if (count['energyAvailable'] < 400) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, 400);
            } else if (count['numContainers'] > 0 && count[creepUtil.roles.COURIER] < 2 && count[creepUtil.roles.MINER] > 0) {
                if (count['energyAvailable'] < 300) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.COURIER, count['energyAvailable']);
            }
            else if (count[creepUtil.roles.MELEE] < 8 && rescueFlags.length > 0) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                rescueFlags = _.sortBy(rescueFlags, (flag) => {
                    return _.filter(Game.creeps, (creep) => {
                        return creep.memory && creep.memory.rescue === flag.name;
                    }).length;
                });
                let memory = {};
                memory.rescue = rescueFlags[0];
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MELEE, count['energyAvailable'], memory);
            }
            else if (count[creepUtil.roles.UPGRADER] < 2 ||
                (count[creepUtil.roles.UPGRADER] < 3 && creepCount[creepUtil.roles.CLAIMER + ":X"] > 3)) {
                if (count['energyAvailable'] < 550) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, count['energyAvailable']);
            }
            // else if (count[creepUtil.roles.TANK] < 4 && creepCount[creepUtil.roles.TANK + ":X"] < 4) {
            //     if (count['energyAvailable'] < 1100) {
            //         return;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.TANK, count['energyAvailable']);
            // }
            // else if (count[creepUtil.roles.MELEE] < 4 && creepCount[creepUtil.roles.MELEE + ":X"] < 4) {
            //     if (count['energyAvailable'] < 900) {
            //         return;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MELEE, count['energyAvailable']);
            // }
            else if (count[creepUtil.roles.BUILDER] < 2) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.BUILDER, count['energyAvailable']);
            }
            else if (count[creepUtil.roles.CLAIMER] < 1 && creepCount[creepUtil.roles.CLAIMER + ":X"] < 8 &&
                    creepCount[creepUtil.roles.SCOUT + ":X"] > 1) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.CLAIMER, 800)
            }
            else if (count[creepUtil.roles.SCOUT] < 1) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.SCOUT, count['energyAvailable']);
            }
            else if (count[creepUtil.roles.XCOURIER] < 2) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.XCOURIER, Math.min(1000, count['energyAvailable']));
            }
            else if (count[creepUtil.roles.UPGRADER] < 3) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, count['energyAvailable']);
            }
        });

        _.forEach(Game.spawns, (spawn) => {
            if(spawn.spawning) {
                var spawningCreep = Game.creeps[spawn.spawning.name];
                spawn.room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawn.pos.x + 1,
                    spawn.pos.y,
                    {align: 'left', opacity: 0.8});
            }
        });
    },

    getRescueFlagName: function(creep) {
        return "Rescue:" + creep.room.name
    }
};