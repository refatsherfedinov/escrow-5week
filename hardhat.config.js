require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
    solidity: '0.8.17',
    paths: {
        artifacts: './app/src/artifacts',
    },
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
};
