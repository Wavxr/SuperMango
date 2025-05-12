/* app/result.tsx ----------------------------------------------------------- */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/* -------------------------------------------------------------------------
   1.  STATIC IMPORT MAP  (← paths fixed)
---------------------------------------------------------------------------*/
const leafImages = {
  Healthy:  require('../assets/images/healthy.png'),
  Mild:     require('../assets/images/mild.png'),
  Moderate: require('../assets/images/moderate.png'),
  Severe:   require('../assets/images/severe.png'),
} as const;

const avatarImage = require('../assets/images/avatar.png');

/* -------------------------------------------------------------------------
   2.  TYPES
---------------------------------------------------------------------------*/
type Recommendation = {
  severity_label: string;
  weather_risk: 'Low' | 'Medium' | 'High';
  advice: string;
  info: string;
};

export default function ResultScreen() {
  /* ─────────────────────────── params ─────────────────────────────────── */
  const {
    psi,                // percent_severity_index
    overallLabel,       // overall_label
    humidity,
    temperature,
    wetness,
    recommendation,     // JSON-stringified Recommendation
  } = useLocalSearchParams();

  const router = useRouter();
  const [showRec, setShowRec] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [showRec]);

  /* ─────────────────────────── parsing ────────────────────────────────── */
  const severityText =
    typeof overallLabel === 'string' ? overallLabel : undefined;
  const percentSeverity = psi
    ? parseFloat(Array.isArray(psi) ? psi[0] : (psi as string))
    : undefined;

  let rec: Recommendation | undefined;
  try {
    rec =
      typeof recommendation === 'string'
        ? (JSON.parse(recommendation) as Recommendation)
        : undefined;
  } catch {
    rec = undefined;
  }

  /* ──────────────────────── colour palettes ───────────────────────────── */
  const severityColors = {
    Healthy:  '#4CAF50',
    Mild:     '#FFC107',
    Moderate: '#FF9800',
    Severe:   '#F44336',
  } as const;

  const severityColor = severityText 
    ? severityColors[severityText as keyof typeof severityColors] 
    : '#4CAF50';

  /* ───────────────────────── handlers ─────────────────────────────────── */
  const scanAgain = () => router.replace('/');
  const toggleRec = () => setShowRec(!showRec);

  /* ====================================================================== */
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.background, { backgroundColor: '#f5f5f5' }]}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {!showRec ? (
            /* ░░ FIRST SCREEN ░░ (Result) ░░──────────────────────────────── */
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Anthracnose Detection</Text>
              </View>

              {/* leaf visual */}
              {severityText && (
                <View style={styles.imageWrapper}>
                  <Image
                    source={leafImages[severityText as keyof typeof leafImages]}
                    style={styles.leaf}
                  />
                </View>
              )}

              <View style={styles.resultSection}>
                {/* PSI progress bar */}
                {typeof percentSeverity === 'number' && !Number.isNaN(percentSeverity) && (
                  <SimpleCard>
                    <View style={styles.psiContainer}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(percentSeverity, 100)}%`,
                              backgroundColor: severityColor,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.psiTextContainer}>
                        <Text style={styles.psiLabel}>Percent Severity Index</Text>
                        <Text style={styles.psiValue}>
                          {percentSeverity.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </SimpleCard>
                )}

                {/* overall label */}
                {severityText && (
                  <View style={styles.conditionContainer}>
                    <Text style={styles.conditionLabel}>Tree Condition</Text>
                    <Text
                      style={[
                        styles.conditionValue,
                        { color: severityColor },
                      ]}
                    >
                      {severityText}
                    </Text>
                  </View>
                )}
              </View>

              {/* weather */}
              {humidity && temperature && wetness && (
                <View style={styles.weatherSection}>
                  <Text style={styles.sectionTitle}>On-site Weather</Text>
                  <View style={styles.weatherRow}>
                    <WeatherItem
                      icon="thermometer-outline"
                      value={`${Number(temperature).toFixed(1)}°C`}
                      label="Temp"
                    />
                    <WeatherItem
                      icon="water-outline"
                      value={`${Number(humidity).toFixed(0)}%`}
                      label="Humidity"
                    />
                    <WeatherItem
                      icon="rainy-outline"
                      value={`${Number(wetness).toFixed(1)}h`}
                      label="Wetness"
                    />
                  </View>
                </View>
              )}

              <View style={styles.actionSection}>
                {rec && (
                  <PrimaryButton text="View Recommendation" onPress={toggleRec} />
                )}
              </View>
            </ScrollView>
          ) : (
            /* ░░ SECOND SCREEN ░░ (Recommendation) ░░────────────────────── */
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity style={styles.backButton} onPress={toggleRec}>
                <Ionicons name="arrow-back" size={22} color="#424242" />
                <Text style={styles.backText}>Back to Results</Text>
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.title}>Treatment Recommendation</Text>
              </View>

              <View style={styles.avatarWrapper}>
                <Image source={avatarImage} style={styles.avatar} />
              </View>

              {/* risk badge */}
              {rec && (
                <View style={styles.riskSection}>
                  <Text style={styles.sectionTitle}>Risk Level</Text>
                  <View
                    style={[
                      styles.riskBadge,
                      {
                        backgroundColor:
                          rec.weather_risk === 'Low'
                            ? '#81c784'
                            : rec.weather_risk === 'Medium'
                            ? '#ffb74d'
                            : '#e57373',
                      },
                    ]}
                  >
                    <Text style={styles.riskText}>{rec.weather_risk}</Text>
                  </View>
                </View>
              )}

              {/* advice */}
              {rec ? (
                <View style={styles.adviceSection}>
                  <Text style={styles.sectionTitle}>What to Do</Text>
                  <SimpleCard>
                    <View style={styles.adviceContainer}>
                      {rec.advice.split('\n').map((line, i) => (
                        <View key={i} style={styles.adviceRow}>
                          <View style={styles.bulletPoint} />
                          <Text style={styles.adviceText}>{line}</Text>
                        </View>
                      ))}
                    </View>
                  </SimpleCard>

                  {rec.info ? (
                    <SimpleCard style={{ marginTop: 0 }}>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>Why it Works</Text>
                        <Text style={styles.infoText}>{rec.info}</Text>
                      </View>
                    </SimpleCard>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.error}>⚠️ No recommendation available.</Text>
              )}

              <View style={styles.actionSection}>
                <PrimaryButton text="Scan Another Leaf" onPress={scanAgain} />
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

/* ─────────────────────────── helpers ──────────────────────────────────── */
function SimpleCard({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <View style={[styles.simpleCard, style]}>
      {children}
    </View>
  );
}

function WeatherItem({
  icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <SimpleCard style={styles.weatherItem}>
      <Ionicons name={icon} size={22} color="#424242" />
      <Text style={styles.weatherValue}>{value}</Text>
      <Text style={styles.weatherLabel} numberOfLines={1}>{label}</Text>
    </SimpleCard>
  );
}

function PrimaryButton({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.primaryButton} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonInner}>
        <Text style={styles.primaryButtonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────────────────── styles ───────────────────────────────────── */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  root: { 
    flex: 1,
  },
  background: { 
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20, 
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 0, 
  },
  header: {
    marginBottom: 10, 
    alignItems: 'center',
  },
  title: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#424242',
    textAlign: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  leaf: { 
    width: 180, 
    height: 180,
    resizeMode: 'contain',
  },
  resultSection: {
    marginBottom: 20, 
  },
  simpleCard: {
    borderRadius: 12, 
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  psiContainer: {
    padding: 16, 
  },
  progressTrack: {
    height: 8, 
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 4,
  },
  psiTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  psiLabel: { 
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  psiValue: {
    fontSize: 18, 
    fontWeight: '700',
    color: '#424242',
  },
  conditionContainer: { 
    marginTop: 10,
    alignItems: 'center',
  },
  conditionLabel: { 
    fontSize: 14, 
    color: '#424242', 
    marginBottom: 6, 
    fontWeight: '500',
  },
  conditionValue: { 
    fontSize: 32, 
    fontWeight: '700',
  },
  weatherSection: {
    marginBottom: 20, 
  },
  sectionTitle: {
    fontSize: 16, 
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12, 
    textAlign: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
    padding: 10, 
    flex: 1,
    marginHorizontal: 4,
  },
  weatherValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#424242',
    marginTop: 4, 
  },
  weatherLabel: { 
    fontSize: 11, 
    color: '#757575', 
    marginTop: 2,
    textAlign: 'center',
  },
  actionSection: {
    marginTop: 0, 
    marginBottom: 0, 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    alignSelf: 'flex-start',
  },
  backText: { 
    marginLeft: 8, 
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  avatar: {
    width: 140, 
    height: 140, 
    borderRadius: 0,
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  riskBadge: { 
    paddingHorizontal: 20, 
    paddingVertical: 6, 
    borderRadius: 16, 
  },
  riskText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 12, 
  },
  adviceSection: {
    marginBottom: 20,
  },
  adviceContainer: {
    padding: 16, 
  },
  adviceRow: {
    flexDirection: 'row',
    marginBottom: 10, 
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6, 
    height: 6, 
    borderRadius: 3,
    backgroundColor: '#424242',
    marginTop: 6,
    marginRight: 10, 
  },
  adviceText: { 
    flex: 1,
    fontSize: 14,
    color: '#424242', 
    lineHeight: 20, 
  },
  infoContainer: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 0, 
  },
  infoText: {
    fontSize: 13, 
    color: '#424242',
    lineHeight: 18, 
    fontStyle: 'italic',
  },
  primaryButton: { 
    borderRadius: 12, 
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonInner: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    textAlign: 'center',
  },
  error: { 
    textAlign: 'center', 
    color: '#f44336', 
    marginTop: 12,
    fontSize: 14, 
  },
});