import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../theme/types';

interface WeekCalendarProps {
    currentWeekStart: Date;
    onWeekChange: (direction: 'prev' | 'next') => void;
    selectedDate: string | null;
    onDayPress: (date: Date) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
    currentWeekStart,
    onWeekChange,
    selectedDate,
    onDayPress,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const getWeekRange = () => {
        const start = new Date(currentWeekStart);
        const end = new Date(currentWeekStart);
        end.setDate(start.getDate() + 6);

        const format = (d: Date) =>
            d.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
            });

        return `${format(start)} – ${format(end)}`;
    };

    const getDaysOfWeek = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const normalizeLocalDate = (value: Date) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return (
        <View>
            {/* Week Navigation */}
            <View style={styles.weekNavigation}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => onWeekChange('prev')}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.background} />
                </TouchableOpacity>

                <Text style={styles.dateRangeText}>{getWeekRange()}</Text>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => onWeekChange('next')}
                >
                    <Ionicons name="chevron-forward" size={24} color={theme.background} />
                </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <View style={styles.daysContainer}>
                {getDaysOfWeek().map((date, index) => {
                    const dateStr = normalizeLocalDate(date);
                    const isSelected = selectedDate === dateStr;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayItem,
                                isSelected && styles.selectedDayItem,
                            ]}
                            onPress={() => onDayPress(date)}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.selectedDayText
                            ]}>
                                {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                            </Text>
                            <Text style={[
                                styles.dateText,
                                isSelected && styles.selectedDateText
                            ]}>
                                {date.getDate()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const createStyles = (theme: ThemeColors) => StyleSheet.create({
    weekNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.weekDateBackground,
        borderRadius: 12,
        padding: 4,
        marginBottom: 12
    },
    navButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.primary,
    },
    dateRangeText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.weekText,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        borderRadius: 12, // Optional: if we want it rounded like in Roster
    },
    dayItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    selectedDayItem: {
        backgroundColor: theme.primary,
    },
    dayText: {
        fontSize: 12,
        color: theme.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    selectedDayText: {
        color: theme.primaryText,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
    },
    selectedDateText: {
        color: theme.primaryText,
    },
});

export default WeekCalendar;
