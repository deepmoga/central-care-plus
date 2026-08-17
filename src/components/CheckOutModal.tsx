import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { createStyles } from '../styles/CheckOutModalStyles';

interface CheckOutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (applySchedule: boolean) => void;
    checkInTime: string | null;
    privateKms: string;
    outingKms: string;
    signature: number;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({ visible, onClose, onConfirm, checkInTime, privateKms, outingKms, signature, scheduledStartTime, scheduledEndTime }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [checkOutTime, setCheckOutTime] = useState<Date>(new Date());
    const [applySchedule, setApplySchedule] = useState(false);

    useEffect(() => {
        if (visible) {
            setCheckOutTime(new Date());
            setApplySchedule(false); // Reset on open
        }
    }, [visible]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Confirm Job Completion</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.timeSection}>
                            <View style={styles.timeRow}>
                                <Text style={styles.label}>Check-In Time:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={[styles.value, applySchedule && styles.strikethrough]}>
                                        {checkInTime ? checkInTime : '--:--:--'}
                                    </Text>
                                    {applySchedule && scheduledStartTime && (
                                        <Text style={[styles.value, { color: theme.primary }]}>{scheduledStartTime}</Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.timeRow}>
                                <Text style={styles.label}>Check-Out Time:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={[styles.value, applySchedule && styles.strikethrough]}>
                                        {formatTime(checkOutTime)}
                                    </Text>
                                    {applySchedule && scheduledEndTime && (
                                        <Text style={[styles.value, { color: theme.primary }]}>{scheduledEndTime}</Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Apply Schedule Checkbox */}
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setApplySchedule(!applySchedule)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, applySchedule && styles.checkboxChecked]}>
                                {applySchedule && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Apply Schedule Timings</Text>
                        </TouchableOpacity>

                        <View style={styles.summarySection}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.label}>Private Kms:</Text>
                                <Text style={styles.value}>{privateKms || '0'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.label}>Outing Kms:</Text>
                                <Text style={styles.value}>{outingKms || '0'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.label}>Signature:</Text>
                                <Text style={[styles.value, { color: signature ? theme.success : theme.error }]}>
                                    {signature === 1 ? 'Captured' : 'Not Signed'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(applySchedule)}>
                            <Text style={styles.confirmButtonText}>Confirm & Complete</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default CheckOutModal;
