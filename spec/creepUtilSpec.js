let creepUtil = require('../src/util/creep.util');

describe("Creep Util Tests", function() {
    beforeEach(function() {
        require('./mocks/game')();
    });

    it("Creep util should build best role with available energy", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.HARVESTER, 400);
        expect(creep.bodyArray.length).toBeGreaterThan(4);
    });

    it("Upgrader should contain WORK, MOVE, and CARRY components", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.UPGRADER, 200);
        expect(creep.bodyArray.indexOf(WORK)).not.toBe(-1);
        expect(creep.bodyArray.indexOf(MOVE)).not.toBe(-1);
        expect(creep.bodyArray.indexOf(CARRY)).not.toBe(-1);
    });

    it("Harvester should contain work components", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.HARVESTER, 500);
        expect(creep.bodyArray.indexOf(WORK)).not.toBe(-1);
    });

    it("Harvester build should contain no work components", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.COURIER, 500);
        expect(creep.bodyArray.indexOf(WORK)).toBe(-1);
    });

    it("Miner build should contain only 1 move component", function() {
        let creep = creepUtil.buildBestCreep(creepUtil.roles.MINER, 500);
        expect(creep.bodyArray.indexOf(WORK)).not.toBe(-1);
        expect(creep.bodyArray.indexOf(MOVE)).toBe(0);
        expect(creep.bodyArray.indexOf(CARRY)).toBe(1);
        creep.bodyArray.splice(1,1);
        expect(creep.bodyArray.indexOf(CARRY)).toBe(-1);
    });
});