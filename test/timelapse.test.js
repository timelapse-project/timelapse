const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Timelapse = artifacts.require("Timelapse");
const Offering = artifacts.require("Offering");
const Billing = artifacts.require("Billing");

contract("Timelapse", function (accounts) {
  // Accounts
  const owner = accounts[0];
  const phoneHash1 = accounts[1];
  const phoneHash2 = accounts[2];

  // Timestamp
  const timestampA = new BN(1626699313);
  const timestampP = new BN(1626699323);
  const timestampPast = new BN(996009553);
  const timestampFuture = new BN(2573846353);

  // ID expect for customer
  const idCustomer1 = new BN(0);
  const idCustomer2 = new BN(1);

  // Ref and Scoring
  const score1 = new BN(5);
  const score2 = new BN(6);
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

  // Customer Status
  const newCustomer = new BN(0);
  const activeCustomer = new BN(1);
  const closeCustomer = new BN(2);

  // Product Status
  const activeProduct = new BN(0);
  const closeProduct = new BN(1);

  // Proposal Status
  const activeProposal = new BN(0);
  const closedProposal = new BN(1);

  // Offer Status
  const newOffer = new BN(0);
  const acceptedOffer = new BN(1);

  describe("Début des tests pour Billing.sol, Owner = Timelapse", async function () {
    beforeEach(async function () {
      this.BillingInstance = await Billing.new();
      this.OfferingInstance = await Offering.new();
      this.TimelapseInstance = await Timelapse.new(
        this.BillingInstance.address,
        this.OfferingInstance.address
      );
    });

    describe("Function: isActiveCustomer", async function () {
      it("isActiveCustomer", async function () {
        expect(
          await this.BillingInstance.isActiveCustomer(phoneHash1)
        ).to.be.false;
      });
    });

    describe("Function: addToScore", async function () {
      it("Revert: addToScore is onlyOwner", async function () {
        await expectRevert(
          this.BillingInstance.addToScore(phoneHash1, { from: phoneHash1 }),
          "Ownable: caller is not the owner"
        );
      });

      it("addToScore", async function () {
        // Customer 1
        await this.BillingInstance.addToScore(phoneHash1);
        expect(
          (await this.BillingInstance.customerList(phoneHash1))["idCustomer"]
        ).to.be.bignumber.equal(idCustomer1);
        expect(
          (await this.BillingInstance.customerList(phoneHash1))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer1))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer1))["score"]
        ).to.be.bignumber.equal(new BN(12));
        expect(
          (await this.BillingInstance.customers(idCustomer1))["nbTopUp"]
        ).to.be.bignumber.equal(new BN(1));
        expect(
          (await this.BillingInstance.customers(idCustomer1))["amount"]
        ).to.be.bignumber.equal(new BN(0));
        expect(
          (await this.BillingInstance.customers(idCustomer1))[
            "lastAcceptanceID"
          ]
        ).to.be.bignumber.equal(new BN(0));

        // Customer 2
        await this.BillingInstance.addToScore(phoneHash2);
        expect(
          (await this.BillingInstance.customerList(phoneHash2))["idCustomer"]
        ).to.be.bignumber.equal(idCustomer2);
        expect(
          (await this.BillingInstance.customerList(phoneHash2))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer2))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer2))["score"]
        ).to.be.bignumber.equal(new BN(12));
        expect(
          (await this.BillingInstance.customers(idCustomer2))["nbTopUp"]
        ).to.be.bignumber.equal(new BN(1));
        expect(
          (await this.BillingInstance.customers(idCustomer2))["amount"]
        ).to.be.bignumber.equal(new BN(0));
        expect(
          (await this.BillingInstance.customers(idCustomer2))[
            "lastAcceptanceID"
          ]
        ).to.be.bignumber.equal(new BN(0));
      });

      it("Event: ScoreChange for addToScore", async function () {
        expectEvent(
          await this.BillingInstance.addToScore(phoneHash1, { from: owner }),
          "ScoreChange",
          { phoneHash: phoneHash1, score: new BN(12) }
        );
      });
    });

    describe("Function: changeCustomerStatus", async function () {
      it("Revert: changeCustomerStatus is onlyOwner", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await expectRevert(
          this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("changeCustomerStatus", async function () {
        // Customer 1
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.changeCustomerStatus(
          phoneHash1,
          closeCustomer,
          { from: owner }
        );
        expect(
          (await this.BillingInstance.getCustomer(phoneHash1))["status"]
        ).to.be.bignumber.equal(closeCustomer);

        // Customer 2
        await this.BillingInstance.addToScore(phoneHash2, { from: owner });
        await this.BillingInstance.changeCustomerStatus(
          phoneHash2,
          closeCustomer,
          { from: owner }
        );
        expect(
          (await this.BillingInstance.getCustomer(phoneHash2))["status"]
        ).to.be.bignumber.equal(closeCustomer);
      });

      it("Event: CustomerStatusChange for changeCustomerStatus", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        expectEvent(
          await this.BillingInstance.changeCustomerStatus(
            phoneHash1,
            closeCustomer,
            { from: owner }
          ),
          "CustomerStatusChange",
          { phoneHash: phoneHash1, status: closeCustomer }
        );
      });
    });

    describe("Function: changeScore", async function () {
      it("Revert: changeScore is onlyOwner", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await expectRevert(
          this.BillingInstance.changeScore(phoneHash1, score1, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("changeScore", async function () {
        // Customer 1
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.changeScore(phoneHash1, score1, {
          from: owner,
        });
        expect(
          (await this.BillingInstance.getCustomer(phoneHash1))["score"]
        ).to.be.bignumber.equal(score1);

        // Customer 2
        await this.BillingInstance.addToScore(phoneHash2, { from: owner });
        await this.BillingInstance.changeScore(phoneHash2, score2, {
          from: owner,
        });
        expect(
          (await this.BillingInstance.getCustomer(phoneHash2))["score"]
        ).to.be.bignumber.equal(score2);
      });

      it("Event: ScoreChange for changeScore", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        expectEvent(
          await this.BillingInstance.changeScore(phoneHash1, score1, {
            from: owner,
          }),
          "ScoreChange",
          { phoneHash: phoneHash1, score: score1 }
        );
      });
    });

    describe("Function: acceptanceBilling", async function () {
      it("Revert: acceptanceBilling is onlyOwner", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await expectRevert(
          this.BillingInstance.acceptanceBilling(
            phoneHash1,
            ref1,
            timestampA,
            idProduct1,
            { from: phoneHash1 }
          ),
          "Ownable: caller is not the owner"
        );
      });

      it("Revert: acceptanceBilling is activeCustomer", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.changeCustomerStatus(
          phoneHash1,
          closeCustomer,
          { from: owner }
        );
        await expectRevert(
          this.BillingInstance.acceptanceBilling(
            phoneHash1,
            ref1,
            timestampA,
            idProduct1,
            { from: owner }
          ),
          "Blocked or Unknowed customer"
        );
      });

      it("acceptanceBilling", async function () {
        // Customer 1
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        const history1 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash1)
          )["lastAcceptanceID"]
        );
        expect(history1["ref"]).to.be.equal(ref1);
        expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history1["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
        expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
        expect(history1["status"]).to.be.bignumber.equal(activeProduct);

        // Customer 2
        await this.BillingInstance.addToScore(phoneHash2, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash2,
          ref2,
          timestampA,
          idProduct2,
          { from: owner }
        );
        const history2 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash2)
          )["lastAcceptanceID"]
        );
        expect(history2["ref"]).to.be.equal(ref2);
        expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history2["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
        expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
        expect(history2["status"]).to.be.bignumber.equal(activeProduct);
      });

      it("Event: AcceptanceReceived for acceptanceBilling", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        expectEvent(
          await this.BillingInstance.acceptanceBilling(
            phoneHash1,
            ref1,
            timestampA,
            idProduct1,
            { from: owner }
          ),
          "AcceptanceReceived",
          {
            phoneHash: phoneHash1,
            ref: ref1,
            acceptanceTimestamp: timestampA,
            idProduct: idProduct1,
          }
        );
      });

      it("Event: Confirmation for acceptanceBilling", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        expectEvent(
          await this.BillingInstance.acceptanceBilling(
            phoneHash1,
            ref1,
            timestampA,
            idProduct1,
            { from: owner }
          ),
          "Confirmation",
          {
            phoneHash: phoneHash1,
            ref: ref1,
            acceptanceTimestamp: timestampA,
            idProduct: idProduct1,
          }
        );
      });
    });

    describe("Function: topUpBilling", async function () {
      it("Revert: topUpBilling is onlyOwner", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        await expectRevert(
          this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("Revert: topUpBilling is for registered phone", async function () {
        await expectRevert(
          this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
            from: owner,
          }),
          "Phone is not registered"
        );
      });

      it("Revert: topUpBilling is for actived product", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
          from: owner,
        });
        await expectRevert(
          this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
            from: owner,
          }),
          "The customer has no product to refund"
        );
      });

      it("topUpBilling", async function () {
        // Customer 1
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
          from: owner,
        });
        const history1 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash1)
          )["lastAcceptanceID"]
        );
        expect(history1["ref"]).to.be.equal(ref1);
        expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history1["paidTimestamp"]).to.be.bignumber.equal(timestampP);
        expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
        expect(history1["status"]).to.be.bignumber.equal(closeProduct);

        // Customer 2
        await this.BillingInstance.addToScore(phoneHash2, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash2,
          ref2,
          timestampA,
          idProduct2,
          { from: owner }
        );
        await this.BillingInstance.topUpBilling(phoneHash2, timestampP, {
          from: owner,
        });
        const history2 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash2)
          )["lastAcceptanceID"]
        );
        expect(history2["ref"]).to.be.equal(ref2);
        expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history2["paidTimestamp"]).to.be.bignumber.equal(timestampP);
        expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
        expect(history2["status"]).to.be.bignumber.equal(closeProduct);
      });

      it("Event: TopUpReceived for topUpBilling", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        expectEvent(
          await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
            from: owner,
          }),
          "TopUpReceived",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });

      it("Event: Acknowledge for topUpBilling", async function () {
        await this.BillingInstance.addToScore(phoneHash1, { from: owner });
        await this.BillingInstance.acceptanceBilling(
          phoneHash1,
          ref1,
          timestampA,
          idProduct1,
          { from: owner }
        );
        expectEvent(
          await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {
            from: owner,
          }),
          "Acknowledge",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });
    });
  });

  describe("Début des tests pour Offering.sol, Owner = Timelapse", async function () {
    beforeEach(async function () {
      this.BillingInstance = await Billing.new();
      this.OfferingInstance = await Offering.new();
      this.TimelapseInstance = await Timelapse.new(
        this.BillingInstance.address,
        this.OfferingInstance.address
      );
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
        // Add Proposal
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
        // Add Proposal
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

  describe("Début des tests pour Timelapse.sol", async function () {
    beforeEach(async function () {
      this.BillingInstance = await Billing.new();
      this.OfferingInstance = await Offering.new();
      this.TimelapseInstance = await Timelapse.new(
        this.BillingInstance.address,
        this.OfferingInstance.address
      );
      await this.BillingInstance.transferOwnership(
        this.TimelapseInstance.address,
        { from: owner }
      );
      await this.OfferingInstance.transferOwnership(
        this.TimelapseInstance.address,
        { from: owner }
      );
    });

    describe("Function: addProposal", async function () {
      it("Revert: addProposal is onlyOwner", async function () {
        await expectRevert(
          this.TimelapseInstance.addProposal(
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
        await this.TimelapseInstance.addProposal(
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
        await this.TimelapseInstance.addProposal(
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
        await this.TimelapseInstance.addProposal(
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
        const receipt1 = await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.OfferingInstance,
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
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await expectRevert(
          this.TimelapseInstance.closeProposal(0, { from: phoneHash1 }),
          "Ownable: caller is not the owner"
        );
      });

      it("Revert: closeProposal for existing proposal", async function () {
        await expectRevert(
          this.TimelapseInstance.closeProposal(0, { from: owner }),
          "Proposal doesn't exist"
        );
      });

      it("closeProposal", async function () {
        // Proposal 1
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.closeProposal(idProposal1, {
          from: owner,
        });
        const proposal1 = await this.OfferingInstance.proposals(idProposal1);
        expect(proposal1["status"]).to.be.bignumber.equal(closedProposal);

        // Proposal 2
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.closeProposal(idProposal2, {
          from: owner,
        });
        const proposal2 = await this.OfferingInstance.proposals(idProposal2);
        expect(proposal2["status"]).to.be.bignumber.equal(closedProposal);

        // Proposal 1
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        await this.TimelapseInstance.closeProposal(idProposal3, {
          from: owner,
        });
        const proposal3 = await this.OfferingInstance.proposals(idProposal3);
        expect(proposal3["status"]).to.be.bignumber.equal(closedProposal);
      });

      it("Event: ClosedProposal for closeProposal", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        const receipt1 = await this.TimelapseInstance.closeProposal(0, {
          from: owner,
        });
        await expectEvent.inTransaction(
          receipt1.tx,
          this.OfferingInstance,
          "ClosedProposal",
          { idProposal: new BN(0) }
        );
      });
    });

    describe("Function: addToScore", async function () {
      it("Revert: addToScore is onlyOwner", async function () {
        await expectRevert(
          this.TimelapseInstance.addToScore(phoneHash1, { from: phoneHash1 }),
          "Ownable: caller is not the owner"
        );
      });

      it("addToScore", async function () {
        // Customer 1
        await this.TimelapseInstance.addToScore(phoneHash1);
        expect(
          (await this.BillingInstance.customerList(phoneHash1))["idCustomer"]
        ).to.be.bignumber.equal(idCustomer1);
        expect(
          (await this.BillingInstance.customerList(phoneHash1))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer1))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer1))["score"]
        ).to.be.bignumber.equal(new BN(12));
        expect(
          (await this.BillingInstance.customers(idCustomer1))["nbTopUp"]
        ).to.be.bignumber.equal(new BN(1));
        expect(
          (await this.BillingInstance.customers(idCustomer1))["amount"]
        ).to.be.bignumber.equal(new BN(0));
        expect(
          (await this.BillingInstance.customers(idCustomer1))[
            "lastAcceptanceID"
          ]
        ).to.be.bignumber.equal(new BN(0));

        // Customer 2
        await this.TimelapseInstance.addToScore(phoneHash2);
        expect(
          (await this.BillingInstance.customerList(phoneHash2))["idCustomer"]
        ).to.be.bignumber.equal(idCustomer2);
        expect(
          (await this.BillingInstance.customerList(phoneHash2))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer2))["status"]
        ).to.be.bignumber.equal(activeCustomer);
        expect(
          (await this.BillingInstance.customers(idCustomer2))["score"]
        ).to.be.bignumber.equal(new BN(12));
        expect(
          (await this.BillingInstance.customers(idCustomer2))["nbTopUp"]
        ).to.be.bignumber.equal(new BN(1));
        expect(
          (await this.BillingInstance.customers(idCustomer2))["amount"]
        ).to.be.bignumber.equal(new BN(0));
        expect(
          (await this.BillingInstance.customers(idCustomer2))[
            "lastAcceptanceID"
          ]
        ).to.be.bignumber.equal(new BN(0));
      });

      it("Event: ScoreChange for addToScore", async function () {
        const receipt1 = await this.TimelapseInstance.addToScore(phoneHash1, {
          from: owner,
        });
        await expectEvent.inTransaction(
          receipt1.tx,
          this.BillingInstance,
          "ScoreChange",
          { phoneHash: phoneHash1, score: new BN(12) }
        );
      });
    });

    describe("Function: lowBalance", async function () {
      it("Revert: lowBalance is onlyOwner", async function () {
        await expectRevert(
          this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("lowBalance", async function () {
        // Add Proposal
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        const offer1 = await this.OfferingInstance.offers(idOffer1);
        expect(offer1["phoneHash"]).to.be.equal(phoneHash1);
        expect(offer1["ref"]).to.be.equal(ref1);
        expect(offer1["status"]).to.be.bignumber.equal(newOffer);

        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash2, ref2, {
          from: owner,
        });
        const offer2 = await this.OfferingInstance.offers(idOffer2);
        expect(offer2["phoneHash"]).to.be.equal(phoneHash2);
        expect(offer2["ref"]).to.be.equal(ref2);
        expect(offer2["status"]).to.be.bignumber.equal(newOffer);

        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash2, ref3, {
          from: owner,
        });
        const offer3 = await this.OfferingInstance.offers(idOffer3);
        expect(offer3["phoneHash"]).to.be.equal(phoneHash2);
        expect(offer3["ref"]).to.be.equal(ref3);
        expect(offer3["status"]).to.be.bignumber.equal(newOffer);
      });

      it("Event: LowBalanceReceived for lowBalance", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        const receipt1 = await this.TimelapseInstance.lowBalance(
          phoneHash1,
          ref1,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.OfferingInstance,
          "LowBalanceReceived",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });

      it("Event: OfferSent for lowBalance", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        const receipt1 = await this.TimelapseInstance.lowBalance(
          phoneHash1,
          ref1,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.OfferingInstance,
          "OfferSent",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });
    });

    describe("Function: acceptance", async function () {
      it("Revert: acceptance is onlyOwner", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await expectRevert(
          this.TimelapseInstance.acceptance(
            phoneHash1,
            ref1,
            timestampA,
            idOffer1,
            idProposal1,
            { from: phoneHash1 }
          ),
          "Ownable: caller is not the owner"
        );
      });

      it("acceptance", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        // Customer 1
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        const history1 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash1)
          )["lastAcceptanceID"]
        );
        expect(history1["ref"]).to.be.equal(ref1);
        expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history1["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
        expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
        expect(history1["status"]).to.be.bignumber.equal(activeProduct);

        // Customer 2
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash2, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash2,
          ref2,
          timestampA,
          idOffer2,
          idProposal2,
          { from: owner }
        );
        const history2 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash2)
          )["lastAcceptanceID"]
        );
        expect(history2["ref"]).to.be.equal(ref2);
        expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history2["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
        expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
        expect(history2["status"]).to.be.bignumber.equal(activeProduct);
      });

      it("Event: AcceptanceReceived for acceptance", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        const receipt1 = await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.BillingInstance,
          "AcceptanceReceived",
          {
            phoneHash: phoneHash1,
            ref: ref1,
            acceptanceTimestamp: timestampA,
            idProduct: idProduct1,
          }
        );
      });

      it("Event: Confirmation for acceptance", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        const receipt1 = await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.BillingInstance,
          "Confirmation",
          {
            phoneHash: phoneHash1,
            ref: ref1,
            acceptanceTimestamp: timestampA,
            idProduct: idProduct1,
          }
        );
      });
    });

    describe("Function: topUp", async function () {
      it("Revert: topUp is onlyOwner", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await expectRevert(
          this.TimelapseInstance.topUp(phoneHash1, timestampP, {
            from: phoneHash1,
          }),
          "Ownable: caller is not the owner"
        );
      });

      it("topUp", async function () {
        // Customer 1
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash1, timestampP, {
          from: owner,
        });
        const history1 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash1)
          )["lastAcceptanceID"]
        );
        expect(history1["ref"]).to.be.equal(ref1);
        expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history1["paidTimestamp"]).to.be.bignumber.equal(timestampP);
        expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
        expect(history1["status"]).to.be.bignumber.equal(closeProduct);

        // Customer 2
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash2, ref2, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash2,
          ref2,
          timestampA,
          idOffer2,
          idProposal2,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash2, timestampP, {
          from: owner,
        });
        const history2 = await this.BillingInstance.histories(
          (
            await this.BillingInstance.getCustomer(phoneHash2)
          )["lastAcceptanceID"]
        );
        expect(history2["ref"]).to.be.equal(ref2);
        expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(
          timestampA
        );
        expect(history2["paidTimestamp"]).to.be.bignumber.equal(timestampP);
        expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
        expect(history2["status"]).to.be.bignumber.equal(closeProduct);
      });

      it("Event: TopUpReceived for topUp", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        const receipt1 = await this.TimelapseInstance.topUp(
          phoneHash1,
          timestampP,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.BillingInstance,
          "TopUpReceived",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });

      it("Event: Acknowledge for topUp", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        const receipt1 = await this.TimelapseInstance.topUp(
          phoneHash1,
          timestampP,
          { from: owner }
        );
        await expectEvent.inTransaction(
          receipt1.tx,
          this.BillingInstance,
          "Acknowledge",
          { phoneHash: phoneHash1, ref: ref1 }
        );
      });
    });

    describe("Function: getCustomerActivitiesLog", async function () {
      it("getCustomerActivitiesLog", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash1, timestampP, {
          from: owner,
        });
        const customerActivitiesLog =
          await this.TimelapseInstance.getCustomerActivitiesLog(
            phoneHash1,
            timestampPast,
            timestampFuture,
            { from: owner }
          );
        expect(customerActivitiesLog[0].status).to.be.equal("Offer");
        expect(customerActivitiesLog[1].status).to.be.equal("Accepted");
        expect(customerActivitiesLog[2].status).to.be.equal("Closed");
      });
    });

    describe("Function: generateInvoicing", async function () {
      it("generateInvoicing", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        // Customer 1
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash1, timestampP, {
          from: owner,
        });

        // Customer 2
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash2, ref2, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash2,
          ref2,
          timestampA,
          idOffer2,
          idProposal2,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash2, timestampP, {
          from: owner,
        });
        const invoicing = await this.TimelapseInstance.generateInvoicing(
          timestampPast,
          timestampFuture,
          { from: owner }
        );
        expect(invoicing[0].totalCapital).to.be.bignumber.equal(new BN(600));
        expect(invoicing[0].totalInterest).to.be.bignumber.equal(new BN(150));
      });
    });

    describe("Function: generateReporting", async function () {
      it("generateReporting", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );

        // Customer 1
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash1, ref1, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          ref1,
          timestampA,
          idOffer1,
          idProposal1,
          { from: owner }
        );
        await this.TimelapseInstance.topUp(phoneHash1, timestampP, {
          from: owner,
        });

        // Customer 2
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash2, { from: owner });
        }
        this.TimelapseInstance.lowBalance(phoneHash2, ref2, { from: owner });
        await this.TimelapseInstance.acceptance(
          phoneHash2,
          ref2,
          timestampA,
          idOffer2,
          idProposal2,
          { from: owner }
        );
        const reporting = await this.TimelapseInstance.generateReporting(
          timestampPast,
          timestampFuture,
          { from: owner }
        );
        expect(reporting[0].offersCount).to.be.bignumber.equal(new BN(2));
        expect(reporting[0].acceptedOffersCount).to.be.bignumber.equal(
          new BN(2)
        );
        expect(reporting[0].totalCapitalLoans).to.be.bignumber.equal(
          new BN(400)
        );
        expect(reporting[0].totalInterestLoans).to.be.bignumber.equal(
          new BN(100)
        );
        expect(reporting[0].closedTopupsCount).to.be.bignumber.equal(new BN(1));
        expect(reporting[0].totalCapitalGain).to.be.bignumber.equal(
          new BN(200)
        );
        expect(reporting[0].totalInterestGain).to.be.bignumber.equal(
          new BN(50)
        );
      });
    });

    describe("Function: getOfferSize", async function () {
      it("getOfferSize", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        const offerSize = await this.OfferingInstance.getOfferSize(phoneHash1, {
          from: owner,
        });
        expect(offerSize).to.be.bignumber.equal(new BN(1));
      });
    });

    describe("Function: getOffersSize", async function () {
      it("getOffersSize", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        const offersSize = await this.OfferingInstance.getOffersSize({
          from: owner,
        });
        expect(offersSize).to.be.bignumber.equal(new BN(1));
      });
    });

    describe("Function: getProposalOfferSize", async function () {
      it("getProposalOfferSize", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        const proposalOfferSize =
          await this.OfferingInstance.getProposalOfferSize(idOffer1, {
            from: owner,
          });
        expect(proposalOfferSize).to.be.bignumber.equal(new BN(2));
      });
    });

    describe("Function: getIndexProposalOffer", async function () {
      it("getIndexProposalOffer", async function () {
        await this.TimelapseInstance.addProposal(
          minScore1,
          capital1,
          interest1,
          description1,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore2,
          capital2,
          interest2,
          description2,
          { from: owner }
        );
        await this.TimelapseInstance.addProposal(
          minScore3,
          capital3,
          interest3,
          description3,
          { from: owner }
        );
        for (let i = 0; i < 21; i++) {
          await this.TimelapseInstance.addToScore(phoneHash1, { from: owner });
        }
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        const proposalOfferIndex =
          await this.OfferingInstance.getIndexProposalOffer(
            idOffer1,
            new BN(0),
            { from: owner }
          );
        expect(proposalOfferIndex).to.be.bignumber.equal(idProposal1);
      });
    });
  });
});
