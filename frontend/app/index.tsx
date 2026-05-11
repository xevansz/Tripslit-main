import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/auth";

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      if (loading) return;
      router.replace(user ? "/(tabs)/home" : "/(auth)/onboarding");
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, user]);

  return (
    <LinearGradient colors={["#0066FF", "#14B8A6"]} style={styles.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]} testID="splash-logo">
        <View style={styles.logo}>
          <Ionicons name="paper-plane" size={56} color="#0066FF" />
        </View>
        <Text style={styles.brand}>TripSplit</Text>
        <Text style={styles.tag}>Travel together. Split smarter.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center" },
  logo: {
    width: 110, height: 110, borderRadius: 30, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  brand: { color: "#fff", fontSize: 40, fontWeight: "800", marginTop: 24, letterSpacing: -0.5 },
  tag: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 8, fontWeight: "500" },
});
