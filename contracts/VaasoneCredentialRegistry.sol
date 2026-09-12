// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VaasoneCredentialRegistry
 * @notice On-chain credential integrity registry for the Vaasone VaaS platform.
 *         Stores SHA-256 document hashes anchored by authorized issuers.
 *         Deployed on BNB Smart Chain testnet as the secondary trust layer.
 *
 * @dev   - Only the owner (Vaasone platform) can anchor and revoke.
 *        - Verification is public and gas-free (view function).
 *        - Batch anchoring reduces gas costs for bulk issuance.
 */
contract VaasoneCredentialRegistry {

    // ── State ──────────────────────────────────────────────

    address public owner;

    struct Anchor {
        bytes32 documentHash;     // SHA-256 hash of the canonical credential
        uint256 anchoredAt;       // Block timestamp of anchoring
        bool    isRevoked;        // Revocation flag
        uint256 revokedAt;        // Block timestamp of revocation (0 if active)
    }

    /// @notice credentialId => Anchor
    mapping(string => Anchor) public anchors;

    /// @notice Total number of credentials anchored
    uint256 public totalAnchored;

    /// @notice Total number of credentials revoked
    uint256 public totalRevoked;

    // ── Events ─────────────────────────────────────────────

    event CredentialAnchored(
        string indexed credentialId,
        bytes32 documentHash,
        uint256 timestamp
    );

    event CredentialRevoked(
        string indexed credentialId,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ── Modifiers ──────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "VaaS: caller is not the owner");
        _;
    }

    // ── Constructor ────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ── Write Functions ────────────────────────────────────

    /**
     * @notice Anchor a single credential hash on-chain.
     * @param credentialId  The unique credential identifier (e.g. "VO-2024-00482")
     * @param documentHash  The SHA-256 hash of the canonical credential payload
     */
    function anchorCredential(
        string calldata credentialId,
        bytes32 documentHash
    ) external onlyOwner {
        require(anchors[credentialId].anchoredAt == 0, "VaaS: already anchored");
        require(documentHash != bytes32(0), "VaaS: empty hash");

        anchors[credentialId] = Anchor({
            documentHash: documentHash,
            anchoredAt: block.timestamp,
            isRevoked: false,
            revokedAt: 0
        });

        totalAnchored++;
        emit CredentialAnchored(credentialId, documentHash, block.timestamp);
    }

    /**
     * @notice Anchor multiple credentials in a single transaction.
     * @param credentialIds  Array of credential identifiers
     * @param documentHashes Array of corresponding SHA-256 hashes
     */
    function anchorBatch(
        string[] calldata credentialIds,
        bytes32[] calldata documentHashes
    ) external onlyOwner {
        require(credentialIds.length == documentHashes.length, "VaaS: length mismatch");
        require(credentialIds.length <= 50, "VaaS: batch too large");

        for (uint256 i = 0; i < credentialIds.length; i++) {
            if (anchors[credentialIds[i]].anchoredAt == 0 && documentHashes[i] != bytes32(0)) {
                anchors[credentialIds[i]] = Anchor({
                    documentHash: documentHashes[i],
                    anchoredAt: block.timestamp,
                    isRevoked: false,
                    revokedAt: 0
                });
                totalAnchored++;
                emit CredentialAnchored(credentialIds[i], documentHashes[i], block.timestamp);
            }
        }
    }

    /**
     * @notice Revoke a previously anchored credential.
     * @param credentialId The credential to revoke
     */
    function revokeCredential(string calldata credentialId) external onlyOwner {
        require(anchors[credentialId].anchoredAt > 0, "VaaS: not anchored");
        require(!anchors[credentialId].isRevoked, "VaaS: already revoked");

        anchors[credentialId].isRevoked = true;
        anchors[credentialId].revokedAt = block.timestamp;

        totalRevoked++;
        emit CredentialRevoked(credentialId, block.timestamp);
    }

    /**
     * @notice Transfer contract ownership.
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "VaaS: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ── View Functions (gas-free verification) ─────────────

    /**
     * @notice Verify a credential's on-chain anchor.
     * @param credentialId The credential to verify
     * @return documentHash The anchored SHA-256 hash
     * @return anchoredAt   The timestamp when anchored
     * @return isRevoked    Whether the credential is revoked
     * @return revokedAt    The timestamp of revocation (0 if active)
     */
    function verifyCredential(string calldata credentialId)
        external
        view
        returns (
            bytes32 documentHash,
            uint256 anchoredAt,
            bool isRevoked,
            uint256 revokedAt
        )
    {
        Anchor memory a = anchors[credentialId];
        return (a.documentHash, a.anchoredAt, a.isRevoked, a.revokedAt);
    }

    /**
     * @notice Check if a credential is anchored and active (not revoked).
     * @param credentialId The credential to check
     * @return True if anchored and not revoked
     */
    function isActive(string calldata credentialId) external view returns (bool) {
        Anchor memory a = anchors[credentialId];
        return a.anchoredAt > 0 && !a.isRevoked;
    }

    /**
     * @notice Verify a hash matches the anchored value.
     * @param credentialId The credential to check
     * @param hash The hash to compare against
     * @return True if the hash matches the anchored hash
     */
    function verifyHash(string calldata credentialId, bytes32 hash)
        external
        view
        returns (bool)
    {
        return anchors[credentialId].documentHash == hash && anchors[credentialId].anchoredAt > 0;
    }
}
