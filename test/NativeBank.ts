import hre from "hardhat";
import { Exploit, NativeBank } from "../typechain-types";
import { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";

describe("NativeBank", () => {
  let signers: HardhatEthers.SignerWithAddress[];
  let nativeBankC: NativeBank;

  beforeEach("Deploy NativeBank contract", async () => {
    signers = await hre.ethers.getSigners();
    nativeBankC = await hre.ethers.deployContract("NativeBank");
  });
  it("Should send native token to contract", async () => {
    const staker = signers[0];
    const stakingAmount = hre.ethers.parseEther("1");

    const txResp = await staker.sendTransaction({
      to: await nativeBankC.getAddress(),
      value: stakingAmount,
    });
    await txResp.wait();

    expect(
      await hre.ethers.provider.getBalance(await nativeBankC.getAddress()),
    ).equal(stakingAmount);
    expect(await nativeBankC.balanceOf(staker.address)).equal(stakingAmount);
  });
  it("Should withdraw native token from contract", async () => {
    const staker = signers[0];
    const stakingAmount = hre.ethers.parseEther("10");

    const sentTx = await staker.sendTransaction({
      to: await nativeBankC.getAddress(),
      value: stakingAmount,
    });
    await sentTx.wait();

    expect(await nativeBankC.balanceOf(staker.address)).equal(stakingAmount);

    await nativeBankC.withdraw();
    expect(await nativeBankC.balanceOf(staker.address)).equal(0n);
    expect(
      await hre.ethers.provider.getBalance(await nativeBankC.getAddress()),
    ).equal(0n);
  });

  it("Exploit", async () => {
    const victim1 = signers[1];
    const victim2 = signers[2];
    const hacker = signers[3];

    const exploitC: Exploit = await hre.ethers.deployContract(
      "Exploit",
      [await nativeBankC.getAddress()],
      hacker,
    );
    const hCAddr = await exploitC.getAddress();
    const stakingAmount = hre.ethers.parseEther("1");

    await victim1.sendTransaction({
      to: await nativeBankC.getAddress(),
      value: stakingAmount,
    });
    await victim2.sendTransaction({
      to: await nativeBankC.getAddress(),
      value: stakingAmount,
    });

    await exploitC.exploit({ value: stakingAmount });

    expect(await hre.ethers.provider.getBalance(hCAddr)).equal(
      hre.ethers.parseEther("3"),
    );
    expect(
      await hre.ethers.provider.getBalance(await nativeBankC.getAddress()),
    ).equal(0n);
  });
});
