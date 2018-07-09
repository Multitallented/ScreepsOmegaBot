let harvester = require('../src/role.harvester');

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

    it("Harvester should prioritize extensions over spawn", function() {
        let extension1 = require('./mocks/structuretypes/structure-extension')('Extension1', 15, 30, STRUCTURE_EXTENSION);
        extension1.energy = 0;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(extension1);
        harvester.run(harvester1);
        expect(harvester1.memory.currentOrder).toBe("MOVE:Extension1");
    });

    // it("Harvester should transfer to a container if spawn is full", function() {
    //     Game.rooms.Room1.entities.FIND_STRUCTURES.push(
    //             require('./mocks/structuretypes/structure-container')('Container1', 12, 30, STRUCTURE_CONTAINER));
    //     harvester.run(harvester1);
    //     expect(harvester1.memory.currentOrder).toBe("MOVE:Container1");
    // });
});