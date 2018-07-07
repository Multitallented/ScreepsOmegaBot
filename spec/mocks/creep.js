module.exports = function(partArray, name, memory) {
    let baseCreep = {
        carry: {
            energy: 0
        },
        carryCapacity: 50*getPartCount(CARRY, partArray),
        room: {
            find: function(entityType) {
                return [];
            },
            controller: {}
        },
        moveTo: function(entity, options) {},
        harvest: function(entity) {},
        transfer: function(entity, itemType) {},
        say: function(message) {},
        build: function() {},
        upgradeController: function() {},
        name: name
    }
    baseCreep = _.merge(baseCreep, memory);
    return baseCreep;
};

function getPartCount(part, partArray) {
    let i=0;
    for (let currentPart in partArray) {
        if (!currentPart || currentPart !== part) {
            continue;
        }
        i++;
    }
    return i;
}