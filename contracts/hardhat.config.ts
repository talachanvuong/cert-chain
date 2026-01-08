import { defineConfig } from 'hardhat/config'

export default defineConfig({
  solidity: '0.8.28',
  networks: {
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
  },
})
