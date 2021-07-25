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
  const ref3 = "EXTERNAL_REFERENCE 3";

  // Proposal Creation
  const idProposal1 = new BN(0);
  const idProposal2 = new BN(1);
  const idProposal3 = new BN(2);
  const minScore1 = new BN(49);
  const minScore2 = new BN(118);
  const minScore3 = new BN(185);
  const capital1 = new BN(200);
  const capital2 = new BN(400);
  const capital3 = new BN(600);
  const interest1 = new BN(50);
  const interest2 = new BN(100);
  const interest3 = new BN(150);
  const description1 = "2 $ + 0.5 $";
  const description2 = "4 $ + 1 $";
  const description3 = "6 $ + 1.5 $";

  // Offer Creation
  const idOffer1 = new BN(0);
  const idOffer2 = new BN(1);
  const idOffer3 = new BN(2);

  // Product Creation
  const idProduct1 = new BN(0);
  const idProduct2 = new BN(1);

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

    describe("Function: addProposal", async function () {
      it("Revert: addProposal is onlyOwner", async function () {
        await expectRevert(
          this.OfferingInstance.addProposal(
            minScore1,
            capital1,
            interest1,
            description1,
            { from: phoneHash1 }
          ),
          "Ownable: caller is not the owner"
        );
      });

      it("addProposal", async function () {
        // Proposal 1
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        const proposal1 = await this.OfferingInstance.proposals(idProposal1);
        expect(proposal1["minScoring"]).to.be.bignumber.equal(minScore1);
        expect(proposal1["capital"]).to.be.bignumber.equal(capital1);
        expect(proposal1["interest"]).to.be.bignumber.equal(interest1);
        expect(proposal1["description"]).to.be.equal(description1);
        expect(proposal1["status"]).to.be.bignumber.equal(activeProposal);

        // Proposal 2
        await this.OfferingInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        const proposal2 = await this.OfferingInstance.proposals(idProposal2);
        expect(proposal2["minScoring"]).to.be.bignumber.equal(minScore2);
        expect(proposal2["capital"]).to.be.bignumber.equal(capital2);
        expect(proposal2["interest"]).to.be.bignumber.equal(interest2);
        expect(proposal2["description"]).to.be.equal(description2);
        expect(proposal2["status"]).to.be.bignumber.equal(activeProposal);

        // Proposal 3
        await this.OfferingInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        const proposal3 = await this.OfferingInstance.proposals(idProposal3);
        expect(proposal3["minScoring"]).to.be.bignumber.equal(minScore3);
        expect(proposal3["capital"]).to.be.bignumber.equal(capital3);
        expect(proposal3["interest"]).to.be.bignumber.equal(interest3);
        expect(proposal3["description"]).to.be.equal(description3);
        expect(proposal3["status"]).to.be.bignumber.equal(activeProposal);
      });

      it("Event: ProposalAdded", async function () {
        expectEvent(
          await this.OfferingInstance.addProposal(
            minScore1,
            capital1,
            interest1,
            description1,
            { from: owner }
          ),
          "ProposalAdded",
          {
            idProposal: new BN(0),
            minScoring: minScore1,
            capital: capital1,
            interest: interest1,
            description: description1,
          }
        );
      });
    });

    describe("Function: closeProposal", async function () {
      it("Revert: closeProposal is onlyOwner", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await expectRevert(
          this.OfferingInstance.closeProposal(0, { from: phoneHash1 }),
          "Ownable: caller is not the owner"
        );
      });

      it("Revert: closeProposal for existing proposal", async function () {
        await expectRevert(
          this.OfferingInstance.closeProposal(0, { from: owner }),
          "Proposal doesn't exist"
        );
      });

      it("closeProposal", async function () {
        // Proposal 1
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.closeProposal(idProposal1, { from: owner });
        const proposal1 = await this.OfferingInstance.proposals(idProposal1);
        expect(proposal1["status"]).to.be.bignumber.equal(closedProposal);

        // Proposal 2
        await this.OfferingInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.OfferingInstance.closeProposal(idProposal2, { from: owner });
        const proposal2 = await this.OfferingInstance.proposals(idProposal2);
        expect(proposal2["status"]).to.be.bignumber.equal(closedProposal);

        // Proposal 1
        await this.OfferingInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        await this.OfferingInstance.closeProposal(idProposal3, { from: owner });
        const proposal3 = await this.OfferingInstance.proposals(idProposal3);
        expect(proposal3["status"]).to.be.bignumber.equal(closedProposal);
      });

      it("Event: ClosedProposal for closeProposal", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        expectEvent(
          await this.OfferingInstance.closeProposal(0, { from: owner }),
          "ClosedProposal",
          { idProposal: new BN(0) }
        );
      });
    });

    describe("Function: proposalsCount", async function () {
      it("proposalsCount", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        expect(
          await this.OfferingInstance.proposalsCount()
        ).to.be.bignumber.equal(new BN(1));
        await this.OfferingInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        expect(
          await this.OfferingInstance.proposalsCount()
        ).to.be.bignumber.equal(new BN(2));
        await this.OfferingInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        expect(
          await this.OfferingInstance.proposalsCount()
        ).to.be.bignumber.equal(new BN(3));
      });
    });

    describe("Function: lowBalanceOffering", async function () {
      it("Revert: lowBalanceOffering is onlyOwner", async function () {
        await expectRevert(
          this.OfferingInstance.lowBalanceOffering(
            phoneHash1,
            ref1,
            minScore1,
            { from: phoneHash1 }
          ),
          "Ownable: caller is not the owner"
        );
      });

      it("lowBalanceOffering", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.OfferingInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        // Customer 1
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        const offer1 = await this.OfferingInstance.offers(idOffer1);
        expect(offer1["phoneHash"]).to.be.equal(phoneHash1);
        expect(offer1["ref"]).to.be.equal(ref1);
        expect(offer1["status"]).to.be.bignumber.equal(newOffer);

        // Customer 2
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash2,
          ref2,
          minScore2,
          { from: owner }
        );
        const offer2 = await this.OfferingInstance.offers(idOffer2);
        expect(offer2["phoneHash"]).to.be.equal(phoneHash2);
        expect(offer2["ref"]).to.be.equal(ref2);
        expect(offer2["status"]).to.be.bignumber.equal(newOffer);

        // Customer 3
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash2,
          ref3,
          minScore3,
          { from: owner }
        );
        const offer3 = await this.OfferingInstance.offers(idOffer3);
        expect(offer3["phoneHash"]).to.be.equal(phoneHash2);
        expect(offer3["ref"]).to.be.equal(ref3);
        expect(offer3["status"]).to.be.bignumber.equal(newOffer);
      });

      it("Event: LowBalanceReceived for lowBalanceOffering", async function () {
        expectEvent(
          await this.OfferingInstance.lowBalanceOffering(
            phoneHash1,
            ref1,
            minScore1,
            { from: owner }
          ),
          "LowBalanceReceived",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });

      it("Event: OfferSent for lowBalanceOffering", async function () {
        expectEvent(
          await this.OfferingInstance.lowBalanceOffering(
            phoneHash1,
            ref1,
            minScore1,
            { from: owner }
          ),
          "OfferSent",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });
    });

    describe("Function: createProduct", async function () {
      it("Revert: createProduct is onlyOwner", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        await expectRevert(
          this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 0, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("Revert: createProduct for existing Proposal", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        await expectRevert(
          this.OfferingInstance.createProduct(phoneHash1, timestampA, 0, 1),
          "Proposal doesn't exist"
        );
      });

      it("Revert: createProduct for existing Offer", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        await expectRevert(
          this.OfferingInstance.createProduct(phoneHash1, timestampA, 1, 0),
          "Offer doesn't exist"
        );
      });

      it("createProduct", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.OfferingInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        // Product 1
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        await this.OfferingInstance.createProduct(
          phoneHash1,
          timestampA,
          idOffer1,
          idProposal1
        );
        const product1 = await this.OfferingInstance.products(idProduct1);
        expect(product1["phoneHash"]).to.be.equal(phoneHash1);
        expect(product1["timestamp"]).to.be.bignumber.equal(timestampA);
        expect(product1["idOffer"]).to.be.bignumber.equal(idOffer1);
        expect(product1["idProposal"]).to.be.bignumber.equal(idProposal1);
        expect(product1["status"]).to.be.bignumber.equal(activeProduct);

        // Product 2
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash2,
          ref2,
          minScore2,
          { from: owner }
        );
        await this.OfferingInstance.createProduct(
          phoneHash2,
          timestampA,
          idOffer2,
          idProposal2
        );
        const product2 = await this.OfferingInstance.products(idProduct2);
        expect(product2["phoneHash"]).to.be.equal(phoneHash2);
        expect(product2["timestamp"]).to.be.bignumber.equal(timestampA);
        expect(product2["idOffer"]).to.be.bignumber.equal(idOffer2);
        expect(product2["idProposal"]).to.be.bignumber.equal(idProposal2);
        expect(product2["status"]).to.be.bignumber.equal(activeProduct);
      });

      it("Event: ProductCreated for createProduct", async function () {
        await this.OfferingInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.OfferingInstance.lowBalanceOffering(
          phoneHash1,
          ref1,
          minScore1,
          { from: owner }
        );
        expectEvent(
          await this.OfferingInstance.createProduct(
            phoneHash1,
            timestampA,
            0,
            0
          ),
          "ProductCreated",
          {
            phoneHash: phoneHash1,
            timestamp: timestampA,
            idOffer: new BN(0),
            idProposal: new BN(0),
          }
        );
      });
    });
  });
});
