"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeDeposit = void 0;
exports.bridgeDeposit = {
    address: "0x324C7ec7fb2Bc61646aC2f22f6D06AB29B6c87a3",
    abi: [
        {
            inputs: [
                { internalType: "uint256", name: "_maxDepositAmount", type: "uint256" },
                { internalType: "uint256", name: "_maxBalance", type: "uint256" },
                { internalType: "bool", name: "_canReceiveDeposit", type: "bool" },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "owner",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "balance",
                    type: "uint256",
                },
            ],
            name: "BalanceWithdrawn",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "bool",
                    name: "canReceiveDeposit",
                    type: "bool",
                },
            ],
            name: "CanReceiveDepositSet",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "owner",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "Destructed",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "emitter",
                    type: "address",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "EtherReceived",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "previousBalance",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "newBalance",
                    type: "uint256",
                },
            ],
            name: "MaxBalanceSet",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "previousAmount",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "newAmount",
                    type: "uint256",
                },
            ],
            name: "MaxDepositAmountSet",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "oldOwner",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "newOwner",
                    type: "address",
                },
            ],
            name: "OwnerSet",
            type: "event",
        },
        {
            inputs: [],
            name: "destroy",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "getCanReceiveDeposit",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getMaxBalance",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getMaxDepositAmount",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getOwner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "bool", name: "_canReceiveDeposit", type: "bool" },
            ],
            name: "setCanReceiveDeposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "_maxDepositAmount", type: "uint256" },
            ],
            name: "setMaxAmount",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "uint256", name: "_maxBalance", type: "uint256" },
            ],
            name: "setMaxBalance",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
            name: "setOwner",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "withdrawBalance",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        { stateMutability: "payable", type: "receive" },
    ],
};
