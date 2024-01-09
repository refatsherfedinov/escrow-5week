const express = require('express');
const cors = require('cors');
const { add } = require('nodemon/lib/rules');
const app = express();
const port = 8080;

app.use(express.json());

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

let deployedContracts = [];

app.get('/getContracts', (req, res) => {
    try {
        res.status(200).send(deployedContracts);
    } catch (err) {
        console.log(err);
    }
});

app.post('/newContract', (req, res) => {
    try {
        deployedContracts.push(req.body);
        res.status(200).send(deployedContracts);
    } catch (err) {
        console.log(err);
    }
});

app.post('/approve', (req, res) => {
    try {
        const { address } = req.body;
        console.log(req.body);
        const contractIdx = deployedContracts.findIndex(
            (contract) => contract.address === address
        );
        if (contractIdx === -1) {
            throw new Error('Contract not found');
        }
        deployedContracts[contractIdx].approved = true;
        res.status(200).send(deployedContracts);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
