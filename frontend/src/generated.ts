//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Certificate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const certificateAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'NotOwner' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_certificateHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: '_certificateAction',
        internalType: 'enum Certificate.CertificateAction',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'CertificateUpdated',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'certificates',
    outputs: [
      { name: 'certificateHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'certificateName', internalType: 'string', type: 'string' },
      { name: 'classification', internalType: 'string', type: 'string' },
      { name: 'issuer', internalType: 'address', type: 'address' },
      { name: 'issuedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'revoked', internalType: 'bool', type: 'bool' },
      { name: 'studentId', internalType: 'string', type: 'string' },
      { name: 'studentName', internalType: 'string', type: 'string' },
      { name: 'dateOfBirth', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_certificateName', internalType: 'string', type: 'string' },
      { name: '_classification', internalType: 'string', type: 'string' },
      { name: '_studentId', internalType: 'string', type: 'string' },
      { name: '_studentName', internalType: 'string', type: 'string' },
      { name: '_dateOfBirth', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'issueCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const
