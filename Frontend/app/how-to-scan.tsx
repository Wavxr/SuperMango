import { 
    View, 
    Text, 
    ScrollView, 
    Pressable, 
    Dimensions, 
    Animated, 
    StatusBar,
    StyleSheet 
  } from "react-native";
  import { useRouter } from "expo-router";
  import { useState, useRef, useEffect } from "react";
  import { LinearGradient } from "expo-linear-gradient";
  import { Ionicons } from "@expo/vector-icons";
  import { useSafeAreaInsets } from "react-native-safe-area-context";
  
  const { width, height } = Dimensions.get('window');
  
  const instructions = [
    {
      emoji: "📸",
      title: { en: "Clean Lens", tl: "Linisin ang Kamera" },
      description: {
        en: "Wipe your camera lens for a crystal clear photo.",
        tl: "Punasan ang lente ng camera para luminaw ang kuha.",
      },
    },
    {
      emoji: "🍃",
      title: { en: "One Leaf Only", tl: "Isang Dahon Lamang" },
      description: {
        en: "Show only one full leaf in the photo frame.",
        tl: "Isang buong dahon lang ang kuhanan ng litrato.",
      },
    },
    {
      emoji: "☀️",
      title: { en: "Good Lighting", tl: "Maliwanag na Ilaw" },
      description: {
        en: "Take photo during daylight, from above the leaf.",
        tl: "Kuhanan ng litrato sa maliwanag na lugar.",
      },
    },
  ];
  
  // Modern Design Theme
  const theme = {
    colors: {
      primary: '#F59E0B',
      primaryLight: '#FCD34D',
      secondary: '#FF8F00',
      background: {
        start: '#FFFBEB',
        middle: '#FEF3C7',
        end: '#FDE68A',
      },
      text: {
        primary: '#92400E',
        secondary: '#B45309',
        light: '#6B7280',
      },
      card: '#FFFFFF',
      shadow: 'rgba(245, 158, 11, 0.2)',
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
  
  // Floating Particle Component
  function FloatingParticle({ 
    delay, 
    emoji, 
    left, 
    top 
  }: { 
    delay: number; 
    emoji: string;
    left: string;
    top: string;
  }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0.6)).current;
  
    useEffect(() => {
      const animate = () => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: -20,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0.3,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: 0,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0.7,
                duration: 1500,
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
  
  // Progress Dots Component
  function ProgressDots({ currentIndex, total }: { currentIndex: number; total: number }) {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.primary + '30',
                transform: [
                  {
                    scale: index === currentIndex ? 1.2 : 1,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  }
  
  export default function HowToScan() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [lang, setLang] = useState<"en" | "tl">("en");
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const buttonScale = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    const scrollViewRef = useRef<ScrollView>(null);
  
    useEffect(() => {
      // Entrance animations
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
  
      // Continuous pulse animation for button
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
  
    const handleScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / width);
      setCurrentIndex(index);
    };
  
    const handleLanguageToggle = () => {
      // Add subtle animation when toggling language
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      setLang(lang === "en" ? "tl" : "en");
    };
  
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.start} />
        
        {/* Background Gradient */}
        <LinearGradient
          colors={[theme.colors.background.start, theme.colors.background.middle, theme.colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
  
        {/* Floating Particles */}
        <View style={styles.particlesContainer}>
          <FloatingParticle delay={0} emoji="🥭" left="10%" top="15%" />
          <FloatingParticle delay={1000} emoji="🍃" left="85%" top="20%" />
          <FloatingParticle delay={2000} emoji="🌿" left="15%" top="75%" />
          <FloatingParticle delay={3000} emoji="✨" left="80%" top="70%" />
        </View>
  
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📚 How to Scan</Text>
            <Text style={styles.headerSubtitle}>
              {lang === "en" 
                ? "Follow these steps for best results" 
                : "Sundin ang mga hakbang para sa magandang resulta"
              }
            </Text>
          </View>
        </Animated.View>
  
        {/* Progress Dots */}
        <Animated.View 
          style={[
            styles.progressContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <ProgressDots currentIndex={currentIndex} total={instructions.length} />
        </Animated.View>
  
        {/* Instruction Carousel */}
        <Animated.View 
          style={[
            styles.carouselContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {instructions.map((item, idx) => (
              <View key={idx} style={styles.slideContainer}>
                <View style={styles.card}>
                  <LinearGradient
                    colors={['#FFFFFF', '#FEFEFE']}
                    style={styles.cardGradient}
                  >
                    {/* Emoji Container */}
                    <View style={styles.emojiContainer}>
                      <LinearGradient
                        colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
                        style={styles.emojiBackground}
                      >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                      </LinearGradient>
                    </View>
  
                    {/* Content */}
                    <View style={styles.contentContainer}>
                      <Text style={styles.stepNumber}>
                        {lang === "en"
                          ? `Step ${idx + 1}`
                          : idx === 0
                            ? "Unang Hakbang"
                            : idx === 1
                              ? "Pangalawang Hakbang"
                              : "Ikatlong Hakbang"}
                      </Text>
                      <Text style={styles.title}>
                        {item.title[lang]}
                      </Text>
                      <Text style={styles.description}>
                        {item.description[lang]}
                      </Text>
                    </View>
  
                    {/* Language Toggle */}
                    <Pressable
                      onPress={handleLanguageToggle}
                      style={styles.langToggle}
                    >
                      <LinearGradient
                        colors={[theme.colors.primary + '15', theme.colors.primaryLight + '15']}
                        style={styles.langToggleGradient}
                      >
                        <Text style={styles.langToggleText}>
                          {lang === "en" ? "🇵🇭 Basahin sa Tagalog" : "🇺🇸 Read in English"}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </LinearGradient>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
  
        {/* Start Scanning Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            { 
              paddingBottom: insets.bottom + 80,
              transform: [{ scale: Animated.multiply(buttonScale, pulseAnim) }],
            }
          ]}
        >
          <Pressable
            onPress={() => router.push("/camera")}
            style={styles.startButton}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="scan" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                {lang === "en" ? "Start Scanning" : "Simulan ang Pag-scan"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    
    // Floating Particles
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
      fontSize: 20,
    },
  
    // Header
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    headerContent: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontWeight: '500',
    },
  
    // Progress Dots
    progressContainer: {
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
  
    // Carousel
    carouselContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    slideContainer: {
      width,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'center',
    },
    card: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    cardGradient: {
      padding: theme.spacing.xl,
      alignItems: 'center',
      minHeight: height * 0.5,
      justifyContent: 'center',
    },
  
    // Emoji
    emojiContainer: {
      marginBottom: theme.spacing.xl,
    },
    emojiBackground: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    emoji: {
      fontSize: 60,
    },
  
    // Content
    contentContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: 16,
      color: theme.colors.text.light,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: theme.spacing.md,
    },
  
    // Language Toggle
    langToggle: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    langToggleGradient: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      borderRadius: theme.borderRadius.xl,
    },
    langToggleText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
      textAlign: 'center',
    },
  
    // Start Button
    buttonContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    startButton: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    startButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      marginHorizontal: theme.spacing.md,
    },
  });