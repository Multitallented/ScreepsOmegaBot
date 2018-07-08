var respawn = require('../src/respawn');
var util = require('../src/util');

describe("Respawn Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
    });

    it("Respawn Should be Variable", function() {
        let room = require('./mocks/room')();
        Game.creeps['Upgrader1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader2", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader3'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader3", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Upgrader4'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader4", {memory: {role: 'upgrader'}}, room);
        respawn.run({"harvester": 1, "upgrader": 4, "builder": 0});
        expect(util.countCreeps().harvester).toBe(1);
    });

    it("Respawn should build bigger creeps if energy available", function() {

    });
});