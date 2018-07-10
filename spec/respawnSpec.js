var respawn = require('../src/respawn');
var util = require('../src/util');

describe("Respawn Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms.Room1.entities.FIND_STRUCTURES = [
            require('./mocks/structuretypes/structure-spawn')('Spawn1', 12, 25, STRUCTURE_SPAWN)
        ];
    });

    it("Respawn Should be Variable", function() {
        let room = require('./mocks/room')();
        Game.creeps['Upgrader1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader2", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader3'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader3", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader4'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader4", {memory: {role: 'upgrader'}}, room);
        respawn.run();
        expect(util.countCreeps().harvester).toBe(1);
    });

    it("Respawn should build bigger creeps if energy available", function() {
        Game.rooms.Room1.energyAvailable = 600;
        Game.rooms.Room1.entities.FIND_CREEPS.push(require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, Game.rooms.Room1));
        Game.rooms.Room1.entities.FIND_CREEPS.push(require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1", {memory: {role: 'harvester'}}, Game.rooms.Room1));
        Game.rooms.Room1.entities.FIND_CREEPS.push(require('./mocks/creep')([MOVE, WORK, CARRY], "Builder1", {memory: {role: 'builder'}}, Game.rooms.Room1));
        Game.rooms.Room1.energyCapacityAvailable = 600;
        Game.spawns['Spawn1'].room.energyAvailable = 600;
        Game.spawns['Spawn1'].room.energyCapacityAvailable = 600;
        respawn.run();
        expect(Game.spawns['Spawn1'].spawning.body.length).toBeGreaterThan(3);
    });

    it("Respawn should build harvester if none exist and energy at least 200", function() {
        Game.rooms.Room1.energyAvailable = 200;
        Game.rooms.Room1.energyCapacityAvailable = 600;
        Game.spawns['Spawn1'].room.energyAvailable = 200;
        Game.spawns['Spawn1'].room.energyCapacityAvailable = 600;
        respawn.run({'harvester': 1});
        expect(util.countCreeps().harvester).toBe(1);
    });
});