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
        let count = 0;
        console.log("Controller Level: " + Game.rooms.Room1.memory.controllerLevel);
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
            count++;
        }
        console.log("Controller Level: " + Game.rooms.Room1.memory.controllerLevel);
        console.log("Count: " + count);
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        });
    });
    it("Output should contain storage", function() {
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasStorage = false;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_STORAGE) {
                hasStorage = true;
            }
        });
        expect(hasStorage).toBe(true);
    });
    it("Output should not contain storage", function() {
        Game.rooms.Room1.entities[107].push(
            require('./mocks/structure')('Storage1', 25, 25, STRUCTURE_STORAGE, Game.rooms.Room1)
        );
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasStorage = false;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_STORAGE) {
                hasStorage = true;
            }
        });
        expect(hasStorage).toBe(false);
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
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasSpawn = false;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_SPAWN) {
                hasSpawn = true;
            }
        });
        expect(hasSpawn).toBe(true);
    });
    it("Output should not have 2 spawn", function() {
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasSpawn = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
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