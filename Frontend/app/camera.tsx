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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

/* ------------------------------------------------------------------- */
/* constants & helpers                                                 */
/* ------------------------------------------------------------------- */

const MAX_PHOTOS = 10;
const ENDPOINT   = 'http://192.168.1.166:8000/predict-batch';

/* ------------------------------------------------------------------- */
/* component                                                           */
/* ------------------------------------------------------------------- */
export default function CameraScreen() {
  /* --------------------------- state -------------------------------- */
  const [cameraKey, setCameraKey]     = useState(Math.random());
  const cameraRef                     = useRef<any>(null);
  const [facing]                      = useState<CameraType>('back');

  const [cameraPerm, requestCamPerm]  = useCameraPermissions();
  const [mediaPerm,  setMediaPerm]    = useState<ImagePicker.PermissionStatus | null>(null);

  const [images, setImages]           = useState<string[]>([]);
  const [isLoading, setIsLoading]     = useState(false);

  const router = useRouter();
  const haveTen = images.length === MAX_PHOTOS;

  /* reset camera key whenever screen regains focus */
  useFocusEffect(
    useCallback(() => {
      setCameraKey(Math.random());
    }, [])
  );

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

    /* request media permission once */
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
        quality: 1,
        selectionLimit: MAX_PHOTOS - images.length, // pick only what we still need
      });

      if (result.canceled) return;

      const uris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...uris].slice(0, MAX_PHOTOS));
    } catch (err) {
      console.error('❌ Image-picker error:', err);
    }
  };

  /* ----------------------- submit to backend ------------------------ */
  const handleSubmit = async () => {
    if (!haveTen) {
      Alert.alert(`Need ${MAX_PHOTOS} photos`, 'Please add more images.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      images.forEach((uri, i) => {
        const ext  = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
        const mime = ext.toLowerCase() === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        formData.append('files', { uri, name: `leaf_${i}.${ext}`, type: mime } as any);
      });

      const res = await fetch(ENDPOINT, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const { overall_severity_index } = await res.json();
      router.push({
        pathname: '/result',
        params: { severity: String(overall_severity_index) },
      });

      /* reset for next scan */
      setImages([]);
      setCameraKey(Math.random());
    } catch (err: any) {
      console.error('❌ Submission failed:', err);
      Alert.alert('Upload error', err.message ?? 'Failed to send photos.');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------- UI logic ----------------------------- */
  if (!cameraPerm) return <View />;            // still asking
  if (!cameraPerm.granted) {
    return (
      <PermissionView
        onPress={requestCamPerm}
        title="Camera Access"
        message="Camera permission is required to scan mango leaves for Anthracnose detection."
      />
    );
  }

  /* ----------------------------- JSX -------------------------------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView key={cameraKey} style={styles.camera} facing={facing} ref={cameraRef} photo>
        <View style={styles.overlay}>
          {/* status bar */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{`Photos: ${images.length}/${MAX_PHOTOS}`}</Text>
          </View>

          <View style={styles.frameGuide} />

          {/* buttons */}
          <View style={styles.buttonContainer}>
            {haveTen ? (
              <MainButton onPress={handleSubmit} loading={isLoading} label="Submit All (10)" />
            ) : (
              <>
                <MainButton onPress={handleCapture} loading={isLoading} icon />
                <MainButton onPress={handlePick}   loading={isLoading} label="Upload Photo(s)" />
              </>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

/* ------------------------------------------------------------------- */
/* helper sub-components                                               */
/* ------------------------------------------------------------------- */

function MainButton({
  onPress,
  loading,
  label,
  icon,
}: {
  onPress: () => void;
  loading: boolean;
  label?: string;
  icon?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.captureButton} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : icon ? (
        <View style={styles.captureInner} /> /* camera shutter circle */
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function PermissionView({
  onPress,
  title,
  message,
}: {
  onPress: () => void;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.permissionContainer}>
      <LinearGradient colors={['#fff9c4', '#fff176', '#ffeb3b']} style={styles.permissionGradient}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionMessage}>{message}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={onPress}>
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

/* ------------------------------------------------------------------- */
/* styles                                                              */
/* ------------------------------------------------------------------- */

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
    width: 150,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fbc02d',
    borderWidth: 2,
    borderColor: '#fff',
  },
  /* permission screen */
  permissionContainer: { flex: 1 },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: { fontSize: 28, fontWeight: 'bold', color: '#795548', marginBottom: 20 },
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
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
