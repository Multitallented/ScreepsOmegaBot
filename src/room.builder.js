modules.export = {
    buildRoom: function(room) {
        let centerFlag = room.find(FIND_FLAGS, {filter: (f) => {
                return flag.name && (flag.name.indexOf('Claimed') !== -1 ||
                    flag.name.indexOf('Unclaimed') !== -1);
            }});
        if (centerFlag.length && centerFlag[0] !== undefined && centerFlag !== null) {
            centerFlag[0].remove();
        }
    }
};