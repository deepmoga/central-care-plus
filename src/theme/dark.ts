import { ThemeColors } from "./types";

export const darkTheme: ThemeColors = {
    // Background colors
    background: '#0F172A', // Deep dark blue
    backgroundGradient: ['#0F172A', '#1E1B4B'], // Deep Blue to Dark Indigo
    surface: '#1E293B', // Lighter blue-grey for headers/nav
    card: '#1E293B', // Matching surface for cards

    // Text colors
    text: '#F8FAFC', // Off-white
    textSecondary: '#94A3B8', // Blue-grey text
    textTertiary: '#64748B',

    // Border colors
    border: '#334155',
    borderLight: '#475569',

    // Input colors
    inputBackground: '#1E293B',
    inputBorder: '#334155',
    inputText: '#F8FAFC',
    placeholder: '#64748B',

    // Button colors
    primary: '#38B2AC', // Teal accent (keeping consistent with light mode but vibrant)
    primaryText: '#FFFFFF',

    // Status colors
    success: '#4ADE80', // Vibrant green
    warning: '#FB923C', // Vibrant orange
    error: '#F87171', // Vibrant red
    info: '#60A5FA', // Vibrant blue

    // Special colors
    overlay: 'rgba(15, 23, 42, 0.9)',
    shadow: '#38B2AC', // Neon Teal for glow effect
    badge: '#F87171',

    // Icon colors
    icon: '#38B2AC', // Teal
    iconSecondary: '#94A3B8',

    badgePrimary: '#010102ff',
    weekDateBackground: '#E6FFFA',
    weekText: '#1E293B',
    timeCardBackground: '#ffffff3a',
    timeText: '#eaeaeaff',
    timeFeather: '#eaeaeaff'
};