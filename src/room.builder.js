module.exports = {
    buildRoom: function(room) {
        let centerFlag = room.find(FIND_FLAGS, {filter: (f) => {
                return flag.name && (flag.name.indexOf('Claimed') !== -1 ||
                    flag.name.indexOf('Unclaimed') !== -1);
            }});
        if (centerFlag.length && centerFlag[0] !== undefined && centerFlag !== null) {
            centerFlag[0].remove();
        }

        let constructionSites = [];

        let sources = room.find(FIND_SOURCES);
        let importantStructures = room.find(FIND_STRUCTURES, {filter: (s) => {
            return s.structureType && (s.structureType === STRUCTURE_CONTAINER ||
                s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER ||
                s.structureType === STRUCTURE_STORAGE);
            }});

        if (sources.length) {
            this.getContainers(constructionSites, room, sources);
        }

        let pointsOfImportance = _.merge(sources, importantStructures);
        pointsOfImportance.push(room.controller);


        let centerOfInterest = this.getCenterOfArray(pointsOfImportance);
        for (let i=0; i<6; i++) {
            pointsOfImportance.push(this.getPositionWithBuffer(constructionSites, room,
                centerOfInterest.x, centerOfInterest.y,
                38 - 2 * Math.max(Math.abs(centerOfInterest.x - 25), Math.abs(centerOfInterest.y - 25)), 0, STRUCTURE_TOWER));
        }
        pointsOfImportance.push(this.getPositionWithBuffer(constructionSites, room, 25, 25, 38, 0, STRUCTURE_STORAGE));

        for (let i=0; i<3; i++) {
            pointsOfImportance.push(this.getPositionWithBuffer(constructionSites, room, 25, 25, 38, 1, STRUCTURE_SPAWN));
        }

        this.getRoadsAndRamparts(constructionSites, room, pointsOfImportance);

        this.getWalls(constructionSites, room);

        for (let i=0; i< 60; i++) {
            this.getPositionWithBuffer(constructionSites, room, 25, 25, 38, 1, STRUCTURE_EXTENSION);
        }


        let controllerLevel = room.controller.level;
        let structureCount = {};
        constructionSites = _.filter(constructionSites, (site) => {
            let type = site.type ? site.type : site.structureType;
            if (!structureCount[type]) {
                structureCount[type] = 1;
            } else {
                structureCount[type]++;
            }
            return structureCount[type] <= CONTROLLER_STRUCTURES[type][controllerLevel];
        });

        constructionSites = _.sortBy(constructionSites, (site) => { return this.getTypeRanking(site.type); });

        // console.log(constructionSites.length);
        // _.forEach(constructionSites, (site) => {
        //     console.log(site.pos.x + ":" + site.pos.y + " type=" + site.type);
        // });
        return constructionSites;
    },

    getRoadsAndRamparts: function(constructionSites, room, pointsOfImportance) {
        _.forEach(pointsOfImportance, (point1) => {
            _.forEach(pointsOfImportance, (point2) => {
                if (point1 === point2 || point1.pos === undefined || point2.pos === undefined ||
                        point1.pos === null || point2.pos === null) {
                    return;
                }
                let pos1 = room.getPositionAt(point1.pos.x, point1.pos.y);
                let pos2 = room.getPositionAt(point2.pos.x, point2.pos.y);
                _.forEach(pos1.findPathTo(pos2), (roadPos) => {
                    let isWall = roadPos.x === 4 || roadPos.x === 46 || roadPos.y === 4 || roadPos.y === 46;
                    if (isWall) {
                        constructionSites.push({type: STRUCTURE_RAMPART, pos: {x: roadPos.x, y: roadPos.y}});
                    } else if (!_.filter(room.lookAt(roadPos.x, roadPos.y), (c) => {
                            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall');
                            }).length) {
                        constructionSites.push({type: STRUCTURE_ROAD, pos: {x: roadPos.x, y: roadPos.y}});

                    }
                });
            });
        });
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

    getPositionWithBuffer: function(constructionSites, room, x, y, size, buffer, type) {
        let finalPosition = null;
        this.loopFromCenter(x, y, size, (x, y) => {
            let positionOk = true;
            if (buffer > 0) {
                this.loopFromCenter(x, y, 1 + 2 * buffer, (x, y) => {
                    if (_.filter(room.lookAt(x, y), (c) => {
                            return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length ||
                        _.filter(constructionSites, (site) => { return site.pos.x === x && site.pos.y === y; }).length) {
                        positionOk = false;
                        return true;
                    }
                });
            } else {
                if (_.filter(room.lookAt(x, y), (c) => {
                        return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall'); }).length ||
                    _.filter(constructionSites, (site) => { return site.pos.x === x && site.pos.y === y; }).length) {
                    positionOk = false;
                }
            }
            if (positionOk) {
                constructionSites.push({type: type, pos: {x: x, y: y}});
                finalPosition = { x: x, y: y };
                return true;
            }
        });
        return { structureType: type, pos: finalPosition };
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

    getWalls: function(constructionSites, room) {
        for (let x=4; x<46; x++) {
            this.checkWall(x, 4, room, constructionSites);
            this.checkWall(x, 46, room, constructionSites);
        }
        for (let y=4; y<46; y++) {
            this.checkWall(4, y, room, constructionSites);
            this.checkWall(46, y, room, constructionSites);
        }
    },

    checkWall: function(x, y, room, constructionSites) {
        if (!_.filter(constructionSites, (site) => { return site.pos.x === x && site.pos.y === y; }).length &&
                !_.filter(room.lookAt(x, y), (c) => {
                    return c.type === 'terrain' && c.terrain === 'wall';
                }).length) {
            constructionSites.push({type: STRUCTURE_WALL, pos: {x: x, y: y}});
        }
    },

    getContainers: function(constructionSites, room, sources) {
        _.forEach(sources, (source) => {
            let hasContainer = false;
            _.forEach(_.filter(room.lookAtArea(source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true), (c) => {
                return c.type === 'terrain' && c.terrain !== 'wall';
            }), (c) => {
                if (hasContainer) {
                    return;
                }
                if (_.filter(room.lookAt(c.x, c.y), (terrain) => {
                    return terrain.type === 'structure';
                }).length) {
                    return;
                }
                constructionSites.push({type: STRUCTURE_CONTAINER, pos: {x: c.x, y: c.y}});
                hasContainer = true;
            });
        });
    }
};