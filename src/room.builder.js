modules.export = {
    buildRoom: function(room) {
        let centerFlag = room.find(FIND_FLAGS, {filter: (f) => {
                return flag.name && (flag.name.indexOf('Claimed') !== -1 ||
                    flag.name.indexOf('Unclaimed') !== -1);
            }});
        if (centerFlag.length && centerFlag[0] !== undefined && centerFlag !== null) {
            centerFlag[0].remove();
        }

        let constructionSites = {};

        let sources = room.find(FIND_SOURCES);
        let importantStructures = room.find(FIND_STRUCTURES, {filter: (s) => {
            return s.structureType && (s.structureType === STRUCTURE_CONTAINER ||
                s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER ||
                s.structureType === STRUCTURE_STORAGE);
            }});

        let pointsOfImportance = _.merge(source, importantStructures);

        this.getContainers(constructionSites, room, sources);
        let spawnPositions = this.getPositionWithBuffer(constructionSites, room, 25, 25, 38, 1, STRUCTURE_SPAWN);

        this.getPositionWithBuffer(constructionSites, room, 25, 25, 38, 1, STRUCTURE_TOWER);
        //TODO extensions
        //TODO storage

        this.getWalls(constructionSites, room);

        //TODO roads/ramparts

        //TODO filter by RCL limits
        //TODO sort by priority
    },

    getCenterOfArray: function(array) {
        let maxX = 0;
        let minX = 50;
        let maxY = 0;
        let minY = 50;
        _.forEach(array, (entity) => {
            maxX = entity.x > maxX ? entity.x : maxX;
            minX = entity.x < minX ? entity.x : minX;
            maxY = entity.y > maxY ? entity.y : maxY;
            minY = entity.y < minY ? entity.y : minY;
        });
        return {
            x: Math.floor(Math.abs(maxX - minX) / array.length),
            y: Math.floor(Math.abs(maxY - minY) / array.length),
        }
    },

    getPositionWithBuffer: function(constructionSites, room, x, y, size, buffer, type) {
        let finalPosition = null;
        this.loopFromCenter(x, y, size, (x, y) => {
            //TODO replace this with another look from center
            let positionOk = true;
            this.loopFromCenter(x, y, 3, (x, y) => {
                if (_.filter(room.lookAt(x,y), (c) => {
                        return c.type === 'structure' || (c.type === 'terrain' && c.terrain === 'wall');
                        }).length && constructionSites[x + ":" + y] !== null) {
                    positionOk = false;
                    return true;
                }
            });
            if (positionOk) {
                constructionSites[x + ":" + y] = type;
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
    },

    getWalls: function(constructionSites, room) {
        for (let x=4; x<46; x++) {
            for (let y=4; y<46; y++) {
                if (!constructionSites[x + ":" + y]) {
                    if (!_.filter(room.lookAt(x, y), (c) => {
                            return c.type === 'terrain' && c.terrain === 'wall';
                            }).length) {
                        constructionSites[x + ":" + y] = STRUCTURE_WALL;
                    }
                }
            }
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
                constructionSites[c.x + ":" + c.y] = STRUCTURE_CONTAINER;
                hasContainer = true;
            });
        });
    }
};