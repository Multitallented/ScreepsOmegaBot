let creepUtil = require('./util/creep.util');
let Util = require('./util/util');

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
                c.room.controller && (c.room.controller.my || (c.room.controller.reservation &&
                c.room.controller.reservation.username === 'Multitallented')) &&
                c.room.find(FIND_HOSTILE_CREEPS).length > 0 &&
                c.room.find(FIND_STRUCTURES, {filter: (s) => {
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
            if (flags.length && !room.find(FIND_HOSTILE_CREEPS, {filter: (c) => {
                    return c.name.indexOf("Keeper") === -1;
                }}).length) {
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
            creepCount[spawn.id]['numSites'] = spawn.room.find(FIND_CONSTRUCTION_SITES).length;
            creepCount[spawn.id]['numContainers'] = spawn.room.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType === STRUCTURE_CONTAINER}}).length;
            _.forEach(creepUtil.roles, (role) => {
                creepCount[spawn.id][role] =
                    spawn.room.find(FIND_CREEPS, {filter: (creep) => {return creep.memory && creep.memory.role &&
                            creep.memory.role === role && !creep.memory.wasScout;}}).length;
                creepCount[spawn.id][role + ":X"] =
                    _.filter(Game.creeps, (c) => {return c.memory && c.memory.role === role}).length;
            });
        });

        _.forEach(creepCount, (count, spawnId) => {
            if (spawnId == null || count[creepUtil.roles.MELEE] > 7) {
                return;
            }
            let room = Game.getObjectById(spawnId) ? Game.getObjectById(spawnId).room : null;

            let spawning = "none";
            if (count[creepUtil.roles.HARVESTER] < 1) {
                spawning = creepUtil.roles.HARVESTER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.UPGRADER] < 1) {
                spawning = creepUtil.roles.UPGRADER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.BUILDER] < 1) {
                spawning = creepUtil.roles.BUILDER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 200) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.BUILDER, Math.min(600, count['energyAvailable']));
            } else if ((count['numContainers'] > count[creepUtil.roles.MINER] && count['numSources'] > count[creepUtil.roles.MINER])
                    || (count['numContainers'] > 0 && count['numContainers'] >= count[creepUtil.roles.MINER] && room != null &&
                    room.find(FIND_CREEPS, {filter: (creep) => {
                        return creep.memory && creep.memory.role === creepUtil.roles.MINER && creep.ticksToLive < 200;
                    }}).length > 0)) {
                spawning = creepUtil.roles.MINER;
                this.saySomething(spawnId, spawning + 1);
                if (count[creepUtil.roles.MINER] < 1 && count['energyAvailable'] < 300) {
                    return;
                } else if ((count['energyCapacity'] > 899 && count['energyAvailable'] < 900) ||
                        (count['energyCapacity'] < 900 && count['energyCapacity'] > count['energyAvailable'])) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MINER, Math.min(count['energyAvailable'], 900));
            } else if ((count[creepUtil.roles.BUILDER] < 5 && creepCount[spawnId]['numSites'] > 0) || count[creepUtil.roles.BUILDER] < 2) {
                spawning = creepUtil.roles.BUILDER;
                this.saySomething(spawnId, spawning + 2);
                if (count['energyAvailable'] < 300) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.BUILDER, Math.min(600, count['energyAvailable']));
            } else if (count[creepUtil.roles.MINER] < 1 && count[creepUtil.roles.HARVESTER] < 2 && count['energyCapacity'] > 399) {
                spawning = creepUtil.roles.HARVESTER;
                this.saySomething(spawnId, spawning + 2);
                if (count['energyAvailable'] < 400) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.HARVESTER, 400);
            } else if (count['numContainers'] > 0 && count[creepUtil.roles.COURIER] < count[creepUtil.roles.MINER]) {
                spawning = creepUtil.roles.COURIER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 300) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.COURIER, count['energyAvailable']);
            }
            else if (count[creepUtil.roles.MELEE] < 8 && rescueFlags.length > 0) {
                spawning = creepUtil.roles.MELEE;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 300) {
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
            else if ((count[creepUtil.roles.UPGRADER] < 2 ||
                (count[creepUtil.roles.UPGRADER] < 3 && creepCount[spawnId][creepUtil.roles.CLAIMER + ":X"] > 3)) && count['energyCapacity'] > 549) {
                spawning = creepUtil.roles.UPGRADER;
                this.saySomething(spawnId, spawning + 2);
                if (count['energyAvailable'] < 550) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.UPGRADER, count['energyAvailable']);
            }
            // else if (count[creepUtil.roles.TANK] < 4 && creepCount[spawnId][creepUtil.roles.TANK + ":X"] < 4) {
            //     if (count['energyAvailable'] < 1100) {
            //         return;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.TANK, count['energyAvailable']);
            // }
            // else if (count[creepUtil.roles.MELEE] < 4 && creepCount[spawnId][creepUtil.roles.MELEE + ":X"] < 4) {
            //     if (count['energyAvailable'] < 900) {
            //         return;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.MELEE, count['energyAvailable']);
            // }
            // else if (count[creepUtil.roles.BUILDER] < 3 && count['energyCapacity'] > 799 && creepCount[spawnId]['numSites'] > 0) {
            //     spawning = creepUtil.roles.BUILDER;
            //     this.saySomething(spawnId, spawning + 2);
            //     if (count['energyAvailable'] < 800) {
            //         return;
            //     }
            //     this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.BUILDER, count['energyAvailable']);
            // }
            else if (count[creepUtil.roles.CLAIMER] < 1 && creepCount[spawnId][creepUtil.roles.CLAIMER + ":X"] < 8 &&
                    creepCount[spawnId][creepUtil.roles.SCOUT + ":X"] > 1 && count['energyCapacity'] > 799) {
                spawning = creepUtil.roles.CLAIMER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.CLAIMER, 800)
            }
            else if (count[creepUtil.roles.SCOUT] < 1 &&
                    creepCount[spawnId][creepUtil.roles.SCOUT + ":X"] < creepCount[spawnId][creepUtil.roles.XCOURIER + ":X"] && count['energyCapacity'] > 799) {
                spawning = creepUtil.roles.SCOUT;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.SCOUT, count['energyAvailable']);
            }
            else if (count[creepUtil.roles.XCOURIER] < 2 && count['energyCapacity'] > 799 && creepCount[spawnId][creepUtil.roles.CLAIMER + ":X"] > 0) {
                spawning = creepUtil.roles.XCOURIER;
                this.saySomething(spawnId, spawning + 1);
                if (count['energyAvailable'] < 800) {
                    return;
                }
                this.spawnACreep(Game.getObjectById(spawnId), creepUtil.roles.XCOURIER, Math.min(1000, count['energyAvailable']));
            }
            else if (count[creepUtil.roles.UPGRADER] < (creepCount[spawnId]['numSites'] ? 5 : 7)) {
                spawning = creepUtil.roles.UPGRADER;
                this.saySomething(spawnId, spawning + 3);
                if (count['energyAvailable'] < count['energyCapacity']) {
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

    saySomething: function(spawnId, message) {
        let spawn = Game.getObjectById(spawnId);
        if (spawn.spawning) {
            return;
        }
        spawn.room.visual.text(
            message,
            spawn.pos.x + 1,
            spawn.pos.y,
            {align: 'left', opacity: 0.8});
    },

    getRescueFlagName: function(creep) {
        return "Rescue:" + creep.room.name
    }
};