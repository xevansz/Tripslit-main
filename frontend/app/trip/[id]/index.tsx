import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../src/theme";
import Button from "../../../src/components/Button";
import { api } from "../../../src/api";

const TOOLS = [
  { k: "journal", label: "Smart Journal", icon: "book-outline", color: "#8B5CF6" },
  { k: "itinerary", label: "Itinerary", icon: "map-outline", color: colors.primary },
  { k: "packing", label: "Packing", icon: "briefcase-outline", color: colors.teal },
  { k: "polls", label: "Polls", icon: "bar-chart-outline", color: colors.warning },
  { k: "chat", label: "Group Chat", icon: "chatbubbles-outline", color: "#EC4899" },
  { k: "album", label: "Album + Map", icon: "images-outline", color: colors.primary },
  { k: "settlement", label: "UPI Settle", icon: "swap-horizontal-outline", color: colors.success },
  { k: "reports", label: "Reports", icon: "stats-chart-outline", color: "#0F172A" },
];

export default function TripDashboard() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "members" | "expenses">("overview");
  const [exps, setExps] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.getTrip(id).then(setTrip).catch(() => {});
    api.listExpenses(id).then(setExps).catch(() => {});
  }, [id]);

  if (!trip) return <SafeAreaView style={styles.safe}><Text style={{ padding: 24 }}>Loading...</Text></SafeAreaView>;

  const budget = 3000;
  const spent = trip.spent || 0;
  const pct = Math.min(100, (spent / budget) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Hero */}
        <ImageBackground source={{ uri: trip.cover_image }} style={styles.hero}>
          <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill as any} />
          <SafeAreaView edges={["top"]} style={{ flex: 1, padding: 18 }}>
            <View style={styles.heroTop}>
              <TouchableOpacity testID="trip-back" onPress={() => router.back()} style={styles.heroBtn}><Ionicons name="chevron-back" size={22} color="#fff" /></TouchableOpacity>
              <TouchableOpacity testID="trip-settings" style={styles.heroBtn}><Ionicons name="settings-outline" size={20} color="#fff" /></TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.heroName}>{trip.name}</Text>
            <Text style={styles.heroDest}><Ionicons name="location" size={14} color="#fff" /> {trip.destination}</Text>
            <Text style={styles.heroDates}>{trip.start_date} → {trip.end_date}</Text>
          </SafeAreaView>
        </ImageBackground>

        {/* Primary actions */}
        <View style={styles.primaryRow}>
          <TouchableOpacity testID="trip-add-expense" onPress={() => router.push("/expense/add")} style={{ flex: 1 }}>
            <LinearGradient colors={colors.blueGrad as any} style={styles.primBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.primText}>Add Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity testID="trip-grouppay" onPress={() => router.push("/grouppay/scan")} style={[styles.primBtn, { flex: 1, backgroundColor: "#0F172A" }]}>
            <Ionicons name="qr-code" size={18} color="#fff" />
            <Text style={styles.primText}>Group Pay</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.primaryRow, { marginTop: 8 }]}>
          <TouchableOpacity testID="trip-wallet" onPress={() => router.push({ pathname: "/trip/[id]/wallet", params: { id } })} style={[styles.primBtn, { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Ionicons name="wallet" size={18} color={colors.text} />
            <Text style={[styles.primText, { color: colors.text }]}>Trip Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="trip-borrow" onPress={() => router.push("/borrow")} style={[styles.primBtn, { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Ionicons name="cash-outline" size={18} color={colors.text} />
            <Text style={[styles.primText, { color: colors.text }]}>Borrow</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["overview", "members", "expenses"] as const).map((t) => (
            <TouchableOpacity key={t} testID={`dash-tab-${t}`} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && { color: colors.primary }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {tab === "overview" && (
          <View style={{ paddingHorizontal: 20, gap: 16, marginTop: 16 }}>
            <View style={styles.budgetCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.cardLabel}>Budget</Text>
                <Text style={styles.cardLabel}>${spent.toFixed(0)} / ${budget}</Text>
              </View>
              <View style={styles.progBg}><View style={[styles.progFill, { width: `${pct}%` }]} /></View>
              <Text style={styles.budgetSub}>{(100 - pct).toFixed(0)}% remaining</Text>
            </View>

            <Text style={styles.section}>Quick tools</Text>
            <View style={styles.toolsGrid}>
              {TOOLS.map((t) => (
                <TouchableOpacity key={t.k} testID={`tool-${t.k}`} onPress={() => router.push({ pathname: "/trip/[id]/[k]", params: { id: id as string, k: t.k } })} style={styles.toolCard} activeOpacity={0.85}>
                  <View style={[styles.toolIcon, { backgroundColor: t.color + "1A" }]}>
                    <Ionicons name={t.icon as any} size={22} color={t.color} />
                  </View>
                  <Text style={styles.toolLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>Suggested vendors</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/vendors")} style={styles.suggestRow}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1757264119016-7e6b568b810d?w=400" }} style={{ width: 60, height: 60, borderRadius: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggName}>Bali Cliffside Villa</Text>
                <Text style={styles.suggMeta}><Ionicons name="star" size={11} color="#fbbf24" /> 4.9 · From $240/night</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </TouchableOpacity>
          </View>
        )}

        {tab === "members" && (
          <View style={{ paddingHorizontal: 20, gap: 10, marginTop: 16 }}>
            <View style={[styles.budgetCard, { backgroundColor: colors.primary + "0F", borderColor: colors.primary + "33" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={{ flex: 1, fontWeight: "700", color: colors.text, fontSize: 13 }}>Roles & permissions: Organizer manages, Treasurer approves wallet, Members contribute & spend.</Text>
              </View>
            </View>
            {(trip.members || []).map((m: any, i: number) => {
              const roles = ["organizer", "treasurer", "member", "viewer"];
              const role = i === 0 ? "organizer" : (i === 1 ? "treasurer" : "member");
              const trust = 92 - i * 6;
              return (
                <View key={m.id} style={styles.memberRow}>
                  <View style={styles.memAv}><Text style={{ color: "#fff", fontWeight: "800" }}>{(m.name || "?").charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontWeight: "800", color: colors.text }}>{m.name}</Text>
                      <View style={[styles.statusPill, { backgroundColor: role === "organizer" ? colors.primary + "1A" : role === "treasurer" ? colors.warning + "1A" : colors.surface2 }]}>
                        <Text style={{ color: role === "organizer" ? colors.primary : role === "treasurer" ? colors.warning : colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }}>{role.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <Ionicons name="shield-checkmark" size={11} color={colors.success} />
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>Trust score {trust}/100</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: colors.successSoft }]}><Text style={{ color: colors.success, fontSize: 11, fontWeight: "800" }}>SETTLED</Text></View>
                </View>
              );
            })}
          </View>
        )}

        {tab === "expenses" && (
          <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
            {exps.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 24 }}>No expenses yet. Tap "Add Expense" above.</Text>}
            {exps.map((e) => (
              <View key={e.id} style={styles.expRow}>
                <View style={styles.expIcon}><Ionicons name="restaurant" size={18} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>{e.description}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{e.category} · paid by {e.paid_by}</Text>
                </View>
                <Text style={{ fontWeight: "800", color: colors.text }}>${e.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  hero: { height: 280 },
  heroTop: { flexDirection: "row", justifyContent: "space-between" },
  heroBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  heroName: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  heroDest: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 4, fontWeight: "600" },
  heroDates: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  primaryRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 18, gap: 10 },
  primBtn: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  tabs: { flexDirection: "row", paddingHorizontal: 20, marginTop: 22, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: {},
  tabText: { color: colors.textMuted, fontWeight: "700", fontSize: 14 },
  tabUnderline: { position: "absolute", bottom: -1, height: 3, width: 50, borderRadius: 2, backgroundColor: colors.primary },
  budgetCard: { padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardLabel: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
  progBg: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, marginTop: 10, overflow: "hidden" },
  progFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  budgetSub: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: { width: "23.5%", padding: 12, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  toolIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  toolLabel: { fontSize: 10, fontWeight: "700", color: colors.text, textAlign: "center" },
  suggestRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  suggName: { fontWeight: "800", color: colors.text },
  suggMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface },
  memAv: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  statusPill: { paddingHorizontal: 10, height: 22, borderRadius: 11, justifyContent: "center" },
  expRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  expIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" },
});
