import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraKey, setCameraKey] = useState(Math.random());
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
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={['#fff9c4', '#fff176', '#ffeb3b']}
          style={styles.permissionGradient}
        >
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionMessage}>
            Camera permission is required to scan mango leaves for Anthracnose detection.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView key={cameraKey} style={styles.camera} facing={facing} ref={cameraRef} photo>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Position Leaf in Frame</Text>
          </View>
          
          <View style={styles.frameGuide}>
            {/* Optional frame guide overlay */}
          </View>
          
          <View style={styles.buttonContainer}>
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
            
            <Text style={styles.captureText}>
              {isLoading ? 'Analyzing...' : 'Tap to Scan Leaf'}
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  camera: { 
    flex: 1 
  },
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
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
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
  captureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
  },
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
