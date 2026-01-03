/**
 * Change Password Modal component
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useChangePassword } from '../../hooks/useChangePassword';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface ChangePasswordModalProps {
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export function ChangePasswordModal({
  onClose,
  buttonRef,
}: ChangePasswordModalProps): JSX.Element {
  const { changePassword, isLoading, error } = useChangePassword();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setValidationError(null);

    // Validate passwords
    if (!oldPassword || !newPassword || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }

    if (oldPassword === newPassword) {
      setValidationError('New password must be different from current password');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
      setOldPassword('');
    }
  };

  // Position modal below button
  useEffect(() => {
    if (buttonRef?.current && modalRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const modal = modalRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Position below button
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;
      let width = Math.max(buttonRect.width, 320);

      // Adjust for mobile
      if (viewportWidth < 640) {
        width = Math.min(viewportWidth - 16, 400);
        left = Math.max(8, Math.min(left, viewportWidth - width - 8));
      }

      // If modal would go off bottom of screen, position above button
      const modalHeight = 500; // Approximate
      if (top + modalHeight > viewportHeight - 16) {
        top = buttonRect.top - modalHeight - 8;
        if (top < 8) {
          top = 8;
          modal.style.maxHeight = `${viewportHeight - top - 16}px`;
        }
      }

      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
      modal.style.width = `${width}px`;
    }
  }, [buttonRef]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

  // Focus old password input on mount
  useEffect(() => {
    setTimeout(() => {
      oldPasswordRef.current?.focus();
    }, 100);
  }, []);

  return (
    <div
      ref={modalRef}
      className="fixed z-50 bg-white dark:bg-black max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border border-black dark:border-white rounded"
      style={{ maxWidth: '90vw', minWidth: '320px' }}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
            aria-label="Close"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-black dark:text-white mb-2">
              Password changed successfully!
            </p>
            <p className="text-sm text-black dark:text-white">
              All your data has been re-encrypted with the new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm text-black dark:text-white mb-4">
              <p>
                Changing your password will re-encrypt all your data. This may
                take a moment.
              </p>
            </div>

            <Input
              ref={oldPasswordRef}
              type="password"
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
              autoFocus
            />

            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              required
              minLength={8}
            />

            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
            />

            {(validationError || error) && (
              <div className="p-3 border border-black dark:border-white rounded bg-white dark:bg-black">
                <p className="text-sm font-medium text-black dark:text-white">
                  {validationError || error}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

