'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';

export interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  toggleHighContrast: () => {},
  textSize: 'normal',
  setTextSize: () => {},
  increaseTextSize: () => {},
  decreaseTextSize: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSize>('normal');

  useEffect(() => {
    const savedContrast = localStorage.getItem('accessibility_high_contrast');
    if (savedContrast === 'true') {
      setHighContrast(true);
      applyContrastDOM(true);
    }

    const savedSize = localStorage.getItem('accessibility_text_size') as TextSize;
    if (savedSize && ['normal', 'large', 'xlarge'].includes(savedSize)) {
      setTextSizeState(savedSize);
      applyTextSizeDOM(savedSize);
    }
  }, []);

  const applyContrastDOM = (enabled: boolean) => {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('contrast-high', 'high-contrast-mode');
        document.body.classList.add('contrast-high', 'high-contrast-mode');
      } else {
        document.documentElement.classList.remove('contrast-high', 'high-contrast-mode');
        document.body.classList.remove('contrast-high', 'high-contrast-mode');
      }
    }
  };

  const applyTextSizeDOM = (size: TextSize) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
      document.body.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
      document.documentElement.classList.add(`text-size-${size}`);
      document.body.classList.add(`text-size-${size}`);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('accessibility_high_contrast', String(next));
      applyContrastDOM(next);
      return next;
    });
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('accessibility_text_size', size);
    applyTextSizeDOM(size);
  };

  const increaseTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
  };

  const decreaseTextSize = () => {
    if (textSize === 'xlarge') setTextSize('large');
    else if (textSize === 'large') setTextSize('normal');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textSize,
        setTextSize,
        increaseTextSize,
        decreaseTextSize,
      }}
    >
      <div className={`${highContrast ? 'contrast-high high-contrast-mode' : ''} text-size-${textSize}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
