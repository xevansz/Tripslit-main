import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import { colors, ASSETS } from "../../src/theme";

const { width } = Dimensions.get("window");

const slides = [
  {
    img: ASSETS.onboarding[2],
    icon: "wallet" as const,
    title: "Split anything,\neffortlessly",
    desc: "Track group expenses, split bills equally, by % or custom — get crystal clear who owes who.",
  },
  {
    img: ASSETS.onboarding[1],
    icon: "map" as const,
    title: "Plan trips\nas a team",
    desc: "Itineraries, polls, packing lists, and group chat — everything for your crew in one place.",
  },
  {
    img: ASSETS.onboarding[0],
    icon: "shield-checkmark" as const,
    title: "Safety,\nbuilt-in",
    desc: "One-tap SOS, live location with trusted contacts, and 24/7 AI assistance wherever you go.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList>(null);

  function next() {
    if (idx < slides.length - 1) {
      ref.current?.scrollToIndex({ index: idx + 1 });
    } else {
      router.replace("/(auth)/signup");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <View />
        <TouchableOpacity testID="onboarding-skip" onPress={() => router.replace("/(auth)/signup")}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.img }} style={styles.image} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.55)"]}
                style={StyleSheet.absoluteFill as any}
              />
              <View style={styles.iconBadge}>
                <Ionicons name={item.icon} size={26} color="#fff" />
              </View>
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, idx === i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.cta}>
        <Button testID="onboarding-continue" title={idx === slides.length - 1 ? "Get Started" : "Continue"} onPress={next} />
        <TouchableOpacity testID="onboarding-login" onPress={() => router.replace("/(auth)/login")} style={{ marginTop: 14, alignSelf: "center" }}>
          <Text style={styles.loginText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  topRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8 },
  skip: { color: colors.textMuted, fontWeight: "600", fontSize: 15 },
  slide: { paddingTop: 24 },
  imageWrap: {
    marginHorizontal: 24, height: 380, borderRadius: 32, overflow: "hidden",
    backgroundColor: colors.surface,
  },
  image: { width: "100%", height: "100%" },
  iconBadge: {
    position: "absolute", top: 20, left: 20, width: 48, height: 48, borderRadius: 16,
    backgroundColor: "rgba(0,102,255,0.9)", alignItems: "center", justifyContent: "center",
  },
  textWrap: { paddingHorizontal: 32, marginTop: 30 },
  title: { fontSize: 30, fontWeight: "800", color: colors.text, lineHeight: 36, letterSpacing: -0.5 },
  desc: { fontSize: 15, color: colors.textMuted, lineHeight: 22, marginTop: 12 },
  dots: { flexDirection: "row", justifyContent: "center", marginVertical: 18, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.primary },
  cta: { paddingHorizontal: 24, paddingBottom: 18 },
  loginText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
