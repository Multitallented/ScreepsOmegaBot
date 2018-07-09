module.exports = {
    run: function() {
        let towers = _.filter(Game.structures, (struct) => { return struct.structureType === STRUCTURE_TOWER});
        _.forEach((towers) => {
            if (tower) {

                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    tower.attack(closestHostile);
                }
                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_CREEPS, {
                    filter: (structure) => structure.hits < structure.hitsMax
                });
                if(closestDamagedStructure) {
                    tower.heal(closestDamagedStructure);
                }
            }
        });
    }
};