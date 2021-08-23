const {mongoRepSet} = require("../test.config");
const {should, expect} = require('chai');

describe('Projects route', function () {
    before(async function () {
        await mongoRepSet().start();
    });

    describe('Create project', function () {
        it('should create a project', function () {

        });
    });
});
