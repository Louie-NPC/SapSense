import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

interface ScreenDimensions {
  width: number;
  height: number;
  isSmallScreen: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isSmallScreen: width < 375,
      isTablet: width >= 768,
      orientation: width > height ? 'landscape' : 'portrait' as 'portrait' | 'landscape',
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window;
      setDimensions({
        width,
        height,
        isSmallScreen: width < 375,
        isTablet: width >= 768,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export default useResponsive;
