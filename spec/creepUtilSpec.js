let creepUtil = require('../src/creep.util');

describe("Creep Util Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
    });

    it("Creep util should build best role with available energy", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.HARVESTER, 400);
        expect(creep.bodyArray.length).toBeGreaterThan(4);
    });
});