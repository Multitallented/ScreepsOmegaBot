let builderScript = require('../src/role.builder');
let Util = require("../src/util");

describe("Builder Tests", function() {
    let builder1 = null;
    let extension1 = null;

    beforeEach(function() {
        require("./mocks/game")();
        extension1 = require('./mocks/structuretypes/structure-extension')('Extension1', 12,28, STRUCTURE_EXTENSION);
        Game.rooms.Room1.entities.FIND_STRUCTURES = [
            require('./mocks/structuretypes/structure-spawn')('Spawn1', 12, 25, STRUCTURE_SPAWN),
            extension1,
        ];
        builder1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Builder1", {memory: {role: 'builder'}}, Game.rooms.Room1);
        builder1.carry.energy = 50;
        builder1.carryCapacity = 50;
        Game.creeps['Builder1'] = builder1;
    });

    it("prioritize repairing existing structures", function() {
        extension1.hits = 50;
        extension1.hitsMax = 100;
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("REPAIR:Extension1");
    });
});