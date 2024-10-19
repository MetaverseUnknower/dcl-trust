import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ethers } from 'ethers';

interface Web3LoginProps {
  onLogin: (address: string) => Promise<{
    message: string;
    handleSignedMessage: (signature: string) => Promise<void>;
  }>;
}

const Web3Login: React.FC<Web3LoginProps> = ({ onLogin }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof (window as any).ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // Call onLogin to get the message and handleSignedMessage function
        const { message, handleSignedMessage } = await onLogin(address);

        // Request the user to sign the message
        const signature = await signer.signMessage(message);

        // Call handleSignedMessage with the signature
        await handleSignedMessage(signature);
      } else {
        alert('Please install MetaMask or another Web3 wallet to connect.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
    setIsConnecting(false);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={connectWallet}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default Web3Login;