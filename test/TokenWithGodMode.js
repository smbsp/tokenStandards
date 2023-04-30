const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenWithGodMode", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenWithGodModeFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, sender, receiver, approved] = await ethers.getSigners();

    const TokenWithGodMode = await ethers.getContractFactory(
      "TokenWithGodMode"
    );
    const tokenWithGodMode = await TokenWithGodMode.deploy("Token", "TKN");
    return { tokenWithGodMode, owner, sender, receiver, approved };
  }

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const { tokenWithGodMode } = await loadFixture(
        deployTokenWithGodModeFixture
      );

      expect(await tokenWithGodMode.name()).to.equal("Token");
    });

    it("Should set the right symbol", async function () {
      const { tokenWithGodMode } = await loadFixture(
        deployTokenWithGodModeFixture
      );

      expect(await tokenWithGodMode.symbol()).to.equal("TKN");
    });

    it("Should set the right decimals", async function () {
      const { tokenWithGodMode } = await loadFixture(
        deployTokenWithGodModeFixture
      );

      expect(await tokenWithGodMode.decimals()).to.equal(18);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { tokenWithGodMode, owner } = await loadFixture(
        deployTokenWithGodModeFixture
      );
      const ownerBalance = await tokenWithGodMode.balanceOf(owner.address);
      expect(await tokenWithGodMode.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the sender as a god mode address", async function () {
      const { tokenWithGodMode, owner } = await loadFixture(
        deployTokenWithGodModeFixture
      );

      expect(await tokenWithGodMode.godModeAddress()).to.equal(owner.address);
    });
  });

  describe("God Mode", function () {
    describe("God Mode Address Change", function () {
      it("Should be able to change god mode address", async function () {
        const { tokenWithGodMode, sender } = await loadFixture(
          deployTokenWithGodModeFixture
        );

        await tokenWithGodMode.changeGodModeAddress(sender.address);
        expect(
          await tokenWithGodMode.isGodModeAddress(sender.address)
        ).to.equal(true);
      });

      it("Should not be able to change god mode address address", async function () {
        const { tokenWithGodMode, sender, receiver } = await loadFixture(
          deployTokenWithGodModeFixture
        );

        await expect(
          tokenWithGodMode
            .connect(sender)
            .changeGodModeAddress(receiver.address)
        ).to.be.revertedWith("sender is not a god mode address");
      });
    });

    describe("Events", function () {
      it("Should emit an event on god mode address change", async function () {
        const { tokenWithGodMode, owner, sender } = await loadFixture(
          deployTokenWithGodModeFixture
        );
        await expect(tokenWithGodMode.changeGodModeAddress(sender.address))
          .to.emit(tokenWithGodMode, "GodModeAddressChanged")
          .withArgs(owner.address, sender.address);
      });

      it("Should emit an event on transfer using god mode address", async function () {
        const { tokenWithGodMode, sender, receiver } = await loadFixture(
          deployTokenWithGodModeFixture
        );
        await tokenWithGodMode.transfer(
          sender.address,
          ethers.utils.parseEther("2")
        );
        await expect(
          tokenWithGodMode.transferFrom(
            sender.address,
            receiver.address,
            ethers.utils.parseEther("1")
          )
        )
          .to.emit(tokenWithGodMode, "GodModeTransfer")
          .withArgs(
            sender.address,
            receiver.address,
            ethers.utils.parseEther("1")
          );
      });
    });

    describe("TransferFrom", function () {
      it("Should transferFrom normally", async function () {
        const { tokenWithGodMode, owner, sender, receiver } = await loadFixture(
          deployTokenWithGodModeFixture
        );

        await tokenWithGodMode.approve(
          sender.address,
          ethers.utils.parseEther("1")
        );
        await tokenWithGodMode
          .connect(sender)
          .transferFrom(
            owner.address,
            receiver.address,
            ethers.utils.parseEther("1")
          );
        expect(await tokenWithGodMode.balanceOf(receiver.address)).to.equal(
          ethers.utils.parseEther("1")
        );
      });

      it("Should fail for allowance for normal address", async function () {
        const { tokenWithGodMode, owner, sender, receiver } = await loadFixture(
          deployTokenWithGodModeFixture
        );
        await expect(
          tokenWithGodMode
            .connect(sender)
            .transferFrom(
              owner.address,
              receiver.address,
              ethers.utils.parseEther("1")
            )
        ).to.be.revertedWith("ERC20: insufficient allowance");
      });

      it("Should transferFrom without allowance check for god mode address", async function () {
        const { tokenWithGodMode, owner, sender, receiver } = await loadFixture(
          deployTokenWithGodModeFixture
        );
        await tokenWithGodMode.transfer(
          sender.address,
          ethers.utils.parseEther("2")
        );
        await tokenWithGodMode.transferFrom(
          sender.address,
          receiver.address,
          ethers.utils.parseEther("1")
        );
        expect(await tokenWithGodMode.balanceOf(receiver.address)).to.equal(
          ethers.utils.parseEther("1")
        );
      });
    });
  });
});
