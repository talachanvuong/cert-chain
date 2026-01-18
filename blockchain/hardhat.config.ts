import hardhatIgnitionPlugin from '@nomicfoundation/hardhat-ignition'
import { defineConfig } from 'hardhat/config'

export default defineConfig({
  plugins: [hardhatIgnitionPlugin],
  solidity: '0.8.28',
  networks: {
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
  },
})
