const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Offering = artifacts.require("Offering");

contract("Offering", function (accounts) {
  const owner = accounts[0];

  const phoneHash1 = "0x3ad53d26D15A658A84Fe8cA9FFc8aA3a7240C1a0";
  const ref1 = "EXTERNAL_REFERENCE";

  const timestampA = new BN(1626699313);
  const timestampP = new BN(1626699323);

  const minScore = new BN(1);
  const capital = new BN(500);
  const interest = new BN(50);
  const description = "Test one two";
  const activeStatus = new BN(0);
  const closedStatus = new BN(1);

  const proposalId1 = new BN(0);
  const offerId1 = new BN(0);
  const productId1 = new BN(0);
  const amount1 = new BN(5);

  describe("Début des tests pour Offering", function () {
    beforeEach(async function () {
      this.OfferingInstance = await Offering.new();
    });

    describe("Function: addProposal", async function() {
      it("Revert: addProposal is onlyOwner", async function() {
        await expectRevert(this.OfferingInstance.addProposal(minScore, capital, interest, description, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("addProposal", async function () {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        let proposals = await this.OfferingInstance.proposals(0);
        expect(proposals["minScoring"]).to.be.bignumber.equal(minScore);
        expect(proposals["capital"]).to.be.bignumber.equal(capital);
        expect(proposals["interest"]).to.be.bignumber.equal(interest);
        expect(proposals["description"]).to.be.equal(description);
        expect(proposals["status"]).to.be.bignumber.equal(activeStatus);
      });

      it("Event: ProposalAdded", async function () {
        expectEvent(await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner}),
          "ProposalAdded",
          {idProposal: new BN(0), minScoring: minScore, capital: capital, interest: interest, description: description});
      });
    });

    describe("Function: closedProposal", async function() {
      it("Revert: closedProposal is onlyOwner", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await expectRevert(this.OfferingInstance.closedProposal(0, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("Revert: closedProposal for existing proposal", async function() {
        await expectRevert(this.OfferingInstance.closedProposal(0, {from:owner}),
        "Proposal doesn't exist");
      });

      it("closedProposal", async function () {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.closedProposal(0, {from: owner});
        let proposal = await this.OfferingInstance.proposals(0);
        expect(proposal["status"]).to.be.bignumber.equal(closedStatus);
      });

      it("Event: ClosedProposal for closedProposal", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        expectEvent(await this.OfferingInstance.closedProposal(0, {from: owner}),
        "ClosedProposal",
        {idProposal: new BN(0)});
      })
    });

    describe("Function: proposalsCount", async function() {

    });

    describe("Function: getSizeProposalOffer", async function() {
      
    });

    describe("Function: getIndexProposalOffer", async function() {
      
    });

    describe("Function: lowBalanceOffering", async function() {
      it("Revert: lowBalanceOffering is onlyOwner", async function() {
        await expectRevert(this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("lowBalanceOffering", async function() {
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        const offer = await this.OfferingInstance.offers(0);
        expect(offer["phoneHash"]).to.be.equal(phoneHash1);
        expect(offer["ref"]).to.be.equal(ref1);
        expect(offer["status"]).to.be.bignumber.equal(activeStatus);
      });

      it("Event: LowBalanceReceived for lowBalanceOffering", async function () {
        expectEvent(await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from: owner}),
          "LowBalanceReceived",
          {phoneHash: phoneHash1, ref: ref1});
      });

      it("Event: OfferSent for lowBalanceOffering", async function () {
        expectEvent(await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from: owner}),
          "OfferSent",
          {phoneHash: phoneHash1, ref: ref1});
      });
    });

    describe("Function: createProduct", async function() {
      it("Revert: createProduct is onlyOwner", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("Revert: createProduct for existing Proposal", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 1),
        "Proposal doesn't exist");
      });

      it("Revert: createProduct for existing Offer", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 1, 0),
        "Offer doesn't exist");
      });

      it("createProduct", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        await this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0);
        const product = await this.OfferingInstance.products(0);
        expect(product["phoneHash"]).to.be.equal(phoneHash1);
        expect(product["timestamp"]).to.be.bignumber.equal(timestampA);
        expect(product["idOffer"]).to.be.bignumber.equal(new BN(0));
        expect(product["idProposal"]).to.be.bignumber.equal(new BN(0));
        expect(product["status"]).to.be.bignumber.equal(activeStatus);
      });

      it("Event: ProductCreated for createProduct", async function() {
        await this.OfferingInstance.addProposal(minScore, capital, interest, description, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore, {from:owner});
        expectEvent(await this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0),
        "ProductCreated",
        {phoneHash: phoneHash1, timestamp: timestampA, idOffer: new BN(0), idProposal: new BN(0)});
      });
    });
  });
});