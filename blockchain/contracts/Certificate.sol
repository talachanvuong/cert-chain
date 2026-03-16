// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Certificate {
    enum CertificateAction {
        Issued,
        Approved,
        Revoked
    }

    enum CertificateStatus {
        Pending,
        Verified,
        Revoked
    }

    struct CertificateInfo {
        bytes32 certificateHash;
        string certificateName;
        string classification;
        address issuer;
        uint issuedAt;
        CertificateStatus status;
        address verifier;
        uint verifiedAt;
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
    error InvalidStatus();
    error OwnerCannotVerify();

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
            status: CertificateStatus.Pending,
            verifier: address(0),
            verifiedAt: 0,
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

        if (certificate.status == CertificateStatus.Revoked) {
            revert InvalidStatus();
        }

        certificate.status = CertificateStatus.Revoked;

        emit CertificateUpdated(_certificateHash, CertificateAction.Revoked);
    }

    function approveCertificate(bytes32 _certificateHash) external {
        if (msg.sender == owner) {
            revert OwnerCannotVerify();
        }

        CertificateInfo storage certificate = certificates[_certificateHash];

        if (certificate.issuedAt == 0) {
            revert NotFound();
        }

        if (certificate.status != CertificateStatus.Pending) {
            revert InvalidStatus();
        }

        certificate.status = CertificateStatus.Verified;
        certificate.verifier = msg.sender;
        certificate.verifiedAt = block.timestamp;

        emit CertificateUpdated(_certificateHash, CertificateAction.Approved);
    }

    function getCertificate(
        bytes32 _certificateHash
    ) external view returns (CertificateInfo memory) {
        CertificateInfo memory certificate = certificates[_certificateHash];

        if (certificate.issuedAt == 0) {
            revert NotFound();
        }

        return certificate;
    }
}
