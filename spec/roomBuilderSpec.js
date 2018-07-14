let roomBuilder = require('../src/room.builder');

describe("Room Builder tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
    });

    it("Init tests", function() {
        let constructionSites = roomBuilder.buildRoom(Game.rooms.Room1);
        _.forEach(constructionSites, (site) => {
            console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        });
    });
});