/**
 * TypeScript type definitions for window.ethereum (MetaMask/Web3 providers)
 *
 * Declares the ethereum property on the Window interface for EIP-1193 compatible providers.
 */

interface Window {
  ethereum?: {
    /**
     * Flag indicating MetaMask is installed
     */
    isMetaMask?: boolean;

    /**
     * EIP-1193 request method
     * @param args - Request arguments with method and optional params
     */
    request: (args: { method: string; params?: any[] }) => Promise<any>;

    /**
     * Event listener for provider events (optional)
     */
    on?: (event: string, callback: (...args: any[]) => void) => void;

    /**
     * Remove event listener (optional)
     */
    removeListener?: (
      event: string,
      callback: (...args: any[]) => void
    ) => void;
  };
}
