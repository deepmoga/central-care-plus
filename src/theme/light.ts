import { ThemeColors } from "./types";

export const lightTheme: ThemeColors = {
    // Background colors
    background: '#FFFFFF', // Pure White base
    backgroundGradient: ['#FFFFFF', '#E6FFFA', '#F0FDF9'], // White -> Light Teal -> Soft Mint
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text colors
    text: '#2D3748', // Dark Grey
    textSecondary: '#718096', // Light Grey
    textTertiary: '#A0AEC0',

    // Border colors
    border: '#E2E8F0',
    borderLight: '#b3b5b7ff',

    // Input colors
    inputBackground: '#F7FAFC',
    inputBorder: '#E2E8F0',
    inputText: '#2D3748',
    placeholder: '#A0AEC0',

    // Button colors
    primary: '#38B2AC', // Teal
    primaryText: '#FFFFFF',

    // Status colors
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',

    // Special colors
    overlay: 'rgba(255, 255, 255, 0.9)',
    shadow: '#81E6D9', // Softer Teal glow for light mode
    badge: '#F56565',

    // Icon colors
    icon: '#38B2AC', // Teal
    iconSecondary: '#718096',

    //badge colors 
    badgePrimary: '#E6FFFA',
    weekDateBackground: '#E6FFFA',
    weekText: '#1E293B',
    timeCardBackground: '#EBF8FF',
    timeText: '#3182CE',
    timeFeather: '#2196F3'
};