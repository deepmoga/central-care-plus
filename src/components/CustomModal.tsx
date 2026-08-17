import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    type?: 'info' | 'warning' | 'error' | 'success';
    children?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    onClose,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    type = 'info',
    children,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <Ionicons name="warning" size={40} color={theme.warning || '#FFC107'} />;
            case 'error':
                return <Ionicons name="alert-circle" size={40} color={theme.error || '#F44336'} />;
            case 'success':
                return <Ionicons name="checkmark-circle" size={40} color={theme.success || '#4CAF50'} />;
            // default:
            //     return <Ionicons name="information-circle" size={40} color={theme.primary || '#2196F3'} />;
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        {getIcon()}
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}
                    {children}

                    <View style={styles.buttonContainer}>
                        {cancelText && (
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: Dimensions.get('window').width * 0.85,
        backgroundColor: theme.surface || '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: theme.textSecondary || '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border || '#ddd',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.textSecondary || '#666',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: theme.primary || '#2196F3',
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default CustomModal;
