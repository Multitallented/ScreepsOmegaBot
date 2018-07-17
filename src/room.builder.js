var Util = require('./util');

module.exports = {
    buildRoom: function(room) {
        let controllerLevel = room.controller ? room.controller.level : 0;
        if (room.memory && room.memory.controllerLevel === controllerLevel) {
            return;
        }
        let centerFlag = room.find(FIND_FLAGS, {filter: (f) => {
                return f.name && (f.name.indexOf('Claimed') !== -1 ||
                    f.name.indexOf('Unclaimed') !== -1);
            }});
        if (centerFlag.length && centerFlag[0] !== undefined && centerFlag !== null) {
            centerFlag[0].remove();
        }

        let constructionSites = [];
        let siteLocations = {};
        let siteCounts = {};
        let saveAndQuit = false;
        if (room.memory.constructionSites) {
            constructionSites = room.memory.constructionSites;
        }
        if (room.memory.siteLocations) {
            siteLocations = room.memory.siteLocations;
        }
        if (room.memory.siteCounts) {
            siteCounts = room.memory.siteCounts;
        }

        this.updateCache(room, siteLocations, siteCounts, constructionSites);

        let sources = room.find(FIND_SOURCES);
        let importantStructures = room.find(FIND_STRUCTURES, {filter: (s) => {
            if (s.structureType && s.my) {
                siteLocations[s.pos.x + ":" + s.pos.y] = { type: s.structureType, pos: s.pos };
            }
            return s.my && s.structureType && (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER ||
                s.structureType === STRUCTURE_STORAGE);
            }});

        let containerCount = siteCounts[STRUCTURE_CONTAINER] ? siteCounts[STRUCTURE_CONTAINER] : 0;
        if (sources.length > containerCount) {
            saveAndQuit = this.getContainers(constructionSites, room, sources, siteCounts, siteLocations);
            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }

        let pointsOfImportance = _.merge(sources, importantStructures);
        pointsOfImportance.push(room.controller);


        let centerOfInterest = this.getCenterOfArray(pointsOfImportance);
        let towerCount = siteCounts[STRUCTURE_TOWER] ? siteCounts[STRUCTURE_TOWER] : 0;
        for (let i=0; i<6 - towerCount; i++) {
            saveAndQuit = this.getPositionWithBuffer(room, centerOfInterest.x, centerOfInterest.y,
                38 - 2 * Math.max(Math.abs(centerOfInterest.x - 25), Math.abs(centerOfInterest.y - 25)), 0, STRUCTURE_TOWER,
                pointsOfImportance, siteCounts, siteLocations, constructionSites);

            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }

        if (!siteCounts[STRUCTURE_STORAGE]) {
            saveAndQuit = this.getPositionWithBuffer(room, 25, 25, 38, 0, STRUCTURE_STORAGE, pointsOfImportance, siteCounts, siteLocations, constructionSites);

            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }

        let spawnCount = siteCounts[STRUCTURE_SPAWN] ? siteCounts[STRUCTURE_SPAWN] : 0;
        for (let i=0; i<3 - spawnCount; i++) {
            saveAndQuit = this.getPositionWithBuffer(room, 25, 25, 38, 1, STRUCTURE_SPAWN, pointsOfImportance, siteCounts,
                siteLocations, constructionSites);

            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }
        let spawns = _.filter(constructionSites, (site) => {
            return site.type === STRUCTURE_SPAWN;
        });

        saveAndQuit = this.getRoadsAndRamparts(constructionSites, room, sources[0], spawns[0], siteCounts, siteLocations);
        if (saveAndQuit) {
            this.saveToCache(room, siteCounts, siteLocations, constructionSites);
            return;
        }

        if (sources.length > 2) {
            saveAndQuit = this.getRoadsAndRamparts(constructionSites, room, sources[0], sources[1], siteCounts, siteLocations);
            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
            saveAndQuit = this.getRoadsAndRamparts(constructionSites, room, sources[1], spawns[0], siteCounts, siteLocations);
            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }


        // saveAndQuit = this.getWalls(room, siteCounts, siteLocations, constructionSites);
        // if (saveAndQuit) {
        //     this.saveToCache(room, siteCounts, siteLocations, constructionSites);
        //     return;
        // }

        let extensionCount = siteCounts[STRUCTURE_EXTENSION] ? siteCounts[STRUCTURE_EXTENSION] : 0;
        for (let i=0; i< 60 - extensionCount; i++) {
            saveAndQuit = this.getPositionWithBuffer(room, 25, 25, 38, 1, STRUCTURE_EXTENSION, pointsOfImportance,
                siteCounts, siteLocations, constructionSites);
            if (saveAndQuit) {
                this.saveToCache(room, siteCounts, siteLocations, constructionSites);
                return;
            }
        }

        let structureCount = {};
        constructionSites = _.filter(constructionSites, (site) => {
            let type = site.type ? site.type : site.structureType;
            if (!structureCount[type]) {
                structureCount[type] = 1;
            } else {
                structureCount[type]++;
            }
            if (CONTROLLER_STRUCTURES[type]) {
                return structureCount[type] <= CONTROLLER_STRUCTURES[type][controllerLevel];
            }
            return true;
        });

        constructionSites = _.sortBy(constructionSites, (site) => { return this.getTypeRanking(site.type); });

        // console.log(constructionSites.length);
        // _.forEach(constructionSites, (site) => {
        //     console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        // });
        siteCounts = {};
        siteLocations = {};
        this.saveToCache(room, siteCounts, siteLocations, constructionSites);
        room.memory.controllerLevel = controllerLevel;
    },

    updateCache: function(room, siteLocations, siteCounts, constructionSites) {
        _.forEach(room.find(FIND_STRUCTURES), (structure) => {
            if (!structure.my && structure.owner && structure.owner.username !== 'Multitallented') {
                structure.destroy();
                return;
            }

            if (siteLocations[structure.pos.x + ":" + structure.pos.y] &&
                siteLocations[structure.pos.x + ":" + structure.pos.y].type === structure.structureType) {
                return;
            }

            if (siteCounts[structure.structureType]) {
                siteCounts[structure.structureType] = 1;
            } else {
                siteCounts[structure.structureType]++;
            }
            let currentSite = {
                pos: {x: structure.pos.x, y: structure.pos.y}, type: structure.structureType,
            };
            siteLocations[structure.pos.x + ":" + structure.pos.y] = currentSite;
            constructionSites.push(currentSite);
        });
    },

    saveToCache: function(room, siteCounts, siteLocations, constructionSites) {
        room.memory.siteCounts = siteCounts;
        room.memory.siteLocations = siteLocations;
        room.memory.constructionSites = constructionSites;
    },

    getRoadsAndRamparts: function(constructionSites, room, point1, point2, siteCounts, siteLocations) {
        let saveAndQuit = false;
        if (point1 === point2 || point1.pos === undefined || point2.pos === undefined ||
                point1.pos === null || point2.pos === null) {
            return;
        }
        let pos1 = room.getPositionAt(point1.pos.x, point1.pos.y);
        let pos2 = room.getPositionAt(point2.pos.x, point2.pos.y);
        _.forEach(pos1.findPathTo(pos2), (roadPos) => {
            let isWall = roadPos.x === 4 || roadPos.x === 46 || roadPos.y === 4 || roadPos.y === 46;
            if (isWall) {
                let newSite = {type: STRUCTURE_RAMPART, pos: {x: roadPos.x, y: roadPos.y}};
                siteLocations[roadPos.x + ":" + roadPos.y] = newSite;
                constructionSites.push(newSite);
                saveAndQuit = true;
            } else if (!siteLocations[roadPos.x + ":" + roadPos.y] &&
                    !_.filter(room.lookAt(roadPos.x, roadPos.y), (c) => {
                    return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall');
                    }).length) {
                let newSite = {type: STRUCTURE_ROAD, pos: {x: roadPos.x, y: roadPos.y}};
                siteLocations[roadPos.x + ":" + roadPos.y] = newSite;
                constructionSites.push(newSite);
                saveAndQuit = true;
            }
        });
        return saveAndQuit;
    },

    getTypeRanking: function(type) {
        switch(type) {
            case STRUCTURE_SPAWN: return 0;
            case STRUCTURE_TOWER: return 2;
            case STRUCTURE_EXTENSION: return 5;
            case STRUCTURE_CONTAINER: return 10;
            case STRUCTURE_ROAD: return 15;
            case STRUCTURE_WALL:
            case STRUCTURE_RAMPART: return 20;
            case STRUCTURE_STORAGE: return 30;
            default: return 40;
        }
    },

    getCenterOfArray: function(array) {
        let maxX = 0;
        let minX = 50;
        let maxY = 0;
        let minY = 50;
        _.forEach(array, (entity) => {
            maxX = entity.pos.x > maxX ? entity.pos.x : maxX;
            minX = entity.pos.x < minX ? entity.pos.x : minX;
            maxY = entity.pos.y > maxY ? entity.pos.y : maxY;
            minY = entity.pos.y < minY ? entity.pos.y : minY;
        });
        return {
            x: minX + Math.floor(Math.abs(maxX - minX) / array.length),
            y: minY + Math.floor(Math.abs(maxY - minY) / array.length),
        }
    },

    getPositionWithBuffer: function(room, x, y, size, buffer, type, pointsOfImportance, siteCounts, siteLocations, constructionSites) {
        this.loopFromCenter(x, y, size, (x, y) => {
            let positionOk = true;
            if (buffer > 0) {
                this.loopFromCenter(x, y, 1 + 2 * buffer, (x, y) => {
                    if (siteLocations[x + ":" + y] || _.filter(room.lookAt(x, y), (c) => {
                            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
                        positionOk = false;
                        return true;
                    }
                });
            } else {
                if (siteLocations[x + ":" + y] || _.filter(room.lookAt(x, y), (c) => {
                        return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length) {
                    positionOk = false;
                }
            }
            if (positionOk) {
                if (siteCounts[type]) {
                    siteCounts[type]++;
                } else {
                    siteCounts[type] = 1;
                }
                let newSite = {type: type, pos: {x: x, y: y}};
                siteLocations[x + ":" + y] = newSite;
                constructionSites.push(newSite);
                if (pointsOfImportance) {
                    pointsOfImportance.push(newSite);
                }
                return true;
            }
        });
        return true;
    },

    loopFromCenter: function(x, y, size, callback) {
        let d = 3;
        let c = 0;
        let s = 1;

        for (let k=1;k<=(size - 1); k++) {
            for (let j=0; j < (k<(size-1) ? 2 : 3); j++) {
                for (let i=0; i<s; i++) {
                    if (callback(x, y)) {
                        return;
                    }

                    c++;
                    switch (d) {
                        case 0: y = y+1; break;
                        case 1: x = x+1; break;
                        case 2: y = y-1; break;
                        case 3: x = x-1; break;
                    }
                }
                d = (d+1)%4;
            }
            s = s+1;
        }
        callback(x, y);
    },

    getWalls: function(room, siteCounts, siteLocations, constructionSites) {
        let saveAndQuit = false;
        for (let x=4; x<46; x++) {
            saveAndQuit = saveAndQuit ? saveAndQuit : this.checkWall(x, 4, room, siteCounts, siteLocations, constructionSites);
            saveAndQuit = saveAndQuit ? saveAndQuit : this.checkWall(x, 46, room, siteCounts, siteLocations, constructionSites);
        }
        for (let y=4; y<46; y++) {
            saveAndQuit = saveAndQuit ? saveAndQuit : this.checkWall(4, y, room, siteCounts, siteLocations, constructionSites);
            saveAndQuit = saveAndQuit ? saveAndQuit : this.checkWall(46, y, room, siteCounts, siteLocations, constructionSites);
        }
        return saveAndQuit;
    },

    checkWall: function(x, y, room, siteCounts, siteLocations, constructionSites) {
        if (!siteLocations[x + ":" + y] &&
                !_.filter(room.lookAt(x, y), (c) => {
                    return c.type === 'terrain' && c.terrain === 'wall';
                }).length) {
            let newSite = {type: STRUCTURE_WALL, pos: {x: x, y: y}};
            constructionSites.push(newSite);
            siteLocations[x + ":" + y] = newSite;
            return true;
        }
        return false;
    },

    getContainers: function(constructionSites, room, sources, siteCounts, siteLocations) {
        let saveAndQuit = false;
        sources.push(room.controller);
        _.forEach(sources, (source) => {
            if (saveAndQuit) {
                return;
            }
            let hasContainer = _.filter(room.lookAtArea(source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true), (c) => {
                return c.type === 'structure' && c.structure.structureType === STRUCTURE_CONTAINER;
            }).length;
            _.forEach(_.filter(room.lookAtArea(source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true), (c) => {
                return c.type === 'terrain' && c.terrain !== 'wall';
            }), (c) => {
                if (hasContainer || siteLocations[c.x + ":" + c.y]) {
                    return;
                }
                if (_.filter(room.lookAt(c.x, c.y), (terrain) => {
                    return terrain.type === 'structure';
                }).length) {
                    return;
                }
                siteLocations[c.x + ":" + c.y] = STRUCTURE_CONTAINER;
                if (siteCounts[STRUCTURE_CONTAINER]) {
                    siteCounts[STRUCTURE_CONTAINER]++;
                } else {
                    siteCounts[STRUCTURE_CONTAINER] = 1;
                }
                constructionSites.push({type: STRUCTURE_CONTAINER, pos: {x: c.x, y: c.y}});
                hasContainer = true;
                saveAndQuit = true;
            });
        });
        return saveAndQuit;
    }
};