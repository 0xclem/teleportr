const { ethers } = require('hardhat');

const MAX_DEPOSIT_AMOUNT = 0.02;
const MAX_BALANCE = 2;

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log('Deploying contracts with the account:', deployer.address);

	console.log('Account balance:', (await deployer.getBalance()).toString());

	const maxDepositAmount = ethers.utils.parseEther(MAX_DEPOSIT_AMOUNT.toString());
	const maxBalance = ethers.utils.parseEther(MAX_BALANCE.toString());
	const canReceiveDeposit = true;

	const BridgeDeposit = await ethers.getContractFactory('BridgeDeposit');
	const BridgeDepositInstance = await BridgeDeposit.deploy(
		maxDepositAmount,
		maxBalance,
		canReceiveDeposit
	);

	console.log('BridgeDeposit address:', BridgeDepositInstance.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
