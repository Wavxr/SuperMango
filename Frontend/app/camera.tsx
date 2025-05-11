import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet as RNStyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

/* ------------------------------------------------------------------- */
/* constants                                                           */
/* ------------------------------------------------------------------- */

const MAX_PHOTOS  = 10;
const ENDPOINT    = 'http://192.168.1.166:8000/getPrescription';
const OPEN_WEATHER_API_KEY = process.env.EXPO_PUBLIC_OWM_KEY ?? '';

/* ------------------------------------------------------------------- */
/* component                                                           */
/* ------------------------------------------------------------------- */
export default function CameraScreen() {
  const [cameraKey, setCameraKey]         = useState(Math.random());
  const cameraRef                         = useRef<any>(null);
  const [facing]                          = useState<CameraType>('back');

  const [camPerm, requestCamPerm]         = useCameraPermissions();
  const [mediaPerm, setMediaPerm]         = useState<ImagePicker.PermissionStatus | null>(null);

  const [images, setImages]               = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const router                            = useRouter();

  const haveTen = images.length === MAX_PHOTOS;

  /* refresh camera preview on screen focus */
  useFocusEffect(useCallback(() => setCameraKey(Math.random()), []));

  /* ----------------------- capture from camera ---------------------- */
  const handleCapture = async () => {
    if (!cameraRef.current || haveTen) return;
    try {
      const { uri } = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      setImages(prev => [...prev, uri].slice(0, MAX_PHOTOS));
    } catch (err) {
      console.error('❌ Capture error:', err);
    }
  };

  /* ----------------------- pick from gallery ------------------------ */
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
        quality: 1,
      });

      if (!result.canceled) {
        const uris = result.assets.map(a => a.uri);
        setImages(prev => [...prev, ...uris].slice(0, MAX_PHOTOS));
      }
    } catch (err) {
      console.error('❌ Image-picker error:', err);
    }
  };

  /* ----------------------- submit to backend ------------------------ */
  const handleSubmit = async () => {
    // need all 10 images
    if (!haveTen) {
      Alert.alert(`Need ${MAX_PHOTOS} photos`, 'Please add more images.');
      return;
    }

    setLoading(true);
    try {
      /* ──────── 1. grab GPS ──────── */
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') throw new Error('Location permission denied');
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      /* ──────── 2. fetch weather ─── */
      let humidity = 0,
          temperature = 0,
          wetness = 0;                     // mm rain (3 h) or precip

      try {
        /* primary source – OpenWeatherMap */
        if (!OPEN_WEATHER_API_KEY) throw new Error('OWM key not set');
        const owmUrl =
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}` +
          `&units=metric&appid=${OPEN_WEATHER_API_KEY}`;

        const owmRes = await fetch(owmUrl);
        if (!owmRes.ok) throw new Error(`OWM HTTP ${owmRes.status}`);

        const wx = await owmRes.json();

        humidity    = wx.main?.humidity ?? 0;
        temperature = wx.main?.temp ?? 0;
        wetness     = ((wx.rain?.['3h'] ?? 0) as number).toFixed(2);
      } catch (owmErr) {
        /* fallback – Open-Meteo (no API key) */
        console.warn('⚠️  OWM failed – switching to Open-Meteo →', owmErr);

        const omUrl =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`;

        const omRes = await fetch(omUrl);
        if (!omRes.ok) throw new Error(`Open-Meteo HTTP ${omRes.status}`);

        const om = await omRes.json();

        humidity    = om.current?.relative_humidity_2m ?? 0;
        temperature = om.current?.temperature_2m ?? 0;
        wetness     = Number(om.current?.precipitation ?? 0).toFixed(2);
      }

      /* ──────── 3. build FormData ─── */
      const fd = new FormData();
      images.forEach((uri, i) => {
        const ext  = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
        const mime = ext.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        fd.append('files', { uri, name: `leaf_${i}.${ext}`, type: mime } as any);
      });

      fd.append('humidity',    String(humidity));
      fd.append('temperature', String(temperature));
      fd.append('wetness',     String(wetness));
      fd.append('lat',         String(latitude));
      fd.append('lon',         String(longitude));

      /* ──────── 4. POST to API ────── */
      const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      /* ──────── 5. navigate to result */
      router.push({
        pathname: '/result',
        params: {
          severity:    String(data.overall_severity_index),
          humidity:    String(data.weather.humidity),
          temperature: String(data.weather.temperature),
          wetness:     String(data.weather.wetness),
        },
      });

      /* reset for next batch */
      setImages([]);
      setCameraKey(Math.random());
    } catch (err) {
      console.error('❌ Submission failed:', err);
      Alert.alert('Upload error', String(err));
    } finally {
      setLoading(false);
    }
  };


  /* --------------------------- UI guards ---------------------------- */
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

  /* ------------------------------- JSX ------------------------------ */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* camera layer – NO CHILDREN */}
      <CameraView
        key={cameraKey}
        style={RNStyleSheet.absoluteFill}
        facing={facing}
        ref={cameraRef}
        photo
      />

      {/* overlay layer */}
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
    </View>
  );
}

/* --------------------------- sub-components ------------------------- */

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
        <Text style={{ color: '#fff', textAlign: 'center' }}>{label}</Text>
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

/* ------------------------------- styles ----------------------------- */

const styles = RNStyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    paddingTop: 50, paddingBottom: 20, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  frameGuide: {
    flex: 1, margin: 40, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, borderStyle: 'dashed',
  },
  buttonContainer: { alignItems: 'center', paddingBottom: 100 },
  captureButton: {
    width: 150, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginVertical: 6,
  },
  captureInner: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#fbc02d', borderWidth: 2, borderColor: '#fff',
  },
  /* permission screen */
  permissionContainer: { flex: 1 },
  permissionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  permissionTitle: { fontSize: 28, fontWeight: 'bold', color: '#795548', marginBottom: 20 },
  permissionMessage: { fontSize: 16, color: '#5d4037', textAlign: 'center', marginBottom: 40 },
  permissionButton: {
    width: '80%', borderRadius: 30, overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
