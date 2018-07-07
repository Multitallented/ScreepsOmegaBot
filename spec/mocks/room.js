module.exports = function(name, controller) {
    return {
        entities: {
            FIND_CONSTRUCTION_SITES: {},
            FIND_SOURCES: {},
            FIND_STRUCTURES: {}
        },
        controller: controller,
        energyAvailable: function() {
            return 0;
        },
        energyCapacityAvailable: function () {
            return 0;
        },
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
            for (let entityKey in this.entities[entityType]) {
                if (!entityKey || !this.entities[entityType].hasOwnProperty(entityKey)) {
                    continue;
                }
                returnArray.push(this.entities[entityType][entityKey]);

            }
            return returnArray;
        },
    };
};