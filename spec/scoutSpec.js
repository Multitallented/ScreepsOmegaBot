const scoutScript = require('../src/role.scout');

describe("Scout tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms['N4W3'] = require('./mocks/room')('N4W3', require('./mocks/controller')('Controller1'));
        Game.rooms['N4W2'] = require('./mocks/room')('N4W2', require('./mocks/controller')('Controller2'));
        Game.rooms['N4W4'] = require('./mocks/room')('N4W4', require('./mocks/controller')('Controller3'));
        Game.rooms['N3W3'] = require('./mocks/room')('N3W3', require('./mocks/controller')('Controller4'));
        Game.rooms['N5W3'] = require('./mocks/room')('N5W3', require('./mocks/controller')('Controller5'));
    });

    it("room should find adjacent room", function() {
        expect(scoutScript.getRoomName('N4W3', FIND_EXIT_TOP)).toBe('N3W3');
        expect(scoutScript.getRoomName('N4W3', FIND_EXIT_RIGHT)).toBe('N4W4');
    });
});