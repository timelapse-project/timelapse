const { BN, ether, expectRevert } = require("@openzeppelin/test-helpers");
const expectEvent = require("@openzeppelin/test-helpers/src/expectEvent");
const { expect } = require("chai");
const Timelapse = artifacts.require("Timelapse");

contract("Timelapse", function (accounts) {
  const owner = accounts[0];

  const phoneHash1 = "0x3ad53d26D15A658A84Fe8cA9FFc8aA3a7240C1a0";
  const ref1 = "EXTERNAL_REFERENCE";

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

  describe("Début des tests pour Timelapse", function () {
    beforeEach(async function () {
      this.TimelapseInstance = await Timelapse.new();
    });

    describe("Proposal :", function () {
      it("Add proposal", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        let proposals = await this.TimelapseInstance.proposals(0);
        expect(proposals["minScoring"]).to.be.bignumber.equal(minScore);
        expect(proposals["capital"]).to.be.bignumber.equal(capital);
        expect(proposals["interest"]).to.be.bignumber.equal(interest);
        expect(proposals["description"]).to.be.equal(description);
        expect(proposals["status"]).to.be.bignumber.equal(activeStatus);
      });

      it("Event: ProposalAdded", async function () {
        expectEvent(
          await this.TimelapseInstance.addProposal(
            minScore,
            capital,
            interest,
            description,
            {
              from: owner,
            }
          ),
          "ProposalAdded",
          {
            proposalId: new BN(0),
            minScoring: minScore,
            capital: capital,
            interest: interest,
            description: description,
          }
        );
      });

      it("Close proposal", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        await this.TimelapseInstance.closedProposal(0, {
          from: owner,
        });
        let proposals = await this.TimelapseInstance.proposals(0);
        expect(proposals["status"]).to.be.bignumber.equal(closedStatus);
      });

      it("Proposal count", async function () {
        let proposalsCountBefore =
          await this.TimelapseInstance.proposalsCount();
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        let proposalsCountAfter = await this.TimelapseInstance.proposalsCount();

        expect(proposalsCountBefore).to.be.bignumber.equal(new BN(0));
        expect(proposalsCountAfter).to.be.bignumber.equal(new BN(1));
      });
    });

    describe("LowBalance :", function () {
      it("Event: LowBalanceReceived", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        expectEvent(
          await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
            from: owner,
          }),
          "LowBalanceReceived",
          {
            phoneHash: phoneHash1,
            ref: ref1,
          }
        );
      });
      it("Event: OfferSent", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        expectEvent(
          await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
            from: owner,
          }),
          "OfferSent",
          {
            phoneHash: phoneHash1,
            ref: ref1,
          }
        );
      });
    });

    describe("Acceptance :", function () {
      it("Event: AcceptanceReceived", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        expectEvent(
          await this.TimelapseInstance.acceptance(
            phoneHash1,
            new BN(0),
            new BN(0),
            {
              from: owner,
            }
          ),
          "AcceptanceReceived",
          {
            phoneHash: phoneHash1,
            offerId: offerId1,
            proposalId: proposalId1,
          }
        );
      });
      it("Event: ConfirmationSent", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        expectEvent(
          await this.TimelapseInstance.acceptance(
            phoneHash1,
            offerId1,
            productId1,
            {
              from: owner,
            }
          ),
          "ConfirmationSent",
          {
            phoneHash: phoneHash1,
            offerId: offerId1,
            productId: productId1,
          }
        );
      });
    });

    describe("TopUp :", function () {
      it("Event: TopUpReceived", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          offerId1,
          productId1,
          {
            from: owner,
          }
        );
        expectEvent(
          await this.TimelapseInstance.topUp(phoneHash1, productId1, amount1, {
            from: owner,
          }),
          "TopUpReceived",
          {
            phoneHash: phoneHash1,
            productId: productId1,
            amount: amount1,
          }
        );
      });
      it("Event: AcknowledgeSent", async function () {
        await this.TimelapseInstance.addProposal(
          minScore,
          capital,
          interest,
          description,
          {
            from: owner,
          }
        );
        await this.TimelapseInstance.lowBalance(phoneHash1, ref1, {
          from: owner,
        });
        await this.TimelapseInstance.acceptance(
          phoneHash1,
          offerId1,
          productId1,
          {
            from: owner,
          }
        );
        expectEvent(
          await this.TimelapseInstance.topUp(phoneHash1, productId1, amount1, {
            from: owner,
          }),
          "AcknowledgeSent",
          {
            phoneHash: phoneHash1,
            productId: productId1,
            amount: amount1,
          }
        );
      });
    });
  });
});
