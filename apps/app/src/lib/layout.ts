import { useWindowDimensions } from "react-native";

export const breakpoints = {
  phone: 0,
  tablet: 768,
  laptop: 1180
} as const;

export const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();
  const safeWidth = width > 0 ? width : 360;
  const isTablet = safeWidth >= breakpoints.tablet;
  const isLaptop = safeWidth >= breakpoints.laptop;

  return {
    width: safeWidth,
    isTablet,
    isLaptop,
    contentWidth: isLaptop ? 1120 : isTablet ? 920 : safeWidth,
    horizontalPadding: isLaptop ? 32 : isTablet ? 24 : 16
  };
};
