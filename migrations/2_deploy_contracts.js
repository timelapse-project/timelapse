var Billing = artifacts.require("./Billing.sol");
var Timelapse = artifacts.require("./Timelapse.sol");

module.exports = async function (deployer) {
  //deployer.deploy(Timelapse);

  await deployer.deploy(Billing);
  const billing = await Billing.deployed();

  await deployer.deploy(Timelapse, billing.address);
  timelapse = await Timelapse.deployed();
  
  await billing.transferOwnership(timelapse.address);

};
