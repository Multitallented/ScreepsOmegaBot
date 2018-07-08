var main = require('../src/main');

describe("Main Loop execution", function() {

	beforeEach(function() {
		require('./mocks/game.js')();
	});

	it("loop should run", function() {
		main.loop();
	});
});