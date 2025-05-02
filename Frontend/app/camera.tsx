import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraKey, setCameraKey] = useState(Math.random()); // ✅ Add random key
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  // Replace the useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen comes into focus
      setCameraKey(Math.random());
      
      // No need to return a cleanup function as useFocusEffect handles this
    }, [])
  );

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'leaf.jpg',
      } as any);

      const response = await fetch('http://192.168.1.166:8000/predict-severity', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.detail || 'Server error');

      console.log('✅ Prediction result from backend:', result);

      router.push({
        pathname: '/result',
        params: { severity: result.severity.toString() },
      });

    } catch (error: any) {
      console.error('❌ Error during capture:', error);
      Alert.alert('Error', error.message || 'Failed to send photo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView key={cameraKey} style={styles.camera} facing={facing} ref={cameraRef} photo>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCapture} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.text}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { textAlign: 'center', marginBottom: 10, color: '#fff' },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  text: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
