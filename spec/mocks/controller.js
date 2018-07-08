module.exports = function(id) {
    return {
        id: id,
        safeMode: undefined,
        safeModeAvailable: 2,
        safeModeCooldown: undefined,
        activateSafeMode: function() {
            this.safeMode = 3000;
            this.safeModeAvailable -= 1;
            this.safeModeCooldown = 10000;
        }
    };
};