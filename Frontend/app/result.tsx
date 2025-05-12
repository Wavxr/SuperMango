import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Recommendation = {
  severity_label: string;
  weather_risk: string;
  advice: string;
  info: string;
};

export default function ResultScreen() {
  // --- params ------------------------------------------------------------------
  const {
    psi,                // percent_severity_index
    overallLabel,       // overall_label
    humidity,
    temperature,
    wetness,
    recommendation,     // JSON-stringified Recommendation
  } = useLocalSearchParams();

  const router = useRouter();

  // --- parsing -----------------------------------------------------------------
  const severityText = typeof overallLabel === 'string' ? overallLabel : undefined;
  const percentSeverity = psi ? parseFloat(Array.isArray(psi) ? psi[0] : (psi as string)) : undefined;
  let rec: Recommendation | undefined;
  try {
    rec = typeof recommendation === 'string' ? (JSON.parse(recommendation) as Recommendation) : undefined;
  } catch (_) {
    rec = undefined;
  }

  // --- colour palettes ---------------------------------------------------------
  const severityColors = {
    Healthy: ['#81c784', '#4caf50'],
    Mild: ['#fff176', '#ffd54f'],
    Moderate: ['#ffb74d', '#ff9800'],
    Severe: ['#e57373', '#f44336'],
  } as const;

  const gradientColors = severityText && severityColors[severityText as keyof typeof severityColors]
    ? severityColors[severityText as keyof typeof severityColors]
    : ['#fff9c4', '#ffeb3b'];

  // --- handlers ----------------------------------------------------------------
  const handleScanAgain = () => router.replace('/');

  // ---------------------------------------------------------------------------- //
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={gradientColors} style={styles.background}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Anthracnose Detection Result</Text>

            {/* PSI ----------------------------------------------------------------*/}
            {typeof percentSeverity === 'number' && !Number.isNaN(percentSeverity) && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Percent Severity Index (PSI)</Text>
                <Text style={styles.percentText}>{percentSeverity.toFixed(2)}%</Text>
              </View>
            )}

            {/* Overall severity ----------------------------------------------------*/}
            {severityText ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Overall Tree Condition</Text>
                <Text
                  style={[styles.resultValue, { color: severityColors[severityText as keyof typeof severityColors][1] }]}
                >
                  {severityText}
                </Text>
              </View>
            ) : (
              <Text style={styles.errorText}>⚠️ No severity result found.</Text>
            )}

            {/* Weather block -------------------------------------------------------*/}
            {humidity && temperature && wetness && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>🌤️ On-site Weather</Text>
                <Text>🌡️ Temp: {Number(temperature).toFixed(1)} °C</Text>
                <Text>💧 Humidity: {Number(humidity).toFixed(0)}%</Text>
                <Text>☔ Wetness: {Number(wetness).toFixed(1)} h</Text>
              </View>
            )}

            {/* Recommendation block -----------------------------------------------*/}
            {rec ? (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>📋 Recommendation</Text>
                <Text style={styles.recommendationHeader}>Risk: {rec.weather_risk}</Text>
                <Text style={styles.recommendationText}>{rec.advice}</Text>
                {rec.info && <Text style={styles.infoText}>Why: {rec.info}</Text>}
              </View>
            ) : (
              <Text style={styles.errorText}>⚠️ No recommendation available.</Text>
            )}

            {/* Scan again button ---------------------------------------------------*/}
            <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
              <LinearGradient
                colors={['#fbc02d', '#f9a825']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Scan Another Leaf</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// --------------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: '100%' },
  contentContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5d4037',
    textAlign: 'center',
    marginBottom: 25,
  },
  resultBox: { marginBottom: 25, alignItems: 'center', paddingHorizontal: 5 },
  resultLabel: { fontSize: 16, color: '#795548', marginBottom: 8, textAlign: 'center' },
  resultValue: { fontSize: 36, fontWeight: 'bold' },
  percentText: { fontSize: 32, fontWeight: '600', color: '#5d4037' },
  recommendationHeader: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  recommendationText: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  infoText: { fontSize: 14, color: '#455a64', fontStyle: 'italic', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  errorText: { fontSize: 16, color: '#f44336', textAlign: 'center', marginVertical: 10 },
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
