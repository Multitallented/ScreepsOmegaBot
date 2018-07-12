let Util = require('./util');
let creepUtil = require('./creep.util');
let scoutScript = require('./role.scout');

module.exports = {
    moveCreepToDestination: function(creep, flagName) {
        let move = creep.moveTo(Game.flags[flagName], {visualizePathStyle: {stroke: '#ffffff'}});
        creep.memory.currentOrder = Util.MOVE + ":flag";
        if (move !== OK && move !== -11 && move !== -4) {
            console.log("melee failed move: " + move);
            scoutScript.moveCreepIntoRoom(creep);
        }

    },

    run: function(creep) {
        // creep.memory.flag= 'Unclaimed:342703';
        // creep.memory.flag= 'Claimed:Demiskeleton:362402';
        // creep.memory.flag= 'Claimed:MichaelBot:W9N9:364364';
        creep.memory.flag= 'Unclaimed:364307:W9N8';

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
            if (!squadLeaders.length) {
                creep.memory.squadLeader = true;
                creep.memory.ticksToAttack = 600;
            } else if (_.filter(Game.creeps, (c) => {
                return c.memory && c.memory.role && (c.memory.role === creepUtil.roles.MELEE ||
                    c.memory.role === creepUtil.roles.LOOTER || c.memory.role === creepUtil.roles.TANK);
                }).length > 7 && squadLeaders[0].ticksToLive > squadLeaders[0].memory.ticksToAttack) {
                squadLeaders[0].memory.ticksToAttack = 300;
                this.moveCreepToDestination(creep, creep.memory.flag);
            }
            return;
        } else if (creep.room.controller && creep.room.controller.owner === undefined) {
            this.moveCreepToDestination(creep, creep.memory.flag);
        } else if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            let goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return !s.my && s.structureType && s.structureType === STRUCTURE_TOWER;
                }});
            let goal = null;
            if (goals.length) {
                goal = creep.pos.findClosestByPath(goals);
            } else {
                goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return !s.my && s.structureType === STRUCTURE_TOWER;
                    }});
                if (goals.length) {
                    goal = creep.pos.findClosestByPath(goals);
                } else {
                    goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                            return !s.my;
                        }});
                    if (goals.length) {
                        goal = creep.pos.findClosestByPath(goals);
                    }
                }
            }
            if (goal != null) {
                creep.attack(goal);
                creep.moveTo(goal, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.currentOrder = Util.MOVE + ":" + goal.id;
            }
        }

        // let withdraw = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
        //     return s.type === 'structure' && s.structure.structureType === STRUCTURE_CONTAINER && s.structure.store.energy > 0; });
        // creep.withdraw(withdraw[0]);
        // let heal = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
        //     return s.type === 'creep' && s.creep.my === true && s.creep.hits < s.creep.hitsMax; });
        //     creep.heal(heal[0]);
        // if (creep.hits < creep.hitsMax) {
        //     creep.heal(creep);
        // }
        // let targets = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
        //     return s.type === 'structure' && s.structure.my == false; });
        // let attack = creep.attack(targets[0]);
        // console.log(attack);
    }
};