import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme";
import { api } from "../../../src/api";

export default function TripWallet() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [w, setW] = useState<any>(null);

  const load = useCallback(() => {
    if (id) api.tripWallet(id).then(setW).catch(() => {});
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function contribute(member: string, amount: number) {
    try { await api.walletTx({ trip_id: id, type: "contribute", amount, member }); load(); }
    catch (e: any) { Alert.alert("Error", e.message); }
  }

  if (!w) return <SafeAreaView style={styles.safe}><Text style={{ padding: 24 }}>Loading wallet...</Text></SafeAreaView>;

  const collectedPct = Math.min(100, (w.collected / Math.max(w.budget, 1)) * 100);
  const spentPct = Math.min(100, (w.spent / Math.max(w.budget, 1)) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="tw-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Trip Wallet</Text>
        <TouchableOpacity testID="tw-history" onPress={() => Alert.alert("History", "Full transaction history")} style={styles.back}><Ionicons name="time-outline" size={20} color={colors.text} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <LinearGradient colors={colors.blueGrad as any} style={styles.balCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>SHARED TREASURY</Text>
          <Text style={styles.bal}>${w.balance.toFixed(2)}</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}><Text style={styles.statL}>Budget</Text><Text style={styles.statV}>${w.budget}</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statL}>Collected</Text><Text style={styles.statV}>${w.collected.toFixed(0)}</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statL}>Spent</Text><Text style={styles.statV}>${w.spent.toFixed(0)}</Text></View>
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          <ActionBtn icon="add" label="Add money" testID="tw-add" onPress={() => contribute("Me", 100)} />
          <ActionBtn icon="arrow-up" label="Withdraw" testID="tw-withdraw" onPress={() => Alert.alert("Withdraw", "Initiated")} />
          <ActionBtn icon="refresh" label="Refund" testID="tw-refund" onPress={() => Alert.alert("Refund", "Requested")} />
          <ActionBtn icon="bar-chart" label="Insights" testID="tw-insights" onPress={() => Alert.alert("Insights", "AI budget prediction: on track")} />
        </View>

        <View style={styles.progBlock}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.progL}>Collection progress</Text>
            <Text style={styles.progV}>{collectedPct.toFixed(0)}%</Text>
          </View>
          <View style={styles.progBg}><View style={[styles.progFill, { width: `${collectedPct}%`, backgroundColor: colors.success }]} /></View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
            <Text style={styles.progL}>Spending progress</Text>
            <Text style={styles.progV}>{spentPct.toFixed(0)}%</Text>
          </View>
          <View style={styles.progBg}><View style={[styles.progFill, { width: `${spentPct}%`, backgroundColor: spentPct > 80 ? colors.danger : colors.primary }]} /></View>
          {spentPct > 80 && (
            <View style={styles.alert}>
              <Ionicons name="warning" size={16} color={colors.danger} />
              <Text style={styles.alertT}>Over 80% spent — slow down to stay within budget.</Text>
            </View>
          )}
        </View>

        <Text style={styles.section}>Member contributions</Text>
        <View style={{ gap: 8 }}>
          {w.contributions.map((c: any, i: number) => {
            const pct = Math.min(100, (c.paid / Math.max(c.required, 1)) * 100);
            const remain = Math.max(0, c.required - c.paid);
            return (
              <View key={i} style={styles.member}>
                <View style={styles.av}><Text style={{ color: "#fff", fontWeight: "800" }}>{c.name.charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.mName}>{c.name}</Text>
                    <Text style={styles.mAmt}>${c.paid.toFixed(0)} / ${c.required.toFixed(0)}</Text>
                  </View>
                  <View style={[styles.progBg, { marginTop: 8 }]}><View style={[styles.progFill, { width: `${pct}%` }]} /></View>
                  <Text style={styles.mRemain}>{remain > 0 ? `Remaining: $${remain.toFixed(0)}` : "Fully paid ✓"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.section}>Recent transactions</Text>
        <View style={{ gap: 8 }}>
          {w.transactions.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", padding: 20 }}>No transactions yet</Text>}
          {w.transactions.slice(0, 8).map((t: any) => (
            <View key={t.id} style={styles.tx}>
              <View style={[styles.txIcon, { backgroundColor: t.type === "contribute" ? colors.successSoft : colors.surface2 }]}>
                <Ionicons name={t.type === "contribute" ? "arrow-down" : "arrow-up"} size={16} color={t.type === "contribute" ? colors.success : colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txT}>{t.type === "contribute" ? `${t.member} contributed` : `${t.member} ${t.type}`}</Text>
                <Text style={styles.txM}>{(t.note || t.type)} · {(t.created_at || "").slice(0, 10)}</Text>
              </View>
              <Text style={[styles.txA, { color: t.type === "contribute" ? colors.success : colors.text }]}>
                {t.type === "contribute" ? "+" : "-"}${t.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionBtn({ icon, label, onPress, testID }: any) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} style={styles.action}>
      <View style={styles.actionIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <Text style={styles.actionT}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  balCard: { padding: 22, borderRadius: 24 },
  bal: { color: "#fff", fontSize: 38, fontWeight: "800", marginTop: 6, letterSpacing: -1 },
  statRow: { flexDirection: "row", marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
  stat: { flex: 1 },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 8 },
  statL: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700" },
  statV: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  action: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary + "1A", marginBottom: 6 },
  actionT: { fontSize: 11, fontWeight: "700", color: colors.text },
  progBlock: { padding: 16, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  progL: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  progV: { fontSize: 13, color: colors.text, fontWeight: "800" },
  progBg: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, marginTop: 8, overflow: "hidden" },
  progFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  alert: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: colors.dangerSoft },
  alertT: { color: colors.danger, fontSize: 12, fontWeight: "600", flex: 1 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text },
  member: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  av: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  mName: { fontWeight: "800", color: colors.text },
  mAmt: { fontWeight: "700", color: colors.text, fontSize: 13 },
  mRemain: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  tx: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface },
  txIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txT: { fontWeight: "700", color: colors.text, fontSize: 13 },
  txM: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  txA: { fontWeight: "800" },
});
