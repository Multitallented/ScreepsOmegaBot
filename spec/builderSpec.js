var main = require('../src/main');

describe("Builder Tests", function() {

    beforeEach(function() {
        require('./mocks/game')();
        Game.creeps['Harvester1'] = require('./mocks/creep')([MOVE, WORK, CARRY], {role: 'harvester'});
        Game.creeps['Builder1'] = require('./mocks/creep')([MOVE, WORK, CARRY], {role: 'builder'});
    });

    it("builder should be spawned", function() {
        main.loop();
        expect(Game.creeps['Builder1']).not().toEqual(null);
    });
});