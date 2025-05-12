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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    Healthy:  ['#A8E063', '#56AB2F'],
    Mild:     ['#FFEDA3', '#FFC85C'],
    Moderate: ['#FFB36B', '#FF914D'],
    Severe:   ['#FF616D', '#FF1E42'],
  } as const;

  const gradientColors =
    severityText && severityColors[severityText as keyof typeof severityColors]
      ? severityColors[severityText as keyof typeof severityColors]
      : ['#fff9c4', '#ffeb3b'];

  /* ───────────────────────── handlers ─────────────────────────────────── */
  const scanAgain = () => router.replace('/');
  const toggleRec = () => setShowRec(!showRec);

  /* ====================================================================== */
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient 
        colors={gradientColors} 
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
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
                  <View style={styles.psiContainer}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(percentSeverity, 100)}%`,
                            backgroundColor:
                              severityColors[severityText as keyof typeof severityColors][1],
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
                )}

                {/* overall label */}
                {severityText && (
                  <View style={styles.conditionContainer}>
                    <Text style={styles.conditionLabel}>Tree Condition</Text>
                    <Text
                      style={[
                        styles.conditionValue,
                        { color: severityColors[severityText as keyof typeof severityColors][1] },
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
                      label="Temperature"
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
                <SecondaryButton text="Scan Another Leaf" onPress={scanAgain} />
              </View>
            </ScrollView>
          ) : (
            /* ░░ SECOND SCREEN ░░ (Recommendation) ░░────────────────────── */
            <ScrollView 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity style={styles.backButton} onPress={toggleRec}>
                <Ionicons name="arrow-back" size={22} color="#795548" />
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
                  <View style={styles.adviceContainer}>
                    {rec.advice.split('\n').map((line, i) => (
                      <View key={i} style={styles.adviceRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.adviceText}>{line}</Text>
                      </View>
                    ))}
                  </View>

                  {rec.info ? (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoTitle}>Why it Works</Text>
                      <Text style={styles.infoText}>{rec.info}</Text>
                    </View>
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
      </LinearGradient>
    </View>
  );
}

/* ─────────────────────────── helpers ──────────────────────────────────── */
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
    <View style={styles.weatherItem}>
      <Ionicons name={icon} size={24} color="#5d4037" />
      <Text style={styles.weatherValue}>{value}</Text>
      <Text style={styles.weatherLabel}>{label}</Text>
    </View>
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
      <LinearGradient
        colors={['#26a69a', '#009688']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.primaryButtonText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.secondaryButton} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.secondaryButtonText}>{text}</Text>
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
    paddingTop: 40,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5d4037',
    textAlign: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  leaf: { 
    width: 180, 
    height: 180, 
    resizeMode: 'contain',
  },
  resultSection: {
    marginBottom: 30,
  },
  psiContainer: {
    marginBottom: 25,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 6,
  },
  psiTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  psiLabel: { 
    fontSize: 16, 
    color: '#5d4037',
    fontWeight: '500',
  },
  psiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5d4037',
  },
  conditionContainer: { 
    marginTop: 20,
    alignItems: 'center',
  },
  conditionLabel: { 
    fontSize: 16, 
    color: '#5d4037', 
    marginBottom: 8,
    fontWeight: '500',
  },
  conditionValue: { 
    fontSize: 36, 
    fontWeight: '700',
  },
  weatherSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 16,
    textAlign: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 5,
  },
  weatherValue: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#5d4037',
    marginTop: 8,
  },
  weatherLabel: { 
    fontSize: 14, 
    color: '#795548', 
    marginTop: 4,
  },
  actionSection: {
    marginTop: 10,
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: { 
    marginLeft: 8, 
    fontSize: 16, 
    color: '#795548',
    fontWeight: '500',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  riskBadge: { 
    paddingHorizontal: 24, 
    paddingVertical: 8, 
    borderRadius: 20,
  },
  riskText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 18,
  },
  adviceSection: {
    marginBottom: 30,
  },
  adviceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  adviceRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5d4037',
    marginTop: 6,
    marginRight: 12,
  },
  adviceText: { 
    flex: 1,
    fontSize: 16, 
    color: '#5d4037', 
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5d4037',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#5d4037',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  primaryButton: { 
    borderRadius: 12, 
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: { 
    paddingVertical: 16, 
    alignItems: 'center', 
  },
  primaryButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: { 
    color: '#5d4037', 
    fontSize: 18, 
    fontWeight: '600',
  },
  error: { 
    textAlign: 'center', 
    color: '#f44336', 
    marginTop: 12,
    fontSize: 16,
  },
});