let harvester = require('../src/role.harvester');
let Util = require('../src/util');

describe("Harvester Tests", function() {
    let harvester1 = null;

    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms.Room1.entities.FIND_STRUCTURES = [
            require('./mocks/structuretypes/structure-spawn')('Spawn1', 12, 25, STRUCTURE_SPAWN)
        ];
        harvester1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1", {memory: {role: 'harvester'}}, Game.rooms.Room1);
        harvester1.carry.energy = 50;
        Game.creeps['Harvester1'] = harvester1;

    });

    it("Harvester should move to spawn if no structures need energy", function() {
        harvester.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe("MOVE:Spawn1");
    });
});