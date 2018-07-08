let util = require('../src/util');
let main = require('../src/main');

describe("Util Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
        let room1 = Game.rooms['Room1'];
        room1.entities.FIND_SOURCES = [
            require('./mocks/source')("Source1", 0, 0, room1),
            require('./mocks/source')("Source2", 10, 10, room1),
            require('./mocks/source')("Source3", 10, 12, room1),
        ];
    });

    it("Util should find open resource", function() {
        main.loop();
        let resource = util.checkIfInUse(Game.spawns.Spawn1.room, FIND_SOURCES, null, util.HARVEST);
        expect(resource).not.toBe(undefined);
    });

    it("Util should find open resource if one in use", function() {
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1",
            {memory: {role: 'harvester', currentOrder: 'HARVEST:Source1'}}, Game.rooms.Room1);
        main.loop();
        let resource = util.checkIfInUse(Game.spawns.Spawn1.room, FIND_SOURCES, null, util.HARVEST);
        expect(resource.id).toBe("Source2");
    });
    it("Util should find current resource not in use", function() {
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source1'}}, Game.rooms.Room1);
        Game.creeps['Harvester2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester2",
            {memory: {role: 'harvester', currentOrder: 'MOVE:Source2'}}, Game.rooms.Room1);
        main.loop();
        let resource = util.checkIfInUse(Game.spawns.Spawn1.room, FIND_SOURCES, Game.creeps['Harvester2'], util.HARVEST);
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
        main.loop();
        let resource = util.checkIfInUse(Game.spawns.Spawn1.room, FIND_SOURCES, Game.creeps['Harvester3'], util.HARVEST);
        expect(resource.id).toBe("Source3");
    });
});