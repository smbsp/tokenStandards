const { BN } = require("@openzeppelin/test-helpers");

const {
  shouldBehaveLikeLinearBondingCurve,
} = require("./LinearBondingCurve.behaviour");

const ERC20Token = artifacts.require("MockToken");
const ERC1363 = artifacts.require("ERC1363Mock");

contract("LinearBondingCurve", function ([_, wallet, beneficiary, operator]) {
  const name = "TEST";
  const symbol = "TEST";

  const erc1363tTokenSupply = new BN("10000000000000000000000");

  beforeEach(async function () {
    this.erc1363Token = await ERC1363.new(
      name,
      symbol,
      beneficiary,
      erc1363tTokenSupply
    );
    this.erc20Token = await ERC20Token.new(name, symbol);
    this.notAcceptedErc1363Token = await ERC1363.new(
      name,
      symbol,
      beneficiary,
      erc1363tTokenSupply
    );
  });

  shouldBehaveLikeLinearBondingCurve([_, wallet, beneficiary, operator]);
});
