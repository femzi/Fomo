import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, Easing,
} from 'react-native';
import Svg, { Path, Circle, G, Rect, Polygon } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const { width: W, height: H } = Dimensions.get('window');

type Props = { onDone: () => void };

// ── ILLUSTRATIONS ────────────────────────────────────────

function FlameIllustration({ pulse }: { pulse: Animated.Value }) {
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* Glow ring */}
        <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
        <Svg width={140} height={180} viewBox="0 0 200 200">
          <Path
            d="M100 20 C 70 65, 45 90, 45 130 C 45 165, 68 185, 100 185 C 132 185, 155 165, 155 130 C 155 105, 140 88, 128 76 C 133 98, 120 112, 106 105 C 96 99, 98 84, 100 20 Z"
            fill="#CC2929"
          />
          <Path
            d="M100 112 C 88 128, 80 142, 80 156 C 80 172, 90 183, 100 183 C 110 183, 120 172, 120 156 C 120 145, 112 135, 106 128 C 108 140, 100 148, 95 142 C 90 137, 92 128, 100 112 Z"
            fill="#0A0A0A"
          />
        </Svg>
      </Animated.View>
      {/* Floating sparks */}
      {[{ x: -50, y: -20, delay: 0 }, { x: 55, y: -35, delay: 300 }, { x: -35, y: 20, delay: 150 }].map((s, i) => (
        <FloatingSpark key={i} x={s.x} y={s.y} delay={s.delay} />
      ))}
    </View>
  );
}

function FloatingSpark({ x, y, delay }: { x: number; y: number; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  return (
    <Animated.View style={[styles.spark, { left: W / 2 + x, top: H * 0.28 + y, transform: [{ translateY }], opacity }]}>
      <Text style={styles.sparkTxt}>✦</Text>
    </Animated.View>
  );
}

function ScoreIllustration() {
  const barAnim = useRef(new Animated.Value(0)).current;
  const numAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(barAnim, { toValue: 1, duration: 1200, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(numAnim, { toValue: 87, duration: 1400, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '87%'] });
  const numStr = numAnim.interpolate({ inputRange: [0, 87], outputRange: ['0', '87'] });

  return (
    <View style={{ alignItems: 'center', height: 200, justifyContent: 'center', gap: 16 }}>
      <Svg width={200} height={100} viewBox="0 0 200 100">
        {/* Background card */}
        <Rect x="10" y="10" width="180" height="80" rx="10" fill="#141414" />
        {/* Crowd bars */}
        {[20, 40, 55, 75, 60, 80, 87].map((h, i) => (
          <Rect key={i} x={25 + i * 22} y={65 - h * 0.5} width="14" height={h * 0.5} rx="3" fill={i === 6 ? '#CC2929' : '#272727'} />
        ))}
      </Svg>
      <View style={styles.scorePill}>
        <Animated.Text style={styles.scoreNum}>{numStr}</Animated.Text>
        <Text style={styles.scoreLbl}>LIVE FOMO SCORE</Text>
      </View>
      <View style={styles.barTrackOuter}>
        <Animated.View style={[styles.barFillAnim, { width: barWidth }]} />
      </View>
      <Text style={styles.scoreCaption}>🔥 ON FIRE</Text>
    </View>
  );
}

function StatusIllustration() {
  const tiers = [
    { icon: '🌱', label: 'NEWCOMER', pts: '0+', delay: 0 },
    { icon: '🙂', label: 'REGULAR', pts: '10+', delay: 150 },
    { icon: '😎', label: 'KNOWN FACE', pts: '30+', delay: 300 },
    { icon: '🔥', label: 'VIBE SETTER', pts: '60+', delay: 450 },
    { icon: '👑', label: 'FOMO ICON', pts: '85+', delay: 600 },
  ];
  return (
    <View style={{ height: 200, justifyContent: 'center', gap: 8 }}>
      {tiers.map((t, i) => (
        <AnimatedTierRow key={t.label} tier={t} index={i} total={tiers.length} />
      ))}
    </View>
  );
}

function AnimatedTierRow({ tier, index, total }: { tier: { icon: string; label: string; pts: string; delay: number }; index: number; total: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: tier.delay, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const isTop = index === total - 1;
  return (
    <Animated.View style={[styles.tierRow, { opacity, transform: [{ translateX }] }, isTop && styles.tierRowTop]}>
      <Text style={styles.tierIcon}>{tier.icon}</Text>
      <Text style={[styles.tierLabel, isTop && styles.tierLabelTop]}>{tier.label}</Text>
      <Text style={styles.tierPts}>{tier.pts}</Text>
    </Animated.View>
  );
}

function SquadIllustration() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  const avatars = [
    { color: '#3A2A1A', label: 'T', x: 30 },
    { color: '#1A3A2A', label: 'S', x: 100 },
    { color: '#2A1A3A', label: 'K', x: 170 },
  ];

  return (
    <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        {avatars.map(av => (
          <View key={av.label} style={[styles.squadAv, { backgroundColor: av.color }]}>
            <Text style={styles.squadAvTxt}>{av.label}</Text>
          </View>
        ))}
      </View>
      <Animated.View style={[styles.checkinBadge, { transform: [{ scale }] }]}>
        <Text style={styles.checkinBadgeTxt}>🚨 IN OR OUT? 10s</Text>
      </Animated.View>
      <View style={styles.responseRow}>
        <View style={styles.responseChip}><Text style={styles.responseChipTxt}>T ✅</Text></View>
        <View style={styles.responseChip}><Text style={styles.responseChipTxt}>S ✅</Text></View>
        <View style={styles.responseChip}><Text style={styles.responseChipTxt}>K ❌</Text></View>
      </View>
    </View>
  );
}

function FinaleIllustration({ pulse }: { pulse: Animated.Value }) {
  const rotate = pulse.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '6deg'] });
  return (
    <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={120} height={120} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="86" fill="none" stroke="#CC2929" strokeWidth="4" />
          <Path
            d="M100 38 C 75 76, 53 100, 53 134 C 53 168, 75 188, 100 188 C 125 188, 147 168, 147 134 C 147 112, 134 96, 122 84 C 127 104, 115 116, 103 109 C 94 103, 96 88, 100 38 Z"
            fill="#CC2929"
          />
          <Path
            d="M100 118 C 89 134, 82 147, 82 160 C 82 175, 91 184, 100 184 C 109 184, 118 175, 118 160 C 118 149, 111 140, 104 134 C 106 145, 99 152, 94 147 C 90 143, 92 134, 100 118 Z"
            fill="#0A0A0A"
          />
        </Svg>
      </Animated.View>
      <Text style={styles.finaleTitle}>FOMO</Text>
    </View>
  );
}

// ── SLIDES ────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'welcome',
    accentColor: '#CC2929',
    title: 'THE NIGHT\nDOESN\'T WAIT',
    sub: 'Your guide to Abuja\'s best nights out — live, scored, and moving in real time.',
  },
  {
    id: 'score',
    accentColor: '#CC2929',
    title: 'KNOW WHERE\nTO GO',
    sub: 'Every event has a live FOMO Score (0–100). Higher score, harder night. Watch it rise in real time.',
  },
  {
    id: 'status',
    accentColor: '#CC2929',
    title: 'BUILD YOUR\nREPUTATION',
    sub: 'Everyone starts as a NEWCOMER. Get rated by people you meet out and climb to FOMO ICON 👑.',
  },
  {
    id: 'squad',
    accentColor: '#CC2929',
    title: 'MOVE WITH\nYOUR SQUAD',
    sub: 'See who\'s going where. Send a 10-second "In or Out?" to your group chat and link up fast.',
  },
  {
    id: 'finale',
    accentColor: '#CC2929',
    title: 'LET\'S FIND\nYOUR NIGHT',
    sub: 'Set up your profile and start exploring what\'s happening tonight in Abuja.',
  },
];

export default function OnboardingIntroScreen({ onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;

  // Persistent pulse animation for flame/finale slides
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function goToSlide(index: number) {
    Animated.timing(contentFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      scrollRef.current?.scrollTo({ x: index * W, animated: false });
      setCurrentIndex(index);
      Animated.timing(contentFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      onDone();
    }
  }

  function onScrollEnd(e: any) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / W);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  }

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.safe}>
      {/* Background gradient effect */}
      <View style={styles.bgGlow} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
          <Text style={styles.skipTxt}>SKIP</Text>
        </TouchableOpacity>
      )}

      {/* Illustration area — swipeable */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.scrollArea}
      >
        {SLIDES.map((s, i) => (
          <View key={s.id} style={styles.slideWrap}>
            {s.id === 'welcome' && <FlameIllustration pulse={pulse} />}
            {s.id === 'score' && <ScoreIllustration />}
            {s.id === 'status' && <StatusIllustration />}
            {s.id === 'squad' && <SquadIllustration />}
            {s.id === 'finale' && <FinaleIllustration pulse={pulse} />}
          </View>
        ))}
      </ScrollView>

      {/* Text content — fades on slide change */}
      <Animated.View style={[styles.textArea, { opacity: contentFade }]}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSub}>{slide.sub}</Text>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
            <View style={[styles.dot, i === currentIndex && styles.dotOn]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity style={styles.ctaBtn} onPress={handleNext}>
        <Text style={styles.ctaTxt}>{isLast ? 'CREATE MY PROFILE' : 'NEXT'}</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </View>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:              { flex: 1, backgroundColor: Colors.bg },
  bgGlow:            { position: 'absolute', top: '10%', left: '20%', width: W * 0.6, height: W * 0.6, borderRadius: W * 0.3, backgroundColor: 'rgba(204,41,41,0.07)', },
  skipBtn:           { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  skipTxt:           { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1 },
  scrollArea:        { flexGrow: 0, height: H * 0.40, marginTop: H * 0.08 },
  slideWrap:         { width: W, alignItems: 'center', justifyContent: 'center' },
  glowRing:          { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(204,41,41,0.20)' },
  spark:             { position: 'absolute' },
  sparkTxt:          { fontSize: 14, color: Colors.red },
  scorePill:         { backgroundColor: Colors.red, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, alignItems: 'center' },
  scoreNum:          { fontSize: 32, fontFamily: Fonts.display, color: '#fff' },
  scoreLbl:          { fontSize: 8, fontFamily: Fonts.bodyBold, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  barTrackOuter:     { width: W * 0.55, height: 6, backgroundColor: Colors.surface2, borderRadius: 3, overflow: 'hidden' },
  barFillAnim:       { height: '100%', backgroundColor: Colors.red, borderRadius: 3 },
  scoreCaption:      { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  tierRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 5, backgroundColor: Colors.surface, borderRadius: 8, width: W * 0.7 },
  tierRowTop:        { backgroundColor: Colors.red },
  tierIcon:          { fontSize: 18, width: 28, textAlign: 'center' },
  tierLabel:         { flex: 1, fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  tierLabelTop:      { color: '#fff' },
  tierPts:           { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim },
  squadAv:           { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border2 },
  squadAvTxt:        { fontSize: 22, fontFamily: Fonts.display, color: '#fff' },
  checkinBadge:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.redDim, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  checkinBadgeTxt:   { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.red },
  responseRow:       { flexDirection: 'row', gap: 8 },
  responseChip:      { backgroundColor: Colors.surface2, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  responseChipTxt:   { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.mid },
  finaleTitle:       { fontSize: 52, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 4 },
  textArea:          { paddingHorizontal: 28, marginTop: 20, gap: 10, alignItems: 'center' },
  slideTitle:        { fontSize: 34, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, textAlign: 'center', lineHeight: 38 },
  slideSub:          { fontSize: 13, fontFamily: Fonts.body, color: Colors.mid, textAlign: 'center', lineHeight: 20 },
  dotsRow:           { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 24 },
  dot:               { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surface2 },
  dotOn:             { backgroundColor: Colors.red, width: 20, borderRadius: 4 },
  ctaBtn:            { marginHorizontal: 24, marginTop: 20, backgroundColor: Colors.red, borderRadius: 6, paddingVertical: 16, alignItems: 'center' },
  ctaTxt:            { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 2 },
});
