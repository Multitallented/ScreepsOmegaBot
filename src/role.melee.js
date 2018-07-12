let Util = require('./util');
let creepUtil = require('./creep.util');
let scoutScript = require('./role.scout');

module.exports = {
    moveCreepToDestination: function(creep, flagName) {
        let move = creep.moveTo(Game.flags[flagName], {visualizePathStyle: {stroke: '#ffffff'}, ignoreCreeps: true});
        creep.memory.currentOrder = Util.MOVE + ":flag";
        if (move !== OK && move !== -11 && move !== -4) {
            console.log("melee failed move: " + move);
            scoutScript.moveCreepIntoRoom(creep);
        }

    },

    run: function(creep) {
        creep.memory.flag= 'Claimed:Demiskeleton:362402';

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
            } else if (squadLeaders[0].ticksToLive < 500 || _.filter(Game.creeps, (c) => {
                return c.memory && c.memory.role && (c.memory.role === creepUtil.roles.MELEE ||
                    c.memory.role === creepUtil.roles.LOOTER || c.memory.role === creepUtil.roles.TANK);
                }).length > 5) {
                creep.memory.flag = 'Claimed:Demiskeleton:362402';
                this.moveCreepToDestination(creep, 'Claimed:Demiskeleton:362402');
            }
            return;
        } else if (creep.room.controller && creep.room.controller.owner === undefined) {
            this.moveCreepToDestination(creep, creep.memory.flag);
        } else if (creep.room.controller && !creep.room.controller.my && creep.room.controller.owner !== undefined) {
            let goals = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                return !s.my && s.structureType && s.structureType === STRUCTURE_TOWER;
                }});
            let goal = creep.pos.findClosestByPath(goals);
            creep.moveTo(goal, {visualizePathStyle: {stroke: '#ffffff'}});
            creep.memory.currentOrder = Util.MOVE + ":" + goal.id;
        }

        let withdraw = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
            return s.store && s.store.energy > 0; });
        creep.withdraw(withdraw[0]);
        let heal = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
            return s.my === true && s.hits < s.hitsMax; });
        creep.heal(heal[0]);
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        let targets = _.filter(creep.room.lookAtArea(creep.pos.y-1, creep.pos.x-1, creep.pos.y+1, creep.pos.x+1, true), (s) => {
            return s.my === false; });
        creep.attack(targets[0]);
    }
};