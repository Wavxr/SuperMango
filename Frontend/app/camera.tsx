import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet as RNStyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/* ------------------------------------------------------------------- */
/* constants                                                           */
/* ------------------------------------------------------------------- */

const NGROK_ENDPOINT = 'https://gopher-loved-largely.ngrok-free.app/getPrescription';
const MAX_PHOTOS = 10;
const OPEN_WEATHER_API_KEY = process.env.EXPO_PUBLIC_OWM_KEY ?? '';

const { width, height } = Dimensions.get('window');

async function fetchWithFallback(formData: FormData) {
  return fetch(NGROK_ENDPOINT, { method: 'POST', body: formData });
}

/* ------------------------------------------------------------------- */
/* Modern Alert Modal Component                                        */
/* ------------------------------------------------------------------- */

function ModernAlertModal({ 
  visible, 
  onClose, 
  language = 'en' 
}: { 
  visible: boolean; 
  onClose: () => void;
  language?: 'en' | 'tl';
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const content = {
    en: {
      title: 'Unclear Photos Detected',
      message: 'One or more photos were not recognized as mango leaves. Please ensure all photos clearly show the leaf against a proper background.',
      instruction: 'Refer to the scanning instructions before trying again.',
      buttonText: 'Got it',
    },
    tl: {
      title: 'Hindi Malinaw na Larawan',
      message: 'Hindi nakilala ang isa o higit pang larawan bilang dahon ng mangga. Siguraduhing malinaw na nakikita ang dahon sa tamang background.',
      instruction: 'Basahin muna ang mga tagubilin sa pag-scan bago subukan ulit.',
      buttonText: 'Naintindihan',
    },
  };

  const currentContent = content[language];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FEFEFE']}
            style={styles.modalGradient}
          >
            {/* Header with Icon */}
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#FEF3C7', '#FDE68A']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="warning" size={32} color="#F59E0B" />
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>{currentContent.title}</Text>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>
                {currentContent.message}
              </Text>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="information-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.instructionText}>
                  {currentContent.instruction}
                </Text>
              </View>

              {/* Visual Guide */}
              <View style={styles.visualGuide}>
                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>✅</Text>
                  <Text style={styles.guideText}>
                    {language === 'en' ? 'Clear leaf photo' : 'Malinaw na dahon'}
                  </Text>
                </View>
                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>❌</Text>
                  <Text style={styles.guideText}>
                    {language === 'en' ? 'Blurry or unclear' : 'Malabo o hindi malinaw'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F59E0B', '#FCD34D']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>{currentContent.buttonText}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ------------------------------------------------------------------- */
/* Enhanced Loading Component with Mango Theme                        */
/* ------------------------------------------------------------------- */

function ModernLoadingScreen({ visible, progress }: { visible: boolean; progress: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Individual particle animations
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0.7),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Smooth entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Smooth continuous rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Gentle pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Mango bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();

      // Staggered particle animations
      const particleAnimations = particleAnims.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: -30 - Math.random() * 20,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0.5,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.8,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
      });

      particleAnimations.forEach(anim => anim.start());

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
        bounceAnimation.stop();
        particleAnimations.forEach(anim => anim.stop());
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  if (!visible) return null;

  const getLoadingText = () => {
    if (progress < 0.2) return 'Capturing location...';
    if (progress < 0.4) return 'Fetching weather data...';
    if (progress < 0.7) return 'Uploading images...';
    if (progress < 0.9) return 'Analyzing leaf health...';
    return 'Generating results...';
  };

  const getMangoEmoji = () => {
    if (progress < 0.2) return '🌍';
    if (progress < 0.4) return '🌤️';
    if (progress < 0.7) return '📤';
    if (progress < 0.9) return '🔬';
    return '✨';
  };

  return (
    <Animated.View 
      style={[
        styles.loadingOverlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(250, 210, 97, 0.95)',  // warm soft yellow
          'rgba(234, 179, 8, 0.95)',   // amber yellow (similar to #EAB308)
          'rgba(181, 159, 0, 0.95)',   // darker golden yellow
        ]}
        style={styles.loadingGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContent}>
          {/* Central Mango Animation */}
          <View style={styles.loadingAnimation}>
            {/* Rotating outer ring */}
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ rotate: spin }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.ringGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            {/* Inner rotating ring */}
            <Animated.View
              style={[
                styles.innerRing,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
                style={styles.ringGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Central Mango */}
            <Animated.View
              style={[
                styles.centerMango,
                {
                  transform: [
                    { translateY: bounceTranslate },
                    { scale: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [1, 1.1],
                    })}
                  ],
                },
              ]}
            >
              <Text style={styles.mangoEmoji}>🥭</Text>
            </Animated.View>

            {/* Status emoji */}
            <Animated.View
              style={[
                styles.statusEmoji,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.statusEmojiText}>{getMangoEmoji()}</Text>
            </Animated.View>
          </View>

          {/* Enhanced Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#4CAF50', '#8BC34A', '#CDDC39']}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>

          {/* Loading text */}
          <Text style={styles.loadingTitle}>🥭 Analyzing Mango Leaves</Text>
          <Text style={styles.loadingSubtitle}>{getLoadingText()}</Text>

          {/* Enhanced floating mango particles */}
          <View style={styles.particlesContainer}>
            {particleAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: `${10 + (i * 10)}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    transform: [
                      { translateY: anim.translateY },
                      { scale: anim.scale },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              >
                <Text style={styles.particleEmoji}>
                  {i % 4 === 0 ? '🥭' : i % 4 === 1 ? '🍃' : i % 4 === 2 ? '🌿' : '✨'}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* Decorative leaves */}
          <View style={styles.decorativeElements}>
            <Animated.View
              style={[
                styles.leafLeft,
                {
                  transform: [
                    { rotate: spin },
                    { scale: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [0.8, 1],
                    })}
                  ],
                },
              ]}
            >
              <Text style={styles.leafEmoji}>🍃</Text>
            </Animated.View>
            
            <Animated.View
              style={[
                styles.leafRight,
                {
                  transform: [
                    { rotate: spin },
                    { scale: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [1, 0.8],
                    })}
                  ],
                },
              ]}
            >
              <Text style={styles.leafEmoji}>🌿</Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------- */
/* Main Component                                                      */
/* ------------------------------------------------------------------- */

export default function CameraScreen() {
  const [cameraKey, setCameraKey] = useState(Math.random());
  const cameraRef = useRef<any>(null);
  const [facing] = useState<CameraType>('back');

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [mediaPerm, setMediaPerm] = useState<ImagePicker.PermissionStatus | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [language] = useState<'en' | 'tl'>('en'); // You can make this dynamic based on user preference
  const router = useRouter();

  const haveTen = images.length === MAX_PHOTOS;

  useFocusEffect(useCallback(() => setCameraKey(Math.random()), []));

  const handleCapture = async () => {
    if (!cameraRef.current || haveTen) return;
    try {
      const { uri } = await cameraRef.current.takePictureAsync({ 
        quality: 0.7, 
        skipProcessing: true,
      });
      setImages(prev => [...prev, uri].slice(0, MAX_PHOTOS));
    } catch (err) {
      console.error('❌ Capture error:', err);
    }
  };

  const handlePick = async () => {
    if (haveTen) return;

    if (!mediaPerm) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaPerm(status);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media-library permission is required to upload photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - images.length,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uris = result.assets.map(a => a.uri);
        setImages(prev => [...prev, ...uris].slice(0, MAX_PHOTOS));
      }
    } catch (err) {
      console.error('❌ Image-picker error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!haveTen) {
      Alert.alert(`Need ${MAX_PHOTOS} photos`, 'Please add more images.');
      return;
    }

    setLoading(true);
    setLoadingProgress(0);

    try {
      // Step 1: Location (20%)
      setLoadingProgress(0.1);
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') throw new Error('Location permission denied');
      
      setLoadingProgress(0.2);
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      // Step 2: Weather (40%)
      setLoadingProgress(0.3);
      let humidity = 0, temperature = 0, wetness = 0;

      try {
        if (!OPEN_WEATHER_API_KEY) throw new Error('OWM key not set');
        const owmUrl =
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}` +
          `&units=metric&appid=${OPEN_WEATHER_API_KEY}`;

        const owmRes = await fetch(owmUrl);
        if (!owmRes.ok) throw new Error(`OWM HTTP ${owmRes.status}`);

        const wx = await owmRes.json();
        humidity = wx.main?.humidity ?? 0;
        temperature = wx.main?.temp ?? 0;
        wetness = ((wx.rain?.['3h'] ?? 0) as number).toFixed(2);
      } catch (owmErr) {
        console.warn('⚠️  OWM failed – switching to Open-Meteo →', owmErr);

        const omUrl =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;

        const omRes = await fetch(omUrl);
        if (!omRes.ok) throw new Error(`Open-Meteo HTTP ${omRes.status}`);

        const om = await omRes.json();
        humidity = om.current?.relative_humidity_2m ?? 0;
        temperature = om.current?.temperature_2m ?? 0;
        wetness = Number(om.current?.precipitation ?? 0).toFixed(2);
      }

      setLoadingProgress(0.4);

      // Step 3: Prepare FormData (60%)
      setLoadingProgress(0.5);
      const fd = new FormData();
      images.forEach((uri, i) => {
        const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
        const mime = ext.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        fd.append('files', { uri, name: `leaf_${i}.${ext}`, type: mime } as any);
      });

      fd.append('humidity', String(humidity));
      fd.append('temperature', String(temperature));
      fd.append('wetness', String(wetness));
      fd.append('lat', String(latitude));
      fd.append('lon', String(longitude));

      setLoadingProgress(0.6);

      // Step 4: Upload and analyze (90%)
      setLoadingProgress(0.7);
      const res = await fetchWithFallback(fd);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      setLoadingProgress(0.9);
      
      //check if res is right response
      let data: any;
      try {
        data = await res.json();

        if (typeof data === 'string') {
          setShowAlertModal(true);
          return;
        }

        if (!data?.overall_label || !data?.recommendation) {
          Alert.alert('Error', 'Something went wrong. Please try again.');
          return;
        }
      } catch {
        Alert.alert('Error', 'Something went wrong. Please try again.');
        return;
      }

      // Step 5: Complete (100%)
      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use replace instead of push to avoid navigation issues
      router.replace({
        pathname: '/summary',
        params: {
          psi: String(data.percent_severity_index),
          overallLabel: data.overall_label,
          humidity: String(data.weather.humidity),
          temperature: String(data.weather.temperature),
          wetness: String(data.weather.wetness),
          recommendation: JSON.stringify(data.recommendation),
        },
      });

      setImages([]);
      setCameraKey(Math.random());
    } catch (err) {
      console.error('❌ Submission failed:', err);
      Alert.alert('Upload error', String(err));
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  if (!camPerm) return <View />;
  if (!camPerm.granted) {
    return (
      <PermissionView
        title="Camera Access"
        message="Camera permission is required to scan mango leaves for Anthracnose detection."
        onPress={requestCamPerm}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        key={cameraKey}
        style={RNStyleSheet.absoluteFill}
        facing={facing}
        ref={cameraRef}
        photo
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{`Photos: ${images.length}/${MAX_PHOTOS}`}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {haveTen ? (
            <MainButton onPress={handleSubmit} loading={loading} label="Submit All (10)" />
          ) : (
            <>
              <MainButton onPress={handleCapture} loading={loading} icon />
              <MainButton onPress={handlePick} loading={loading} label="Upload Photo(s)" />
            </>
          )}
        </View>
      </View>

      <ModernLoadingScreen visible={loading} progress={loadingProgress} />
      
      <ModernAlertModal 
        visible={showAlertModal} 
        onClose={() => setShowAlertModal(false)}
        language={language}
      />
    </View>
  );
}

/* --------------------------- Sub-components ------------------------- */

function MainButton({ onPress, loading, label, icon }: {
  onPress: () => void; loading: boolean; label?: string; icon?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.captureButton} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : icon ? (
        <View style={styles.captureInner} />
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function PermissionView({ title, message, onPress }: {
  title: string; message: string; onPress: () => void;
}) {
  return (
    <View style={styles.permissionContainer}>
      <LinearGradient colors={['#fff9c4', '#fff176', '#ffeb3b']} style={styles.permissionGradient}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionMessage}>{message}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={onPress}>
          <LinearGradient colors={['#fbc02d', '#f9a825']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

/* ------------------------------- Styles ----------------------------- */

const styles = RNStyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonContainer: { alignItems: 'center', paddingBottom: 100 },
  captureButton: {
    width: 150,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fbc02d',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Modern Alert Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },
  visualGuide: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  guideItem: {
    alignItems: 'center',
    flex: 1,
  },
  guideEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Enhanced Loading Screen Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    width: width * 0.85,
  },
  loadingAnimation: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  innerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  ringGradient: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 80,
  },
  centerMango: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mangoEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  statusEmoji: {
    position: 'absolute',
    top: -20,
    right: 10,
  },
  statusEmojiText: {
    fontSize: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 35,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  particleEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  leafLeft: {
    position: 'absolute',
    top: '20%',
    left: '10%',
  },
  leafRight: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
  },
  leafEmoji: {
    fontSize: 28,
    opacity: 0.7,
  },

  // Permission Screen Styles
  permissionContainer: { flex: 1 },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#795548',
    marginBottom: 20,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#5d4037',
    textAlign: 'center',
    marginBottom: 40,
  },
  permissionButton: {
    width: '80%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});