module.exports = {
    roles: {
        HARVESTER: "harvester",
        BUILDER: 'builder',
        UPGRADER: 'upgrader',
        MINER: 'miner',
        COURIER: 'courier',
    },
    parts: {
        WORK: {type: "work", hits: 100, buildCost: 100},
        CARRY: {type: "carry", hits: 100, buildCost: 50},
        MOVE: {type: "move", hits: 100, buildCost: 50},
        ATTACK: {type: "attack", hits: 100, buildCost: 80},
        RANGED_ATTACK: {type: "ranged_attack", hits: 100, buildCost: 150},
        HEAL: {type: "heal", hits: 100, buildCost: 250},
        CLAIM: {type: "claim", hits: 100, buildCost: 600},
        TOUGH: {type: "tough", hits: 100, buildCost: 10},
    },
    buildBestCreep: function(type, energy) {
        let partCount = {
            "work": 0,
            "carry": 0,
            "move": 0,
            "attack": 0,
            "ranged_attack": 0,
            "heal": 0,
            "claim": 0,
            "tough": 0
        };
        let bodyArray = [];
        let energyRemaining = energy;
        while (energyRemaining > 10) {
            if (type === this.roles.BUILDER ||
                    type === this.roles.UPGRADER ||
                    type === this.roles.HARVESTER) {
                if (energyRemaining > 99 && partCount.work < partCount.move) {
                    bodyArray.push(WORK);
                    partCount.work++;
                    energyRemaining -= 100;
                    continue;
                } else if (energyRemaining > 49 && partCount.carry < partCount.move) {
                    bodyArray.push(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 49) {
                    bodyArray.push(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 9) {
                    bodyArray.push(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                    continue;
                }
            } else if (type === this.roles.MINER) {
                if (energyRemaining > 49 && partCount.move === 0) {
                    bodyArray.push(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 49 && partCount.carry === 0) {
                    bodyArray.push(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 99 && partCount.work < 7) {
                    bodyArray.push(WORK);
                    partCount.work++;
                    energyRemaining -= 100;
                    continue;
                } else if (energyRemaining > 49) {
                    bodyArray.push(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 9) {
                    bodyArray.push(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                    continue;
                }
            } else if (type === this.roles.COURIER) {
                if (energyRemaining > 49 && partCount.carry < partCount.move * 2) {
                    bodyArray.push(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 49) {
                    bodyArray.push(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                    continue;
                } else if (energyRemaining > 9) {
                    bodyArray.push(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                    continue;
                }
            }
        }
        let memory = { memory: { role: type }};
        if (type === this.roles.BUILDER) {
            memory.memory.harvesting = true;
        }
        return {
            bodyArray: bodyArray,
            memory: memory,
        };
    },
};