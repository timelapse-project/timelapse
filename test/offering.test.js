const { BN, ether, expectRevert } = require('@openzeppelin/test-helpers');
const expectEvent = require('@openzeppelin/test-helpers/src/expectEvent');
const { expect } = require('chai');
const Offering = artifacts.require("Offering");

contract("Offering", function(accounts) {
    const id1 = "0xf3e7C248B23020Bc1C81abac31a1Fd88A7860f73";
    const description = "Test one two";

    describe("Début des tests pour Offering", function() {
        beforeEach(async function() {
            this.OfferingInstance = await Offering.new();
        });

        describe("Zone 1", function() {
            it("Ajout d'une proposal", async function() {
                await this.OfferingInstance.addPackage(id1, 2, description);
                let proposals = await this.OfferingInstance.packages(0);
                expect(proposals[2]).to.be.equal(description);
            });
        });

        describe("Zone 1", function() {

        });
    });
});