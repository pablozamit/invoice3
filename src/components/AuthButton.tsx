import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle } from 'lucide-react';
import { InvoiceProcessor } from '../services/invoiceProcessor';

export const AuthButton: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const processor = InvoiceProcessor.getInstance();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const signedIn = await processor.checkGoogleAuth();
      setIsSignedIn(signedIn);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await processor.signInToGoogle();
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Verificando...</span>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
        <CheckCircle size={16} />
        <span className="text-sm font-medium">Google conectado</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      <LogIn size={16} />
      <span className="text-sm font-medium">Conectar con Google</span>
    </button>
  );
};