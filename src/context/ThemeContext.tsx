import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import { lightTheme } from '../theme/light';
import { darkTheme } from '../theme/dark';
import { ThemeColors } from '../theme/types';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeColors;
    themeMode: ThemeMode;
    isDark: boolean;
    // toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // 🔹 Snapshot (always available)
    const initialScheme: ColorSchemeName = Appearance.getColorScheme();

    // 🔹 Reactive (may be null initially)
    const systemScheme = useColorScheme();

    const [themeMode, setThemeMode] = useState<ThemeMode>(
        initialScheme === 'dark' ? 'dark' : 'light'
    );

    useEffect(() => {
        if (systemScheme) {
            setThemeMode(systemScheme === 'dark' ? 'dark' : 'light');
        }
    }, [systemScheme]);

    const theme = themeMode === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeMode,
                isDark: themeMode === 'dark',
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
