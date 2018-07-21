module.exports = {
    getRepairPoints: function(controllerLevel) {
        let repairPoints = {};
        if (controllerLevel < 4) {
            repairPoints[STRUCTURE_RAMPART] = {
                repairAt: 100000,
                repairUntil: 200000,
            };
            repairPoints[STRUCTURE_WALL] = {
                repairAt: 100000,
                repairUntil: 200000,
            };
        } else {
            repairPoints[STRUCTURE_RAMPART] = {
                repairAt: 200000,
                repairUntil: 300000,
            };
            repairPoints[STRUCTURE_WALL] = {
                repairAt: 200000,
                repairUntil: 300000,
            };
        }
        repairPoints[STRUCTURE_CONTAINER] = {
            repairAt: 100000,
            repairUntil: 250000,
        };
        repairPoints[STRUCTURE_ROAD] = {
            repairAt: 1000,
            repairUntil: 5000,
        };

        return {
            repairPoints: repairPoints,
        };
    }
};