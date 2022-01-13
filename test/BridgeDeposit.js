const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('TeleportrDeposit contract', function () {
	let TeleportrDeposit;
	let TeleportrDepositInstance;
	let owner;
	let addr1;
	let addr2;
	let addr3;
	let addrs;

	const defaultMaxAmount = 10;
	const defaultMinAmount = 1;
	const defaultMaxBalance = 2;
	const defaultCanReceive = true;
	const provider = ethers.provider;

	beforeEach(async function () {
		TeleportrDeposit = await ethers.getContractFactory('TeleportrDeposit');
		[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
		TeleportrDepositInstance = await TeleportrDeposit.deploy(
			ethers.utils.parseEther(defaultMaxAmount.toString()),
			ethers.utils.parseEther(defaultMinAmount.toString()),
			ethers.utils.parseEther(defaultMaxBalance.toString()),
			defaultCanReceive,
			addr2.address,
			addr3.address
		);
	});

	describe('Deployment failure', function () {
		it('Should revert if min deposit amount >= max deposit amount', async function () {
			expect(
				TeleportrDeposit.deploy(
					ethers.utils.parseEther('5'),
					ethers.utils.parseEther('6'),
					ethers.utils.parseEther(defaultMaxBalance.toString()),
					defaultCanReceive,
					addr2.address,
					addr3.address
				)
			).to.be.revertedWith('maxDeposit amount should be greater than minDeposit amount');
		});
		it('Should revert if L2 depositor address is not set', async function () {
			expect(
				TeleportrDeposit.deploy(
					ethers.utils.parseEther('2'),
					ethers.utils.parseEther('1'),
					ethers.utils.parseEther(defaultMaxBalance.toString()),
					defaultCanReceive,
					ethers.constants.AddressZero,
					addr3.address
				)
			).to.be.revertedWith('L2 depositor address should not be null');
		});
		it('Should revert if L1 standard bridge address is not set', async function () {
			expect(
				TeleportrDeposit.deploy(
					ethers.utils.parseEther('2'),
					ethers.utils.parseEther('1'),
					ethers.utils.parseEther(defaultMaxBalance.toString()),
					defaultCanReceive,
					addr3.address,
					ethers.constants.AddressZero
				)
			).to.be.revertedWith('L1 standard bridge address should not be null');
		});
	});

	describe('Deployment success', function () {
		it('Should set the correct owner', async function () {
			const contractOwner = await TeleportrDepositInstance.owner();
			expect(contractOwner).to.equal(owner.address);
		});
		it('Should set the correct max deposit amount', async function () {
			const maxAmount = await TeleportrDepositInstance.maxDepositAmount();
			expect(Number(ethers.utils.formatEther(maxAmount))).to.equal(defaultMaxAmount);
		});
		it('Should set the correct min deposit amount', async function () {
			const minAmount = await TeleportrDepositInstance.minDepositAmount();
			expect(Number(ethers.utils.formatEther(minAmount))).to.equal(defaultMinAmount);
		});
		it('Should set canReceive to true', async function () {
			const canReceive = await TeleportrDepositInstance.canReceiveDeposit();
			expect(canReceive).to.equal(defaultCanReceive);
		});
		it('Should set l2Depositor', async function () {
			const depositor = await TeleportrDepositInstance.l2Depositor();
			expect(depositor).to.equal(addr2.address);
		});
		it('Should set l1StandardBridge', async function () {
			const bridge = await TeleportrDepositInstance.l1StandardBridge();
			expect(bridge).to.equal(addr3.address);
		});
	});

	describe('Set functions', function () {
		describe('When msg.sender is owner', function () {
			it('Should set a new owner', async function () {
				await TeleportrDepositInstance.connect(owner).setOwner(addr1.address);
				expect(await TeleportrDepositInstance.owner()).to.equal(addr1.address);
			});
			it('Should set a new max deposit amount', async function () {
				const newMaxAmount = ethers.utils.parseEther('2.5');
				await TeleportrDepositInstance.connect(owner).setMaxAmount(newMaxAmount);
				expect(await TeleportrDepositInstance.maxDepositAmount()).to.equal(newMaxAmount);
			});
			it('Should set a new min deposit amount', async function () {
				const newMinAmount = ethers.utils.parseEther('1.2');
				await TeleportrDepositInstance.connect(owner).setMinAmount(newMinAmount);
				expect(await TeleportrDepositInstance.minDepositAmount()).to.equal(newMinAmount);
			});
			it('Should set canReceiveDeposit', async function () {
				const canReceive = false;
				await TeleportrDepositInstance.connect(owner).setCanReceiveDeposit(canReceive);
				expect(await TeleportrDepositInstance.canReceiveDeposit()).to.equal(canReceive);
			});
			it('Should set a new max balance', async function () {
				const newMaxBalance = ethers.utils.parseEther('5');
				await TeleportrDepositInstance.connect(owner).setMaxBalance(newMaxBalance);
				expect(await TeleportrDepositInstance.maxBalance()).to.equal(newMaxBalance);
			});
			it('Should set a new L2 depositor address', async function () {
				const newDepositorAddress = addr3.address;
				await TeleportrDepositInstance.connect(owner).setL2Depositor(newDepositorAddress);
				expect(await TeleportrDepositInstance.l2Depositor()).to.equal(newDepositorAddress);
			});
			it('Should set a new L1 standard bridge address', async function () {
				const newBridgeAddress = addr2.address;
				await TeleportrDepositInstance.connect(owner).setL1StandardBridge(newBridgeAddress);
				expect(await TeleportrDepositInstance.l1StandardBridge()).to.equal(newBridgeAddress);
			});
			it('Should revert if trying to set wrong maxDepositAmount', async function () {
				const newMaxAmount = defaultMinAmount - 1;
				expect(
					TeleportrDepositInstance.connect(owner).setMaxAmount(
						ethers.utils.parseEther(newMaxAmount.toString())
					)
				).to.be.revertedWith('maxDeposit amount should be greater than minDeposit amount');
			});
			it('Should revert if trying to set wrong minDepositAmount', async function () {
				const newMinAmount = defaultMaxAmount + 1;
				expect(
					TeleportrDepositInstance.connect(owner).setMinAmount(
						ethers.utils.parseEther(newMinAmount.toString())
					)
				).to.be.revertedWith('maxDeposit amount should be greater than minDeposit amount');
			});
			it('Should revert if L2 depositor address is not set', async function () {
				expect(
					TeleportrDepositInstance.connect(owner).setL2Depositor(ethers.constants.AddressZero)
				).to.be.revertedWith('L2 depositor address should not be null');
			});
			it('Should revert if L1 standard bridge address is not set', async function () {
				expect(
					TeleportrDepositInstance.connect(owner).setL1StandardBridge(ethers.constants.AddressZero)
				).to.be.revertedWith('L1 standard bridge address should not be null');
			});
		});
		describe('When msg.sender is not owner', function () {
			it('Should not set a new owner', async function () {
				expect(TeleportrDepositInstance.connect(addr1).setOwner(addr2.address)).to.be.revertedWith(
					'Caller is not owner'
				);
			});
			it('Should not set a new max amount', async function () {
				expect(
					TeleportrDepositInstance.connect(addr1).setMaxAmount(ethers.utils.parseEther('1.5'))
				).to.be.revertedWith('Caller is not owner');
			});
			it('Should not set a new min amount', async function () {
				expect(
					TeleportrDepositInstance.connect(addr1).setMinAmount(ethers.utils.parseEther('1'))
				).to.be.revertedWith('Caller is not owner');
			});
			it('Should not set canReceive', async function () {
				expect(
					TeleportrDepositInstance.connect(addr1).setCanReceiveDeposit(false)
				).to.be.revertedWith('Caller is not owner');
			});
			it('Should not set a new L2 depositor address', async function () {
				expect(
					TeleportrDepositInstance.connect(addr1).setL2Depositor(addr3.address)
				).to.be.revertedWith('Caller is not owner');
			});
			it('Should not set a new L1 standard bridge address', async function () {
				expect(
					TeleportrDepositInstance.connect(addr1).setL1StandardBridge(addr2.address)
				).to.be.revertedWith('Caller is not owner');
			});
		});
	});
	describe('When ether is sent to TeleportrDeposit', function () {
		it('Should revert if msg.value > maxAmount ', async function () {
			const depositAmount = defaultMaxAmount + 1;
			expect(
				owner.sendTransaction({
					to: TeleportrDepositInstance.address,
					value: ethers.utils.parseEther(depositAmount.toString()),
				})
			).to.be.revertedWith('Wrong deposit amount');
		});
		it('Should revert if msg.value < minAmount ', async function () {
			const depositAmount = defaultMinAmount - 1;
			expect(
				owner.sendTransaction({
					to: TeleportrDepositInstance.address,
					value: ethers.utils.parseEther(depositAmount.toString()),
				})
			).to.be.revertedWith('Wrong deposit amount');
		});
		it('Should revert if contract balance + msg.value > maxBalance ', async function () {
			await owner.sendTransaction({
				to: TeleportrDepositInstance.address,
				value: ethers.utils.parseEther('1'),
			});
			await owner.sendTransaction({
				to: TeleportrDepositInstance.address,
				value: ethers.utils.parseEther('1'),
			});
			expect(
				owner.sendTransaction({
					to: TeleportrDepositInstance.address,
					value: ethers.utils.parseEther('1'),
				})
			).to.be.revertedWith('Contract reached the max balance allowed');
		});
		it('Should revert if canReceiveDeposit = false', async function () {
			await TeleportrDepositInstance.connect(owner).setCanReceiveDeposit(false);
			expect(
				addr1.sendTransaction({
					to: TeleportrDepositInstance.address,
					value: ethers.utils.parseEther('1'),
				})
			).to.be.revertedWith('Contract is not allowed to receive ether');
		});
		it('Should receive ether if correct amount and canReceive = true', async function () {
			const amount = ethers.utils.parseEther(defaultMinAmount.toString());
			await addr1.sendTransaction({
				to: TeleportrDepositInstance.address,
				value: amount,
			});
			expect(await provider.getBalance(TeleportrDepositInstance.address)).to.equal(amount);
		});
	});
	describe('When the withdrawBalance function is called', function () {
		it('Should revert if msg.sender != owner', async function () {
			expect(TeleportrDepositInstance.connect(addr1).withdrawBalance()).to.be.revertedWith(
				'Caller is not owner'
			);
		});
		it('Should send the contract balance to owner', async function () {
			const amount = defaultMinAmount;
			const ownerInitialBalance = await provider.getBalance(owner.address);
			await addr1.sendTransaction({
				to: TeleportrDepositInstance.address,
				value: ethers.utils.parseEther(amount.toString()),
			});
			const tx = await TeleportrDepositInstance.connect(owner).withdrawBalance();
			const receipt = await provider.getTransactionReceipt(tx.hash);

			const logs = receipt.logs.map((l) => TeleportrDeposit.interface.parseLog(l));
			const {
				args: { to: recipient, balance },
			} = logs[0];
			const ownerFinalBalance = await provider.getBalance(owner.address);
			expect(recipient).to.equal(owner.address);
			expect(balance / 1e18).to.equal(amount);
			expect(ownerInitialBalance / 1e18).to.be.lessThan(ownerFinalBalance / 1e18);
		});
	});
	describe('When the withdrawBalanceTo function is called', function () {
		it('Should revert if msg.sender != owner', async function () {
			expect(
				TeleportrDepositInstance.connect(addr1).withdrawBalanceTo(addr2.address)
			).to.be.revertedWith('Caller is not owner');
		});
		it('Should revert if destination address is 0', async function () {
			expect(
				TeleportrDepositInstance.connect(owner).withdrawBalanceTo(ethers.constants.AddressZero)
			).to.be.revertedWith('Destination address cannot be null');
		});
		it('Should send the contract balance to the destination address', async function () {
			const amount = defaultMinAmount;
			const destInitialBalance = await provider.getBalance(addr3.address);
			await addr1.sendTransaction({
				to: TeleportrDepositInstance.address,
				value: ethers.utils.parseEther(amount.toString()),
			});
			const tx = await TeleportrDepositInstance.connect(owner).withdrawBalanceTo(addr3.address);
			const receipt = await provider.getTransactionReceipt(tx.hash);

			const logs = receipt.logs.map((l) => TeleportrDeposit.interface.parseLog(l));
			const {
				args: { to: recipient, balance },
			} = logs[0];
			const destFinalBalance = await provider.getBalance(addr3.address);
			expect(recipient).to.equal(addr3.address);
			expect(balance / 1e18).to.equal(amount);
			expect(destInitialBalance / 1e18).to.be.lessThan(destFinalBalance / 1e18);
		});
	});
	describe('When the contract is destroyed', function () {
		it('Should revert msg.sender != owner', async function () {
			expect(TeleportrDepositInstance.connect(addr1).destroy()).to.be.revertedWith(
				'Caller is not owner'
			);
		});
		it('Should destroy the contract', async function () {
			await TeleportrDepositInstance.connect(owner).destroy();
			expect(await provider.getCode(TeleportrDepositInstance.address)).to.equal('0x');
		});
	});
});
