let builderScript = require('../src/roles/base-building/role.builder');
let Util = require("../src/util/util");

describe("Builder Tests", function() {
    let builder1 = null;
    let extension1 = null;
    let spawn1 = null;

    beforeEach(function() {
        require("./mocks/game")();
        extension1 = require('./mocks/structuretypes/structure-extension')('Extension1', 12,28, STRUCTURE_EXTENSION);
        spawn1 = require('./mocks/structuretypes/structure-spawn')('Spawn1', 12, 25, STRUCTURE_SPAWN);
        Game.rooms.Room1.entities.FIND_STRUCTURES = [
            spawn1,
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

    it("prioritize structures with lower health", function() {
        spawn1.hits = 12;
        extension1.hits = 6;
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("REPAIR:Extension1");
    });

    it("don't change repair targets until finished repairing", function() {
        spawn1.hits = 12;
        extension1.hits = 6;
        builder1.memory.currentOrder = "REPAIR:Spawn1";
        builder1.memory.repairing = spawn1.id;
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("REPAIR:Spawn1");
    });

    it("dont prioritize repairing walls and ramparts unless they need it", function() {
        let wall1 = require('./mocks/structure')('Wall1', 12, 30, STRUCTURE_WALL);
        wall1.hits = 3000001;
        wall1.hitsMax = 300000000;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(wall1);
        let rampart1 = require('./mocks/structure')('Wall1', 12, 31, STRUCTURE_RAMPART);
        rampart1.hits = 900001;
        rampart1.hitsMax = 999999;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(rampart1);
        let site1 = require('./mocks/construction-site')('Site1',11,30,Game.rooms.Room1, STRUCTURE_WALL);
        Game.rooms.Room1.entities.FIND_CONSTRUCTION_SITES.push(site1);
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("BUILD:Site1");
    });
    it("repair other buildings besides walls and ramparts first", function() {
        let wall1 = require('./mocks/structure')('Wall1', 12, 30, STRUCTURE_WALL);
        wall1.hits = 3000001;
        wall1.hitsMax = 300000000;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(wall1);
        let rampart1 = require('./mocks/structure')('Wall1', 12, 31, STRUCTURE_RAMPART);
        rampart1.hits = 900001;
        rampart1.hitsMax = 999999;
        Game.rooms.Room1.entities.FIND_STRUCTURES.push(rampart1);
        extension1.hits = 50;
        extension1.hitsMax = 100;
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("REPAIR:Extension1");
    });

    it("go harvest when out of energy", function() {
        builder1.carry.energy = 0;
        builder1.memory.repairing = 'Extension1';
        builder1.memory.currentOrder = "REPAIR:Extension1";
        extension1.hits = 5;
        extension1.hitsMax = 300;
        Game.rooms.Room1.entities.FIND_SOURCES.push(
            require('./mocks/source')('Source1', 25, 25, Game.rooms.Room1)
        );
        builderScript.run(builder1);
        expect(builder1.memory.currentOrder).toBe("MOVE:Source1");
    });
});