import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#EAB308',      
    primaryLight: '#FCD34D', 
    secondary: '#D9A700',     
    accent: '#B59F00',       
    background: {
      start: '#FFFEF0',       
      middle: '#FFF9C4',     
      end: '#FFF176',         
    },
    text: {
      primary: '#684F04',     
      secondary: '#A27C04',   
      light: '#6B7280',    
    },
    card: '#FFFFFF',
    shadow: 'rgba(234, 179, 8, 0.2)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};


// Floating Particle Component with better positioning
function FloatingParticle({ 
  delay, 
  duration, 
  emoji, 
  left, 
  top 
}: { 
  delay: number; 
  duration: number; 
  emoji: string;
  left: string;
  top: string;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -30,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          left,
          top,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.particleEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

// Feature Card Component with fixed dimensions
function FeatureCard({ 
  icon, 
  title, 
  description, 
  onPress, 
  gradient,
  delay = 0 
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  gradient: string[];
  delay?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.featureCardTouchable}
      >
        <LinearGradient
          colors={gradient}
          style={styles.featureCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.featureCardContent}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation refs
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[theme.colors.background.start, theme.colors.background.middle, theme.colors.background.end]}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Better Scattered Floating Particles */}
          <View style={styles.particlesContainer}>
            <FloatingParticle delay={0} duration={3000} emoji="🥭" left="15%" top="10%" />
            <FloatingParticle delay={500} duration={3500} emoji="🍃" left="80%" top="15%" />
            <FloatingParticle delay={1000} duration={4000} emoji="🌿" left="10%" top="40%" />
            <FloatingParticle delay={1500} duration={3200} emoji="✨" left="85%" top="45%" />
            <FloatingParticle delay={2000} duration={3800} emoji="🥭" left="20%" top="70%" />
            <FloatingParticle delay={2500} duration={3600} emoji="🍃" left="75%" top="75%" />
            <FloatingParticle delay={3000} duration={4200} emoji="🌿" left="5%" top="85%" />
            <FloatingParticle delay={3500} duration={3400} emoji="✨" left="90%" top="25%" />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Logo Animation */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: Animated.multiply(logoScale, pulseAnim) },
                    { rotate: rotation },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoEmoji}>🥭</Text>
              </LinearGradient>
            </Animated.View>

            {/* Title */}
            <Animated.View style={[styles.titleContainer, { opacity: titleFade }]}>
              <Text style={styles.title}>SuperMango</Text>
              <View style={styles.titleUnderline}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.underlineGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View
              style={[
                styles.subtitleContainer,
                {
                  transform: [{ translateY: subtitleSlide }],
                  opacity: titleFade,
                },
              ]}
            >
              <Text style={styles.subtitle}>AI-Powered Mango Leaf Health Analysis</Text>
              <Text style={styles.description}>
                Detect Anthracnose disease early with advanced machine learning
              </Text>
            </Animated.View>

            {/* Main CTA Button */}
            <Animated.View
              style={[
                styles.mainButtonContainer,
                {
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => router.push('/camera')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.mainButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.mainButtonContent}>
                    <Ionicons name="scan" size={24} color="#FFFFFF" />
                    <Text style={styles.mainButtonText}>Start Scanning</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What You Can Do</Text>
            
            <View style={styles.featuresGrid}>
              <FeatureCard
                icon="camera"
                title="Scan Leaves"
                description="Capture mango leaf photos for instant analysis"
                onPress={() => router.push('/camera')}
                gradient={[theme.colors.primary, theme.colors.primaryLight]}
                delay={200}
              />
              
              <FeatureCard
                icon="library"
                title="View History"
                description="Access your saved tree health records"
                onPress={() => router.push('/saved-trees')}
                gradient={[theme.colors.secondary, '#FBBF24']}
                delay={400}
              />
              
              <FeatureCard
                icon="analytics"
                title="Health Reports"
                description="Get detailed analysis and recommendations"
                onPress={() => router.push('/camera')}
                gradient={[theme.colors.accent, '#FB923C']}
                delay={600}
              />
              
              <FeatureCard
                icon="leaf"
                title="Disease Info"
                description="Learn about Anthracnose and prevention"
                onPress={() => router.push('/camera')}
                gradient={['#EF4444', '#F87171']}
                delay={800}
              />
            </View>
          </View>

          {/* Developer Credit Section */}
          <View style={styles.developerSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
              style={styles.developerCard}
            >
              <Text style={styles.developerTitle}>💻 Developed by Autonomoux</Text>
              <Text style={styles.developerSubtitle}>
                Empowering farmers with AI technology
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Particles
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingParticle: {
    position: 'absolute',
  },
  particleEmoji: {
    fontSize: 24,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    minHeight: height * 0.6,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 60,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  underlineGradient: {
    flex: 1,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.light,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Main Button
  mainButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mainButton: {
    width: '85%',
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainButtonGradient: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  mainButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: theme.spacing.md,
  },

  // Features Section
  featuresSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  featureCard: {
    width: (width - (theme.spacing.lg * 2) - theme.spacing.md) / 2, // Fixed width calculation
  },
  featureCardTouchable: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    height: 160, // Fixed height for uniform cards
  },
  featureCardGradient: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  featureCardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Developer Section
  developerSection: {
    marginTop: theme.spacing.xl,
  },
  developerCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  developerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  developerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});