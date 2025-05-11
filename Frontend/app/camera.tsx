import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CameraScreen() {
  /* ------------------------------------------------------------------ */
  /* state & refs                                                       */
  /* ------------------------------------------------------------------ */
  const [cameraKey, setCameraKey] = useState(Math.random());
  const cameraRef = useRef<any>(null);
  const [facing] = useState<CameraType>('back');

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /* reset camera each time screen is focused */
  useFocusEffect(
    useCallback(() => {
      setCameraKey(Math.random());
    }, [])
  );

  /* ------------------------------------------------------------------ */
  /* capture a single photo                                             */
  /* ------------------------------------------------------------------ */
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      setCapturedImages(prev => [...prev, photo.uri]);
    } catch (err) {
      console.error('❌ Capture error:', err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* submit ten photos                                                  */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async () => {
    if (capturedImages.length < 10) {
      Alert.alert('Please take 10 leaf photos.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      capturedImages.forEach((uri, i) => {
        const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
        const mime = ext.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${ext}`;

        formData.append('files', {
          uri,
          name: `leaf_${i}.${ext}`,
          type: mime,
        } as any);
      });

      const res = await fetch('http://192.168.1.166:8000/predict-batch', {
        method: 'POST',
        body: formData, // do NOT set Content-Type manually
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const result = await res.json();
      router.push({
        pathname: '/result',
        params: { severity: String(result.overall_severity) },
      });

      /* clean-up */
      setCapturedImages([]);
      setCameraKey(Math.random());
    } catch (err: any) {
      console.error('❌ Submission failed:', err);
      Alert.alert('Upload error', err.message ?? 'Failed to send photos.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient colors={['#fff9c4', '#fff176', '#ffeb3b']} style={styles.permissionGradient}>
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionMessage}>
            Camera permission is required to scan mango leaves for Anthracnose detection.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient
              colors={['#fbc02d', '#f9a825']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const haveTenPhotos = capturedImages.length === 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView key={cameraKey} style={styles.camera} facing={facing} ref={cameraRef} photo>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {`Photos: ${capturedImages.length}/10 — ${haveTenPhotos ? 'Ready!' : 'Take more'}`}
            </Text>
          </View>

          <View style={styles.frameGuide} />

          <View style={styles.buttonContainer}>
            {!haveTenPhotos ? (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Text style={{ color: '#fff' }}>Submit All Photos</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

/* -------------------------------------------------------------------- */
/* styles                                                               */
/* -------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  frameGuide: {
    flex: 1,
    margin: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fbc02d',
    borderWidth: 2,
    borderColor: '#fff',
  },
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
    lineHeight: 24,
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
    borderWidth: 1,
    borderColor: 'rgba(251, 192, 45, 0.3)',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
