const meleeScript = require('../src/roles/war/role.melee');

describe("Melee tests", function() {
    let melee1 = null;
    let spawn1 = null;

    beforeEach(function() {
        require('./mocks/game')();

        melee1 = require('./mocks/creep')([ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE],
                'Melee1', { memory: { role: 'melee'}}, Game.rooms.Room1, 25, 26);
        spawn1 = require('./mocks/structuretypes/structure-spawn')('Spawn1', 25, 25, Game.rooms.Room1);
        Game.rooms.Room1.entities[FIND_STRUCTURES].push(
            spawn1
        );
    });

    it("melee should not attack own spawn or tower", function() {
        meleeScript.run(melee1);
        expect(spawn1.hits).toBe(spawn1.hitsMax);
    });
});