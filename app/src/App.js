import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import escrowAbi from './artifacts/contracts/Escrow.sol/Escrow.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
    const approveTxn = await escrowContract.approve();
    await approveTxn.wait();
}

function App() {
    const [escrows, setEscrows] = useState([]);
    const [account, setAccount] = useState();
    const [signer, setSigner] = useState();
    const [arbiter, setArbiter] = useState();
    const [beneficiary, setBeneficiary] = useState();
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        async function getAccounts() {
            const accounts = await provider.send('eth_requestAccounts', []);

            setAccount(accounts[0]);
            const signer = await provider.getSigner();
            setSigner(signer);
            await getContracts();
        }

        getAccounts();
    }, [account]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                getAccounts();
            });
        }
        async function getAccounts() {
            const accounts = await provider.send('eth_requestAccounts', []);
            setAccount(accounts[0]);
            await getContracts();
        }
    }, []);

    async function getContracts() {
        await fetch('http://localhost:8080/getContracts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Server responded with an error');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Data', data);
                const list = data;
                const escrowContracts = list.map((contract) => {
                    const escrowContract = new ethers.Contract(
                        contract.address,
                        escrowAbi.abi,
                        signer
                    );

                    const escrow = {
                        address: contract.address,
                        arbiter: contract.arbiter,
                        beneficiary: contract.beneficiary,
                        value: contract.value,
                        approved: contract.approved,
                        handleApprove: async () => {
                            escrowContract.on('Approved', async () => {
                                await approveStatus(contract.address);
                            });

                            approve(escrowContract, signer);
                        },
                    };
                    return escrow;
                });

                console.log('Contracts retrieved from server');

                setEscrows(escrowContracts);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    async function newContract() {
        const value = ethers.utils.parseEther(amount.toString() || '0');

        const escrowContract = await deploy(
            signer,
            arbiter,
            beneficiary,
            value
        );

        let escrow = {
            address: escrowContract.address,
            arbiter,
            beneficiary,
            value: value.toString(),
            approved: false,
        };

        await fetch('http://localhost:8080/newContract', {
            method: 'POST',
            body: JSON.stringify(escrow),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Server responded with an error');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Data', data);

                setArbiter('');
                setBeneficiary('');
                setAmount(0);

                escrow = {
                    ...escrow,
                    handleApprove: async () => {
                        escrowContract.on('Approved', async () => {
                            await approveStatus(escrowContract.address);
                        });

                        approve(escrowContract, signer);
                    },
                };

                setEscrows([...escrows, escrow]);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    async function approveStatus(contractAddress) {
        await fetch('http://localhost:8080/approve', {
            method: 'POST',
            body: JSON.stringify({ address: contractAddress }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Server responded with an error');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Data', data);
                const list = data;
                setEscrows(list);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <div className='container'>
            <div className='contract'>
                <h1> New Contract </h1>
                <label>
                    Arbiter Address
                    <input
                        type='text'
                        id='arbiter'
                        onChange={(e) => {
                            setArbiter(e.target.value);
                        }}
                    />
                </label>

                <label>
                    Beneficiary Address
                    <input
                        type='text'
                        id='beneficiary'
                        onChange={(e) => {
                            setBeneficiary(e.target.value);
                        }}
                    />
                </label>

                <label>
                    Deposit Amount (in Ether)
                    <input
                        type='text'
                        id='ether'
                        onChange={(e) => {
                            setAmount(e.target.value);
                        }}
                    />
                </label>

                <div
                    className='button'
                    id='deploy'
                    onClick={(e) => {
                        e.preventDefault();
                        newContract();
                    }}
                >
                    Deploy
                </div>
            </div>

            <div className='existing-contracts'>
                <h1> Existing Contracts </h1>

                <div id='container'>
                    {escrows?.map((escrow) => {
                        return <Escrow key={escrow.address} {...escrow} />;
                    })}
                </div>
            </div>
        </div>
    );
}

export default App;
