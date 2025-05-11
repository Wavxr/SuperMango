import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultScreen() {
  const { severity, humidity, temperature, wetness } = useLocalSearchParams();
  const router = useRouter();

  const severityLabels = ['Healthy', 'Mild', 'Moderate', 'Severe'];
  const severityText = typeof severity === 'string' ? severityLabels[parseInt(severity)] : undefined;

  // colour palettes per severity
  const severityColors = {
    Healthy:  ['#81c784', '#4caf50'],
    Mild:     ['#fff176', '#ffd54f'],
    Moderate: ['#ffb74d', '#ff9800'],
    Severe:   ['#e57373', '#f44336'],
  } as const;

  const gradientColors = severityText ? severityColors[severityText as keyof typeof severityColors] : ['#fff9c4', '#ffeb3b'];

  const handleScanAgain = () => router.replace('/');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradientColors} style={styles.background}>
        <View style={styles.contentContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Anthracnose Detection</Text>

            {/* overall severity */}
            {severityText ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Overall Tree Condition</Text>
                <Text style={[styles.resultValue, { color: severityColors[severityText as keyof typeof severityColors][1] }]}>
                  {severityText}
                </Text>
              </View>
            ) : (
              <Text style={styles.errorText}>⚠️ No result found.</Text>
            )}

            {/* weather insight */}
            {humidity && temperature && wetness && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>🌤️ On‑site Weather</Text>
                <Text>🌡️ Temp: {Number(temperature).toFixed(1)} °C</Text>
                <Text>💧 Humidity: {humidity}%</Text>
                <Text>☔ Wetness (rain 3h): {wetness} mm</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
              <LinearGradient colors={['#fbc02d', '#f9a825']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Scan Another Leaf</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: '100%' },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#5d4037', textAlign: 'center', marginBottom: 25 },
  resultBox: { marginBottom: 25, alignItems: 'center' },
  resultLabel: { fontSize: 16, color: '#795548', marginBottom: 8 },
  resultValue: { fontSize: 36, fontWeight: 'bold' },
  errorText: { fontSize: 18, color: '#f44336', textAlign: 'center', marginVertical: 30 },
  button: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
