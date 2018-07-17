let Util = require('../src/util/util');

describe("Util Tests", function() {
    let room1 = null;

    beforeEach(function() {
        require('./mocks/game')();
        room1 = Game.rooms['Room1'];
        room1.entities.FIND_SOURCES = [
            require('./mocks/source')("Source1", 0, 0, room1),
            require('./mocks/source')("Source2", 10, 10, room1),
            require('./mocks/source')("Source3", 10, 12, room1),
        ];
    });

    it("Util should find open resource", function() {
        let resource = Util.checkIfInUse(room1, FIND_SOURCES, null, Util.HARVEST);
        expect(resource).not.toBe(undefined);
    });

    it("Util should find filtered resource", function() {
        let resource = Util.checkIfInUse(room1, FIND_SOURCES, null, Util.HARVEST,
            (source) => { return source.id === "Source3" });
        expect(resource.id).toBe("Source3");
    });


    it("Util should find open resource if one in use", function() {
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1",
            {memory: {role: 'harvester', currentOrder: 'HARVEST:Source1'}}, Game.rooms.Room1);
        let resource = Util.checkIfInUse(room1, FIND_SOURCES, null, Util.HARVEST);
        expect(resource.id).toBe("Source2");
    });
    it("Util should find current resource not in use", function() {
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source1'}}, Game.rooms.Room1);
        Game.creeps['Harvester2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester2",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source2'}}, Game.rooms.Room1);
        let resource = Util.checkIfInUse(room1, FIND_SOURCES, Game.creeps['Harvester2'], Util.HARVEST);
        expect(resource.id).toBe("Source2");
    });
    it("Util should find open resource if one in use or moving to one", function() {
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1",
            {memory: {role: 'harvester', currentOrder: 'HARVEST:Source1'}}, Game.rooms.Room1);
        Game.creeps['Harvester2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester2",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source2'}}, Game.rooms.Room1);
        Game.creeps['Harvester4'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester4",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source2'}}, Game.rooms.Room1);
        Game.creeps['Harvester3'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester3",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source3'}}, Game.rooms.Room1);
        let resource = Util.checkIfInUse(room1, FIND_SOURCES, Game.creeps['Harvester3'], Util.HARVEST);
        expect(resource.id).toBe("Source3");
    });

    it("distance should return -1 if not same room", function() {
        room1.entities.FIND_SOURCES[0].room = { name: "room2" };
        let distance = Util.distance(room1.entities.FIND_SOURCES[0], room1.entities.FIND_SOURCES[1]);
        expect(distance).toBe(-1);
    });

    it("distance should be 12", function() {
        let distance = Util.distance(room1.entities.FIND_SOURCES[0], room1.entities.FIND_SOURCES[2]);
        expect(distance).toBe(12);
    });

    it("adjacent spaces should cover all spaces", function() {
        Util.getEmptyAdjacentSpaces(room1, {x: 13, y: 13});
    });
});