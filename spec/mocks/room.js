module.exports = function(name, controller) {
    return {
        entities: {
            FIND_CONSTRUCTION_SITES: [],
            FIND_SOURCES: [],
            FIND_STRUCTURES: [],
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
        createFlag: function(x, y, name, color, secondaryColor) {
            //only visible to me
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