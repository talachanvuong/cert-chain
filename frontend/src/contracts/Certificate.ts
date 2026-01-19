import type { Abi, Address } from 'viem'
import deployedContract from '../../../blockchain/artifacts/contracts/Certificate.sol/Certificate.json'
import deployedAddress from '../../../blockchain/ignition/deployments/chain-31337/deployed_addresses.json'

export const Certificate = {
  address: deployedAddress['CertificateModule#Certificate'] as Address,
  abi: deployedContract.abi as Abi,
}
