import { useWindowDimensions } from "react-native";

export const breakpoints = {
  phone: 0,
  tablet: 768,
  laptop: 1180
} as const;

export const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  const isLaptop = width >= breakpoints.laptop;

  return {
    width,
    isTablet,
    isLaptop,
    contentWidth: isLaptop ? 1120 : isTablet ? 920 : width,
    horizontalPadding: isLaptop ? 32 : isTablet ? 24 : 16
  };
};

