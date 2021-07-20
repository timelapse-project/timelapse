var Billing = artifacts.require("./Billing.sol");
var Offering = artifacts.require("./Offering.sol");
var Timelapse = artifacts.require("./Timelapse.sol");

module.exports = async function (deployer) {
  // Deploy Billing Contract
  await deployer.deploy(Billing);
  const billing = await Billing.deployed();

  // Deploy Offering Contract
  await deployer.deploy(Offering);
  const offering = await Offering.deployed();

  // Deploy Timelapse Contract
  await deployer.deploy(Timelapse, billing.address, offering.address);
  const timelapse = await Timelapse.deployed();
  
  // Transfer Ownership to Timelapse
  await billing.transferOwnership(timelapse.address);
  await offering.transferOwnership(timelapse.address);
};
