import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles } from '../styles/SignatureStyles';
import { addSignature } from '../api/jobs.service';
import Toast from 'react-native-toast-message';

const SignatureCaptureScreen = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const signatureRef = useRef<SignatureViewRef>(null);
    const route = useRoute();
    const { jobId, jobTable } = route.params as { jobId: number, jobTable: string };

    const handleSignatureOK = async (signature: string) => {
        const payload = {
            signature: signature,
            id: jobId,
            table: jobTable,
        };
        try {
            const response = await addSignature(payload);
            if (response.success) {

                Toast.show({
                    type: 'success',
                    text1: 'Signature added successfully',
                });
                // Navigate back with the signature to update the previous screen
                navigation.goBack();

            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to add signature',
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                type: 'error',
                text1: 'Failed to add signature',
            });
        }
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
    };

    const handleConfirm = () => {
        signatureRef.current?.readSignature();
    };

    return (
        <LinearGradient colors={theme.backgroundGradient as [string, string, ...string[]]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Capture Signature</Text>

                    <View style={styles.card}>
                        <Text style={styles.instructionText}>Please sign inside the box</Text>

                        <View style={styles.signatureBox}>
                            <SignatureScreen
                                ref={signatureRef}
                                onOK={handleSignatureOK}
                                webStyle={`.m-signature-pad--footer {display: none; margin: 0px;} body,html {width: 100%; height: 100%;}`}
                                backgroundColor="transparent"
                                penColor={"#000000"}
                            />
                            <Ionicons name="pencil" size={24} color={theme.primary} style={styles.penIcon} />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleConfirm}>
                                <Text style={styles.saveButtonText}>Save Signature</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default SignatureCaptureScreen;
