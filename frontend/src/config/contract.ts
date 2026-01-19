import { getContract } from 'viem'
import { Certificate } from '../contracts/Certificate'
import { publicClient, walletClient } from './client'

export const certificate = getContract({
  address: Certificate.address,
  abi: Certificate.abi,
  client: {
    public: publicClient,
    wallet: walletClient,
  },
})
