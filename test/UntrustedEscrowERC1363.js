const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UntrustedEscrowERC1363", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const erc1363tTokenSupply = ethers.utils.parseEther("1000000");
  async function deployUntrustedEscrow1363Fixture() {
    // Contracts are deployed using the first signer/account by default
    const timestamp = Math.floor(Date.now() / 1000);
    const [owner, buyer, seller, operator] = await ethers.getSigners();

    const ERC1363Mock = await ethers.getContractFactory("ERC1363Mock");
    const erc1363Mock = await ERC1363Mock.deploy(
      "MockToken",
      "MTKN",
      owner.address,
      erc1363tTokenSupply
    );

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy("MockToken", "MTKN");

    const UntrustedEscrowERC1363 = await ethers.getContractFactory(
      "UntrustedEscrowERC1363"
    );
    const untrustedEscrowERC1363 = await UntrustedEscrowERC1363.deploy(
      buyer.address,
      seller.address,
      erc1363Mock.address
    );

    return {
      untrustedEscrowERC1363,
      erc1363Mock,
      mockToken,
      owner,
      buyer,
      seller,
      operator,
    };
  }

  describe("Untrusted Escrow", function () {
    describe("Deployment", function () {
      it("Should set the right buyer address", async function () {
        const { untrustedEscrowERC1363, buyer } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );
        expect(await untrustedEscrowERC1363.buyer()).to.equal(buyer.address);
      });

      it("Should set the right seller address", async function () {
        const { untrustedEscrowERC1363, seller } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );
        expect(await untrustedEscrowERC1363.seller()).to.equal(seller.address);
      });
    });

    describe("Deposit", function () {
      it("Should deposit ERC20 token", async function () {
        const { untrustedEscrowERC1363, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(
            untrustedEscrowERC1363.address,
            ethers.utils.parseEther("2")
          );
        await untrustedEscrowERC1363
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("1"));
        expect(
          await mockToken.balanceOf(untrustedEscrowERC1363.address)
        ).to.equal(ethers.utils.parseEther("1"));
        expect(await untrustedEscrowERC1363.timelock()).to.not.equal(0);
      });

      it("Should not deposit when token address is zero", async function () {
        const { untrustedEscrowERC1363, buyer } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );

        await expect(
          untrustedEscrowERC1363
            .connect(buyer)
            .deposit(ZERO_ADDRESS, ethers.utils.parseEther("1"))
        ).to.be.revertedWith("invalid token address");
      });

      it("Should not deposit when amount is 0", async function () {
        const { untrustedEscrowERC1363, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );

        await expect(
          untrustedEscrowERC1363.connect(buyer).deposit(mockToken.address, 0)
        ).to.be.revertedWith("invalid amount");
      });

      it("Should not deposit when role is not buyer", async function () {
        const { untrustedEscrowERC1363, mockToken, seller } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );

        await expect(
          untrustedEscrowERC1363
            .connect(seller)
            .deposit(mockToken.address, ethers.utils.parseEther("1"))
        ).to.be.revertedWith("not buyer");
      });
    });

    describe("Withdraw", function () {
      it("Should withdraw ERC20 token", async function () {
        const {
          untrustedEscrowERC1363,
          mockToken,
          buyer,
          seller,
          erc1363Mock,
          operator,
        } = await loadFixture(deployUntrustedEscrow1363Fixture);
        // Deposit
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(
            untrustedEscrowERC1363.address,
            ethers.utils.parseEther("2")
          );
        await untrustedEscrowERC1363
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("2"));
        expect(
          await mockToken.balanceOf(untrustedEscrowERC1363.address)
        ).to.equal(ethers.utils.parseEther("2"));
        expect(await untrustedEscrowERC1363.timelock()).to.not.equal(0);

        // Withdraw
        let value = ethers.utils.parseEther("1");
        await erc1363Mock.connect(seller).approve(operator.address, value);
      });
    });

    describe("Events", function () {
      it("Should emit an event on deposit", async function () {
        const { untrustedEscrowERC1363, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrow1363Fixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(
            untrustedEscrowERC1363.address,
            ethers.utils.parseEther("2")
          );
        await expect(
          untrustedEscrowERC1363
            .connect(buyer)
            .deposit(mockToken.address, ethers.utils.parseEther("1"))
        )
          .to.emit(untrustedEscrowERC1363, "Deposited")
          .withArgs(
            buyer.address,
            mockToken.address,
            ethers.utils.parseEther("1")
          );
      });
    });
  });
});
