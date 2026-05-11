import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, ASSETS } from "../../src/theme";
import Card from "../../src/components/Card";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [bal, setBal] = useState<any>({ total: 0, you_owe: 0, owed_to_you: 0, currency: "USD" });
  const [trips, setTrips] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, t, r] = await Promise.all([api.balance(), api.listTrips(), api.recommendations()]);
      setBal(b);
      setTrips(t || []);
      setRecs(r || []);
    } catch (e) { /* */ }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true); await load(); setRefreshing(false);
  }

  const activeTrip = trips[0];
  const activity = [
    { id: "a1", icon: "card", label: "Maria added Dinner — $84", time: "2h ago", color: colors.primary },
    { id: "a2", icon: "checkmark-circle", label: "Sam settled $120 with you", time: "Yesterday", color: colors.success },
    { id: "a3", icon: "notifications", label: "Bali trip reminder: book ATV", time: "2d ago", color: colors.warning },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || "Traveler"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity testID="home-ai-shortcut" onPress={() => router.push("/(tabs)/tripbuddy")} style={styles.iconBtn}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity testID="home-notifications" onPress={() => router.push("/notifications")} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance card */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <LinearGradient colors={colors.blueGrad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balCard}>
            <Text style={styles.balLabel}>Total balance</Text>
            <Text style={styles.balValue}>${bal.total.toFixed(2)}</Text>
            <View style={styles.balRow}>
              <View style={styles.balPill}>
                <Ionicons name="arrow-down" size={14} color="#fff" />
                <View>
                  <Text style={styles.pillTop}>You owe</Text>
                  <Text style={styles.pillBottom}>${bal.you_owe.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.balPill}>
                <Ionicons name="arrow-up" size={14} color="#fff" />
                <View>
                  <Text style={styles.pillTop}>Owed to you</Text>
                  <Text style={styles.pillBottom}>${bal.owed_to_you.toFixed(2)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.miniChart}>
              {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 0.4 }]} />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Quick actions */}
        <View style={styles.qaRow}>
          <Quick icon="add-circle" label="Add Expense" color={colors.primary} onPress={() => router.push("/expense/add")} testID="qa-add-expense" />
          <Quick icon="git-branch" label="Split Now" color={colors.teal} onPress={() => router.push("/borrow")} testID="qa-split" />
          <Quick icon="qr-code" label="Scan QR" color={"#8B5CF6"} onPress={() => router.push("/grouppay/scan")} testID="qa-scan" />
          <Quick icon="alert-circle" label="SOS" color={colors.danger} onPress={() => router.push("/sos")} testID="qa-sos" />
        </View>

        {/* Active trip */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Active trip</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/trips")}><Text style={styles.link}>See all</Text></TouchableOpacity>
          </View>
          {activeTrip ? (
            <TouchableOpacity testID="home-active-trip" onPress={() => router.push({ pathname: "/trip/[id]", params: { id: activeTrip.id } })}>
              <ImageBackground source={{ uri: activeTrip.cover_image }} style={styles.tripCard} imageStyle={{ borderRadius: 24 }}>
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={[StyleSheet.absoluteFill as any, { borderRadius: 24 }]} />
                <View style={styles.tripCardOverlay}>
                  <Text style={styles.tripName}>{activeTrip.name}</Text>
                  <Text style={styles.tripDest}>{activeTrip.destination}</Text>
                  <View style={styles.tripMeta}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.tripMetaText}>{activeTrip.start_date} → {activeTrip.end_date}</Text>
                  </View>
                  <View style={styles.avatarsRow}>
                    {(activeTrip.members || []).slice(0, 4).map((m: any, i: number) => (
                      <View key={i} style={[styles.miniAvatar, { left: i * -12 }]}>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{(m.name || "?").charAt(0)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity testID="home-no-trip-cta" onPress={() => router.push("/trip/create")} style={styles.emptyTrip}>
              <Ionicons name="add" size={28} color={colors.primary} />
              <Text style={styles.emptyTitle}>Start your first trip</Text>
              <Text style={styles.emptySub}>Plan, split & travel with your crew.</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recommended for you */}
        {recs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              <TouchableOpacity onPress={() => router.push("/discover")} testID="home-discover"><Text style={styles.link}>Discover</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 12, paddingRight: 4 }}>
              {recs.map((r) => (
                <TouchableOpacity key={r.id} testID={`rec-${r.id}`} activeOpacity={0.85} style={styles.recCard}>
                  <Image source={{ uri: r.image }} style={styles.recImg} />
                  <View style={styles.recOverlay}>
                    <View style={styles.recTag}><Text style={styles.recTagT}>{r.tag}</Text></View>
                    <Text style={styles.recT} numberOfLines={2}>{r.title}</Text>
                    <View style={styles.matchRow}><Ionicons name="sparkles" size={11} color="#fff" /><Text style={styles.matchT}>{r.match}% match</Text></View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Card style={{ marginTop: 12, padding: 0 }}>
            {activity.map((a, i) => (
              <View key={a.id} style={[styles.actRow, i < activity.length - 1 && styles.actRowBorder]}>
                <View style={[styles.actIcon, { backgroundColor: a.color + "22" }]}>
                  <Ionicons name={a.icon as any} size={18} color={a.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actLabel}>{a.label}</Text>
                  <Text style={styles.actTime}>{a.time}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity testID="home-fab-create-trip" style={styles.fab} onPress={() => router.push("/trip/create")} activeOpacity={0.85}>
        <LinearGradient colors={colors.blueGrad as any} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Quick({ icon, label, color, onPress, testID }: any) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} style={styles.quick} activeOpacity={0.8}>
      <View style={[styles.quickIcon, { backgroundColor: color + "1A" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
  hello: { color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  name: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.3, marginTop: 2 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  balCard: { borderRadius: 28, padding: 22, overflow: "hidden" },
  balLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  balValue: { color: "#fff", fontSize: 38, fontWeight: "800", letterSpacing: -1, marginTop: 4 },
  balRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  balPill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.18)", padding: 10, borderRadius: 14 },
  pillTop: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  pillBottom: { color: "#fff", fontSize: 14, fontWeight: "700" },
  miniChart: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginTop: 16, height: 38 },
  bar: { flex: 1, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 4 },
  qaRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 18 },
  quick: { flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: 10, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: "700", color: colors.text, textAlign: "center" },
  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  link: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  tripCard: { height: 180, marginTop: 12, justifyContent: "flex-end", overflow: "hidden", borderRadius: 24 },
  tripCardOverlay: { padding: 18 },
  tripName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  tripDest: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 2 },
  tripMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  tripMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "500" },
  avatarsRow: { flexDirection: "row", marginTop: 12, height: 28 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", position: "absolute" },
  emptyTrip: { marginTop: 12, padding: 22, borderRadius: 22, borderWidth: 2, borderStyle: "dashed", borderColor: colors.border, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  actRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  actRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  actIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actLabel: { fontSize: 14, color: colors.text, fontWeight: "600" },
  actTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  fab: { position: "absolute", right: 20, bottom: 100 },
  fabInner: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", shadowColor: "#0066FF", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  recCard: { width: 220, height: 140, borderRadius: 18, overflow: "hidden", backgroundColor: colors.surface, position: "relative" },
  recImg: { width: "100%", height: "100%" },
  recOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: "rgba(0,0,0,0.45)" },
  recTag: { alignSelf: "flex-start", paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: colors.primary, marginBottom: 6, justifyContent: "center" },
  recTagT: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  recT: { color: "#fff", fontSize: 14, fontWeight: "800", lineHeight: 18 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  matchT: { color: "rgba(255,255,255,0.95)", fontSize: 11, fontWeight: "700" },
});
