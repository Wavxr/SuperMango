import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResultScreen() {
  const { severity } = useLocalSearchParams();
  const router = useRouter();

  const severityLabels = ['Healthy', 'Mild', 'Moderate', 'Severe'];
  const severityText = typeof severity === 'string' ? severityLabels[parseInt(severity)] : undefined;

  const handleScanAgain = () => {
    router.replace('/'); // ✅ Go back to home screen instead of directly to camera
  };

  return (
    <View style={styles.container}>
      {severityText ? (
        <>
          <Text style={styles.resultText}>Severity: {severityText}</Text>
          <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.resultText}>⚠️ No result found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  resultText: { fontSize: 24, fontWeight: 'bold', color: '#28a745', marginBottom: 30 },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
