const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Billing = artifacts.require("Billing");

contract('Billing', function (accounts) {
    // Accounts
    const owner = accounts[0];
    const phoneHash1 = accounts[1];
    const phoneHash2 = accounts[2];

    // Timestamp
    const timestampA = new BN(1626699313);
    const timestampP = new BN(1626699323);

    // ID for fictive product
    const idProduct1 = new BN(0);
    const idProduct2 = new BN(1);

    // ID expect for customer
    const idCustomer1 = new BN(0);
    const idCustomer2 = new BN(1);

    // Ref and Scoring
    const score1 = new BN(5);
    const score2 = new BN(6);
    const ref1 = "EXTERNAL_REFERENCE 1";
    const ref2 = "EXTERNAL_REFERENCE 2";

    // Customer Status
    const newCustomer = new BN(0);
    const activeCustomer = new BN(1);
    const closeCustomer = new BN(2);

    // Product Status
    const activeProduct = new BN(0);
    const closeProduct = new BN(1);

    describe("Début des tests pour Billing", function() {
        beforeEach(async function() {
            this.BillingInstance = await Billing.new();
        });

        describe("Function: isActiveCustomer", async function() {
            it("isActiveCustomer", async function() {
                expect(await this.BillingInstance.isActiveCustomer(phoneHash1)).to.be.false;
            });
        });

        describe("Function: addToScore", async function() {
            it("Revert: addToScore is onlyOwner", async function() {
                await expectRevert(this.BillingInstance.addToScore(phoneHash1, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });

            it("addToScore", async function() {
                // Customer 1
                await this.BillingInstance.addToScore(phoneHash1);
                expect(((await this.BillingInstance.customerList(phoneHash1))["idCustomer"])).to.be.bignumber.equal(idCustomer1);
                expect(((await this.BillingInstance.customerList(phoneHash1))["status"])).to.be.bignumber.equal(activeCustomer);
                expect(((await this.BillingInstance.customers(idCustomer1))["status"])).to.be.bignumber.equal(activeCustomer);
                expect(((await this.BillingInstance.customers(idCustomer1))["nbTopUp"])).to.be.bignumber.equal(new BN(1)); // A voir
                expect(((await this.BillingInstance.customers(idCustomer1))["amount"])).to.be.bignumber.equal(new BN(0))    ;
                expect(((await this.BillingInstance.customers(idCustomer1))["firstTopUp"])).to.be.bignumber.equal(new BN(0));
                expect(((await this.BillingInstance.customers(idCustomer1))["lastAcceptanceID"])).to.be.bignumber.equal(new BN(0));

                // Customer 2
                await this.BillingInstance.addToScore(phoneHash2);
                expect(((await this.BillingInstance.customerList(phoneHash2))["idCustomer"])).to.be.bignumber.equal(idCustomer2);
                expect(((await this.BillingInstance.customerList(phoneHash2))["status"])).to.be.bignumber.equal(activeCustomer);
                expect(((await this.BillingInstance.customers(idCustomer2))["status"])).to.be.bignumber.equal(activeCustomer);
                expect(((await this.BillingInstance.customers(idCustomer2))["nbTopUp"])).to.be.bignumber.equal(new BN(1)); // A voir
                expect(((await this.BillingInstance.customers(idCustomer2))["amount"])).to.be.bignumber.equal(new BN(0))    ;
                expect(((await this.BillingInstance.customers(idCustomer2))["firstTopUp"])).to.be.bignumber.equal(new BN(0));
                expect(((await this.BillingInstance.customers(idCustomer2))["lastAcceptanceID"])).to.be.bignumber.equal(new BN(0));
            });
        });

        describe("Function: changeCustomerStatus", async function() {
            it("Revert: changeCustomerStatus is onlyOwner", async function() {
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await expectRevert(this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:phoneHash1}),
                "Ownable: caller is not the owner");
            });
    
            it("changeCustomerStatus", async function() {
                // Customer 1
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash1, closeCustomer, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash1))["status"])).to.be.bignumber.equal(closeCustomer);

                // Customer 2
                await this.BillingInstance.addToScore(phoneHash2, {from:owner});
                await this.BillingInstance.changeCustomerStatus(phoneHash2, closeCustomer, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash2))["status"])).to.be.bignumber.equal(closeCustomer);
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
                // Customer 1
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.changeScore(phoneHash1, score1, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash1))["score"])).to.be.bignumber.equal(score1);

                // Customer 2
                await this.BillingInstance.addToScore(phoneHash2, {from:owner});
                await this.BillingInstance.changeScore(phoneHash2, score2, {from:owner});
                expect(((await this.BillingInstance.getCustomer(phoneHash2))["score"])).to.be.bignumber.equal(score2);
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
                // Customer 1
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                const history1 = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash1))["lastAcceptanceID"]);
                expect(history1["ref"]).to.be.equal(ref1);
                expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history1["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
                expect(history1["status"]).to.be.bignumber.equal(activeProduct);

                // Customer 2
                await this.BillingInstance.addToScore(phoneHash2, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash2, ref2, timestampA, idProduct2, {from:owner});
                const history2 = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash2))["lastAcceptanceID"]);
                expect(history2["ref"]).to.be.equal(ref2);
                expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history2["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
                expect(history2["status"]).to.be.bignumber.equal(activeProduct);
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
                // Customer 1
                await this.BillingInstance.addToScore(phoneHash1, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash1, ref1, timestampA, idProduct1, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash1, timestampP, {from:owner});
                const history1 = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash1))["lastAcceptanceID"]);
                expect(history1["ref"]).to.be.equal(ref1);
                expect(history1["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history1["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history1["idProduct"]).to.be.bignumber.equal(idProduct1);
                expect(history1["status"]).to.be.bignumber.equal(closeProduct);

                // Customer 2
                await this.BillingInstance.addToScore(phoneHash2, {from:owner});
                await this.BillingInstance.acceptanceBilling(phoneHash2, ref2, timestampA, idProduct2, {from:owner});
                await this.BillingInstance.topUpBilling(phoneHash2, timestampP, {from:owner});
                const history2 = await this.BillingInstance.histories((await this.BillingInstance.getCustomer(phoneHash2))["lastAcceptanceID"]);
                expect(history2["ref"]).to.be.equal(ref2);
                expect(history2["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history2["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history2["idProduct"]).to.be.bignumber.equal(idProduct2);
                expect(history2["status"]).to.be.bignumber.equal(closeProduct);
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
});