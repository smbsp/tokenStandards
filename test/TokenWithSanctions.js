const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("TokenWithSanctions", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const ADMIN_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ADMIN_ROLE")
  );
  async function deployTokenWithSanctionsFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, newAdmin, user] = await ethers.getSigners();

    const TokenWithSanctions = await ethers.getContractFactory(
      "TokenWithSanctions"
    );
    const tokenWithSanctions = await TokenWithSanctions.deploy("Token", "TKN");

    return { tokenWithSanctions, owner, newAdmin, user };
  }

  describe.only("Deployment", function () {
    it("Should set the right name", async function () {
      const { tokenWithSanctions } = await loadFixture(
        deployTokenWithSanctionsFixture
      );

      expect(await tokenWithSanctions.name()).to.equal("Token");
    });

    it("Should set the right symbol", async function () {
      const { tokenWithSanctions } = await loadFixture(
        deployTokenWithSanctionsFixture
      );

      expect(await tokenWithSanctions.symbol()).to.equal("TKN");
    });

    it("Should set the right decimals", async function () {
      const { tokenWithSanctions } = await loadFixture(
        deployTokenWithSanctionsFixture
      );

      expect(await tokenWithSanctions.decimals()).to.equal(18);
    });

    it("Should set the owner as an admin", async function () {
      const { tokenWithSanctions, owner } = await loadFixture(
        deployTokenWithSanctionsFixture
      );

      expect(
        await tokenWithSanctions.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });
  });
});
