module.exports = {
    roles: {
        HARVESTER: "harvester",
        BUILDER: 'builder',
        UPGRADER: 'upgrader',
        MINER: 'miner',
        COURIER: 'courier',
        CLAIMER: 'claimer',
        SCOUT: 'scout',
        HOMING: 'homing',
        MELEE: 'melee',
        LOOTER: 'looter',
        TANK: 'tank',
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
        if (type === this.roles.MINER) {
            energy = Math.min(energy, 1000);
        } else if (type === this.roles.HARVESTER) {
            energy = Math.min(energy, 600);
        } else if (type === this.roles.SCOUT) {
            energy = Math.min(energy, 1200);
        } else if (type === this.roles.COURIER) {
            energy = Math.min(energy, 400);
        }
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
                type === this.roles.HARVESTER ||
                type === this.roles.SCOUT) {
                if (energyRemaining > 99 && partCount.work < partCount.move) {
                    bodyArray.unshift(WORK);
                    partCount.work++;
                    energyRemaining -= 100;
                } else if (energyRemaining > 49 && partCount.carry < partCount.move) {
                    bodyArray.unshift(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 49) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else {
                    energyRemaining = 0;
                }
            } else if (type === this.roles.MINER) {
                if (energyRemaining > 49 && partCount.move === 0) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 49 && partCount.carry === 0) {
                    bodyArray.unshift(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 99 && partCount.work < 7) {
                    bodyArray.unshift(WORK);
                    partCount.work++;
                    energyRemaining -= 100;
                } else if (energyRemaining > 49) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else {
                    energyRemaining = 0;
                }
            } else if (type === this.roles.COURIER) {
                if (energyRemaining > 49 && partCount.carry < partCount.move * 2) {
                    bodyArray.unshift(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 49) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else {
                    energyRemaining = 0;
                }
            } else if (type === this.roles.CLAIMER) {
                if (energyRemaining > 599 && partCount.claim < 1) {
                    bodyArray.unshift(CLAIM);
                    partCount.claim++;
                    energyRemaining -= 600;
                } else if (energyRemaining > 49) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else {
                    energyRemaining = 0;
                }
            } else if (type === this.roles.MELEE) {
                if (energyRemaining > 79 && partCount.attack < 2) {
                    bodyArray.unshift(ATTACK);
                    partCount.attack++;
                    energyRemaining -= 80;
                } else if (energyRemaining > 49 && partCount.move < bodyArray.length / 2) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                }
                else if (energyRemaining > 249 && partCount.heal < 1) {
                    bodyArray.unshift(HEAL);
                    partCount.heal++;
                    energyRemaining -= 250;
                }
                else if (energyRemaining > 9) {
                    bodyArray.unshift(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                }
            } else if (type === this.roles.LOOTER) {
                if (energyRemaining > 49 && partCount.move < bodyArray.length / 2) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 249 && partCount.heal < 1) {
                    bodyArray.unshift(HEAL);
                    partCount.heal++;
                    energyRemaining -= 250;
                } else if (energyRemaining > 49 && partCount.carry < 3) {
                    bodyArray.unshift(CARRY);
                    partCount.carry++;
                    energyRemaining -= 50;
                } else if (energyRemaining > 9) {
                    bodyArray.unshift(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                }
            } else if (type === this.roles.TANK) {
                if (energyRemaining > 49 && partCount.move < bodyArray.length / 2) {
                    bodyArray.unshift(MOVE);
                    partCount.move++;
                    energyRemaining -= 50;
                }
                // else if (energyRemaining > 249 && partCount.heal < 2) {
                //     bodyArray.unshift(HEAL);
                //     partCount.heal++;
                //     energyRemaining -= 250;
                // }
                else if (energyRemaining > 9) {
                    bodyArray.unshift(TOUGH);
                    partCount.tough++;
                    energyRemaining -= 10;
                }
            }
            // else if (type === this.roles.SCOUT) {
            //     if (energyRemaining > 99 && partCount.work < 1) {
            //         bodyArray.unshift(WORK);
            //         partCount.work++;
            //         energyRemaining -= 100;
            //     } else if (energyRemaining > 49 && (partCount.move < 1 || partCount.move < partCount.tough * 2)) {
            //         bodyArray.unshift(MOVE);
            //         partCount.move++;
            //         energyRemaining -= 50;
            //     } else if (energyRemaining > 49 && partCount.carry === 0) {
            //         bodyArray.unshift(CARRY);
            //         partCount.carry++;
            //         energyRemaining -= 50;
            //     } else if (energyRemaining > 9) {
            //         bodyArray.unshift(TOUGH);
            //         partCount.tough++;
            //         energyRemaining -= 10;
            //     }
            // }
        }
        let memory = { memory: { role: type }};
        return {
            bodyArray: bodyArray,
            memory: memory,
        };
    },
};