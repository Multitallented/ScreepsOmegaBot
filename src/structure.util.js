module.exports = {
    getRepairPoints: function() {
        let repairPoints = {};
        repairPoints[STRUCTURE_RAMPART] = {
            repairAt: 200000,
            repairUntil: 300000,
        };
        repairPoints[STRUCTURE_WALL] = {
            repairAt: 200000,
            repairUntil: 300000,
        };
        repairPoints[STRUCTURE_CONTAINER] = {
            repairAt: 100000,
            repairUntil: 250000,
        };
        repairPoints[STRUCTURE_ROAD] = {
            repairAt: 500,
            repairUntil: 9999999,
        };

        return {
            repairPoints: repairPoints,
        };
    }
};