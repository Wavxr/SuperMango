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
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Modern Design System
const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#10B981',
    primaryLight: '#34D399',
    secondary: '#6366F1',
    accent: '#F59E0B',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      light: '#9CA3AF',
    },
    status: {
      healthy: '#10B981',
      mild: '#F59E0B',
      moderate: '#EF4444',
      severe: '#DC2626',
    },
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

function AnimatedTreeCard({ item, index, openTree, confirmDelete }: any) {
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSeverityColor = (severity: string) => {
    return theme.colors.status[severity.toLowerCase()] || theme.colors.text.secondary;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: itemFadeAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: itemFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => openTree(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {/* Card Background Gradient */}
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFB']}
          style={styles.cardGradient}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.treeImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageOverlay}
              />
              
              {/* Severity Badge */}
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(item.payload.overallLabel) + '15' }
              ]}>
                <View style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(item.payload.overallLabel) }
                ]} />
                <Text style={[
                  styles.severityText,
                  { color: getSeverityColor(item.payload.overallLabel) }
                ]}>
                  {item.payload.overallLabel}
                </Text>
              </View>

              {/* PSI Score */}
              <View style={styles.psiContainer}>
                <Text style={styles.psiLabel}>PSI</Text>
                <Text style={styles.psiValue}>
                  {Number(item.payload.psi).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.treeName} numberOfLines={1}>
                  🥭 {item.name}
                </Text>
                <Text style={styles.dateText}>
                  {formatDate(item.timestamp)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LinearGradient
                  colors={['#FEE2E2', '#FECACA']}
                  style={styles.deleteButtonGradient}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Weather Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="thermometer" size={14} color="#F59E0B" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {Number(item.payload.temperature).toFixed(1)}°C
                  </Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="water" size={14} color="#3B82F6" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {Number(item.payload.humidity).toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="rainy" size={14} color="#10B981" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {Number(item.payload.wetness).toFixed(1)}mm
                  </Text>
                  <Text style={styles.statLabel}>Rainfall</Text>
                </View>
              </View>
            </View>

            {/* Action Indicator */}
            <View style={styles.actionIndicator}>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.text.light} />
            </View>
          </View>
        </LinearGradient>
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
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem('savedRecommendations');
        const parsedData = raw ? JSON.parse(raw) : [];
        // Sort by timestamp (newest first)
        const sortedData = parsedData.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setData(sortedData);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(headerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error('Error loading saved trees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fadeAnim, headerAnim]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        fadeAnim.setValue(0);
        headerAnim.setValue(0);
      };
    }, [loadData])
  );

  const del = async (id: string) => {
    const filtered = data.filter(x => x.id !== id);
    setData(filtered);
    await AsyncStorage.setItem('savedRecommendations', JSON.stringify(filtered));
  };

  const confirmDelete = (id: string) =>
    Alert.alert(
      'Delete Tree Record',
      'Are you sure you want to remove this tree from your saved collection?',
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

  const EmptyStateComponent = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[theme.colors.primary + '10', theme.colors.primaryLight + '05']}
        style={styles.emptyGradient}
      >
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
            style={styles.emptyIconGradient}
          >
            <Text style={styles.emptyIcon}>🥭</Text>
          </LinearGradient>
        </View>
        
        <Text style={styles.emptyTitle}>No Saved Trees Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start scanning mango leaves to build your tree health collection
        </Text>
        
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.scanButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="scan" size={20} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Scan Your First Tree</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const HeaderComponent = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        }
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>🌳 My Tree Collection</Text>
            <Text style={styles.headerSubtitle}>
              {data.length} {data.length === 1 ? 'tree' : 'trees'} monitored
            </Text>
          </View>
          
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{data.length}</Text>
              <Text style={styles.headerStatLabel}>Trees</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.primaryLight + '10']}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading your tree collection...</Text>
          </LinearGradient>
        </View>
      ) : (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <AnimatedTreeCard
                item={item}
                index={index}
                openTree={openTree}
                confirmDelete={confirmDelete}
              />
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 20 }
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyStateComponent}
            ListHeaderComponent={data.length > 0 ? HeaderComponent : null}
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  headerGradient: {
    padding: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'center',
  },
  headerStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Card Styles
  cardContainer: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  cardGradient: {
    flex: 1,
  },
  imageSection: {
    height: 180,
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  treeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  severityBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  psiContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  psiLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  psiValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Content Styles
  contentSection: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  treeName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 2,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  actionIndicator: {
    alignSelf: 'flex-end',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyGradient: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
  },
  emptyIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  scanButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
    fontSize: 16,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingGradient: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
});