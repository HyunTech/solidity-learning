import hre from "hardhat";
import { expect } from "chai";
import { MultiManagedAccessMock } from "../typechain-types";
import { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import { mintingAmount, decimals } from "./constant";

describe("MultiManagedAccess", () => {
  let signers: HardhatEthers.SignerWithAddress[];
  let multiManagedAccessC: MultiManagedAccessMock;
  let managerAddresses: string[];

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    managerAddresses = signers.slice(1, 6).map((signer) => signer.address);

    multiManagedAccessC = await hre.ethers.deployContract("MultiManagedAccessMock", [
      managerAddresses,
    ]);
  });

  describe("Initialized managers check", () => {
    it("should set signer0 as owner and signer1 to signer5 as managers", async () => {
      expect(await multiManagedAccessC.owner()).equal(signers[0].address);

      for (let i = 0; i < managerAddresses.length; i++) {
        expect(await multiManagedAccessC.managers(i)).equal(managerAddresses[i]);
        expect(await multiManagedAccessC.confirmed(i)).equal(false);
      }
    });
  });

  describe("Confirm", () => {
    it("should revert when non manager confirms", async () => {
      await expect(
        multiManagedAccessC.connect(signers[0]).confirm(),
      ).to.be.revertedWith("You are not a manager");
    });

    it("should confirm managers from signer1 to signer5", async () => {
      for (let i = 1; i <= 5; i++) {
        await multiManagedAccessC.connect(signers[i]).confirm();
        expect(await multiManagedAccessC.confirmed(i - 1)).equal(true);
      }
    });
  });

  describe("OnlyAllConfirmed", () => {
    it("should revert when non manager changes rewardPerBlock", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      await expect(
        multiManagedAccessC.connect(signers[0]).setRewardPerBlock(rewardToChange),
      ).to.be.revertedWith("You are not a manager");
    });

    it("should revert when not all managers confirmed yet", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      await multiManagedAccessC.connect(signers[1]).confirm();
      await multiManagedAccessC.connect(signers[2]).confirm();
      await multiManagedAccessC.connect(signers[3]).confirm();

      await expect(
        multiManagedAccessC.connect(signers[1]).setRewardPerBlock(rewardToChange),
      ).to.be.revertedWith("Not all confirmed yet");
    });

    it("should change rewardPerBlock when all managers confirmed", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      for (let i = 1; i <= 5; i++) {
        await multiManagedAccessC.connect(signers[i]).confirm();
      }

      await multiManagedAccessC
        .connect(signers[1])
        .setRewardPerBlock(rewardToChange);

      expect(await multiManagedAccessC.rewardPerBlock()).equal(rewardToChange);
    });
  });
});
