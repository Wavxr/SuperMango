import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Modern Design Theme
const theme = {
  colors: {
    primary: '#F59E0B',
    primaryLight: '#FCD34D',
    secondary: '#FF8F00',
    accent: '#10B981',
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
    severity: {
      Healthy: '#10B981',
      Mild: '#F59E0B',
      Moderate: '#F97316',
      Severe: '#EF4444',
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
              toValue: -25,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 2000,
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
                  scale: index === currentIndex ? 1.3 : 1,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function SummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [lang, setLang] = useState<'en' | 'tl'>('en');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  const {
    psi = '0',
    overallLabel = 'Unknown',
    humidity = '0',
    temperature = '0',
    wetness = '0',
    recommendation = '{}',
  } = params;

  const parsedRec = JSON.parse(recommendation as string);
  const severityColor = theme.colors.severity[overallLabel as keyof typeof theme.colors.severity] || theme.colors.text.secondary;

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
  }, []);

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
    
    setLang(lang === 'en' ? 'tl' : 'en');
  };

  const getWeatherRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return theme.colors.text.secondary;
    }
  };

  const getCombinedRiskColor = (severity: string, weatherRisk: string) => {
    // Priority: High weather risk > Severe severity > Medium weather risk > Moderate severity, etc.
    if (weatherRisk === 'High') return '#EF4444';
    if (severity === 'Severe') return '#EF4444';
    if (weatherRisk === 'Medium') return '#F97316';
    if (severity === 'Moderate') return '#F97316';
    if (weatherRisk === 'Low' || severity === 'Mild') return '#F59E0B';
    return '#10B981'; // Healthy + Low risk
  };

  const slides = [
    {
      id: 'severity',
      title: lang === 'en' ? 'Disease Severity' : 'Lala ng Sakit',
      emoji: '🩺',
      icon: 'medical',
      subtitle: lang === 'en' ? 'Current condition of your mango tree' : 'Lagay ngayon ng puno ng mangga mo',
      color: severityColor,
      details: {
        psi: parseFloat(psi as string),
        label: overallLabel,
      }
    },
    {
      id: 'weather',
      title: lang === 'en' ? 'Weather' : 'Panahon',
      emoji: '🌦️',
      icon: 'cloud',
      subtitle: lang === 'en' ? 'Weather conditions affecting your tree' : 'Kondisyon ng panahon na nakakaapekto sa puno',
      color: getWeatherRiskColor(parsedRec?.weather_risk),
      details: {
        humidity: parseFloat(humidity as string),
        temperature: parseFloat(temperature as string),
        wetness: parseFloat(wetness as string),
        risk: parsedRec?.weather_risk,
      }
    },
    {
      id: 'combined_risk',
      title: lang === 'en' ? 'Anthracnose Severity + Spread Risk' : 'Tindi ng Anthracnose + Lakas ng Pagkalat',
      emoji: '⚠️',
      icon: 'warning',
      subtitle: lang === 'en' ? 'Combined assessment of disease and spread potential' : 'Pinagsamang Tingin sa Sakit at Pagkalat',
      color: getCombinedRiskColor(overallLabel, parsedRec?.weather_risk),
      details: {
        severity: overallLabel,
        weatherRisk: parsedRec?.weather_risk,
        combined: `${overallLabel} + ${parsedRec?.weather_risk} Risk`,
      }
    },
    {
      id: 'action',
      title: lang === 'en' ? 'Recommended Action' : 'Inirerekomendang Aksyon',
      emoji: '💡',
      icon: 'bulb',
      subtitle: lang === 'en' ? 'What you need to do next' : 'Ano ang dapat ninyong gawin',
      color: theme.colors.accent,
      details: {
        action: lang === 'en' ? parsedRec?.action_label : parsedRec?.action_label_tagalog,
        severity: parsedRec?.severity_label,
      }
    },
    {
      id: 'summary',
      title: lang === 'en' ? 'Quick Summary' : 'Buod ng Resulta',
      emoji: '📋',
      icon: 'document-text',
      subtitle: lang === 'en' ? 'Ready to view detailed recommendations' : 'Handa na ang mga payo para sayo',
      color: theme.colors.primary,
      details: {
        ready: true,
      }
    },
  ];

  const renderSlideContent = (slide: any) => {
    switch (slide.id) {
      case 'severity':
        return (
          <View style={styles.slideDetails}>
            {/* PSI Progress Ring */}
            <View style={styles.progressRingContainer}>
              <View style={[styles.progressRing, { borderColor: slide.color + '20' }]}>
                <View style={[styles.progressRingInner, { backgroundColor: slide.color + '10' }]}>
                  <Text style={[styles.psiValue, { color: slide.color }]}>
                    {slide.details.psi.toFixed(1)}%
                  </Text>
                  <Text style={styles.psiLabel}>PSI</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.severityInfo}>
              <Text style={[styles.severityLevel, { color: slide.color }]}>
                {lang === 'en'
                  ? slide.details.label
                  : slide.details.label === 'Healthy'
                    ? 'Malusog ang Puno'
                    : slide.details.label === 'Mild'
                      ? 'Bahagya ang Lala'
                      : slide.details.label === 'Moderate'
                        ? 'Katamtaman ang Lala'
                        : 'Malala na ang Puno'}
              </Text>
              <Text style={styles.severityDescription}>
                {lang === 'en' 
                  ? 'Percent Severity Index measures the extent of disease on your mango leaves'
                  : 'Sinusukat ng PSI kung gaano kalala ang sakit sa mga dahon ng mangga mo'
                }
              </Text>
            </View>
          </View>
        );

      case 'weather':
        return (
          <View style={styles.slideDetails}>
            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <LinearGradient
                  colors={['#F59E0B15', '#F59E0B10']}
                  style={styles.weatherIconContainer}
                >
                  <Ionicons name="thermometer" size={24} color="#F59E0B" />
                </LinearGradient>
                <Text style={styles.weatherValue}>{slide.details.temperature.toFixed(1)}°C</Text>
                <Text style={styles.weatherLabel}>
                  {lang === 'en' ? 'Temperature' : 'Temperatura'}
                </Text>
              </View>

              <View style={styles.weatherItem}>
                <LinearGradient
                  colors={['#06B6D415', '#06B6D410']}
                  style={styles.weatherIconContainer}
                >
                  <Ionicons name="water" size={24} color="#06B6D4" />
                </LinearGradient>
                <Text style={styles.weatherValue}>{slide.details.humidity.toFixed(0)}%</Text>
                <Text style={styles.weatherLabel}>
                  {lang === 'en' ? 'Humidity' : 'Halumigmig'}
                </Text>
              </View>

              <View style={styles.weatherItem}>
                <LinearGradient
                  colors={['#10B98115', '#10B98110']}
                  style={styles.weatherIconContainer}
                >
                  <Ionicons name="rainy" size={24} color="#10B981" />
                </LinearGradient>
                <Text style={styles.weatherValue}>{slide.details.wetness.toFixed(1)}mm</Text>
                <Text style={styles.weatherLabel}>
                  {lang === 'en' ? 'Rainfall' : 'Ulan'}
                </Text>
              </View>
            </View>

            <View style={[styles.riskBadge, { backgroundColor: slide.color + '15' }]}>
              <Text style={[styles.riskText, { color: slide.color }]}>
                {lang === 'en'
                  ? `${slide.details.risk} Weather Risk`
                  : `${slide.details.risk === 'Low' ? 'Mahina' : slide.details.risk === 'Medium' ? 'Katamtaman' : 'Malala'} na Banta ng Panahon`}
              </Text>
            </View>
          </View>
        );

      case 'combined_risk':
        return (
          <View style={styles.slideDetails}>
            <View style={styles.combinedRiskContainer}>
              {/* Severity Section */}
              <View style={styles.riskSection}>
                <View style={[styles.riskIconContainer, { backgroundColor: severityColor + '15' }]}>
                  <Ionicons name="medical" size={28} color={severityColor} />
                </View>
                <Text style={styles.riskSectionTitle}>
                  {lang === 'en' ? 'Disease Severity' : 'Lala ng Sakit'}
                </Text>
                <Text style={[styles.riskSectionValue, { color: severityColor }]}>
                  {lang === 'en'
                    ? slide.details.severity
                    : slide.details.severity === 'Healthy'
                      ? 'Malusog'
                      : slide.details.severity === 'Mild'
                        ? 'Bahagya'
                        : slide.details.severity === 'Moderate'
                          ? 'Katamtaman'
                          : 'Malala'}
                </Text>

              </View>

              {/* Plus Icon */}
              <View style={styles.plusContainer}>
                <Text style={styles.plusIcon}>+</Text>
              </View>

              {/* Weather Risk Section */}
              <View style={styles.riskSection}>
                <View style={[styles.riskIconContainer, { backgroundColor: getWeatherRiskColor(slide.details.weatherRisk) + '15' }]}>
                  <Ionicons name="cloud-outline" size={28} color={getWeatherRiskColor(slide.details.weatherRisk)} />
                </View>
                <Text style={styles.riskSectionTitle}>
                  {lang === 'en' ? 'Spread Risk' : 'Lakas ng Pagkalat'}
                </Text>
                <Text style={[styles.riskSectionValue, { color: getWeatherRiskColor(slide.details.weatherRisk) }]}>
                  {lang === 'en'
                    ? slide.details.weatherRisk
                    : slide.details.weatherRisk === 'Low'
                      ? 'Mahina'
                      : slide.details.weatherRisk === 'Medium'
                        ? 'Katamtaman'
                        : 'Malala'}
                </Text>
              </View>
            </View>

            {/* Combined Result */}
            <View style={[styles.combinedResultBadge, { backgroundColor: slide.color + '15' }]}>
              <Ionicons name="analytics" size={24} color={slide.color} />
              <Text style={[styles.combinedResultText, { color: slide.color }]}>
                {lang === 'en'
                  ? slide.details.combined
                  : `${slide.details.severity === 'Healthy'
                      ? 'Malusog'
                      : slide.details.severity === 'Mild'
                        ? 'Bahagya'
                        : slide.details.severity === 'Moderate'
                          ? 'Katamtaman'
                          : 'Malala'} + ${
                      slide.details.weatherRisk === 'Low'
                        ? 'Mahina'
                        : slide.details.weatherRisk === 'Medium'
                          ? 'Katamtaman'
                          : 'Malala'}`
                }
              </Text>

            </View>

            <Text style={styles.combinedDescription}>
              {lang === 'en' 
                ? 'This combination determines the urgency and type of treatment needed for your mango tree.'
                : 'Itong kombinasyon ang nagsasabi kung gaano kaagad at anong lunas ang bagay sa puno ng mangga mo.'
              }
            </Text>
          </View>
        );

      case 'action':
        return (
          <View style={styles.slideDetails}>
            <View style={[styles.actionBadge, { backgroundColor: slide.color + '15' }]}>
              <Ionicons name="checkmark-circle" size={32} color={slide.color} />
              <Text style={[styles.actionText, { color: slide.color }]}>
                {slide.details.action}
              </Text>
            </View>
            
            <Text style={styles.actionDescription}>
              {lang === 'en' 
                ? 'Based on the analysis, this is the recommended course of action for your mango tree.'
                : 'Ayon sa pagsusuri, ito ang dapat gawin para sa puno ng mangga mo.'
              }
            </Text>
          </View>
        );

      case 'summary':
        return (
          <View style={styles.slideDetails}>
            <View style={styles.summaryGrid}>
              {/* Severity */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {lang === 'en' ? 'Severity' : 'Gaano Kalala'}
                </Text>
                <Text style={[styles.summaryValue, { color: severityColor }]}>
                  {lang === 'en'
                    ? overallLabel
                    : overallLabel === 'Healthy'
                      ? 'Malusog ang Puno'
                      : overallLabel === 'Mild'
                        ? 'Bahagya ang Lala'
                        : overallLabel === 'Moderate'
                          ? 'Katamtaman ang Lala'
                          : 'Malala na ang Puno'}
                </Text>
              </View>

              {/* Spread Risk */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {lang === 'en' ? 'Spread Risk' : 'Lakas ng Pagkalat'}
                </Text>
                <Text style={[styles.summaryValue, { color: getWeatherRiskColor(parsedRec?.weather_risk) }]}>
                  {lang === 'en'
                    ? parsedRec?.weather_risk
                    : parsedRec?.weather_risk === 'Low'
                      ? 'Mahina'
                      : parsedRec?.weather_risk === 'Medium'
                        ? 'Katamtaman'
                        : 'Malala'}
                </Text>
              </View>

              {/* Action */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {lang === 'en' ? 'Action' : 'Aksyon'}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.accent }]}>
                  {lang === 'en' ? parsedRec?.action_label : parsedRec?.action_label_tagalog}
                </Text>
              </View>
            </View>

            {/* Analysis Complete Indicator */}
            <View style={styles.readyIndicator}>
              <Ionicons name="checkmark-done-circle" size={48} color={theme.colors.accent} />
              <Text style={styles.readyText}>
                {lang === 'en' ? 'Analysis Complete!' : 'Tapos na ang Pagsusuri!'}
              </Text>
            </View>
          </View>
        );


      default:
        return null;
    }
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
        <FloatingParticle delay={1500} emoji="🍃" left="85%" top="20%" />
        <FloatingParticle delay={3000} emoji="🌿" left="15%" top="75%" />
        <FloatingParticle delay={4500} emoji="✨" left="80%" top="70%" />
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
        <Text style={styles.headerTitle}>📊 Analysis Summary</Text>
        <Text style={styles.headerSubtitle}>
          {lang === 'en' 
            ? 'Review your mango tree health analysis' 
            : 'Alamin ang kalagayan ng puno mo'
          }
        </Text>
        
        {/* Language Toggle */}
        <TouchableOpacity onPress={handleLanguageToggle} style={styles.langToggle}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.langToggleGradient}
          >
            <Text style={styles.langToggleText}>
              {lang === 'en' ? '🇵🇭 Tagalog' : '🇺🇸 English'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Progress Dots */}
      <Animated.View 
        style={[
          styles.progressContainer,
          { opacity: fadeAnim }
        ]}
      >
        <ProgressDots currentIndex={activeIndex} total={slides.length} />
      </Animated.View>

      {/* Slides */}
      <Animated.View 
        style={[
          styles.carouselContainer,
          { opacity: fadeAnim }
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slideContainer}>
              <View style={styles.card}>
                <LinearGradient
                  colors={['#FFFFFF', '#FEFEFE']}
                  style={styles.cardGradient}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: slide.color + '15' }]}>
                      <Text style={styles.emoji}>{slide.emoji}</Text>
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.cardTitle}>{slide.title}</Text>
                      <Text style={styles.cardSubtitle}>{slide.subtitle}</Text>
                    </View>
                  </View>

                  {/* Slide-specific Content */}
                  {renderSlideContent(slide)}
                </LinearGradient>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            paddingBottom: insets.bottom + 80,
            transform: [{ scale: buttonScale }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() =>
            router.push({
              pathname: '/result',
              params,
            })
          }
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>
              {lang === 'en' ? 'View Detailed Results' : 'Tingnan ang Buong Resulta'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
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
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: theme.spacing.md,
  },
  langToggle: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  langToggleGradient: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  langToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    minHeight: height * 0.5,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.text.light,
    fontWeight: '500',
  },

  // Slide Details
  slideDetails: {
    flex: 1,
    justifyContent: 'center',
  },

  // Severity Slide
  progressRingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  psiValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  psiLabel: {
    fontSize: 12,
    color: theme.colors.text.light,
    fontWeight: '600',
  },
  severityInfo: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  severityLevel: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  severityDescription: {
    fontSize: 14,
    color: theme.colors.text.light,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Weather Slide
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  weatherItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  weatherLabel: {
    fontSize: 12,
    color: theme.colors.text.light,
    fontWeight: '500',
  },
  riskBadge: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  riskText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Combined Risk Slide
  combinedRiskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  riskSection: {
    flex: 1,
    alignItems: 'center',
  },
  riskIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  riskSectionTitle: {
    fontSize: 13,
    color: theme.colors.text.light,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  riskSectionValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  plusContainer: {
    marginHorizontal: theme.spacing.md,
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.light,
  },
  combinedResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  combinedResultText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
    textAlign: 'center',
  },
  combinedDescription: {
    fontSize: 14,
    color: theme.colors.text.light,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.sm,
  },

  // Action Slide
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
    textAlign: 'center',
    flex: 1,
  },
  actionDescription: {
    fontSize: 14,
    color: theme.colors.text.light,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },

  // Summary Slide
  summaryGrid: {
    marginBottom: theme.spacing.xl,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary + '20',
  },
  summaryLabel: {
    fontSize: 15,
    color: theme.colors.text.light,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  readyIndicator: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.accent,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },

  // Continue Button
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  continueButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: theme.spacing.sm,
  },
});