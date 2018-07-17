let main = require('../src/main');
let Util = require('../src/util/util');

describe("Main Loop execution", function() {

    beforeEach(function() {
        require('./mocks/game')();
    });

    it("loop should run", function() {
        main.loop();
    });

    it("builder max should be zero", function() {
        let controller = require('./mocks/controller')('Controller1');
        let room = require('./mocks/room')('Room1', controller);
        Game.creeps['Upgrader1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, room);
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester1", {memory: {role: 'harvester'}}, room);
        Game.creeps['Harvester2'] = require('./mocks/creep')([MOVE, WORK, CARRY], "Harvester2", {memory: {role: 'harvester'}}, room);
        main.loop();
        expect(Util.countCreeps().builder).toBe(0);
    });

    it("if under attack, safe mode should activate", function() {
        let controller = require('./mocks/controller')('Controller1');
        let room = require('./mocks/room')('Room1', controller);
        let upgrader1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, room);
        //TODO add a hostile to the room
        upgrader1.hits = 45;
        upgrader1.hitsMax = 100;
        Game.creeps['Upgrader1'] = upgrader1;

        main.loop();
        expect(room.controller.safeMode).not.toBe(undefined);
    });
    it("if under attack and safe mode already running, safe mode should not activate", function() {
        let controller = require('./mocks/controller')('Controller1');
        controller.safeModeAvailable = 1;
        controller.safeMode = 1000;
        controller.safeModeCooldown = 999;
        let room = require('./mocks/room')('Room1', controller);
        let upgrader1 = require('./mocks/creep')([MOVE, WORK, CARRY], "Upgrader1", {memory: {role: 'upgrader'}}, room);
        //TODO add a hostile to the room
        upgrader1.hits = 45;
        upgrader1.hitsMax = 100;
        Game.creeps['Upgrader1'] = upgrader1;

        main.loop();
        expect(room.controller.safeMode).toBe(1000);
    });
});