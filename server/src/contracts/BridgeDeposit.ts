export default {
	address: '0x52b1926417188a0b879306179b5dac3679904528',
	abi: [
		{
			inputs: [
				{ internalType: 'uint256', name: '_maxAmount', type: 'uint256' },
				{ internalType: 'bool', name: '_canReceive', type: 'bool' },
			],
			stateMutability: 'nonpayable',
			type: 'constructor',
		},
		{
			anonymous: false,
			inputs: [{ indexed: false, internalType: 'bool', name: 'canReceive', type: 'bool' }],
			name: 'CanReceiveSet',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'owner', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
			],
			name: 'Destructed',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'emitter', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
			],
			name: 'EtherReceived',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: false, internalType: 'uint256', name: 'previousAmount', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'newAmount', type: 'uint256' },
			],
			name: 'MaxAmountSet',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'oldOwner', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
			],
			name: 'OwnerSet',
			type: 'event',
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'owner', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'balance', type: 'uint256' },
			],
			name: 'Rugged',
			type: 'event',
		},
		{ inputs: [], name: 'destroy', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [],
			name: 'getCanReceive',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'getMaxAmount',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function',
		},
		{
			inputs: [],
			name: 'getOwner',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function',
		},
		{ inputs: [], name: 'rug', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [{ internalType: 'bool', name: '_canReceive', type: 'bool' }],
			name: 'setCanReceive',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'uint256', name: '_maxAmount', type: 'uint256' }],
			name: 'setMaxAmount',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{
			inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
			name: 'setOwner',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function',
		},
		{ stateMutability: 'payable', type: 'receive' },
	],
};
