let roomBuilder = require('../src/room.builder');

describe("Room Builder tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('./mocks/source')("Source1",38,10,Game.rooms.Room1)
        );
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('./mocks/source')("Source1",15,22,Game.rooms.Room1)
        );
    });

    it("Init tests", function() {
        let constructionSites = roomBuilder.buildRoom(Game.rooms.Room1);
        _.forEach(constructionSites, (site) => {
            console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        });
    });
    it("Output should contain storage", function() {
        let constructionSites = roomBuilder.buildRoom(Game.rooms.Room1);
        let hasStorage = false;
        _.forEach(constructionSites, (site) => {
            if (site.type === STRUCTURE_STORAGE) {
                hasStorage = true;
            }
        });
        expect(hasStorage).toBe(true);
    });

    it("center should be 30, 20", function() {
        let array = [
            { pos: {x: 25, y: 25 }},
            { pos: {x: 35, y: 15 }}
        ];
        let center = roomBuilder.getCenterOfArray(array);
        expect(center.x).toBe(30);
        expect(center.y).toBe(20);
    });

    it("Output should contain spawn", function() {
        let constructionSites = roomBuilder.buildRoom(Game.rooms.Room1);
        let hasSpawn = false;
        _.forEach(constructionSites, (site) => {
            if (site.type === STRUCTURE_SPAWN) {
                hasSpawn = true;
            }
        });
        expect(hasSpawn).toBe(true);
    });
    it("Output should not have 2 spawn", function() {
        let constructionSites = roomBuilder.buildRoom(Game.rooms.Room1);
        let hasSpawn = 0;
        _.forEach(constructionSites, (site) => {
            if (site.type === STRUCTURE_SPAWN) {
                hasSpawn++;
            }
        });
        expect(hasSpawn).toBe(1);
    });

    it("loop from center should length 9", function() {
        let counter = 0;
        roomBuilder.loopFromCenter(26, 26, 3, (x, y) => {
            counter++;
        });
        expect(counter).toBe(9);
    });
});