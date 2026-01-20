import type { Address } from 'viem'
import deployedAddresses from '../../../blockchain/ignition/deployments/chain-31337/deployed_addresses.json'
import { certificateAbi } from '../generated'

export const Certificate = {
  address: deployedAddresses['CertificateModule#Certificate'] as Address,
  abi: certificateAbi,
}
