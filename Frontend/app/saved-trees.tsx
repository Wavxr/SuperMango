import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function AnimatedListItem({ item, index, openTree, confirmDelete }: any) {
  const itemFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemFadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, itemFadeAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: itemFadeAnim,
          transform: [
            {
              translateY: itemFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => openTree(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.img} />
          <View style={styles.severityBadge}>
            <Text style={styles.severityText}>{item.payload.overallLabel}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#E53E3E" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="thermometer-outline" size={14} color="#FF9800" />
              <Text style={styles.statText}>
                {Number(item.payload.temperature).toFixed(1)}°C
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={14} color="#3182CE" />
              <Text style={styles.statText}>
                {Number(item.payload.humidity).toFixed(0)}%
              </Text>
            </View>
          </View>

          <Text style={styles.time}>
            <Ionicons name="time-outline" size={12} color="#718096" />
            {' ' + new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SavedTreesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem('savedRecommendations');
        const parsedData = raw ? JSON.parse(raw) : [];
        setData(parsedData);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error loading saved trees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        fadeAnim.setValue(0);
      };
    }, [loadData, fadeAnim])
  );

  const del = async (id: string) => {
    const filtered = data.filter(x => x.id !== id);
    setData(filtered);
    await AsyncStorage.setItem('savedRecommendations', JSON.stringify(filtered));
  };

  const confirmDelete = (id: string) =>
    Alert.alert(
      'Delete Tree',
      'Are you sure you want to remove this tree?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => del(id),
        },
      ],
      { cancelable: true }
    );

  const openTree = (item: any) => {
    router.push({
      pathname: '/result',
      params: {
        ...item.payload,
        savedView: 'true',
      },
    });
  };

  const EmptyListComponent = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Ionicons name="leaf-outline" size={60} color="#CBD5E0" />
      <Text style={styles.emptyTitle}>No saved trees yet</Text>
      <Text style={styles.emptySubtitle}>Trees you save will appear here</Text>
      <TouchableOpacity style={styles.scanButton} onPress={() => router.replace('/')}>
        <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Scan a Tree</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Saved Trees</Text>
      <Text style={styles.headerSubtitle}>
        {data.length} {data.length === 1 ? 'tree' : 'trees'} saved
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading saved trees...</Text>
        </View>
      ) : (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <AnimatedListItem
                item={item}
                index={index}
                openTree={openTree}
                confirmDelete={confirmDelete}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyListComponent}
            ListHeaderComponent={data.length > 0 ? ListHeaderComponent : null}
          />
        </Animated.View>
      )}
    </View>
  );
}

const theme = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  primary: '#4CAF50',
  text: '#2D3748',
  textLight: '#718096',
  border: '#E2E8F0',
  iconBg: '#EDF2F7',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textLight,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  img: {
    width: 100,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  severityBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.iconBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: theme.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textLight,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textLight,
  },
});
