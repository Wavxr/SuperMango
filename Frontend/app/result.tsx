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

// Avatar Image
import AvatarImg from '../assets/images/avatar.png';

// Types
type Recommendation = {
  severity_label: string;
  weather_risk: 'Low' | 'Medium' | 'High';
  action_label: string;
  advice: string;
  info: string;
  action_label_tagalog?: string;
  advice_tagalog?: string;
  info_tagalog?: string;
};

export default function ResultScreen() {
  const {
    psi,
    overallLabel,
    humidity,
    temperature,
    wetness,
    recommendation,
  } = useLocalSearchParams();

  const router = useRouter();
  const [showRec, setShowRec] = useState(false);
  const [lang, setLang] = useState<'en' | 'tl'>('en');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [showRec, lang]);

  const percentSeverity = psi ? parseFloat(String(psi)) : undefined;
  const severityText = String(overallLabel);
  const rec: Recommendation = recommendation
    ? JSON.parse(String(recommendation))
    : { severity_label: '', weather_risk: 'Low', action_label: '', advice: '', info: '' };

  // Tagalog mappings
  const TAGALOG_SEVERITY: Record<string, string> = {
    Healthy: 'Malusog',
    Mild: 'Bahagya',
    Moderate: 'Katamtaman',
    Severe: 'Malala',
  };
  const TAGALOG_RISK: Record<string, string> = {
    Low: 'Mababang',
    Medium: 'Katamtamang',
    High: 'Mataas na',
  };

  const displaySeverity = lang === 'tl' ? TAGALOG_SEVERITY[severityText] || severityText : severityText;
  const displayRisk = lang === 'tl' ? TAGALOG_RISK[rec.weather_risk] || rec.weather_risk : rec.weather_risk;

  const actionLabel = lang === 'tl' && rec.action_label_tagalog ? rec.action_label_tagalog : rec.action_label;
  const adviceText = lang === 'tl' && rec.advice_tagalog ? rec.advice_tagalog : rec.advice;
  const infoText = lang === 'tl' && rec.info_tagalog ? rec.info_tagalog : rec.info;

  const colors = { Healthy: '#4CAF50', Mild: '#FFC107', Moderate: '#FF9800', Severe: '#F44336' };
  const severityColor = colors[severityText as keyof typeof colors] || '#424242';

  const toggleRec = () => setShowRec(!showRec);
  const scanAgain = () => router.replace('/');
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'tl' : 'en'));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>  
        {!showRec ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* Header with mango leaf emoji */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>🍃 Anthracnose Results</Text>
              <TouchableOpacity onPress={toggleLang} style={styles.langButton}>
                <Text style={styles.langButtonText}>{lang === 'en' ? 'Tagalog' : 'English'}</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { borderColor: severityColor }]}>
              <View style={styles.summaryRow}>
                <Ionicons name="leaf-outline" size={24} color={severityColor} style={{ marginRight: 8 }} />
                <Text style={styles.summaryText}>
                  {lang === 'tl' ? 'Kalubhaan:' : 'Severity:'}{' '}
                  <Text style={{ color: severityColor }}>{displaySeverity}</Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cloud-outline" size={20} color="#555" style={{ marginRight: 8 }} />
                <Text style={styles.summaryText}>
                  {lang === 'tl' ? 'Panganib ng Panahon:' : 'Weather Risk:'}{' '}
                  <Text style={{ color: rec.weather_risk === 'Low' ? '#81c784' : rec.weather_risk === 'Medium' ? '#ffb74d' : '#e57373' }}>
                    {displayRisk}
                  </Text>
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="medkit-outline" size={20} color="#555" style={{ marginRight: 8 }} />
                <Text style={styles.summaryText}>
                  {lang === 'tl' ? 'Gagawin:' : 'Action:'}{' '}
                  <Text style={{ color: severityColor, fontWeight: '600' }}>{actionLabel}</Text>
                </Text>
              </View>
            </View>

            {/* PSI Bar */}
            {typeof percentSeverity === 'number' && !Number.isNaN(percentSeverity) && (
              <View style={styles.card}>
                <Ionicons name="speedometer-outline" size={24} color={severityColor} style={{ alignSelf: 'center', marginBottom: 8 }} />
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(percentSeverity, 100)}%`, backgroundColor: severityColor }]} />
                </View>
                <Text style={styles.psiLabel}>{percentSeverity.toFixed(1)}% PSI</Text>
              </View>
            )}

            {/* Weather Stats */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{lang === 'tl' ? 'Panahon' : 'Weather'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="thermometer-outline" size={20} color="#555" />
                  <Text style={styles.statText}>{Number(temperature).toFixed(1)}°C</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="water-outline" size={20} color="#555" />
                  <Text style={styles.statText}>{Number(humidity).toFixed(0)}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="rainy-outline" size={20} color="#555" />
                  <Text style={styles.statText}>{Number(wetness).toFixed(1)}h</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.button} onPress={toggleRec} activeOpacity={0.8}>
              <Text style={styles.buttonText}>{lang === 'tl' ? 'Tingnan ang Payo' : 'View Recommendations'}</Text>
            </TouchableOpacity>

          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* Back & Language Toggle */}
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={toggleRec}>
                <Ionicons name="arrow-back-outline" size={20} color="#424242" />
                <Text style={styles.backText}>{lang === 'tl' ? 'Bumalik' : 'Back'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleLang} style={styles.langButton}>
                <Text style={styles.langButtonText}>{lang === 'en' ? 'Tagalog' : 'English'}</Text>
              </TouchableOpacity>
            </View>

            {/* Title & Avatar */}
            <Text style={styles.title}>{lang === 'tl' ? 'Mga Payo' : 'Recommendations'}</Text>
            <Image source={AvatarImg} style={styles.avatar} />

            {/* Risk Badge */}
            <View style={[styles.riskBadge, { backgroundColor: rec.weather_risk === 'Low' ? '#81c784' : rec.weather_risk === 'Medium' ? '#ffb74d' : '#e57373' }]}>
              <Text style={styles.riskText}>{displayRisk} {lang === 'tl' ? 'Panganib' : 'Risk'}</Text>
            </View>

            {/* Advice List */}
            <View style={styles.card}>
              {adviceText.split('\n').map((line, i) => (
                <View key={i} style={styles.adviceRow}>
                  <Text style={styles.bullet}>{i + 1}</Text>
                  <Text style={styles.adviceText}>{line.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>

            {/* Why Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{lang === 'tl' ? 'Bakit' : 'Why'}</Text>
              <Text style={styles.infoText}>{infoText}</Text>
            </View>

            {/* Scan Again Button */}
            <TouchableOpacity style={styles.button} onPress={scanAgain} activeOpacity={0.8}>
              <Text style={styles.buttonText}>{lang === 'tl' ? 'Muli Scan' : 'Scan Again'}</Text>
            </TouchableOpacity>

          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

// Styles
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langButton: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  langButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#333', textAlign: 'center', marginVertical: 16, letterSpacing: 1 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginVertical: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryText: { fontSize: 16, color: '#555' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginVertical: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#eee', overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%' },
  psiLabel: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 6, fontSize: 15, color: '#555' },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 24, marginVertical: 16, alignItems: 'center', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: 6, fontSize: 14, color: '#555', fontWeight: '600' },
  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginVertical: 24, borderWidth: 2, borderColor: '#eee' },
  riskBadge: { alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  riskText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  adviceRow: { flexDirection: 'row', marginBottom: 12 },
  bullet: { fontSize: 16, fontWeight: '700', color: '#555', width: 24 },
  adviceText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 24 },
  infoText: { fontSize: 14, fontStyle: 'italic', color: '#666', marginTop: 8, textAlign: 'center' },
});