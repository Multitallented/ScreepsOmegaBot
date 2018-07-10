module.exports = function () {
    // Require lodash
    global._ = require('lodash');

    // Merge constants into global.
    global = _.merge(global, {
        TOP: 1,
        TOP_RIGHT: 2,
        RIGHT: 3,
        BOTTOM_RIGHT: 4,
        BOTTOM: 5,
        BOTTOM_LEFT: 6,
        LEFT: 7,
        TOP_LEFT: 8,

        LOOK_CREEPS: "creep",
        LOOK_ENERGY: "energy",
        LOOK_RESOURCES: "resource",
        LOOK_SOURCES: "source",
        LOOK_MINERALS: "mineral",
        LOOK_STRUCTURES: "structure",
        LOOK_FLAGS: "flag",
        LOOK_CONSTRUCTION_SITES: "constructionSite",
        LOOK_NUKES: "nuke",
        LOOK_TERRAIN: "terrain",

        STRUCTURE_CONTAINER: 'container',
        STRUCTURE_CONTROLLER: 'controller',
        STRUCTURE_EXTENSION: 'extension',
        STRUCTURE_KEEPER_LAIR: 'keeperLair',
        STRUCTURE_LINK: 'link',
        STRUCTURE_NUKER: 'nuker',
        STRUCTURE_OBSERVER: 'observer',
        STRUCTURE_PORTAL: 'portal',
        STRUCTURE_POWER_BANK: 'powerBank',
        STRUCTURE_POWER_SPAWN: 'powerSpawn',
        STRUCTURE_RAMPART: 'rampart',
        STRUCTURE_ROAD: 'road',
        STRUCTURE_SPAWN: 'spawn',
        STRUCTURE_STORAGE: 'storage',
        STRUCTURE_TOWER: 'tower',
        STRUCTURE_WALL: 'constructedWall',

        WORK: {type: "work", hits: 100, buildCost: 100},
        CARRY: {type: "carry", hits: 100, buildCost: 50},
        MOVE: {type: "move", hits: 100, buildCost: 50},
        ATTACK: {type: "attack", hits: 100, buildCost: 80},
        RANGED_ATTACK: {type: "ranged_attack", hits: 100, buildCost: 150},
        HEAL: {type: "heal", hits: 100, buildCost: 250},
        CLAIM: {type: "claim", hits: 100, buildCost: 600},
        TOUGH: {type: "tough", hits: 100, buildCost: 10},

        //resources
        RESOURCE_ENERGY: 'energy',

        //ERRORS
        OK: 0,
        ERR_FULL: -8,
        ERR_NOT_IN_RANGE: -9,

        //FIND constants
        FIND_STRUCTURES: 'FIND_STRUCTURES',
        FIND_SOURCES: 'FIND_SOURCES',
        FIND_CONSTRUCTION_SITES: 'FIND_CONSTRUCTION_SITES',
        FIND_HOSTILE_CREEPS: 'FIND_HOSTILE_CREEPS',
        FIND_CREEPS: 'FIND_CREEPS',
        FIND_EXIT_TOP: 'FIND_EXIT_TOP',
        FIND_EXIT_LEFT: 'FIND_EXIT_LEFT',
        FIND_EXIT_RIGHT: 'FIND_EXIT_RIGHT',
        FIND_EXIT_BOTTOM: 'FIND_EXIT_BOTTOM',
    });

    let gameObjects = [];


    let controller1 = require('./controller')('Controller1');
    let room1 = require('./room')('Room1', controller1);
    let gameSpawns = {};
    gameSpawns.Spawn1 = require('./structuretypes/structure-spawn')('Spawn1', 12, 25, room1);

    // Game properties
    global.Game = {
        creeps: {},
        flags: {},
        rooms: {"Room1": room1},
        structures: {},
        spawns: gameSpawns,
        time: Math.floor(new Date().getTime() / 1000),
        getObjectById: function(id) {
            gameObjects =  _.merge(gameObjects, this.creeps);
            gameObjects =  _.merge(gameObjects, this.rooms);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_CONSTRUCTION_SITES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_STRUCTURES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_SOURCES);
            gameObjects =  _.merge(gameObjects, this.rooms.Room1.entities.FIND_CREEPS);
            let returnArray = {};
            _.forEach(gameObjects, (object) => {
                if (object.id) {
                    returnArray[object.id] = object;
                } else if (object.name) {
                    returnArray[object.name] = object;
                }
            });
            return returnArray[id];
        }
    };

    // Game's memory properties
    global.Memory = {
        creeps: {},
        spawns: {},
        rooms: {
            "Room1": room1
        }
    };

    global.Map = function () {};

    var roomCount = 0;
    global.Room = function () {
        this.name = 'TestingRoom' + (++roomCount);
        this.memory = {}
    };

    global.RoomPosition = function (x, y, roomName) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;

    };
    global.RoomPosition.prototype.lookFor = function () {};

    var sourceCount = 0;
    global.Source = function () {
        this.id = 'TestingSource' + (++sourceCount);
    };
};