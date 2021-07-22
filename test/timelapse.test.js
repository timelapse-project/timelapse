const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Timelapse = artifacts.require("Timelapse");
const Offering = artifacts.require("Offering");
const Billing = artifacts.require("Billing");

contract('Timelapse', function (accounts) {
    // Accounts
    const owner = accounts[0];
    const phoneHash1 = accounts[1];
    const phoneHash2 = accounts[2];

    // Timestamp
    const timestampA = new BN(1626699313);
    const timestampP = new BN(1626699323);
    
    /* Billling Begin */
    // ID for fictive Product
    const idProduct1 = new BN(0);
    const idProduct2 = new BN(1);

    // Ref and Scoring
    const score1 = new BN(5);
    const score2 = new BN(6);
    const ref1 = "EXTERNAL_REFERENCE 1";
    const ref2 = "EXTERNAL_REFERENCE 2";
    /* Billing End */

    /* Offering Begin */
    // Proposal Creation
    const minScore1 = new BN(1);
    const minScore2 = new BN(2);
    const capital1 = new BN(500);
    const capital2 = new BN(1000);
    const interest1 = new BN(50);
    const interest2 = new BN(100);
    const description1 = "Description 1";
    const description2 = "Description 2";
    /* Offering End */

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

    describe("Début des tests pour Billing", function() {
        beforeEach(async function() {
            this.BillingInstance = await Billing.new();
            this.OfferingInstance = await Offering.new();
            this.TimelapseInstance = await Timelapse.new(this.BillingInstance.address, this.OfferingInstance.address);
        });

        describe("Function: isActiveCustomer", async function() {
            it("isActiveCustomer", async function() {
                expect(await this.BillingInstance.isActiveCustomer(phoneHash1)).to.be.false;
            });
        });

        describe("Function: addToScore", async function() {

        });

        describe("Function: changeCustomerStatus", async function() {
            it("Revert: changeCustomerStatus is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await expectRevert(this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });
    
            it("changeCustomerStatus", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash1))["status"])).to.be.bignumber.equal(closeCustomer);
            });
    
            it("Event: CustomerStatusChange for changeCustomerStatus", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                expectEvent(await this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:owner}),
                "CustomerStatusChange",
                {phoneHash: phoneHash1, status: closeCustomer});
            });
        });

        describe("Function: changeScore", async function() {
            it("Revert: changeScore is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await expectRevert(this.BillingInstance.changeScore(phoneHash1, score1, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });
    
            it("changeScore", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.changeScore(phoneHash1, score1, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash1))["score"])).to.be.bignumber.equal(score1);
            });
    
            it("Event: ScoreChange for changeScore", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                expectEvent(await this.BillingInstance.changeScore(phoneHash1, score1, {from:owner}),
                "ScoreChange",
                {phoneHash: phoneHash1, score: score1});
            });
        });

        describe("Function: acceptanceBilling", async function() {
            it("Revert: acceptanceBilling is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });
    
            it("Revert: acceptanceBilling is activeCustomer", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:owner});
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner}),
                "Blocked or Unknowed customer");
            });
    
            it("acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash1))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref1);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct1);
                expect(history["status"]).to.be.bignumber.equal(activeProduct);
            });
    
            it("Event: AcceptanceReceived for acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner}),
                "AcceptanceReceived",
                {phoneHash: phoneHash1, ref: ref1, acceptanceTimestamp: timestampA, idProduct: idProduct1});
            });
    
            it("Event: Confirmation for acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner}),
                "Confirmation",
                {phoneHash: phoneHash1, ref: ref1, acceptanceTimestamp: timestampA, idProduct: idProduct1});
            });
        });

        describe("Function: topUpBilling", async function() {
            it("Revert: topUpBilling is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });

            it("Revert: topUpBilling is for registered phone", async function() {
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner}),
                "Phone is not registered");
            });

            it("Revert: topUpBilling is for actived product", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner}),
                "The customer has no product to refund");
            });

            it("topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash1))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref1);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct1);
                expect(history["status"]).to.be.bignumber.equal(closeProduct);
            });

            it("Event: TopUpReceived for topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner}),
                "TopUpReceived",
                {phoneHash: phoneHash1, ref: ref1});
            });

            it("Event: Acknowledge for topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner}),
                "Acknowledge",
                {phoneHash: phoneHash1, ref: ref1});
            })
        });
    });

    describe("Début des tests pour Offering", function () {
        beforeEach(async function () {
            this.BillingInstance = await Billing.new();
            this.OfferingInstance = await Offering.new();
            this.TimelapseInstance = await Timelapse.new(this.BillingInstance.address, this.OfferingInstance.address);
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