import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";

const LOANS = [
  { name: "Maya", amount: 120, reason: "Concert tickets", due: "Mar 22", status: "active", overdue: false },
  { name: "Jordan", amount: 65, reason: "Gas split", due: "Mar 10", status: "overdue", overdue: true },
  { name: "Priya", amount: 240, reason: "Hotel deposit", due: "Apr 02", status: "active", overdue: false },
  { name: "Alex", amount: 80, reason: "Dinner share", due: "Feb 15", status: "settled", overdue: false },
];

export default function Borrow() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="b-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Borrow Ledger</Text>
        <TouchableOpacity testID="b-new" style={styles.back}><Ionicons name="add" size={22} color={colors.text} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <LinearGradient colors={colors.blueGrad as any} style={styles.summary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700" }}>NET POSITION</Text>
          <Text style={styles.netVal}>+$425.00</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <View style={styles.pill}><Text style={styles.pillT}>3 active loans</Text></View>
            <View style={styles.pill}><Text style={styles.pillT}>1 overdue</Text></View>
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          <TouchableOpacity testID="b-request" style={styles.action}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + "1A" }]}><Ionicons name="arrow-down" size={20} color={colors.primary} /></View>
            <Text style={styles.actionT}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="b-lend" style={styles.action}>
            <View style={[styles.actionIcon, { backgroundColor: colors.teal + "1A" }]}><Ionicons name="arrow-up" size={20} color={colors.teal} /></View>
            <Text style={styles.actionT}>Lend</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="b-remind" style={styles.action}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + "1A" }]}><Ionicons name="notifications" size={20} color={colors.warning} /></View>
            <Text style={styles.actionT}>Remind</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>All loans</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          {LOANS.map((l, i) => (
            <View key={i} style={styles.loan}>
              <View style={styles.av}><Text style={{ color: "#fff", fontWeight: "800" }}>{l.name.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.lName}>{l.name}</Text>
                  {l.status === "settled" && <View style={[styles.tag, { backgroundColor: colors.successSoft }]}><Text style={[styles.tagT, { color: colors.success }]}>SETTLED</Text></View>}
                  {l.overdue && <View style={[styles.tag, { backgroundColor: colors.dangerSoft }]}><Text style={[styles.tagT, { color: colors.danger }]}>OVERDUE</Text></View>}
                </View>
                <Text style={styles.lMeta}>{l.reason} · due {l.due}</Text>
              </View>
              <Text style={[styles.lAmt, l.status === "settled" && { color: colors.textMuted, textDecorationLine: "line-through" }]}>${l.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  summary: { padding: 20, borderRadius: 22 },
  netVal: { color: "#fff", fontSize: 36, fontWeight: "800", letterSpacing: -1, marginTop: 4 },
  pill: { paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center" },
  pillT: { color: "#fff", fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  action: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actionT: { fontSize: 12, fontWeight: "700", color: colors.text },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 22 },
  loan: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  av: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  lName: { fontWeight: "800", color: colors.text },
  lMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  lAmt: { fontWeight: "800", color: colors.text, fontSize: 16 },
  tag: { paddingHorizontal: 7, height: 18, borderRadius: 9, justifyContent: "center" },
  tagT: { fontSize: 9, fontWeight: "800" },
});
