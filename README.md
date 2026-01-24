# cert-chain

Storing and verifying certifications on Blockchain.

## Setup

> Change the terminal to `Bash`

Install packages:

```bash
cd frontend
npm install
cd ..
cd blockchain
npm install
```

Run Hardhat network:

```bash
npx hardhat node
```

Deploy contract (run in the second terminal):

```bash
cd blockchain
npx hardhat ignition deploy ignition/modules/Certificate.ts --network localhost --reset
```

Run client:

```bash
cd ..
cd frontend
npm run dev
```
