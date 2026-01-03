/**
 * Delete Account Modal component
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface DeleteAccountModalProps {
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export function DeleteAccountModal({
  onClose,
  buttonRef,
}: DeleteAccountModalProps): JSX.Element {
  const { deleteAccount, isLoading, error } = useDeleteAccount();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const CONFIRM_TEXT = 'DELETE';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setValidationError(null);

    // Validate password
    if (!password) {
      setValidationError('Password is required');
      return;
    }

    // Validate confirmation text
    if (confirmText !== CONFIRM_TEXT) {
      setValidationError(`Please type "${CONFIRM_TEXT}" to confirm`);
      return;
    }

    try {
      await deleteAccount(password);
      // Account deletion will trigger logout, so we don't need to close modal
      // The user will be redirected to login
    } catch (err) {
      // Error is handled by the hook
      setPassword('');
      setConfirmText('');
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
      const modalHeight = 400; // Approximate
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

  // Focus confirm input on mount
  useEffect(() => {
    setTimeout(() => {
      confirmInputRef.current?.focus();
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
            Delete Account
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
            aria-label="Close"
            disabled={isLoading}
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-black dark:text-white mb-4">
            <p className="font-semibold mb-2">
              This action cannot be undone. This will permanently delete:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your account</li>
              <li>All your habits and data</li>
              <li>All encrypted vaults</li>
            </ul>
          </div>

          <Input
            ref={passwordInputRef}
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoFocus
            disabled={isLoading}
          />

          <Input
            ref={confirmInputRef}
            type="text"
            label={`Type "${CONFIRM_TEXT}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_TEXT}
            required
            disabled={isLoading}
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
              variant="danger"
              className="flex-1"
              disabled={isLoading || !password || confirmText !== CONFIRM_TEXT}
            >
              {isLoading ? 'Deleting Account...' : 'Delete Account'}
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
      </div>
    </div>
  );
}

