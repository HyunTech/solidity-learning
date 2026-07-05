import hre from "hardhat";
import { expect } from "chai";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import { mintingAmount, decimals } from "./constant";

describe("MultiManagedAccess", () => {
  let signers: HardhatEthers.SignerWithAddress[];
  let myTokenC: MyToken;
  let tinyBankC: TinyBank;
  let managerAddresses: string[];

  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    managerAddresses = signers.slice(1, 6).map((signer) => signer.address);

    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      decimals,
      mintingAmount,
    ]);

    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
      managerAddresses,
    ]);

    await myTokenC.setManager(await tinyBankC.getAddress());
  });

  describe("Initialized managers check", () => {
    it("should set signer0 as owner and signer1 to signer5 as managers", async () => {
      expect(await tinyBankC.owner()).equal(signers[0].address);

      for (let i = 0; i < managerAddresses.length; i++) {
        expect(await tinyBankC.managers(i)).equal(managerAddresses[i]);
        expect(await tinyBankC.confirmed(i)).equal(false);
      }
    });
  });

  describe("Confirm", () => {
    it("should revert when non manager confirms", async () => {
      await expect(tinyBankC.connect(signers[0]).confirm()).to.be.revertedWith(
        "You are not a manager",
      );
    });

    it("should confirm managers from signer1 to signer5", async () => {
      for (let i = 1; i <= 5; i++) {
        await tinyBankC.connect(signers[i]).confirm();
        expect(await tinyBankC.confirmed(i - 1)).equal(true);
      }
    });
  });

  describe("OnlyAllConfirmed", () => {
    it("should revert when non manager changes rewardPerBlock", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      await expect(
        tinyBankC.connect(signers[0]).setRewardPerBlock(rewardToChange),
      ).to.be.revertedWith("You are not a manager");
    });

    it("should revert when not all managers confirmed yet", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      await tinyBankC.connect(signers[1]).confirm();
      await tinyBankC.connect(signers[2]).confirm();
      await tinyBankC.connect(signers[3]).confirm();

      await expect(
        tinyBankC.connect(signers[1]).setRewardPerBlock(rewardToChange),
      ).to.be.revertedWith("Not all confirmed yet");
    });

    it("should change rewardPerBlock when all managers confirmed", async () => {
      const rewardToChange = hre.ethers.parseUnits("10000", decimals);

      for (let i = 1; i <= 5; i++) {
        await tinyBankC.connect(signers[i]).confirm();
      }

      await tinyBankC.connect(signers[1]).setRewardPerBlock(rewardToChange);

      expect(await tinyBankC.rewardPerBlock()).equal(rewardToChange);
    });
  });
});
