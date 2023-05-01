const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenWithSanctions", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const ADMIN_ROLE = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("ADMIN_ROLE")
  );
  async function deployTokenWithSanctionsFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, sender, receiver, approved] = await ethers.getSigners();

    const TokenWithSanctions = await ethers.getContractFactory(
      "TokenWithSanctions"
    );
    const tokenWithSanctions = await TokenWithSanctions.deploy("Token", "TKN");
    return { tokenWithSanctions, owner, sender, receiver, approved };
  }

  describe("Deployment", function () {
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

    it("Should assign the total supply of tokens to the owner", async function () {
      const { tokenWithSanctions, owner } = await loadFixture(
        deployTokenWithSanctionsFixture
      );
      const ownerBalance = await tokenWithSanctions.balanceOf(owner.address);
      expect(await tokenWithSanctions.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the owner as an admin", async function () {
      const { tokenWithSanctions, owner } = await loadFixture(
        deployTokenWithSanctionsFixture
      );

      expect(await tokenWithSanctions.owner()).to.equal(owner.address);
    });
  });

  describe("Sanctions", function () {
    describe("Validations", function () {
      it("Should sanction an address", async function () {
        const { tokenWithSanctions, sender } = await loadFixture(
          deployTokenWithSanctionsFixture
        );

        await tokenWithSanctions.sanctionAddress(sender.address);
        expect(await tokenWithSanctions.isSanctioned(sender.address)).to.equal(
          true
        );
      });

      it("Should revert sanction when address is already sanctioned", async function () {
        const { tokenWithSanctions, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );

        await tokenWithSanctions.sanctionAddress(receiver.address);
        await expect(
          tokenWithSanctions.sanctionAddress(receiver.address)
        ).to.be.revertedWith("address already sanctioned");
      });

      it("Should unsanction an address", async function () {
        const { tokenWithSanctions, sender } = await loadFixture(
          deployTokenWithSanctionsFixture
        );

        await tokenWithSanctions.sanctionAddress(sender.address);
        expect(await tokenWithSanctions.isSanctioned(sender.address)).to.equal(
          true
        );
        await tokenWithSanctions.unsanctionAddress(sender.address);
        expect(await tokenWithSanctions.isSanctioned(sender.address)).to.equal(
          false
        );
      });

      it("Should revert when address is already unsanctioned", async function () {
        const { tokenWithSanctions, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );
        await expect(
          tokenWithSanctions.unsanctionAddress(receiver.address)
        ).to.be.revertedWith("address not sanctioned");
      });
    });

    describe("Transfers", function () {
      it("Should transfer when no sanctions", async function () {
        const { tokenWithSanctions, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );
        await tokenWithSanctions.transfer(
          receiver.address,
          ethers.utils.parseEther("1")
        );
        expect(await tokenWithSanctions.balanceOf(receiver.address)).to.equal(
          ethers.utils.parseEther("1")
        );
      });

      it("Should not transfer when receiver is sanctioned", async function () {
        const { tokenWithSanctions, owner, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );

        await tokenWithSanctions.sanctionAddress(receiver.address);
        await expect(
          tokenWithSanctions.transfer(
            receiver.address,
            ethers.utils.parseEther("1")
          )
        ).to.be.revertedWith("receiver sanctioned");
      });

      it("Should not transfer when sender is sanctioned", async function () {
        const { tokenWithSanctions, sender, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );
        await tokenWithSanctions.transfer(
          sender.address,
          ethers.utils.parseEther("2")
        );
        await tokenWithSanctions.sanctionAddress(sender.address);
        await expect(
          tokenWithSanctions
            .connect(sender)
            .transfer(receiver.address, ethers.utils.parseEther("1"))
        ).to.be.revertedWith("sender sanctioned");
      });
    });

    describe("TransfersFrom", function () {
      it("Should transferFrom when no sanctions", async function () {
        const { tokenWithSanctions, owner, sender, receiver } =
          await loadFixture(deployTokenWithSanctionsFixture);

        await tokenWithSanctions.approve(
          sender.address,
          ethers.utils.parseEther("1")
        );
        await tokenWithSanctions
          .connect(sender)
          .transferFrom(
            owner.address,
            receiver.address,
            ethers.utils.parseEther("1")
          );
        expect(await tokenWithSanctions.balanceOf(receiver.address)).to.equal(
          ethers.utils.parseEther("1")
        );
      });

      it("Should not transferFrom when receiver is sanctioned", async function () {
        const { tokenWithSanctions, owner, sender, receiver } =
          await loadFixture(deployTokenWithSanctionsFixture);

        await tokenWithSanctions.approve(
          sender.address,
          ethers.utils.parseEther("1")
        );

        await tokenWithSanctions.sanctionAddress(receiver.address);
        await expect(
          tokenWithSanctions
            .connect(sender)
            .transferFrom(
              owner.address,
              receiver.address,
              ethers.utils.parseEther("1")
            )
        ).to.be.revertedWith("receiver sanctioned");
      });

      it("Should not transfer when approved is sanctioned", async function () {
        const { tokenWithSanctions, owner, sender, receiver } =
          await loadFixture(deployTokenWithSanctionsFixture);

        await tokenWithSanctions.approve(
          sender.address,
          ethers.utils.parseEther("2")
        );
        await tokenWithSanctions.sanctionAddress(sender.address);
        await expect(
          tokenWithSanctions
            .connect(sender)
            .transferFrom(
              owner.address,
              receiver.address,
              ethers.utils.parseEther("1")
            )
        ).to.be.revertedWith("approved sanctioned");
      });

      it("Should not transfer when sender is sanctioned", async function () {
        const { tokenWithSanctions, owner, sender, receiver, approved } =
          await loadFixture(deployTokenWithSanctionsFixture);

        await tokenWithSanctions.transfer(
          sender.address,
          ethers.utils.parseEther("2")
        );

        await tokenWithSanctions
          .connect(sender)
          .approve(approved.address, ethers.utils.parseEther("2"));
        await tokenWithSanctions.sanctionAddress(sender.address);
        await expect(
          tokenWithSanctions
            .connect(sender)
            .transferFrom(
              sender.address,
              receiver.address,
              ethers.utils.parseEther("1")
            )
        ).to.be.revertedWith("sender sanctioned");
      });
    });

    describe("Events", function () {
      it("Should emit an event on sanction", async function () {
        const { tokenWithSanctions, sender } = await loadFixture(
          deployTokenWithSanctionsFixture
        );
        await expect(tokenWithSanctions.sanctionAddress(sender.address))
          .to.emit(tokenWithSanctions, "Sanction")
          .withArgs(sender.address);
      });

      it("Should emit an event on unsanction", async function () {
        const { tokenWithSanctions, receiver } = await loadFixture(
          deployTokenWithSanctionsFixture
        );
        await tokenWithSanctions.sanctionAddress(receiver.address);
        await expect(tokenWithSanctions.unsanctionAddress(receiver.address))
          .to.emit(tokenWithSanctions, "UnSanction")
          .withArgs(receiver.address);
      });
    });
  });
});
