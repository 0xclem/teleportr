const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('BridgeDeposit contract', function () {
	let BridgeDeposit;
	let BridgeDepositInstance;
	let owner;
	let addr1;
	let addr2;
	let addrs;

	const defaultMaxAmount = 1;
	const defaultCanReceive = true;
	const provider = ethers.provider;

	beforeEach(async function () {
		BridgeDeposit = await ethers.getContractFactory('BridgeDeposit');
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
		BridgeDepositInstance = await BridgeDeposit.deploy(
			ethers.utils.parseEther(defaultMaxAmount.toString()),
			defaultCanReceive
		);
	});

	describe('Deployment', function () {
		it('Should set the correct owner', async function () {
			const contractOwner = await BridgeDepositInstance.getOwner();
			expect(contractOwner).to.equal(owner.address);
		});
		it('Should set the correct max amount', async function () {
			const maxAmount = await BridgeDepositInstance.getMaxAmount();
			expect(Number(ethers.utils.formatEther(maxAmount))).to.equal(defaultMaxAmount);
		});
		it('Should set canReceive to true', async function () {
			const canReceive = await BridgeDepositInstance.getCanReceive();
			expect(canReceive).to.equal(defaultCanReceive);
		});
	});

	describe('Set functions', function () {
		describe('When msg.sender is owner', function () {
			it('Should set a new owner', async function () {
				await BridgeDepositInstance.connect(owner).setOwner(addr1.address);
				expect(await BridgeDepositInstance.getOwner()).to.equal(addr1.address);
			});
			it('Should set a new max amount', async function () {
				const newMaxAmount = ethers.utils.parseEther('2.5');
				await BridgeDepositInstance.connect(owner).setMaxAmount(newMaxAmount);
				expect(await BridgeDepositInstance.getMaxAmount()).to.equal(newMaxAmount);
			});
			it('Should set canReceive', async function () {
				const canReceive = false;
				await BridgeDepositInstance.connect(owner).setCanReceive(canReceive);
				expect(await BridgeDepositInstance.getCanReceive()).to.equal(canReceive);
			});
		});
		describe('When msg.sender is not owner', function () {
			it('Should not set a new owner', async function () {
				expect(BridgeDepositInstance.connect(addr1).setOwner(addr2.address)).to.be.revertedWith(
					'Caller is not owner'
				);
			});
			it('Should not set a new max amount', async function () {
				expect(
					BridgeDepositInstance.connect(addr1).setMaxAmount(ethers.utils.parseEther('1.5'))
				).to.be.revertedWith('Caller is not owner');
			});
			it('Should not set canReceive', async function () {
				expect(BridgeDepositInstance.connect(addr1).setCanReceive(false)).to.be.revertedWith(
					'Caller is not owner'
				);
			});
		});
	});
	describe('When ether is sent to BridgeDeposit', function () {
		it('Should revert if msg.value > maxAmount ', async function () {
			expect(
				owner.sendTransaction({
					to: BridgeDepositInstance.address,
					value: ethers.utils.parseEther('10'),
				})
			).to.be.revertedWith('Amount is too big');
		});
		it('Should revert if canReceive = false', async function () {
			await BridgeDepositInstance.connect(owner).setCanReceive(false);
			expect(
				addr1.sendTransaction({
					to: BridgeDepositInstance.address,
					value: ethers.utils.parseEther('1'),
				})
			).to.be.revertedWith('Contract is not allowed to receive ether');
		});
		it('Should receive ether if correct amount and canReceive = true', async function () {
			const amount = ethers.utils.parseEther('0.55');
			await addr1.sendTransaction({
				to: BridgeDepositInstance.address,
				value: amount,
			});
			expect(await provider.getBalance(BridgeDepositInstance.address)).to.equal(amount);
		});
	});
	describe('When the rug function is called', function () {
		it('Should revert msg.sender != owner', async function () {
			expect(BridgeDepositInstance.connect(addr1).rug()).to.be.revertedWith('Caller is not owner');
		});
		it('Should send the contract balance to owner', async function () {
			const amount = ethers.utils.parseEther('0.55');
			const ownerInitialBalance = await provider.getBalance(owner.address);
			await addr1.sendTransaction({
				to: BridgeDepositInstance.address,
				value: amount,
			});
			const tx = await BridgeDepositInstance.connect(owner).rug();
			const receipt = await provider.getTransactionReceipt(tx.hash);

			const logs = receipt.logs.map((l) => BridgeDeposit.interface.parseLog(l));
			const {
				args: { owner: recipient, balance },
			} = logs[0];
			const ownerFinalBalance = await provider.getBalance(owner.address);
			expect(recipient).to.equal(owner.address);
			expect(balance / 1e18).to.equal(0.55);
			expect(ownerInitialBalance / 1e18).to.be.lessThan(ownerFinalBalance / 1e18);
		});
	});
	describe('When the contract is destroyed', function () {
		it('Should revert msg.sender != owner', async function () {
			expect(BridgeDepositInstance.connect(addr1).destroy()).to.be.revertedWith(
				'Caller is not owner'
			);
		});
		it('Should destroy the contract', async function () {
			await BridgeDepositInstance.connect(owner).destroy();
			expect(await provider.getCode(BridgeDepositInstance.address)).to.equal('0x');
		});
	});
});
