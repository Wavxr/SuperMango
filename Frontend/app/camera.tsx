"use client"

import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet as RNStyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Image,
} from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

/* ------------------------------------------------------------------- */
/* constants                                                           */
/* ------------------------------------------------------------------- */

const NGROK_ENDPOINT = "https://gopher-loved-largely.ngrok-free.app/getPrescription"
const MAX_PHOTOS = 10
const OPEN_WEATHER_API_KEY = process.env.EXPO_PUBLIC_OWM_KEY ?? ""

const { width, height } = Dimensions.get("window")

async function fetchWithFallback(formData: FormData) {
  return fetch(NGROK_ENDPOINT, { method: "POST", body: formData })
}

/* ------------------------------------------------------------------- */
/* Preview Modal Component                                             */
/* ------------------------------------------------------------------- */

function PreviewModal({
  visible,
  images,
  onClose,
  onProceed,
  onRemoveImage,
  language = "en",
  onToggleLanguage,
}: {
  visible: boolean
  images: string[]
  onClose: () => void
  onProceed: () => void
  onRemoveImage: (index: number) => void
  language?: "en" | "tl"
  onToggleLanguage: () => void
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const isComplete = images.length === MAX_PHOTOS
  const remaining = MAX_PHOTOS - images.length

  const content = {
    en: {
      title: "Review Your Photos",
      subtitle: isComplete
        ? `${images.length} photos ready for analysis`
        : `${images.length} photos captured • ${remaining} more needed`,
      description: "Make sure all photos clearly show mango leaves. Tap any photo to remove it.",
      proceedButton: "Looks good, proceed",
      backButton: isComplete ? "Add/Remove Photos" : `Add ${remaining} More Photos`,
      needMoreText: `You need ${remaining} more photo${remaining === 1 ? "" : "s"} to proceed with analysis.`,
    },
    tl: {
      title: "Suriin ang mga Larawan",
      subtitle: isComplete
        ? `${images.length} larawan na handa para sa pagsusuri`
        : `${images.length} larawan na nakuha • ${remaining} pa ang kailangan`,
      description:
        "Siguraduhing lahat ng larawan ay malinaw na nagpapakita ng dahon ng mangga. I-tap ang kahit anong larawan para tanggalin.",
      proceedButton: "Mukhang ayos, magpatuloy",
      backButton: isComplete ? "Magdagdag/Magtanggal ng Larawan" : `Magdagdag ng ${remaining} Pang Larawan`,
      needMoreText: `Kailangan mo ng ${remaining} pang larawan para makapag-proceed sa analysis.`,
    },
  }

  const currentContent = content[language]

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            styles.previewContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#FFFFFF", "#FEFEFE"]} style={styles.previewGradient}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>

              {/* Translation Button */}
              <TouchableOpacity style={styles.translateButton} onPress={onToggleLanguage} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#F59E0B", "#FCD34D"]}
                  style={styles.translateButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="language" size={16} color="#FFFFFF" />
                  <Text style={styles.translateButtonText}>{language === "en" ? "TL" : "EN"}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.previewHeaderContent}>
                <View style={styles.previewIconContainer}>
                  <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.previewIconGradient}>
                    <Ionicons name="images" size={28} color="#F59E0B" />
                  </LinearGradient>
                </View>
                <Text style={styles.previewTitle}>{currentContent.title}</Text>
                <Text style={[styles.previewSubtitle, { color: isComplete ? "#10B981" : "#F59E0B" }]}>
                  {currentContent.subtitle}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.previewDescription}>
              <View style={styles.previewDescIcon}>
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.previewDescText}>{currentContent.description}</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressIndicator}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(images.length / MAX_PHOTOS) * 100}%`,
                      backgroundColor: isComplete ? "#10B981" : "#F59E0B",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {images.length}/{MAX_PHOTOS} photos
              </Text>
            </View>

            {/* Need More Photos Warning */}
            {!isComplete && (
              <View style={styles.warningContainer}>
                <View style={styles.warningIcon}>
                  <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.warningText}>{currentContent.needMoreText}</Text>
              </View>
            )}

            {/* Photo Grid */}
            <ScrollView style={styles.photoGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.photoContainer}>
                {images.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onPress={() => onRemoveImage(index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri }} style={styles.photoImage} />
                    <View style={styles.photoOverlay}>
                      <View style={styles.removeButton}>
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                      </View>
                      <Text style={styles.photoNumber}>{index + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Empty slots */}
                {Array.from({ length: remaining }, (_, index) => (
                  <View key={`empty-${index}`} style={styles.emptySlot}>
                    <View style={styles.emptySlotContent}>
                      <Ionicons name="add" size={24} color="#D1D5DB" />
                      <Text style={styles.emptySlotText}>{images.length + index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.previewButtons}>
              {/* Back/Add More Button */}
              <TouchableOpacity style={[styles.previewButton, styles.backButton]} onPress={onClose} activeOpacity={0.8}>
                <LinearGradient
                  colors={isComplete ? ["#6366F1", "#8B5CF6"] : ["#F59E0B", "#FCD34D"]}
                  style={styles.previewButtonGradient}
                >
                  <Ionicons name={isComplete ? "camera" : "add"} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.previewButtonText}>{currentContent.backButton}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Proceed Button - Only show if complete */}
              {isComplete && (
                <TouchableOpacity
                  style={[styles.previewButton, styles.proceedButton]}
                  onPress={onProceed}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#10B981", "#34D399"]} style={styles.previewButtonGradient}>
                    <Text style={styles.previewButtonText}>{currentContent.proceedButton}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

/* ------------------------------------------------------------------- */
/* Verification Modal Component                                        */
/* ------------------------------------------------------------------- */

function VerificationModal({
  visible,
  onSubmit,
  onVerifyFirst,
  onClose,
  language = "en",
  onToggleLanguage,
}: {
  visible: boolean
  onSubmit: () => void
  onVerifyFirst: () => void
  onClose: () => void
  language?: "en" | "tl"
  onToggleLanguage: () => void
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.3)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const content = {
    en: {
      title: "Verify Photos First?",
      message: "Are you sure all the leaves you submitted are Sweet Elena mango leaves?",
      description:
        "If you're not completely sure, you can run a quick check to help confirm your photos show the right type of leaves.",
      yesButton: "Yes, I'm sure - No need to Verify",
      noButton: "Run verification test first",
    },
    tl: {
      title: "I-verify Muna ang mga Larawan?",
      message: "Sigurado ka ba na lahat ng dahon na inyong ipinasa ay dahon ng Sweet Elena mango?",
      description:
        "Kung hindi ka sigurado, maaari kang mag-run ng mabilis na check para ma-confirm na tama ang uri ng dahon sa mga larawan mo.",
      yesButton: "Oo, sigurado ako — i-submit na",
      noButton: "I-run muna ang verification test",
    },
  }

  const currentContent = content[language]

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            styles.verificationContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#FFFFFF", "#FEFEFE"]} style={styles.verificationGradient}>
            {/* Close Button */}
            <TouchableOpacity style={styles.verificationCloseButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Translation Button */}
            <TouchableOpacity style={styles.verificationTranslateButton} onPress={onToggleLanguage} activeOpacity={0.8}>
              <LinearGradient
                colors={["#F59E0B", "#FCD34D"]}
                style={styles.translateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="language" size={16} color="#FFFFFF" />
                <Text style={styles.translateButtonText}>{language === "en" ? "TL" : "EN"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Header with Icon */}
            <View style={styles.verificationHeader}>
              <View style={styles.verificationIconContainer}>
                <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.verificationIconGradient}>
                  <Ionicons name="checkmark-circle" size={32} color="#F59E0B" />
                </LinearGradient>
              </View>
              <Text style={styles.verificationTitle}>{currentContent.title}</Text>
            </View>

            {/* Content */}
            <View style={styles.verificationContent}>
              <Text style={styles.verificationMessage}>{currentContent.message}</Text>

              <View style={styles.verificationDescription}>
                <View style={styles.verificationDescIcon}>
                  <Ionicons name="information-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.verificationDescText}>{currentContent.description}</Text>
              </View>

              {/* Visual indicators */}
              <View style={styles.verificationOptions}>
                <View style={styles.optionItem}>
                  <Text style={styles.optionEmoji}>🚀</Text>
                  <Text style={styles.optionText}>
                    {language === "en" ? "Direct submission" : "Direktang pag-submit"}
                  </Text>
                </View>
                <View style={styles.optionItem}>
                  <Text style={styles.optionEmoji}>🔍</Text>
                  <Text style={styles.optionText}>{language === "en" ? "Verify first" : "I-verify muna"}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.verificationButtons}>
              {/* Yes, Submit Button */}
              <TouchableOpacity
                style={[styles.verificationButton, styles.submitButton]}
                onPress={onSubmit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#10B981", "#34D399"]}
                  style={styles.verificationButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="rocket" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.verificationButtonText}>{currentContent.yesButton}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* No, Verify First Button */}
              <TouchableOpacity
                style={[styles.verificationButton, styles.verifyButton]}
                onPress={onVerifyFirst}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#F59E0B", "#FCD34D"]}
                  style={styles.verificationButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.verificationButtonText}>{currentContent.noButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

/* ------------------------------------------------------------------- */
/* Modern Alert Modal Component                                        */
/* ------------------------------------------------------------------- */

function ModernAlertModal({
  visible,
  onClose,
  language = "en",
}: {
  visible: boolean
  onClose: () => void
  language?: "en" | "tl"
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.3)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const content = {
    en: {
      title: "Unclear Photos Detected",
      message:
        "One or more photos were not recognized as mango leaves. Please ensure all photos clearly show the leaf against a proper background.",
      instruction: "Refer to the scanning instructions before trying again.",
      buttonText: "Got it",
    },
    tl: {
      title: "Hindi Malinaw na Larawan",
      message:
        "Hindi nakilala ang isa o higit pang larawan bilang dahon ng mangga. Siguraduhing malinaw na nakikita ang dahon sa tamang background.",
      instruction: "Basahin muna ang mga tagubilin sa pag-scan bago subukan ulit.",
      buttonText: "Naintindihan",
    },
  }

  const currentContent = content[language]

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#FFFFFF", "#FEFEFE"]} style={styles.modalGradient}>
            {/* Header with Icon */}
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.iconGradient}>
                  <Ionicons name="warning" size={32} color="#F59E0B" />
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>{currentContent.title}</Text>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{currentContent.message}</Text>

              <View style={styles.instructionContainer}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="information-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.instructionText}>{currentContent.instruction}</Text>
              </View>

              {/* Visual Guide */}
              <View style={styles.visualGuide}>
                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>✅</Text>
                  <Text style={styles.guideText}>{language === "en" ? "Clear leaf photo" : "Malinaw na dahon"}</Text>
                </View>
                <View style={styles.guideItem}>
                  <Text style={styles.guideEmoji}>❌</Text>
                  <Text style={styles.guideText}>
                    {language === "en" ? "Blurry or unclear" : "Malabo o hindi malinaw"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.modalButton} onPress={onClose} activeOpacity={0.8}>
              <LinearGradient
                colors={["#F59E0B", "#FCD34D"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>{currentContent.buttonText}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

/* ------------------------------------------------------------------- */
/* Enhanced Loading Component with Mango Theme                        */
/* ------------------------------------------------------------------- */

function ModernLoadingScreen({ visible, progress }: { visible: boolean; progress: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.3)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  // Individual particle animations
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0.7),
      scale: new Animated.Value(1),
    })),
  ).current

  useEffect(() => {
    if (visible) {
      // Smooth entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      // Smooth continuous rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      )
      rotateAnimation.start()

      // Gentle pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      )
      pulseAnimation.start()

      // Mango bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      )
      bounceAnimation.start()

      // Staggered particle animations
      const particleAnimations = particleAnims.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: -30 - Math.random() * 20,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0.5,
                duration: 1500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.8,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ]),
        )
      })

      particleAnimations.forEach((anim) => anim.start())

      return () => {
        rotateAnimation.stop()
        pulseAnimation.stop()
        bounceAnimation.stop()
        particleAnimations.forEach((anim) => anim.stop())
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  })

  if (!visible) return null

  const getLoadingText = () => {
    if (progress < 0.2) return "Capturing location..."
    if (progress < 0.4) return "Fetching weather data..."
    if (progress < 0.7) return "Uploading images..."
    if (progress < 0.9) return "Analyzing leaf health..."
    return "Generating results..."
  }

  const getMangoEmoji = () => {
    if (progress < 0.2) return "🌍"
    if (progress < 0.4) return "🌤️"
    if (progress < 0.7) return "📤"
    if (progress < 0.9) return "🔬"
    return "✨"
  }

  return (
    <Animated.View
      style={[
        styles.loadingOverlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(250, 210, 97, 0.95)", // warm soft yellow
          "rgba(234, 179, 8, 0.95)", // amber yellow (similar to #EAB308)
          "rgba(181, 159, 0, 0.95)", // darker golden yellow
        ]}
        style={styles.loadingGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContent}>
          {/* Central Mango Animation */}
          <View style={styles.loadingAnimation}>
            {/* Rotating outer ring */}
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ rotate: spin }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.ringGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Inner rotating ring */}
            <Animated.View
              style={[
                styles.innerRing,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]}
                style={styles.ringGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Central Mango */}
            <Animated.View
              style={[
                styles.centerMango,
                {
                  transform: [
                    { translateY: bounceTranslate },
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.mangoEmoji}>🥭</Text>
            </Animated.View>

            {/* Status emoji */}
            <Animated.View
              style={[
                styles.statusEmoji,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.statusEmojiText}>{getMangoEmoji()}</Text>
            </Animated.View>
          </View>

          {/* Enhanced Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              >
                <LinearGradient
                  colors={["#4CAF50", "#8BC34A", "#CDDC39"]}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>

          {/* Loading text */}
          <Text style={styles.loadingTitle}>🥭 Analyzing Mango Leaves</Text>
          <Text style={styles.loadingSubtitle}>{getLoadingText()}</Text>

          {/* Enhanced floating mango particles */}
          <View style={styles.particlesContainer}>
            {particleAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: `${10 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    transform: [{ translateY: anim.translateY }, { scale: anim.scale }],
                    opacity: anim.opacity,
                  },
                ]}
              >
                <Text style={styles.particleEmoji}>
                  {i % 4 === 0 ? "🥭" : i % 4 === 1 ? "🍃" : i % 4 === 2 ? "🌿" : "✨"}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* Decorative leaves */}
          <View style={styles.decorativeElements}>
            <Animated.View
              style={[
                styles.leafLeft,
                {
                  transform: [
                    { rotate: spin },
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.leafEmoji}>🍃</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.leafRight,
                {
                  transform: [
                    { rotate: spin },
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.leafEmoji}>🌿</Text>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

/* ------------------------------------------------------------------- */
/* Main Component                                                      */
/* ------------------------------------------------------------------- */

export default function CameraScreen() {
  const [cameraKey, setCameraKey] = useState(Math.random())
  const cameraRef = useRef<any>(null)
  const [facing] = useState<CameraType>("back")

  const [camPerm, requestCamPerm] = useCameraPermissions()
  const [mediaPerm, setMediaPerm] = useState<ImagePicker.PermissionStatus | null>(null)

  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [language, setLanguage] = useState<"en" | "tl">("en")
  const router = useRouter()

  const haveTen = images.length === MAX_PHOTOS
  const hasImages = images.length > 0

  useFocusEffect(useCallback(() => setCameraKey(Math.random()), []))

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "tl" : "en"))
  }

  const handleCapture = async () => {
    if (!cameraRef.current || haveTen) return
    try {
      const { uri } = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      })
      setImages((prev) => [...prev, uri].slice(0, MAX_PHOTOS))
    } catch (err) {
      console.error("❌ Capture error:", err)
    }
  }

  const handlePick = async () => {
    if (haveTen) return

    if (!mediaPerm) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      setMediaPerm(status)
      if (status !== "granted") {
        Alert.alert("Permission needed", "Media-library permission is required to upload photos.")
        return
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - images.length,
        quality: 0.7,
      })

      if (!result.canceled) {
        const uris = result.assets.map((a) => a.uri)
        setImages((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS))
      }
    } catch (err) {
      console.error("❌ Image-picker error:", err)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearAllPhotos = () => {
    Alert.alert("Clear All Photos", "Are you sure you want to remove all captured photos?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => setImages([]),
      },
    ])
  }

  const handleSubmitClick = () => {
    if (!haveTen) {
      Alert.alert(`Need ${MAX_PHOTOS} photos`, "Please add more images.")
      return
    }
    setShowPreviewModal(true)
  }

  const handlePreviewProceed = () => {
    setShowPreviewModal(false)
    setShowVerificationModal(true)
  }

  const handleDirectSubmit = () => {
    setShowVerificationModal(false)
    performSubmission(false) // verify_first = false
  }

  const handleVerifyFirst = () => {
    setShowVerificationModal(false)
    performSubmission(true) // verify_first = true
  }

  const handleCloseVerification = () => {
    setShowVerificationModal(false)
  }

  const performSubmission = async (verifyFirst: boolean) => {
    setLoading(true)
    setLoadingProgress(0)

    try {
      // Step 1: Location (20%)
      setLoadingProgress(0.1)
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync()
      if (locStatus !== "granted") throw new Error("Location permission denied")

      setLoadingProgress(0.2)
      const { coords } = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = coords

      // Step 2: Weather (40%)
      setLoadingProgress(0.3)
      let humidity = 0,
        temperature = 0,
        wetness = 0

      try {
        if (!OPEN_WEATHER_API_KEY) throw new Error("OWM key not set")
        const owmUrl =
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}` +
          `&units=metric&appid=${OPEN_WEATHER_API_KEY}`

        const owmRes = await fetch(owmUrl)
        if (!owmRes.ok) throw new Error(`OWM HTTP ${owmRes.status}`)

        const wx = await owmRes.json()
        humidity = wx.main?.humidity ?? 0
        temperature = wx.main?.temp ?? 0
        wetness = ((wx.rain?.["3h"] ?? 0) as number).toFixed(2)
      } catch (owmErr) {
        console.warn("⚠️  OWM failed – switching to Open-Meteo →", owmErr)

        const omUrl =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`

        const omRes = await fetch(omUrl)
        if (!omRes.ok) throw new Error(`Open-Meteo HTTP ${omRes.status}`)

        const om = await omRes.json()
        humidity = om.current?.relative_humidity_2m ?? 0
        temperature = om.current?.temperature_2m ?? 0
        wetness = Number(om.current?.precipitation ?? 0).toFixed(2)
      }

      setLoadingProgress(0.4)

      // Step 3: Prepare FormData (60%)
      setLoadingProgress(0.5)
      const fd = new FormData()
      images.forEach((uri, i) => {
        const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg"
        const mime = ext.toLowerCase() === "jpg" ? "image/jpeg" : `image/${ext}`
        fd.append("files", { uri, name: `leaf_${i}.${ext}`, type: mime } as any)
      })

      fd.append("humidity", String(humidity))
      fd.append("temperature", String(temperature))
      fd.append("wetness", String(wetness))
      fd.append("lat", String(latitude))
      fd.append("lon", String(longitude))
      fd.append("verify_first", String(verifyFirst)) // Add verification flag

      setLoadingProgress(0.6)

      // Step 4: Upload and analyze (90%)
      setLoadingProgress(0.7)
      const res = await fetchWithFallback(fd)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setLoadingProgress(0.9)

      //check if res is right response
      let data: any
      try {
        data = await res.json()

        if (typeof data === "string") {
          setShowAlertModal(true)
          return
        }

        if (!data?.overall_label || !data?.recommendation) {
          Alert.alert("Error", "Something went wrong. Please try again.")
          return
        }
      } catch {
        Alert.alert("Error", "Something went wrong. Please try again.")
        return
      }

      // Step 5: Complete (100%)
      setLoadingProgress(1)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Use replace instead of push to avoid navigation issues
      router.replace({
        pathname: "/summary",
        params: {
          psi: String(data.percent_severity_index),
          overallLabel: data.overall_label,
          humidity: String(data.weather.humidity),
          temperature: String(data.weather.temperature),
          wetness: String(data.weather.wetness),
          recommendation: JSON.stringify(data.recommendation),
        },
      })

      setImages([])
      setCameraKey(Math.random())
    } catch (err) {
      console.error("❌ Submission failed:", err)
      Alert.alert("Upload error", String(err))
    } finally {
      setLoading(false)
      setLoadingProgress(0)
    }
  }

  if (!camPerm) return <View />
  if (!camPerm.granted) {
    return (
      <PermissionView
        title="Camera Access"
        message="Camera permission is required to scan mango leaves for Anthracnose detection."
        onPress={requestCamPerm}
      />
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView key={cameraKey} style={RNStyleSheet.absoluteFill} facing={facing} ref={cameraRef} photo />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{`Photos: ${images.length}/${MAX_PHOTOS}`}</Text>
          {hasImages && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAllPhotos} activeOpacity={0.8}>
              <LinearGradient colors={["#EF4444", "#F87171"]} style={styles.clearButtonGradient}>
                <Ionicons name="trash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {haveTen ? (
            <MainButton onPress={handleSubmitClick} loading={loading} label="Review & Submit" />
          ) : (
            <>
              <MainButton onPress={handleCapture} loading={loading} icon />
              <MainButton onPress={handlePick} loading={loading} label="Upload Photo(s)" />
              {hasImages && (
                <MainButton
                  onPress={() => setShowPreviewModal(true)}
                  loading={loading}
                  label={`Preview (${images.length})`}
                  secondary
                />
              )}
            </>
          )}
        </View>
      </View>

      <ModernLoadingScreen visible={loading} progress={loadingProgress} />

      <ModernAlertModal visible={showAlertModal} onClose={() => setShowAlertModal(false)} language={language} />

      <PreviewModal
        visible={showPreviewModal}
        images={images}
        onClose={() => setShowPreviewModal(false)}
        onProceed={handlePreviewProceed}
        onRemoveImage={handleRemoveImage}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      <VerificationModal
        visible={showVerificationModal}
        onSubmit={handleDirectSubmit}
        onVerifyFirst={handleVerifyFirst}
        onClose={handleCloseVerification}
        language={language}
        onToggleLanguage={toggleLanguage}
      />
    </View>
  )
}

/* --------------------------- Sub-components ------------------------- */

function MainButton({
  onPress,
  loading,
  label,
  icon,
  secondary,
}: {
  onPress: () => void
  loading: boolean
  label?: string
  icon?: boolean
  secondary?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.captureButton, secondary && styles.secondaryButton]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : icon ? (
        <View style={styles.captureInner} />
      ) : (
        <Text
          style={{
            color: secondary ? "#F59E0B" : "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

function PermissionView({
  title,
  message,
  onPress,
}: {
  title: string
  message: string
  onPress: () => void
}) {
  return (
    <View style={styles.permissionContainer}>
      <LinearGradient colors={["#fff9c4", "#fff176", "#ffeb3b"]} style={styles.permissionGradient}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionMessage}>{message}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={onPress}>
          <LinearGradient colors={["#fbc02d", "#f9a825"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

/* ------------------------------- Styles ----------------------------- */

const styles = RNStyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: { alignItems: "center", paddingBottom: 100 },
  captureButton: {
    width: 150,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryButton: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.5)",
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fbc02d",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // Translation Button Styles
  translateButton: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verificationTranslateButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  translateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  translateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Preview Modal Styles
  previewContainer: {
    width: width * 0.95,
    height: height * 0.85,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  previewGradient: {
    flex: 1,
    padding: 20,
  },
  previewHeader: {
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewHeaderContent: {
    alignItems: "center",
    paddingTop: 10,
  },
  previewIconContainer: {
    marginBottom: 12,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewIconGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400E",
    textAlign: "center",
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  previewDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewDescIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  previewDescText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
    fontWeight: "500",
  },
  progressIndicator: {
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
  },
  photoGrid: {
    flex: 1,
    marginBottom: 16,
  },
  photoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  photoItem: {
    width: (width * 0.95 - 60) / 3,
    height: (width * 0.95 - 60) / 3,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 8,
    flexDirection: "row",
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptySlot: {
    width: (width * 0.95 - 60) / 3,
    height: (width * 0.95 - 60) / 3,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  emptySlotContent: {
    alignItems: "center",
  },
  emptySlotText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 4,
  },
  previewButtons: {
    flexDirection: "row",
    gap: 12,
  },
  previewButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    shadowColor: "#6B7280",
  },
  proceedButton: {
    shadowColor: "#10B981",
  },
  previewButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Verification Modal Styles
  verificationContainer: {
    width: width * 0.9,
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  verificationGradient: {
    padding: 24,
  },
  verificationCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  verificationIconContainer: {
    marginBottom: 16,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verificationIconGradient: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#92400E",
    textAlign: "center",
  },
  verificationContent: {
    marginBottom: 24,
  },
  verificationMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  verificationDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  verificationDescIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  verificationDescText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    fontWeight: "500",
  },
  verificationOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionItem: {
    alignItems: "center",
    flex: 1,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  verificationButtons: {
    gap: 12,
  },
  verificationButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButton: {
    shadowColor: "#10B981",
  },
  verifyButton: {
    shadowColor: "#F59E0B",
  },
  verificationButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  verificationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Modern Alert Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#92400E",
    textAlign: "center",
  },
  modalContent: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    fontWeight: "500",
  },
  visualGuide: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  guideItem: {
    alignItems: "center",
    flex: 1,
  },
  guideEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  modalButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Enhanced Loading Screen Styles
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    width: width * 0.85,
  },
  loadingAnimation: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  outerRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
  },
  innerRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  ringGradient: {
    flex: 1,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 80,
  },
  centerMango: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  mangoEmoji: {
    fontSize: 48,
    textAlign: "center",
  },
  statusEmoji: {
    position: "absolute",
    top: -20,
    right: 10,
  },
  statusEmojiText: {
    fontSize: 24,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 35,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
  },
  particleEmoji: {
    fontSize: 20,
    textAlign: "center",
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  leafLeft: {
    position: "absolute",
    top: "20%",
    left: "10%",
  },
  leafRight: {
    position: "absolute",
    bottom: "25%",
    right: "15%",
  },
  leafEmoji: {
    fontSize: 28,
    opacity: 0.7,
  },

  // Permission Screen Styles
  permissionContainer: { flex: 1 },
  permissionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#795548",
    marginBottom: 20,
  },
  permissionMessage: {
    fontSize: 16,
    color: "#5d4037",
    textAlign: "center",
    marginBottom: 40,
  },
  permissionButton: {
    width: "80%",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
})
