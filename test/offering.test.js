const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Offering = artifacts.require("Offering");

contract("Offering", function (accounts) {
  // Accounts
  const owner = accounts[0];
  const phoneHash1 = accounts[1];
  const phoneHash2 = accounts[2];

  // Timestamp
  const timestampA = new BN(1626699313);
  const timestampP = new BN(1626699323);

  // Ref
  const ref1 = "EXTERNAL_REFERENCE 1";
  const ref2 = "EXTERNAL_REFERENCE 2";

  // Proposal Creation
  const minScore1 = new BN(1);
  const minScore2 = new BN(2);
  const capital1 = new BN(500);
  const capital2 = new BN(1000);
  const interest1 = new BN(50);
  const interest2 = new BN(100);
  const description1 = "Description 1";
  const description2 = "Description 2";

  // Proposal Status
  const activeProposal = new BN(0);
  const closedProposal = new BN(1);

  // Offer Status
  const newOffer = new BN(0);
  const acceptedOffer = new BN(1);

  // Product Status
  const activeProduct = new BN(0);
  const closedProduct = new BN(1);

  describe("Début des tests pour Offering", function () {
    beforeEach(async function () {
      this.OfferingInstance = await Offering.new();
    });

    describe("Function: addProposal", async function() {
      it("Revert: addProposal is onlyOwner", async function() {
        await expectRevert(this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("addProposal", async function () {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        let proposals = await this.OfferingInstance.proposals(0);
        expect(proposals["minScoring"]).to.be.bignumber.equal(minScore1);
        expect(proposals["capital"]).to.be.bignumber.equal(capital1);
        expect(proposals["interest"]).to.be.bignumber.equal(interest1);
        expect(proposals["description"]).to.be.equal(description1);
        expect(proposals["status"]).to.be.bignumber.equal(activeProposal);
      });

      it("Event: ProposalAdded", async function () {
        expectEvent(await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner}),
          "ProposalAdded",
          {idProposal: new BN(0), minScoring: minScore1, capital: capital1, interest: interest1, description: description1});
      });
    });

    describe("Function: closedProposal", async function() {
      it("Revert: closedProposal is onlyOwner", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await expectRevert(this.OfferingInstance.closedProposal(0, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("Revert: closedProposal for existing proposal", async function() {
        await expectRevert(this.OfferingInstance.closedProposal(0, {from:owner}),
        "Proposal doesn't exist");
      });

      it("closedProposal", async function () {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.closedProposal(0, {from: owner});
        let proposal = await this.OfferingInstance.proposals(0);
        expect(proposal["status"]).to.be.bignumber.equal(closedProposal);
      });

      it("Event: ClosedProposal for closedProposal", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
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
        await expectRevert(this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("lowBalanceOffering", async function() {
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        const offer = await this.OfferingInstance.offers(0);
        expect(offer["phoneHash"]).to.be.equal(phoneHash1);
        expect(offer["ref"]).to.be.equal(ref1);
        expect(offer["status"]).to.be.bignumber.equal(newOffer);
      });

      it("Event: LowBalanceReceived for lowBalanceOffering", async function () {
        expectEvent(await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from: owner}),
          "LowBalanceReceived",
          {phoneHash: phoneHash1, ref: ref1});
      });

      it("Event: OfferSent for lowBalanceOffering", async function () {
        expectEvent(await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from: owner}),
          "OfferSent",
          {phoneHash: phoneHash1, ref: ref1});
      });
    });

    describe("Function: createProduct", async function() {
      it("Revert: createProduct is onlyOwner", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0, {from:phoneHash1}),
        "Ownable: caller is not the owner");
      });

      it("Revert: createProduct for existing Proposal", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 1),
        "Proposal doesn't exist");
      });

      it("Revert: createProduct for existing Offer", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        await expectRevert(this.OfferingInstance.createProduct(phoneHash1, timestampA, 1, 0),
        "Offer doesn't exist");
      });

      it("createProduct", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        await this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0);
        const product = await this.OfferingInstance.products(0);
        expect(product["phoneHash"]).to.be.equal(phoneHash1);
        expect(product["timestamp"]).to.be.bignumber.equal(timestampA);
        expect(product["idOffer"]).to.be.bignumber.equal(new BN(0));
        expect(product["idProposal"]).to.be.bignumber.equal(new BN(0));
        expect(product["status"]).to.be.bignumber.equal(activeProduct);
      });

      it("Event: ProductCreated for createProduct", async function() {
        await this.OfferingInstance.addProposal(minScore1, capital1, interest1, description1, {from: owner});
        await this.OfferingInstance.lowBalanceOffering(phoneHash1, ref1, minScore1, {from:owner});
        expectEvent(await this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0),
        "ProductCreated",
        {phoneHash: phoneHash1, timestamp: timestampA, idOffer: new BN(0), idProposal: new BN(0)});
      });
    });
  });
});