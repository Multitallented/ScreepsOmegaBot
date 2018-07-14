module.exports = function(name, controller) {
    return {
        entities: {
            111: [],
            105: [],
            107: [],
            101: [],
        },
        controller: controller,
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        memory: {},
        name: name,
        storage: undefined,
        terminal: undefined,
        visual: {
            text: function(message, x, y, options) {}
        },
        createConstructionSite: function(x, y, structureType, name) {

        },
        lookAt: function(x, y) {

        },
        lookAtArea: function(top, left, bottom, right, isArray) {
            return [ { x: left, y: top, type: 'terrain', terrain: 'plain' } ]
        },
        getPositionAt: function(x, y) {
            return {
                x: x, y: y, room: this,
                findPathTo: function(position) {
                    return [];
                }
            }
        },
        createFlag: function(x, y, name, color, secondaryColor) {
            //only visible to me
        },
        findExitTo: function(room) {
            return FIND_EXIT_TOP;
        },
        find: function(entityType, options) {
            let returnArray = [];
            _.forEach(this.entities[entityType], (entity) => {
                if (options !== undefined && options.filter !== undefined) {
                    if (options.filter(entity)) {
                        returnArray.push(entity);
                    }
                } else {
                    returnArray.push(entity);
                }
            });
            return returnArray;
        },
    };
};