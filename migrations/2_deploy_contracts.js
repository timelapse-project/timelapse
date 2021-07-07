var Offering = artifacts.require("./Offering.sol");

module.exports = function (deployer) {
  deployer.deploy(Offering);
};
