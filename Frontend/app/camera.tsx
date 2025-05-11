import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

/* ------------------------------------------------------------------- */
/* constants                                                            */
/* ------------------------------------------------------------------- */

const MAX_PHOTOS = 10;
const ENDPOINT   = 'http://192.168.1.166:8000/predict-batch';

/* ------------------------------------------------------------------- */
/* component                                                            */
/* ------------------------------------------------------------------- */
export default function CameraScreen() {
  const [cameraKey, setCameraKey] = useState(Math.random());
  const cameraRef                 = useRef<any>(null);
  const [facing]                  = useState<CameraType>('back');

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [mediaPerm, setMediaPerm] = useState<ImagePicker.PermissionStatus | null>(null);

  const [images, setImages]       = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);
  const router                    = useRouter();

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // old enum (no crash)
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
    if (!haveTen) {
      Alert.alert(`Need ${MAX_PHOTOS} photos`, 'Please add more images.'); return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      images.forEach((uri, i) => {
        const ext  = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
        const mime = ext.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        fd.append('files', { uri, name: `leaf_${i}.${ext}`, type: mime } as any);
      });

      const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { overall_severity_index } = await res.json();
      router.push({ pathname: '/result', params: { severity: String(overall_severity_index) } });

      setImages([]);  setCameraKey(Math.random());
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

const styles = StyleSheet.create({
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
