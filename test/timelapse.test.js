const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Timelapse = artifacts.require("Timelapse");
const Offering = artifacts.require("Offering");
const Billing = artifacts.require("Billing");

contract('Timelapse', function (accounts) {
    const owner = accounts[0];
    const phoneHash = accounts[1];

    const timestampA = new BN(1626699313);
    const timestampP = new BN(1626699323);
    const idProduct = new BN(0);
    const score = new BN(5);
    const ref = "ref de test";
    const activeCustomer = new BN(0);
    const closeCustomer = new BN(1);
    const activeProduct = new BN(0);
    const closeProduct = new BN(1);

    const minScore = new BN(1);
    const capital = new BN(500);
    const interest = new BN(50);
    const description = "Test one two";
    const activeStatus = new BN(0);
    const closedStatus = new BN(1);

    const phoneHash1 = "0x3ad53d26D15A658A84Fe8cA9FFc8aA3a7240C1a0";
    const ref1 = "EXTERNAL_REFERENCE";
  

    describe("Début des tests pour Billing", function() {
        beforeEach(async function() {
            this.BillingInstance = await Billing.new();
            this.OfferingInstance = await Offering.new();
            this.TimelapseInstance = await Timelapse.new(this.BillingInstance.address, this.OfferingInstance.address);
        });

        describe("Function: isActiveCustomer", async function() {
            it("isActiveCustomer", async function() {
                await this.BillingInstance.isActiveCustomer(phoneHash);
            });
        });

        describe("Function: changeCustomerStatus", async function() {
            it("Revert: changeCustomerStatus is onlyOwner", async function() {
                await expectRevert(this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeCustomerStatus", async function() {
                await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                expect(((await this.BillingInstance.customers(phoneHash))["status"])).to.be.bignumber.equal(closeCustomer);
            });
    
            it("Event: CustomerStatusChange for changeCustomerStatus", async function() {
                expectEvent(await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner}),
                "CustomerStatusChange",
                {phoneHash: phoneHash, status: closeCustomer});
            });
        });

        describe("Function: changeScore", async function() {
            it("Revert: changeScore is onlyOwner", async function() {
                await expectRevert(this.BillingInstance.changeScore(phoneHash, score, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeScore", async function() {
                await this.BillingInstance.changeScore(phoneHash, score, {from:owner});
                expect(((await this.BillingInstance.customers(phoneHash))["score"])).to.be.bignumber.equal(score);
            });
    
            it("Event: ScoreChange for changeScore", async function() {
                expectEvent(await this.BillingInstance.changeScore(phoneHash, score, {from:owner}),
                "ScoreChange",
                {phoneHash: phoneHash, score: score});
            });
        });

        describe("Function: acceptanceBilling", async function() {
            it("Revert: acceptanceBilling is onlyOwner", async function() {
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("Revert: acceptanceBilling is activeCustomer", async function() {
                await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Blocked customer");
            });
    
            it("acceptanceBilling", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.customers(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(activeProduct);
            });
    
            it("Event: AcceptanceReceived for acceptanceBilling", async function() {
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "AcceptanceReceived",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
    
            it("Event: Confirmation for acceptanceBilling", async function() {
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Confirmation",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
        });

        describe("Function: topUpBilling", async function() {
            it("Revert: topUpBilling is onlyOwner", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });

            it("Revert: topUpBilling is for registered phone", async function() {
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Phone is not registered");
            });

            it("Revert: topUpBilling is for actived product", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "The customer has no product to refund");
            });

            it("topUpBilling", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.customers(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(closeProduct);
            });

            it("Event: TopUpReceived for topUpBilling", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "TopUpReceived",
                {phoneHash: phoneHash, ref: ref});
            });

            it("Event: Acknowledge for topUpBilling", async function() {
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Acknowledge",
                {phoneHash: phoneHash, ref: ref});
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