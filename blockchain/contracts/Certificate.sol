// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Certificate {
    enum CertificateAction {
        Issued,
        Revoked
    }

    struct CertificateInfo {
        bytes32 certificateHash;
        string certificateName;
        string classification;
        address issuer;
        uint issuedAt;
        bool revoked;
        string studentId;
        string studentName;
        uint dateOfBirth;
    }

    mapping(bytes32 => CertificateInfo) public certificates;

    address public owner;

    event CertificateUpdated(
        bytes32 indexed _certificateHash,
        CertificateAction _certificateAction
    );
    event StudentReceived(string indexed _studentId, bytes32 _certificateHash);

    error NotOwner();
    error NotFound();

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string calldata _certificateName,
        string calldata _classification,
        string calldata _studentId,
        string calldata _studentName,
        uint _dateOfBirth
    ) external onlyOwner {
        bytes32 certificateHash = keccak256(
            abi.encodePacked(
                _certificateName,
                _classification,
                _studentId,
                _studentName,
                _dateOfBirth
            )
        );

        certificates[certificateHash] = CertificateInfo({
            certificateHash: certificateHash,
            certificateName: _certificateName,
            classification: _classification,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            studentId: _studentId,
            studentName: _studentName,
            dateOfBirth: _dateOfBirth
        });

        emit CertificateUpdated(certificateHash, CertificateAction.Issued);
        emit StudentReceived(_studentId, certificateHash);
    }

    function revokeCertificate(bytes32 _certificateHash) external onlyOwner {
        CertificateInfo storage certificate = certificates[_certificateHash];

        if (certificate.issuedAt == 0) {
            revert NotFound();
        }

        certificate.revoked = true;

        emit CertificateUpdated(_certificateHash, CertificateAction.Revoked);
    }

    function verifyCertificate(
        bytes32 _certificateHash
    ) external view returns (CertificateInfo memory) {
        CertificateInfo memory cert = certificates[_certificateHash];

        if (cert.issuedAt == 0) {
            revert NotFound();
        }

        return cert;
    }
}
