"""Wallet authentication service."""

from eth_account.messages import encode_defunct
from web3 import Web3
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import User

# Initialize Web3 (no provider needed for signature verification)
w3 = Web3()


class WalletAuthError(Exception):
    """Raised when wallet authentication fails."""

    pass


class WalletAlreadyExistsError(Exception):
    """Raised when wallet is already registered."""

    pass


def verify_wallet_signature(
    message: str, signature: str, expected_address: str
) -> bool:
    """Verify that a signature was created by the expected wallet address.

    Uses EIP-191 personal_sign standard to verify signatures.

    Args:
        message: The message that was signed
        signature: The signature (hex string with 0x prefix)
        expected_address: The expected signer address (lowercase)

    Returns:
        True if signature is valid and matches expected address

    """
    try:
        # Encode message using EIP-191 (same as personal_sign)
        encoded_message = encode_defunct(text=message)

        # Recover address from signature
        recovered_address = w3.eth.account.recover_message(
            encoded_message, signature=signature
        )

        # Compare addresses (case-insensitive)
        return recovered_address.lower() == expected_address.lower()
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


async def register_wallet_user(
    session: AsyncSession,
    wallet_address: str,
    signature: str,
    message: str,
    message_version: int,
) -> User:
    """Register a new wallet user.

    Args:
        session: Database session
        wallet_address: Ethereum address (lowercase)
        signature: Signature of the auth message
        message: The message that was signed
        message_version: Version of the auth message

    Returns:
        Created user object

    Raises:
        WalletAuthError: If signature is invalid
        WalletAlreadyExistsError: If wallet already registered

    """
    # Verify signature
    if not verify_wallet_signature(message, signature, wallet_address):
        raise WalletAuthError("Invalid signature")

    # Check if wallet already exists
    result = await session.execute(
        select(User).where(User.wallet_address == wallet_address.lower())
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise WalletAlreadyExistsError("Wallet already registered")

    # Create user with wallet auth
    user = User(
        auth_type="wallet",
        wallet_address=wallet_address.lower(),
        message_version=message_version,
        username=None,
        auth_hash=None,
        salt=None,
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate_wallet_user(
    session: AsyncSession,
    wallet_address: str,
    signature: str,
    message: str,
) -> User:
    """Authenticate a wallet user.

    Args:
        session: Database session
        wallet_address: Ethereum address (lowercase)
        signature: Signature of the auth message
        message: The message that was signed

    Returns:
        Authenticated user object

    Raises:
        WalletAuthError: If wallet not found or signature invalid

    """
    # Find user by wallet address
    result = await session.execute(
        select(User).where(User.wallet_address == wallet_address.lower())
    )
    user = result.scalar_one_or_none()

    if not user:
        raise WalletAuthError("Wallet not registered")

    # Verify signature
    if not verify_wallet_signature(message, signature, wallet_address):
        raise WalletAuthError("Invalid signature")

    return user
