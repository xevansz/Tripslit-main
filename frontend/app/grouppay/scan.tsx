import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";

export default function ScanQR() {
  const router = useRouter();
  const line = useRef(new Animated.Value(0)).current;
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(() => {
      setScanning(false);
      router.replace({
        pathname: "/grouppay/session",
        params: { merchant: "Sunset Beach Cafe", amount: "126.50" },
      });
    }, 2400);
    return () => clearTimeout(t);
  }, []);

  const translateY = line.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });

  return (
    <View style={styles.bg}>
      <SafeAreaView edges={["top"]} style={styles.head}>
        <TouchableOpacity testID="qr-back" onPress={() => router.back()} style={styles.back}><Ionicons name="close" size={22} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Scan to pay</Text>
        <TouchableOpacity testID="qr-flash" style={styles.back}><Ionicons name="flash-outline" size={20} color="#fff" /></TouchableOpacity>
      </SafeAreaView>

      <View style={styles.center}>
        <View style={styles.frame}>
          <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
          <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
            <LinearGradient colors={["transparent", "#14B8A6", "transparent"] as any} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
          </Animated.View>
        </View>
        <Text style={styles.hint}>{scanning ? "Aim at merchant QR…" : "QR detected ✓"}</Text>
      </View>

      <View style={styles.modes}>
        <TouchableOpacity testID="mode-quick" style={[styles.mode, styles.modeActive]}>
          <Text style={styles.modeT}>Group Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="mode-trip" style={styles.mode}>
          <Text style={[styles.modeT, { color: "rgba(255,255,255,0.7)" }]}>Trip Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="mode-solo" style={styles.mode}>
          <Text style={[styles.modeT, { color: "rgba(255,255,255,0.7)" }]}>Quick Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#0F172A" },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 17, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  frame: { width: 260, height: 260, position: "relative" },
  corner: { position: "absolute", width: 36, height: 36, borderColor: "#14B8A6", borderRadius: 6 },
  scanLine: { position: "absolute", left: 0, right: 0, height: 3 },
  hint: { color: "#fff", marginTop: 28, fontSize: 14, fontWeight: "600" },
  modes: { flexDirection: "row", justifyContent: "center", gap: 8, paddingHorizontal: 24, paddingBottom: 60 },
  mode: { paddingHorizontal: 14, height: 38, borderRadius: 19, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  modeActive: { backgroundColor: "#fff" },
  modeT: { color: colors.text, fontWeight: "800", fontSize: 13 },
});
