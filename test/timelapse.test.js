const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Timelapse = artifacts.require("Timelapse");

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

    describe("Test du contrat", function() {
        beforeEach(async function() {
            this.TimelapseInstance = await Timelapse.new();
        });

        describe("Function: isActiveCustomer", async function() {
            it("isActiveCustomer", async function() {
                expect(await this.TimelapseInstance.isActiveCustomer(phoneHash)).to.be.true;
            });
        });

        describe("Function: changeCustomerStatus", async function() {
            it("Revert: changeCustomerStatus is onlyOwner", async function() {
                await expectRevert(this.TimelapseInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeCustomerStatus", async function() {
                await this.TimelapseInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                expect(((await this.TimelapseInstance.customers(phoneHash))["status"])).to.be.bignumber.equal(closeCustomer);
            });
    
            it("Event: CustomerStatusChange for changeCustomerStatus", async function() {
                expectEvent(await this.TimelapseInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner}),
                "CustomerStatusChange",
                {phoneHash: phoneHash, status: closeCustomer});
            });
        });

        describe("Function: changeScore", async function() {
            it("Revert: changeScore is onlyOwner", async function() {
                await expectRevert(this.TimelapseInstance.changeScore(phoneHash, score, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("changeScore", async function() {
                await this.TimelapseInstance.changeScore(phoneHash, score, {from:owner});
                expect(((await this.TimelapseInstance.customers(phoneHash))["score"])).to.be.bignumber.equal(score);
            });
    
            it("Event: ScoreChange for changeScore", async function() {
                expectEvent(await this.TimelapseInstance.changeScore(phoneHash, score, {from:owner}),
                "ScoreChange",
                {phoneHash: phoneHash, score: score});
            });
        });

        describe("Function: acceptanceBilling", async function() {
            it("Revert: acceptanceBilling is onlyOwner", async function() {
                await expectRevert(this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });
    
            it("Revert: acceptanceBilling is activeCustomer", async function() {
                await this.TimelapseInstance.changeCustomerStatus(phoneHash, closeCustomer, {from:owner});
                await expectRevert(this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Blocked customer");
            });
    
            it("acceptanceBilling", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                const history = await this.TimelapseInstance.histories(phoneHash, (await this.TimelapseInstance.customers(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(new BN(0));
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(activeProduct);
            });
    
            it("Event: AcceptanceReceived for acceptanceBilling", async function() {
                expectEvent(await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "AcceptanceReceived",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
    
            it("Event: Confirmation for acceptanceBilling", async function() {
                expectEvent(await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner}),
                "Confirmation",
                {phoneHash: phoneHash, ref: ref, acceptanceTimestamp: timestampA, idProduct: idProduct});
            });
        });

        describe("Function: topUpBilling", async function() {
            it("Revert: topUpBilling is onlyOwner", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await expectRevert(this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:phoneHash}),
                "Ownable: caller is not the owner");
            });

            it("Revert: topUpBilling is for registered phone", async function() {
                await expectRevert(this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Phone is not registered");
            });

            it("Revert: topUpBilling is for actived product", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                await expectRevert(this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "The customer has no product to refund");
            });

            it("topUpBilling", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                await this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner});
                const history = await this.TimelapseInstance.histories(phoneHash, (await this.TimelapseInstance.customers(phoneHash))["lastAcceptanceID"]);
                expect(history["ref"]).to.be.equal(ref);
                expect(history["acceptanceTimestamp"]).to.be.bignumber.equal(timestampA);
                expect(history["paidTimestamp"]).to.be.bignumber.equal(timestampP);
                expect(history["idProduct"]).to.be.bignumber.equal(idProduct);
                expect(history["status"]).to.be.bignumber.equal(closeProduct);
            });

            it("Event: TopUpReceived for topUpBilling", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "TopUpReceived",
                {phoneHash: phoneHash, ref: ref});
            });

            it("Event: Acknowledge for topUpBilling", async function() {
                await this.TimelapseInstance.acceptanceBilling(phoneHash, ref, timestampA, idProduct, {from:owner});
                expectEvent(await this.TimelapseInstance.topUpBilling(phoneHash, timestampP, {from:owner}),
                "Acknowledge",
                {phoneHash: phoneHash, ref: ref});
            })
        });
    });
});