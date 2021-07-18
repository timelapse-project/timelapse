const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Billing = artifacts.require("Billing");

contract('Billing', function (accounts) {
    const owner = accounts[0];
    const phoneHash = accounts[1];
    describe("Test du contrat", function() {
        beforeEach(async function() {
            this.BillingInstance = await Billing.new();
        });

        it("isActiveCustomer", async function() {
            expect(await this.BillingInstance.isActiveCustomer(phoneHash)).to.be.true;
        });
    });
});