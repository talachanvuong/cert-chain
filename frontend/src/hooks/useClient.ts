import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
} from 'viem'
import { localhost } from 'viem/chains'

export const useClient = () => {
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http('http://127.0.0.1:8545'),
  })

  const walletClient = createWalletClient({
    chain: localhost,
    transport: custom(window.ethereum!),
  })

  const connectWallet = async () => {
    const [account] = await walletClient.requestAddresses()
    return account
  }

  const getBalance = async (address: string) => {
    const ethAddress = address as `0x${string}`
    const balance = await publicClient.getBalance({
      address: ethAddress,
    })
    const ethBalance = Number(formatEther(balance))

    const formatter = new Intl.NumberFormat('vi-vn')
    const formattedBalance = formatter.format(ethBalance) + ' ETH'

    return formattedBalance
  }

  return { publicClient, walletClient, connectWallet, getBalance }
}
