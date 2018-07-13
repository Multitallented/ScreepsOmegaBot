let creepUtil = require('./creep.util');

module.exports = {
    spawnACreep: function(spawn, key, energy) {
        let newName = key.charAt(0).toUpperCase() + key.slice(1) + Game.time;
        let creepData = creepUtil.buildBestCreep(key, energy);
        spawn.spawnCreep(creepData.bodyArray, newName,
            creepData.memory);
    },

    run: function() {
        let creepCount = {};
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
            let creepsUnderAttack = _.filter(Game.creeps, (c) => {
                return c.hits < c.hitsMax && c.my && c.memory && c.memory.role &&
                    c.memory.role !== creepUtil.roles.SCOUT && c.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType && s.structureType === STRUCTURE_TOWER;
                    }}).length < 1;
                });
            _.forEach(_.filter(Game.flags, (f) => {
                return f.name && f.name.split(":")[0] === "Rescue" && !Game.getObjectById(f.name.split(":")[1]) &&
                    !_.filter(Game.creeps, (c) => { return c.memory && c.memory.rescue === f.name}).length
                }),
                (f) => { f.remove(); }
            );
            if (count[creepUtil.roles.HARVESTER] < 1) {
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, count['energyAvailable']);
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
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, 300);
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
            // else if (count[creepUtil.roles.MELEE] < 8 && creepsUnderAttack.length > 0) {
            //     if (count['energyAvailable'] < 800) {
            //         return;
            //     }
            //     let flag = null;
            //     let flagPos = 0;
            //     for (let i=0; i< creepsUnderAttack.length; i++) {
            //         if (_.filter(Game.flags, (f) => {
            //             return f.name === this.getRescueFlagName(creepsUnderAttack[i]);
            //             }).length) {
            //             continue;
            //         }
            //         flag = this.getRescueFlagName(creepsUnderAttack[i]);
            //         flagPos = i;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MELEE, count['energyAvailable']);
            //     let creep = Game.getObjectById(spawnId).spawning;
            //     if (creep && creep.memory && creep.memory.role === creepUtil.roles.MELEE) {
            //         if (flag !== null) {
            //             creepsUnderAttack[flagPos].room.createFlag(creepsUnderAttack[flagPos].x, creepsUnderAttack[flagPos].y, flag);
            //             creep.memory.rescue = flag;
            //         } else {
            //             creep.memory.rescue = this.getRescueFlagName(creepsUnderAttack[flagPos]);
            //         }
            //     }
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
            else if (count[creepUtil.roles.SCOUT] < 2) {
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.SCOUT, count['energyAvailable']);
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
        return "Rescue:" + creep.id + ":" + creep.room.name
    }
};