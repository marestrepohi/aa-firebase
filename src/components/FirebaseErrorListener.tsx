'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // In a real app, you might use a toast to notify the user.
      // For this debugging environment, we will throw it so Next.js
      // displays the error overlay.
      console.error("Caught permission error:", error.message);
      // We throw the error to make it visible in the Next.js error overlay
      // This is for development purposes only.
      setTimeout(() => {
        throw error;
      }, 0);
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything
}
