let minerScript = require('../src/roles/base-building/role.miner');

describe("Miner Tests", function() {
    let miner1 = null;
    let room1 = null;
    let source1 = null;
    let container1 = null;

    beforeEach(function() {
        require('./mocks/game')();
        room1 = Game.rooms.Room1;
        source1 = require('./mocks/source')("Source1",0,17,room1);
        room1.entities.FIND_SOURCES.push(source1);
        container1 = require('./mocks/structuretypes/structure-container')('Container1', 2, 10, room1);
        room1.entities.FIND_STRUCTURES.push(container1);
        let container2 = require('./mocks/structuretypes/structure-container')('Container2', 2, 15, room1);
        room1.entities.FIND_STRUCTURES.push(container2);
        miner1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Miner1", {memory: {role: 'miner'}}, room1);
        miner1.carryCapacity = 50;
        miner1.pos.x = 1;
        miner1.pos.y = 16;
    });

    it("miner should move to open energy source when spawned", function() {
        miner1.pos.x = 1;
        miner1.pos.y = 8;
        minerScript.run(miner1);
        expect(miner1.memory.currentOrder).toBe("MOVE:Source1");
    });

    it("miner in position should harvest until full", function() {
        miner1.carry.energy=6;
        miner1.memory.inPosition = source1.id;
        minerScript.run(miner1);
        expect(miner1.memory.currentOrder).toBe("HARVEST:Source1");
    });

    it("miner in position with full should deposit in nearest container", function() {
        miner1.carry.energy = 50;
        miner1.memory.inPosition = source1.id;
        minerScript.run(miner1);
        expect(miner1.memory.currentOrder).toBe("TRANSFER:Container2");
    });

    it("miner in position should harvest when empty", function() {
        miner1.carry.energy = 0;
        miner1.memory.inPosition = source1.id;
        minerScript.run(miner1);
        expect(miner1.memory.currentOrder).toBe("HARVEST:Source1");
    });
});
