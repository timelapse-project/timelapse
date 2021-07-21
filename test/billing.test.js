const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Billing = artifacts.require("Billing");

contract('Billing', function (accounts) {
    const owner = accounts[0];
    const phoneHash = accounts[1];

    const timestampA = new BN(1626699313);
    const timestampP = new BN(1626699323);
    const idProduct = new BN(0);
    const score = new BN(5);
    const ref = "ref de test";
    const newCustomer = new BN(0);
    const activeCustomer = new BN(1);
    const closeCustomer = new BN(2);
    const activeProduct = new BN(0);
    const closeProduct = new BN(1);

    describe("Début des tests pour Billing", function() {
        beforeEach(async function() {
            this.BillingInstance = await Billing.new();
        });

        describe("Function: isActiveCustomer", async function() {
            it("isActiveCustomer", async function() {
                expect(await this.BillingInstance.isActiveCustomer(phoneHash)).to.be.false;
            });
        });

        describe("Function: addToScore", async function() {

        });

        describe("Function: changeCustomerStatus", async function() {
            it("Revert: changeCustomerStatus is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await expectRevert(this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeCustomerStatus", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash))["status"])).to.be.bignumber.equal(closeCustomer);
            });
    
            it("Event: CustomerStatusChange for changeCustomerStatus", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                expectEvent(await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner}),
                "CustomerStatusChange",
                {phoneHash: phoneHash, status: closeCustomer});
            });
        });

        describe("Function: changeScore", async function() {
            it("Revert: changeScore is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await expectRevert(this.BillingInstance.changeScore(phoneHash, score, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeScore", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.changeScore(phoneHash, score, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash))["score"])).to.be.bignumber.equal(score);
            });
    
            it("Event: ScoreChange for changeScore", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                expectEvent(await this.BillingInstance.changeScore(phoneHash, score, {from:owner}),
                "ScoreChange",
                {phoneHash: phoneHash, score: score});
            });
        });

        describe("Function: acceptanceBilling", async function() {
            it("Revert: acceptanceBilling is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("Revert: acceptanceBilling is activeCustomer", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                await expectRevert(this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Blocked or Unknowed customer");
            });
    
            it("acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(activeProduct);
            });
    
            it("Event: AcceptanceReceived for acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "AcceptanceReceived",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
    
            it("Event: Confirmation for acceptanceBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                expectEvent(await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Confirmation",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
        });

        describe("Function: topUpBilling", async function() {
            it("Revert: topUpBilling is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });

            it("Revert: topUpBilling is for registered phone", async function() {
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Phone is not registered");
            });

            it("Revert: topUpBilling is for actived product", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                await expectRevert(this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "The customer has no product to refund");
            });

            it("topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                const history = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(closeProduct);
            });

            it("Event: TopUpReceived for topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "TopUpReceived",
                {phoneHash: phoneHash, ref: ref});
            });

            it("Event: Acknowledge for topUpBilling", async function() {
                await this.BillingInstance.addToScore(phoneHash, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.BillingInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Acknowledge",
                {phoneHash: phoneHash, ref: ref});
            })
        });
    });
});