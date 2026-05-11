import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";
import { api } from "../src/api";

export default function Discover() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { api.discover().then(setItems).catch(() => {}); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="d-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Discover</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}>
        <View>
          <Text style={styles.h1}>Popular destinations</Text>
          <Text style={styles.sub}>Trending with travelers · AR/VR previews available</Text>
        </View>
        {items.map((d) => (
          <TouchableOpacity key={d.id} testID={`disc-${d.id}`} activeOpacity={0.85} style={styles.card}>
            <Image source={{ uri: d.image }} style={styles.cardImg} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={[StyleSheet.absoluteFill as any, { borderRadius: 22 }]} />
            <View style={styles.overlay}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={styles.trips}><Ionicons name="airplane" size={11} color="#fff" /> {d.trips} trips planned</Text>
              </View>
              {d.ar && (
                <TouchableOpacity testID={`ar-${d.id}`} onPress={() => Alert.alert("AR/VR Preview", "Loading immersive 360° tour…")} style={styles.arBtn}>
                  <Ionicons name="cube" size={14} color="#fff" />
                  <Text style={styles.arT}>AR/VR</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  card: { borderRadius: 22, overflow: "hidden", height: 180, position: "relative" },
  cardImg: { width: "100%", height: "100%" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, flexDirection: "row", alignItems: "flex-end" },
  name: { color: "#fff", fontSize: 22, fontWeight: "800" },
  trips: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", marginTop: 4 },
  arBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: "rgba(0,102,255,0.95)", justifyContent: "center" },
  arT: { color: "#fff", fontWeight: "800", fontSize: 11 },
});
