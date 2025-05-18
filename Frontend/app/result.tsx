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
  SafeAreaView,
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
  const infoText =
  lang === 'tl'
    ? rec.info_tagalog || rec.info
    : rec.info_tagalog
    ? rec.info.replace(rec.info_tagalog, '').trim()
    : rec.info;

  const colors = { 
    Healthy: '#4CAF50', 
    Mild: '#FFC107', 
    Moderate: '#FF9800', 
    Severe: '#F44336' 
  };
  const severityColor = colors[severityText as keyof typeof colors] || '#424242';
  
  // Modern UI color palette
  const theme = {
    background: '#F5F7FA',
    card: '#FFFFFF',
    primary: '#4CAF50',
    text: '#2D3748',
    textLight: '#718096',
    border: '#E2E8F0',
    iconBg: '#EDF2F7',
  };

  const toggleRec = () => setShowRec(!showRec);
  const scanAgain = () => router.replace('/');
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'tl' : 'en'));

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>  
        {!showRec ? (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Header with title and language toggle */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>Anthracnose Results</Text>
                <TouchableOpacity onPress={toggleLang} style={[styles.langButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.langButtonText}>{lang === 'en' ? 'Tagalog' : 'English'}</Text>
                </TouchableOpacity>
              </View>

              {/* PSI Card - Now First */}
              {typeof percentSeverity === 'number' && !Number.isNaN(percentSeverity) && (
                <View style={styles.modernCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${severityColor}20` }]}>
                      <Ionicons name="speedometer" size={22} color={severityColor} />
                    </View>
                    <Text style={styles.cardTitle}>PSI</Text>
                    <Text style={styles.resultLabel}>{lang === 'tl' ? 'Resulta' : 'Result'}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(percentSeverity, 100)}%`, backgroundColor: severityColor }]} />
                  </View>
                  <Text style={[styles.psiLabel, { color: severityColor }]}>
                    {percentSeverity.toFixed(1)}% {lang === 'tl' ? 'Nahawaan' : 'Infected'}
                  </Text>
                </View>
              )}

                {/* Severity and Risk Cards - Side by Side */}
                <View style={styles.cardRow}>
                  {/* Severity Card */}
                  <View style={[styles.modernCard, styles.halfCard]}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${severityColor}20` },
                        ]}>
                        <Ionicons name="leaf" size={22} color={severityColor} />
                      </View>
                      <Text style={styles.cardTitle}>
                        {lang === 'tl' ? 'Kalubhaan' : 'Severity'}
                      </Text>
                    </View>
                    <View style={[styles.riskContent, styles.cardCenterContent]}>
                      <Text
                        style={[
                          styles.riskLevel,
                          { color: severityColor },
                          lang === 'tl' && { fontSize: 16 },
                        ]}>
                        {displaySeverity}
                      </Text>
                    </View>
                  </View>

                  {/* Risk Card */}
                  <View style={[styles.modernCard, styles.halfCard]}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor:
                              rec.weather_risk === 'Low'
                                ? '#E8F5E9'
                                : rec.weather_risk === 'Medium'
                                ? '#FFF8E1'
                                : '#FFEBEE',
                          },
                        ]}>
                        <Ionicons
                          name="alert-circle"
                          size={22}
                          color={
                            rec.weather_risk === 'Low'
                              ? '#43A047'
                              : rec.weather_risk === 'Medium'
                              ? '#FFA000'
                              : '#E53935'
                          }
                        />
                      </View>
                      <Text style={styles.cardTitle}>
                        {lang === 'tl' ? 'Panganib' : 'Risk'}
                      </Text>
                    </View>

                    <View style={[styles.riskContent, styles.cardCenterContent]}>
                      <Text
                        style={[
                          styles.riskLevel,
                          {
                            color:
                              rec.weather_risk === 'Low'
                                ? '#43A047'
                                : rec.weather_risk === 'Medium'
                                ? '#FFA000'
                                : '#E53935',
                          },
                          lang === 'tl' && { fontSize: 14 },
                        ]}>
                        {displayRisk} {lang === 'tl' ? 'Panganib' : 'Risk'}
                      </Text>
                      <Text style={styles.actionText}>
                        {lang === 'tl' ? 'Gagawin:' : 'Action:'}
                        {'\n'}
                        <Text style={{ fontWeight: '600' }}>{actionLabel}</Text>
                      </Text>
                    </View>
                  </View>
                </View>



              {/* Weather Stats Card - Now Third */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="cloud" size={22} color="#1E88E5" />
                  </View>
                  <Text style={styles.cardTitle}>{lang === 'tl' ? 'Panahon' : 'Weather'}</Text>
                  <Text style={styles.resultLabel}>{lang === 'tl' ? 'Resulta' : 'Result'}</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={[styles.miniIconContainer, { backgroundColor: '#FFF8E1' }]}>
                      <Ionicons name="thermometer" size={18} color="#FFA000" />
                    </View>
                    <Text style={styles.statText}>{Number(temperature).toFixed(1)}°C</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.miniIconContainer, { backgroundColor: '#E0F7FA' }]}>
                      <Ionicons name="water" size={18} color="#00ACC1" />
                    </View>
                    <Text style={styles.statText}>{Number(humidity).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.miniIconContainer, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="rainy" size={18} color="#43A047" />
                    </View>
                    <Text style={styles.statText}>{Number(wetness).toFixed(1)}h</Text>
                  </View>
                </View>
              </View>

              {/* Spacer for fixed button - increased height to avoid navigation overlap */}
              <View style={{ height: 120 }} />
            </ScrollView>
                  
            {/* Fixed Button - adjusted position to be above navigation */}
            <View style={[styles.fixedButtonContainer, { bottom: 70 }]}>
              <TouchableOpacity style={styles.fixedButton} onPress={toggleRec} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{lang === 'tl' ? 'Tingnan ang Payo' : 'View Recommendations'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Back & Language Toggle */}
              <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={toggleRec}>
                  <Ionicons name="arrow-back" size={20} color="#424242" />
                  <Text style={styles.backText}>{lang === 'tl' ? 'Bumalik' : 'Back'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleLang} style={[styles.langButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.langButtonText}>{lang === 'en' ? 'Tagalog' : 'English'}</Text>
                </TouchableOpacity>
              </View>

              {/* Title & Avatar */}
              <Text style={styles.title}>{lang === 'tl' ? 'Mga Payo' : 'Recommendations'}</Text>
              <Image source={AvatarImg} style={styles.avatar} />

              {/* Risk Badge */}
              <View style={[styles.riskBadge, { 
                backgroundColor: rec.weather_risk === 'Low' ? '#43A047' : 
                                rec.weather_risk === 'Medium' ? '#FFA000' : '#E53935' 
              }]}>
                <Text style={styles.riskText}>{displayRisk} {lang === 'tl' ? 'Panganib' : 'Risk'}</Text>
              </View>

              {/* Advice List */}
              <View style={styles.modernCard}>
                {adviceText.split('\n').map((line, i) => (
                  <View key={i} style={styles.adviceRow}>
                    <View style={[styles.bulletContainer, { backgroundColor: `${severityColor}20` }]}>
                      <Text style={[styles.bullet, { color: severityColor }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.adviceText}>{line.replace(/^\d+\.\s*/, '')}</Text>
                  </View>
                ))}
              </View>

              {/* Why Card */}
              <View style={styles.modernCard}>
                <Text style={styles.sectionTitle}>{lang === 'tl' ? 'Bakit' : 'Why'}</Text>
                <Text style={styles.infoText}>{infoText}</Text>
              </View>

              {/* Spacer for fixed button - increased height to avoid navigation overlap */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
}

// Styles
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#F5F7FA',
  },
  container: { 
    flex: 1, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  content: { 
    paddingHorizontal: 20, 
    paddingBottom: 40,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8,
  },
  langButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowColor: '#000',
  },
  langButtonText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '600',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#2D3748', 
    textAlign: 'center', 
    marginVertical: 16, 
    letterSpacing: 0.5,
  },
  mainResultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    position: 'relative',
  },
  resultLabel: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 12,
  },
  cardCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  summaryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
  },
  summaryText: { 
    fontSize: 16, 
    color: '#4A5568',
    fontWeight: '500',
  },
  progressTrack: { 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#EDF2F7', 
    overflow: 'hidden', 
    marginBottom: 12,
  },
  progressFill: { 
    height: '100%',
    borderRadius: 5,
  },
  psiLabel: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333', 
    textAlign: 'center',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12, 
    color: '#2D3748', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statText: { 
    fontSize: 15, 
    color: '#4A5568',
    fontWeight: '600',
  },
  riskContent: {
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopColor: '#E2E8F0',
  },
  fixedButton: { 
    backgroundColor: '#4CAF50', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    shadowColor: '#4CAF50', 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 }, 
    elevation: 6,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  backButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  halfCard: {
    flex: 0.48,
    marginVertical: 0,
    maxHeight: 300,
    minHeight: 150, // ✅ ensures text never disappears
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  backText: { 
    marginLeft: 6, 
    fontSize: 14, 
    color: '#4A5568', 
    fontWeight: '600',
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    alignSelf: 'center', 
    marginVertical: 24, 
    borderWidth: 2, 
    borderColor: '#E2E8F0',
  },
  riskBadge: { 
    alignSelf: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 8, 
    borderRadius: 12, 
    marginBottom: 16,
  },
  riskText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14,
  },
  adviceRow: { 
    flexDirection: 'row', 
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bulletContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bullet: { 
    fontSize: 14, 
    fontWeight: '700',
  },
  adviceText: { 
    flex: 1, 
    fontSize: 15, 
    color: '#4A5568', 
    lineHeight: 24,
  },
  infoText: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    color: '#718096', 
    marginTop: 8, 
    textAlign: 'center',
    lineHeight: 22,
  },
});