let roomBuilder = require('../src/room.builder');

describe("Room Builder tests", function() {
    let controllerLevel = 2;

    beforeEach(function() {
        require('./mocks/game')();
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('./mocks/source')("Source1",14,13,Game.rooms.Room1)
        );
        Game.rooms.Room1.entities[FIND_SOURCES].push(
            require('./mocks/source')("Source2",11,25,Game.rooms.Room1)
        );
        Game.rooms.Room1.entities[FIND_STRUCTURES].push(
            require('./mocks/structuretypes/structure-container')('Container1', 11,26, Game.rooms.Room1)
        )
    });

    it("Init tests", function() {
        Game.rooms.Room1.controller.level = 1;
        while (Game.rooms.Room1.memory.controllerLevel < 1) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        Game.rooms.Room1.memory.constructionSites = [];
        Game.rooms.Room1.controller.level = 2;
        while (Game.rooms.Room1.memory.controllerLevel < 2) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        Game.rooms.Room1.memory.constructionSites = [];
        Game.rooms.Room1.controller.level = 3;
        while (Game.rooms.Room1.memory.controllerLevel < 3) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        console.log(Game.rooms.Room1.memory.constructionSites.length);
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        });
    });

    it("There should only be 2 containers", function() {
        Game.rooms.Room1.controller.level = 3;
        while (Game.rooms.Room1.memory.controllerLevel < 3) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let containerCount = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_CONTAINER) {
                containerCount++;
            }
        });
        expect(containerCount).toBe(2);
    });

    it("There should be no extensions in level 1", function() {
        Game.rooms.Room1.controller.level = 1;
        while (Game.rooms.Room1.memory.controllerLevel < 1) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = false;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_EXTENSION) {
                hasExtension = true;
            }
        });
        expect(hasExtension).toBe(false);
    });
    it("Dont build a spawn if one already exists", function() {
        Game.rooms.Room1.controller.level = 1;
        while (Game.rooms.Room1.memory.controllerLevel < 1) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = false;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            console.log(site.type);
            if (site.type === STRUCTURE_SPAWN) {
                hasExtension = true;
            }
        });
        expect(hasExtension).toBe(false);
    });
    it("There should be 5 extensions in level 2", function() {
        Game.rooms.Room1.controller.level = 2;
        while (Game.rooms.Room1.memory.controllerLevel < 2) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_EXTENSION) {
                hasExtension++;
            }
        });
        expect(hasExtension).toBe(5);
    });
    it("There should be 10 extensions in level 3", function() {
        Game.rooms.Room1.controller.level = 3;
        while (Game.rooms.Room1.memory.controllerLevel < 3) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_EXTENSION) {
                hasExtension++;
            }
        });
        expect(hasExtension).toBe(10);
    });
    it("There should be 20 extensions in level 4", function() {
        Game.rooms.Room1.controller.level = 4;
        while (Game.rooms.Room1.memory.controllerLevel < 4) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_EXTENSION) {
                hasExtension++;
            }
        });
        expect(hasExtension).toBe(20);
    });
    it("There should be 30 extensions in level 5", function() {
        Game.rooms.Room1.controller.level = 5;
        while (Game.rooms.Room1.memory.controllerLevel < 5) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasExtension = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_EXTENSION) {
                hasExtension++;
            }
        });
        expect(hasExtension).toBe(30);
    });

    // it("Output should contain storage", function() {
    //     while (Game.rooms.Room1.memory.controllerLevel < controllerLevel) {
    //         roomBuilder.buildRoom(Game.rooms.Room1);
    //     }
    //     let hasStorage = false;
    //     _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
    //         if (site.type === STRUCTURE_STORAGE) {
    //             hasStorage = true;
    //         }
    //     });
    //     expect(hasStorage).toBe(true);
    // });
    it("Output should not contain storage", function() {
        Game.rooms.Room1.entities[107].push(
            require('./mocks/structure')('Storage1', 30, 25, STRUCTURE_STORAGE, Game.rooms.Room1)
        );
        while (Game.rooms.Room1.memory.controllerLevel < controllerLevel) {
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

    // it("Output should contain spawn", function() {
    //     while (Game.rooms.Room1.memory.controllerLevel < controllerLevel) {
    //         roomBuilder.buildRoom(Game.rooms.Room1);
    //     }
    //     let hasSpawn = false;
    //     _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
    //         if (site.type === STRUCTURE_SPAWN) {
    //             hasSpawn = true;
    //         }
    //     });
    //     expect(hasSpawn).toBe(true);
    // });
    it("Output should not have 2 spawn", function() {
        while (Game.rooms.Room1.memory.controllerLevel < controllerLevel) {
            roomBuilder.buildRoom(Game.rooms.Room1);
        }
        let hasSpawn = 0;
        _.forEach(Game.rooms.Room1.memory.constructionSites, (site) => {
            if (site.type === STRUCTURE_SPAWN) {
                hasSpawn++;
            }
        });
        expect(hasSpawn).toBeLessThan(2);
    });

    it("loop from center should length 9", function() {
        let counter = 0;
        roomBuilder.loopFromCenter(26, 26, 3, (x, y) => {
            counter++;
        });
        expect(counter).toBe(9);
    });
});