const { BN, ether, expectRevert } = require('@openzeppelin/test-helpers');
const expectEvent = require('@openzeppelin/test-helpers/src/expectEvent');
const { expect } = require('chai');
const Offering = artifacts.require("Offering");

contract("Offering", function(accounts) {
    const owner = accounts[0];

    const minScore = new BN(2);
    const description = "Test one two";

    describe("Début des tests pour Offering", function() {
        beforeEach(async function() {
            this.OfferingInstance = await Offering.new();
        });

        describe("Proposal :", function() {
            it("Ajout d'une proposal", async function() {
                await this.OfferingInstance.addProposal(minScore, description);
                let proposals = await this.OfferingInstance.proposals(0);
                expect(proposals[0]).to.be.bignumber.equal(minScore);
                expect(proposals[1]).to.be.equal(description);
            });

            it("Event : ProposalAdded", async function() {
                ;
                expectEvent(await this.OfferingInstance.addProposal(minScore, description, {from:owner}),
                "ProposalAdded",
                {id: new BN(0), minScoring: minScore, description: description});
            });
        });

        describe("Zone 1", function() {

        });
    });
});