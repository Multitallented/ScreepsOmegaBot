var respawn = require('../src/respawn');
var main = require("../src/main");
var util = require('../src/util');

describe("Respawn Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
        Game.creeps['Upgrader1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}});
        Game.creeps['Upgrader2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader2", {memory: {role: 'upgrader'}});
        Game.creeps['Upgrader3'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader3", {memory: {role: 'upgrader'}});
        Game.creeps['Upgrader4'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader4", {memory: {role: 'upgrader'}});
    });

    it("Respawn Should be Variable", function() {
        respawn.run({"harvester": 1, "upgrader": 4, "builder": 0});
        expect(util.countCreeps().harvester).toBe(1);
    });
});