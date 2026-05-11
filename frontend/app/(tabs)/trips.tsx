import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

export default function Trips() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useFocusEffect(useCallback(() => {
    api.listTrips().then(setTrips).catch(() => {});
  }, []));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>Your trips</Text>
        <TouchableOpacity testID="trips-new" onPress={() => router.push("/trip/create")} style={styles.newBtn}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["upcoming", "past"] as const).map((t) => (
          <TouchableOpacity key={t} testID={`trips-tab-${t}`} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && { color: "#fff" }]}>{t === "upcoming" ? "Upcoming" : "Past"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 14 }}>
        {trips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="airplane" size={42} color={colors.textFaint} />
            <Text style={styles.emptyT}>No trips yet</Text>
            <Text style={styles.emptyS}>Tap + to plan your first adventure.</Text>
          </View>
        ) : (
          trips.map((t) => (
            <TouchableOpacity key={t.id} testID={`trip-${t.id}`} onPress={() => router.push({ pathname: "/trip/[id]", params: { id: t.id } })} activeOpacity={0.9}>
              <ImageBackground source={{ uri: t.cover_image }} style={styles.card} imageStyle={{ borderRadius: 24 }}>
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={[StyleSheet.absoluteFill as any, { borderRadius: 24 }]} />
                <View style={styles.cardOverlay}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{(t.members || []).length} travelers</Text>
                  </View>
                  <Text style={styles.cardName}>{t.name}</Text>
                  <Text style={styles.cardDest}><Ionicons name="location-outline" size={13} color="#fff" /> {t.destination}</Text>
                  <View style={styles.cardFoot}>
                    <Text style={styles.cardDates}>{t.start_date} — {t.end_date}</Text>
                    <View style={styles.spentPill}><Text style={styles.spentText}>${(t.spent || 0).toFixed(0)} spent</Text></View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  newBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", paddingHorizontal: 20, marginTop: 18, gap: 8 },
  tab: { flex: 1, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: colors.text },
  tabText: { color: colors.textMuted, fontWeight: "700", fontSize: 13 },
  empty: { padding: 40, alignItems: "center" },
  emptyT: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 12 },
  emptyS: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: { height: 220, justifyContent: "flex-end", overflow: "hidden", borderRadius: 24 },
  cardOverlay: { padding: 18 },
  tag: { alignSelf: "flex-start", paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", marginBottom: 8 },
  tagText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardName: { color: "#fff", fontSize: 24, fontWeight: "800" },
  cardDest: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  cardDates: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600" },
  spentPill: { paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: "rgba(0,122,255,0.95)", justifyContent: "center" },
  spentText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
