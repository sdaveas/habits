"""Custom exception classes."""


class VaultNotFoundError(Exception):
    """Raised when a vault is not found."""

    pass


class VaultAccessDeniedError(Exception):
    """Raised when access to a vault is denied."""

    pass


class UserNotFoundError(Exception):
    """Raised when a user is not found."""

    pass


class AuthenticationError(Exception):
    """Raised when authentication fails."""

    pass

