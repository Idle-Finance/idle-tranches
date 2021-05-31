require("hardhat/config")
const { BigNumber } = require("@ethersproject/bignumber");
const helpers = require("../scripts/helpers");
const addresses = require("../lib/addresses");
const { expect } = require("chai");

const BN = n => BigNumber.from(n.toString());
const ONE_TOKEN = (n, decimals) => BigNumber.from('10').pow(BigNumber.from(n));

describe("IdleStrategy", function () {
  beforeEach(async () => {
    // deploy contracts
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const MockIdleToken = await ethers.getContractFactory("MockIdleToken");

    this.underlying = await MockERC20.deploy("DAI", "DAI");
    await this.underlying.deployed();

    this.incentiveToken = await MockERC20.deploy("IDLE", "IDLE");
    await this.incentiveToken.deployed();

    this.idleToken = await MockIdleToken.deploy(this.underlying.address);
    await this.idleToken.deployed();

    this.strategy = await helpers.deployUpgradableContract('IdleStrategy', [this.idleToken.address, this.owner.address], this.owner);
  });

  it("should not reinitialize the contract", async () => {
    await expect(
      this.strategy.connect(this.owner).initialize(this.idleToken.address, this.owner.address),
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("should initialize", async () => {
    expect(await this.strategy.strategyToken()).to.equal(this.idleToken.address);
    expect(await this.strategy.owner()).to.equal(this.owner.address);
    expect(await this.strategy.token()).to.equal(this.underlying.address);
    expect(await this.strategy.idleToken()).to.equal(this.idleToken.address);
    expect(await this.strategy.tokenDecimals()).to.be.bignumber.equal(BN(18));
    expect(await this.strategy.oneToken()).to.be.bignumber.equal(ONE_TOKEN(18));
  });

  // TODO add more
});
