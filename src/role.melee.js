let Util = require('./util');
let creepUtil = require('./creep.util');
let scoutScript = require('./role.scout');

module.exports = {
    moveCreepToDestination: function(creep, flagName) {
        let move = null;
        // if (creep.memory.squadLeader) {
            move = creep.moveTo(Game.flags[flagName], {reusePath: 3, visualizePathStyle: {stroke: '#ffffff'}});
        // } else {
        //     let squadLeaders = _.filter(Game.creeps, (c) => { return c.memory && c.memory.squadLeader; });
        //     if (squadLeaders.length && squadLeaders[0].pos.getRangeTo(creep) > 1) {
        //         move = creep.moveTo(squadLeaders[0], {visualizePathStyle: {stroke: '#ffffff'}});
        //     }
        // }
        creep.memory.currentOrder = Util.MOVE + ":flag";
        if (move !== OK && move !== -11 && move !== -4) {
            scoutScript.moveCreepIntoRoom(creep);
        }

    },

    run: function(creep) {
        // creep.memory.flag= 'Unclaimed:342703';
        // creep.memory.flag= 'Claimed:Demiskeleton:362402';
        creep.memory.flag= 'Claimed:Demiskeleton:362402';
        // creep.memory.flag= 'Claimed:Sleepless:W2N7:441130';
        // creep.memory.flag= 'Unclaimed:384626:W3N7';
        // creep.memory.flag= 'Claimed:MichaelBot:W9N9:364364';
        // creep.memory.flag= 'Unclaimed:364279:W9N7';
        // creep.memory.flag= 'Unclaimed:364307:W9N8';
        // creep.memory.flag= 'Unclaimed:495540:W7N4';

        if (creep.memory && creep.memory.rescue) {
            let rescue = Game.getObjectById(creep.memory.rescue);
            if (rescue !== undefined && rescue !== null) {
                if (rescue.room.name !== creep.room.name) {
                    creep.moveTo(rescue.pos, {reusePath: 3, visualizePathStyle: {stroke: '#ffffff'}});
                    creep.memory.currentOrder = Util.MOVE + ":" + rescue.room.name;
                }
            }
        }

        if (creep.memory && creep.memory.rescue) {
            let flag = Game.flags[creep.memory.rescue];
            if (flag != null && flag.name.split(":")[1] !== creep.room.name) {
                this.moveCreepToDestination(creep, creep.memory.rescue);
            } else {
                this.fight(creep);
            }
            return;
        }

        if (creep.room.controller && creep.room.controller.my) {
            let spawns = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType && s.structureType === STRUCTURE_SPAWN
                }});
            if (spawns.length) {
                spawns[0].renewCreep(creep);
            }
            let squadLeaders = _.filter(Game.creeps, (c) => {
                    return c.memory && c.memory.role && c.memory.squadLeader;
                });
            let army = _.filter(Game.creeps, (c) => {
                return c.memory && c.memory.role && (c.memory.role === creepUtil.roles.MELEE ||
                    c.memory.role === creepUtil.roles.LOOTER || c.memory.role === creepUtil.roles.TANK);
            });
            if (!squadLeaders.length) {
                creep.memory.squadLeader = true;
                creep.memory.ticksToAttack = 900;
            } else if (army.length > 0 && squadLeaders[0].ticksToLive > squadLeaders[0].memory.ticksToAttack) {
                squadLeaders[0].memory.ticksToAttack = 100;
                this.moveCreepToDestination(creep, creep.memory.flag);
            }
            return;
        } else if (!creep.room.controller || creep.room.controller.owner === undefined) {
            this.moveCreepToDestination(creep, creep.memory.flag);
            return;
        } else if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            if (scoutScript.moveCreepIntoRoom(creep)) {
                return;
            }
            //this.fight(creep);
        }

        this.fight(creep);
    },
    fight: function(creep) {
        let goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return !s.my && s.structureType && s.structureType === STRUCTURE_TOWER;
            }});
        let goal = null;
        if (goals.length) {
            goal = creep.pos.findClosestByPath(goals);
        } else {
            let goals = creep.room.find(FIND_CREEPS, {filter: (s) => {
                    return !s.my && (!s.name || s.name.indexOf("Keepera") === -1);
                }});

            if (goals.length) {
                goal = creep.pos.findClosestByPath(goals);
            } else {
                goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return !s.my && s.structureType && s.structureType !== STRUCTURE_CONTAINER &&
                            s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTROLLER &&
                            s.structureType !== STRUCTURE_KEEPER_LAIR && s.structureType !== STRUCTURE_WALL &&
                            s.structureType !== STRUCTURE_RAMPART;
                    }});
                if (goals.length) {
                    goal = creep.pos.findClosestByPath(goals);
                }
            }
        }
        if (goal != null) {
            creep.attack(goal);
            creep.moveTo(goal, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.attack(goal);
            creep.memory.currentOrder = Util.MOVE + ":" + goal.id;
        } else {
            this.moveCreepToDestination(creep, creep.memory.flag);
        }

        if (creep.pos.x !== 1 && creep.pos.x !== 49 && creep.pos.y !== 1 && creep.pos.y !== 49) {
            let withdraw = _.filter(creep.room.lookAtArea(creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1, true), (s) => {
                return s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER && s.structure.store.energy > 0;
            });
            let targets = _.filter(creep.room.lookAtArea(creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1, true), (s) => {
                return (s.structure && s.structure.structureType !== STRUCTURE_CONTAINER &&
                    s.structure.structureType !== STRUCTURE_ROAD) || (s.creep && !s.creep.my);
            });


            if (targets.length) {
                targets = _.sortBy(targets, (t) => {
                    let hits = t.structure ? t.structure.hits : t.creep.hits;
                    return hits });
                let attack = null;
                if (targets[0].structure) {
                    attack = creep.attack(targets[0].structure);
                } else if (targets[0].creep) {
                    attack = creep.attack(targets[0].creep);
                }
                // console.log(attack);
            }
            if (withdraw.length) {
                creep.withdraw(withdraw[0].structure);
            }
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
            let heal = _.filter(creep.room.lookAtArea(creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1, true), (s) => {
                return s.type === 'creep' && s.creep.my === true && s.creep.hits < s.creep.hitsMax;
            });
            if (heal.length) {
                creep.heal(heal[0].creep);
            }
        }
    }
};