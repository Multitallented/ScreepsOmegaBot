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
        RESOURCE_ENERGY: 'resourceEnergy',

        //Behavior constants
        FIND_STRUCTURES: 'findStructures',
        ERR_NOT_IN_RANGE: 'errorNotInRange',
        FIND_SOURCES: 'findSources',
        FIND_CONSTRUCTION_SITES: 'findConstructionSites'
    });

    var gameObjects = [];


    var gameSpawns = {};
    gameSpawns.Spawn1 = require('./spawn')();

    // Game properties
    global.Game = {
        creeps: {},
        flags: {},
        rooms: {},
        structures: {},
        spawns: gameSpawns,
        time: Math.floor(new Date().getTime() / 1000),
        getObjectById: function(id) {

            return gameObjects[id];
        }
    };

    // Game's memory properties
    global.Memory = {
        creeps: {},
        spawns: {},
        rooms: {}
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