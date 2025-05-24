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
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AvatarImg from '../assets/images/avatar.png';

/* ------------------------------------------------------------------ */
/* ---------------------------- types -------------------------------- */

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
  /* ------------ nav / params ------------- */
  const {
    psi,
    overallLabel,
    humidity,
    temperature,
    wetness,
    recommendation,
    savedView, // "true" when opened from Saved tab
  } = useLocalSearchParams();
  const router = useRouter();

  /* ------------ ui state ----------------- */
  const insets = useSafeAreaInsets();
  const [showRec, setShowRec] = useState(false);
  const [lang, setLang] = useState<'en' | 'tl'>('en');
  const fadeAnim = useState(new Animated.Value(0))[0];

  /* save modal */
  const [saveModal, setSaveModal] = useState(false);
  const [treeName, setTreeName] = useState('');
  const [treeImage, setTreeImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [showRec, lang]);

  const percentSeverity = psi ? parseFloat(String(psi)) : undefined;
  const severityText = String(overallLabel);
  const rec: Recommendation = recommendation
    ? JSON.parse(String(recommendation))
    : {
        severity_label: '',
        weather_risk: 'Low',
        action_label: '',
        advice: '',
        info: '',
      };

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

  const displaySeverity =
    lang === 'tl'
      ? TAGALOG_SEVERITY[severityText] || severityText
      : severityText;
  const displayRisk =
    lang === 'tl'
      ? TAGALOG_RISK[rec.weather_risk] || rec.weather_risk
      : rec.weather_risk;

  const actionLabel =
    lang === 'tl' && rec.action_label_tagalog
      ? rec.action_label_tagalog
      : rec.action_label;
  const adviceText =
    lang === 'tl' && rec.advice_tagalog ? rec.advice_tagalog : rec.advice;
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
    Severe: '#F44336',
  };
  const severityColor =
    colors[severityText as keyof typeof colors] || '#424242';

  // Modern UI color palette
  const theme = {
    background : '#F5F7FA',
    card: '#FFFFFF',
    primary: '#4CAF50',
    text: '#2D3748',
    textLight: '#718096',
    border: '#E2E8F0',
    iconBg: '#EDF2F7',
  };

  const toggleRec = () => setShowRec(!showRec);
  const scanAgain = () => router.replace('/');
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'tl' : 'en'));

   /* -------------- effects ---------------- */
   useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [showRec, lang]);

  /* ------------------------------------------------------------------ */
  /* --------------------- save-feature helpers ----------------------- */

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled) setTreeImage(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled) setTreeImage(res.assets[0].uri);
  };

  const saveToStorage = async () => {
    if (!treeName || !treeImage) {
      Alert.alert('Missing info', 'Please add a tree name and photo.');
      return;
    }
    setSaving(true);
    try {
      const key = 'savedRecommendations';
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        id: Date.now().toString(),
        name: treeName,
        image: treeImage,
        timestamp: Date.now(),
        payload: {
          psi,
          overallLabel,
          humidity,
          temperature,
          wetness,
          recommendation,
        },
      });
      await AsyncStorage.setItem(key, JSON.stringify(list));
      setSaveModal(false);
      setTreeName('');
      setTreeImage(null);
      Alert.alert('Saved', 'Recommendation stored locally.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* ---------------------------- render ------------------------------- */
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 16, 
        },
      ]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {!showRec ? (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}>
              {/* Header with title and language toggle */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>Anthracnose Results</Text>
                <TouchableOpacity
                  onPress={toggleLang}
                  style={[
                    styles.langButton,
                    { backgroundColor: theme.primary },
                  ]}>
                  <Text style={styles.langButtonText}>
                    {lang === 'en' ? 'Tagalog' : 'English'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PSI Card */}
              {typeof percentSeverity === 'number' &&
                !Number.isNaN(percentSeverity) && (
                  <View style={styles.modernCard}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${severityColor}20` },
                        ]}>
                        <Ionicons
                          name="speedometer"
                          size={22}
                          color={severityColor}
                        />
                      </View>
                      <Text style={styles.cardTitle}>PSI</Text>
                      <Text style={styles.resultLabel}>
                        {lang === 'tl' ? 'Resulta' : 'Result'}
                      </Text>
                    </View>
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
                    <Text style={[styles.psiLabel, { color: severityColor }]}>
                      {percentSeverity.toFixed(1)}%{' '}
                      {lang === 'tl' ? 'ang lala ng Anthracnose' : 'Severity of Anthracnose'}
                    </Text>
                  </View>
                )}

              {/* Severity and Risk Cards */}
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

              {/* Weather Stats Card */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: '#E3F2FD' },
                    ]}>
                    <Ionicons name="cloud" size={22} color="#1E88E5" />
                  </View>
                  <Text style={styles.cardTitle}>
                    {lang === 'tl' ? 'Panahon' : 'Weather'}
                  </Text>
                  <Text style={styles.resultLabel}>
                    {lang === 'tl' ? 'Resulta' : 'Result'}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.miniIconContainer,
                        { backgroundColor: '#FFF8E1' },
                      ]}>
                      <Ionicons name="thermometer" size={18} color="#FFA000" />
                    </View>
                    <Text style={styles.statText}>
                      {Number(temperature).toFixed(1)}°C
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.miniIconContainer,
                        { backgroundColor: '#E0F7FA' },
                      ]}>
                      <Ionicons name="water" size={18} color="#00ACC1" />
                    </View>
                    <Text style={styles.statText}>
                      {Number(humidity).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.miniIconContainer,
                        { backgroundColor: '#E8F5E9' },
                      ]}>
                      <Ionicons name="rainy" size={18} color="#43A047" />
                    </View>
                    <Text style={styles.statText}>
                      {Number(wetness).toFixed(1)}h
                    </Text>
                  </View>
                </View>
              </View>

              {/* Spacer */}
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Button */}
            <View
              style={[
                styles.fixedButtonContainer,
                { 
                  paddingBottom: insets.bottom + 90, 
                  backgroundColor: theme.background 
                },
              ]}>
              <TouchableOpacity
                style={styles.fixedButton}
                onPress={toggleRec}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>
                  {lang === 'tl' ? 'Tingnan ang Payo' : 'View Recommendations'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (

          /* ---------- second panel (recommendations) ---------- */
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}>
              {/* Back & Language Toggle */}
              <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={toggleRec}>
                  <Ionicons name="arrow-back" size={20} color="#424242" />
                  <Text style={styles.backText}>
                    {lang === 'tl' ? 'Bumalik' : 'Back'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleLang}
                  style={[
                    styles.langButton,
                    { backgroundColor: theme.primary },
                  ]}>
                  <Text style={styles.langButtonText}>
                    {lang === 'en' ? 'Tagalog' : 'English'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title & Avatar */}
              <Text style={styles.title}>
                {lang === 'tl' ? 'Mga Payo' : 'Recommendations'}
              </Text>
              <Image source={AvatarImg} style={styles.avatar} />

              {/* Advice List */}
              <View style={styles.modernCard}>
                {adviceText.split('\n').map((line, i) => {
                  const startsWithNumber = /^\d+\./.test(line.trim()); 

                  return (
                    <View key={i} style={styles.adviceRow}>
                      {startsWithNumber && ( 
                        <View
                          style={[
                            styles.bulletContainer,
                            { backgroundColor: `${severityColor}20` },
                          ]}>
                          <Text style={[styles.bullet, { color: severityColor }]}>
                            {i + 1}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.adviceText,
                          !startsWithNumber && { marginLeft: 34 }, 
                        ]}>
                        {line.replace(/^\d+\.\s*/, '')} {/* Remove the number if present */}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* --- Save button (only if not in savedView) --- */}
              {!savedView && (
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setSaveModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.saveBtnIconContainer}>
                    <Ionicons name="save" size={18} color="#fff" />
                  </View>
                  <Text style={styles.saveTxt}>
                    {lang === 'tl' ? 'I-save ang Payo' : 'Save Recommendation'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Spacer */}
              <View style={{ height: 15 }} />


              {/* Why Card */}
              <View style={styles.modernCard}>
                <Text style={styles.sectionTitle}>
                  {lang === 'tl' ? 'Bakit' : 'Why'}
                </Text>
                <Text style={styles.infoText}>{infoText}</Text>
              </View>

              {/* Spacer */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </Animated.View>

      {/* ---------------- save modal ---------------- */}
      <Modal
              visible={saveModal}
              transparent
              animationType="fade"
              onRequestClose={() => setSaveModal(false)}
            >
              <View style={styles.modalOverlay}>
                <Animated.View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {lang === 'tl' ? 'I-save ang Puno' : 'Save Tree'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.closeButton} 
                      onPress={() => setSaveModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#718096" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {lang === 'tl' ? 'Pangalan ng Puno' : 'Tree Name'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={lang === 'tl' ? 'Pangalan' : 'Enter tree name'}
                      value={treeName}
                      onChangeText={setTreeName}
                    />
                  </View>

                  <Text style={styles.sectionLabel}>
                    {lang === 'tl' ? 'Larawan ng Puno' : 'Tree Photo'}
                  </Text>

                  <View style={styles.modalBtnsRow}>
                    <TouchableOpacity style={styles.miniBtn} onPress={takePhoto}>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.miniBtnTxt}>
                        {lang === 'tl' ? 'Kamera' : 'Camera'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniBtn} onPress={pickImage}>
                      <Ionicons name="images" size={20} color="#fff" />
                      <Text style={styles.miniBtnTxt}>
                        {lang === 'tl' ? 'Gallery' : 'Gallery'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {treeImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: treeImage }}
                        style={styles.imagePreview}
                      />
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#CBD5E0" />
                      <Text style={styles.placeholderText}>
                        {lang === 'tl' ? 'Walang larawan' : 'No image selected'}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.bigBtn, !treeName || !treeImage ? styles.bigBtnDisabled : null]}
                    onPress={saveToStorage}
                    disabled={saving || !treeName || !treeImage}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                        <Text style={styles.bigBtnTxt}>
                          {lang === 'tl' ? 'I-save' : 'Save'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Modal>

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
    elevation: 12,
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
    minHeight: 150,
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
/* -------- save button -------- */
saveBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'center',
  marginTop: 16,
  backgroundColor: '#4CAF50',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 30,
  elevation: 4,
  shadowColor: '#4CAF50',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
saveBtnIconContainer: {
  backgroundColor: 'rgba(255,255,255,0.2)',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
},
saveTxt: { 
  color: '#fff', 
  fontWeight: '600',
  fontSize: 15,
},

/* -------- modal -------- */
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  padding: 24,
},
modalBox: { 
  backgroundColor: '#fff', 
  borderRadius: 20, 
  padding: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 10,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#EDF2F7',
  paddingBottom: 12,
},
modalTitle: { 
  fontSize: 22, 
  fontWeight: '700', 
  color: '#2D3748',
},
closeButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#F7FAFC',
  justifyContent: 'center',
  alignItems: 'center',
},
inputContainer: {
  marginBottom: 16,
},
inputLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#4A5568',
  marginBottom: 6,
},
sectionLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#4A5568',
  marginBottom: 10,
},
input: {
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
  backgroundColor: '#F7FAFC',
},
modalBtnsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},
miniBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#4CAF50',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  flex: 0.48,
  justifyContent: 'center',
  elevation: 2,
  shadowColor: '#4CAF50',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
},
miniBtnTxt: { 
  color: '#fff', 
  marginLeft: 8,
  fontWeight: '600',
  fontSize: 14,
},
imagePreviewContainer: {
  marginVertical: 16,
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
imagePreview: { 
  width: '100%', 
  height: 180, 
  borderRadius: 16,
},
imagePlaceholder: {
  width: '100%',
  height: 180,
  borderRadius: 16,
  backgroundColor: '#F7FAFC',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 16,
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderStyle: 'dashed',
},
placeholderText: {
  color: '#A0AEC0',
  marginTop: 8,
  fontSize: 14,
},
bigBtn: {
  flexDirection: 'row',
  backgroundColor: '#4CAF50',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
  elevation: 4,
  shadowColor: '#4CAF50',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
bigBtnDisabled: {
  backgroundColor: '#A0AEC0',
  elevation: 0,
  shadowOpacity: 0,
},
bigBtnTxt: { 
  color: '#fff', 
  fontWeight: '700', 
  fontSize: 16
},
});
