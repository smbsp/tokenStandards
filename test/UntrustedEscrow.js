const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UntrustedEscrow", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const Role = {
    BUYER: 0,
    SELLER: 1,
  };
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  async function deployUntrustedEscrowFixture() {
    // Contracts are deployed using the first signer/account by default
    const timestamp = Math.floor(Date.now() / 1000);
    const [owner, buyer, seller] = await ethers.getSigners();
    const UntrustedEscrow = await ethers.getContractFactory("UntrustedEscrow");
    const untrustedEscrow = await UntrustedEscrow.deploy();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy("MockToken", "MTKN");
    return { untrustedEscrow, mockToken, owner, buyer, seller, timestamp };
  }

  describe("Untrusted Escrow", function () {
    describe("Deposit", function () {
      it("Should to deposit ERC20 token", async function () {
        const { untrustedEscrow, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrowFixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(untrustedEscrow.address, ethers.utils.parseEther("2"));
        await untrustedEscrow
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("1"), Role.BUYER);
        expect(await mockToken.balanceOf(untrustedEscrow.address)).to.equal(
          ethers.utils.parseEther("1")
        );
        expect(await untrustedEscrow.roles(buyer.address)).to.equal(Role.BUYER);
        const tokenDetails = await untrustedEscrow.tokenTimelock(buyer.address);
        expect(tokenDetails.token).to.equal(mockToken.address);
        expect(tokenDetails.timelock).to.not.equal(0);
      });

      it("Should not deposit when token address is zero", async function () {
        const { untrustedEscrow, buyer } = await loadFixture(
          deployUntrustedEscrowFixture
        );

        await expect(
          untrustedEscrow
            .connect(buyer)
            .deposit(ZERO_ADDRESS, ethers.utils.parseEther("1"), Role.BUYER)
        ).to.be.revertedWith("invalid token address");
      });

      it("Should not deposit when amount is 0", async function () {
        const { untrustedEscrow, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrowFixture
        );

        await expect(
          untrustedEscrow
            .connect(buyer)
            .deposit(mockToken.address, 0, Role.BUYER)
        ).to.be.revertedWith("invalid amount");
      });

      it("Should not deposit when role is not buyer", async function () {
        const { untrustedEscrow, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrowFixture
        );

        await expect(
          untrustedEscrow
            .connect(buyer)
            .deposit(
              mockToken.address,
              ethers.utils.parseEther("1"),
              Role.SELLER
            )
        ).to.be.revertedWith("only buyer can deposit token");
      });
    });

    describe("Withdraw", function () {
      it("Should withdraw ERC20 token", async function () {
        const { untrustedEscrow, mockToken, buyer, seller } = await loadFixture(
          deployUntrustedEscrowFixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(untrustedEscrow.address, ethers.utils.parseEther("2"));
        await untrustedEscrow
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("1"), Role.BUYER);
        // Increase the time of the blockchain by 4 days
        await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]);
        // Mine a new block to confirm the time increase
        await ethers.provider.send("evm_mine", []);
        await untrustedEscrow
          .connect(seller)
          .withdraw(buyer.address, Role.SELLER);
        expect(await mockToken.balanceOf(untrustedEscrow.address)).to.equal(0);
        expect(await untrustedEscrow.roles(seller.address)).to.equal(
          Role.SELLER
        );
        const tokenDetails = await untrustedEscrow.tokenTimelock(buyer.address);
        expect(tokenDetails.token).to.equal(ZERO_ADDRESS);
        expect(tokenDetails.timelock).to.equal(0);
      });

      it("Should not withdraw when buyer address is zero", async function () {
        const { untrustedEscrow, seller } = await loadFixture(
          deployUntrustedEscrowFixture
        );

        await expect(
          untrustedEscrow.connect(seller).withdraw(ZERO_ADDRESS, Role.SELLER)
        ).to.be.revertedWith("invalid buyer address");
      });

      it("Should not withdraw before 3 days", async function () {
        // Deposit
        const { untrustedEscrow, mockToken, buyer, seller } = await loadFixture(
          deployUntrustedEscrowFixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(untrustedEscrow.address, ethers.utils.parseEther("2"));
        await untrustedEscrow
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("1"), Role.BUYER);

        await expect(
          untrustedEscrow.connect(seller).withdraw(buyer.address, Role.SELLER)
        ).to.be.revertedWith("cannot withdraw before 3 days");
      });

      it("Should not withdraw when role is not seller", async function () {
        const { untrustedEscrow, buyer, seller } = await loadFixture(
          deployUntrustedEscrowFixture
        );

        await expect(
          untrustedEscrow.connect(seller).withdraw(buyer.address, Role.BUYER)
        ).to.be.revertedWith("only seller can withdraw token");
      });
    });

    describe("Events", function () {
      it("Should emit an event on deposit", async function () {
        const { untrustedEscrow, mockToken, buyer } = await loadFixture(
          deployUntrustedEscrowFixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(untrustedEscrow.address, ethers.utils.parseEther("2"));
        await expect(
          untrustedEscrow
            .connect(buyer)
            .deposit(
              mockToken.address,
              ethers.utils.parseEther("1"),
              Role.BUYER
            )
        )
          .to.emit(untrustedEscrow, "Deposited")
          .withArgs(buyer.address, ethers.utils.parseEther("1"));
      });

      it("Should emit an event on withdrawal", async function () {
        const { untrustedEscrow, mockToken, buyer, seller } = await loadFixture(
          deployUntrustedEscrowFixture
        );
        await mockToken.transfer(buyer.address, ethers.utils.parseEther("2"));
        await mockToken
          .connect(buyer)
          .approve(untrustedEscrow.address, ethers.utils.parseEther("2"));
        await untrustedEscrow
          .connect(buyer)
          .deposit(mockToken.address, ethers.utils.parseEther("1"), Role.BUYER);
        // Increase the time of the blockchain by 4 days
        await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]);
        // Mine a new block to confirm the time increase
        await ethers.provider.send("evm_mine", []);
        await expect(
          untrustedEscrow.connect(seller).withdraw(buyer.address, Role.SELLER)
        )
          .to.emit(untrustedEscrow, "Withdrawn")
          .withArgs(seller.address, ethers.utils.parseEther("1"));
      });
    });
  });
});
