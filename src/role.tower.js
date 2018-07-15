module.exports = {
    run: function() {
        let towers = _.filter(Game.structures, (struct) => { return struct.structureType === STRUCTURE_TOWER});
        _.forEach(towers, (tower) => {
            if (tower) {

                let closestHostileHealer = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,
                    {filter: (c) => _.filter(c.body, (part) => part.type === HEAL).length});
                if(closestHostileHealer) {
                    tower.attack(closestHostileHealer);
                }
                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(!closestHostileHealer && closestHostile) {
                    tower.attack(closestHostile);
                }
                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_CREEPS, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.my
                });
                if(!closestHostileHealer && !closestHostile && closestDamagedStructure) {
                    tower.heal(closestDamagedStructure);
                }
            }
        });
    }
};