import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ActivityIndicatorComponentProps {
    inline?: boolean;
    size?: 'small' | 'large';
    color?: string;
}

const ActivityIndicatorComponent = ({ inline = false, size = 'large', color }: ActivityIndicatorComponentProps) => {
    const { theme } = useTheme();

    if (inline) {
        return <ActivityIndicator size={size} color={color || '#fff'} animating={true} />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
            <ActivityIndicator size={size} color={color || theme.primary} animating={true} />
        </View>
    );
};

export default ActivityIndicatorComponent;