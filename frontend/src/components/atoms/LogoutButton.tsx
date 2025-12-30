/**
 * Logout button atom component
 */

import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';
import { useCryptoStore } from '../../store/cryptoStore';
import { useHabitStore } from '../../store/habitStore';

export function LogoutButton(): JSX.Element {
  const logout = useAuthStore((state) => state.logout);
  const clearKeys = useCryptoStore((state) => state.clearKeys);
  const clearHabitData = useHabitStore((state) => state.clearHabitData);

  const handleLogout = (): void => {
    clearKeys();
    clearHabitData();
    logout();
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
}

