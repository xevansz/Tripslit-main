import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";

const TX = [
  { id: "1", name: "Maria K.", note: "Bali villa", amount: -240, time: "Today", icon: "arrow-up" as const },
  { id: "2", name: "Sam L.", note: "Settled trip", amount: 120, time: "Yesterday", icon: "arrow-down" as const },
  { id: "3", name: "Currency conv.", note: "USD → IDR", amount: -300, time: "Mar 4", icon: "swap-horizontal" as const },
  { id: "4", name: "Jordan", note: "Gas refill", amount: 65, time: "Mar 1", icon: "arrow-down" as const },
];

export default function Wallet() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="w-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <LinearGradient colors={["#0F172A", "#1E293B"] as any} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>TRIPSPLIT WALLET</Text>
            <Ionicons name="wallet" size={20} color="#fff" />
          </View>
          <Text style={styles.balance}>$2,847.50</Text>
          <View style={styles.cardFoot}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>USD · Multi-currency</Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "700" }}>•••• 4429</Text>
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          {[
            { k: "send", icon: "arrow-up", label: "Send" },
            { k: "request", icon: "arrow-down", label: "Request" },
            { k: "convert", icon: "swap-horizontal", label: "Convert" },
            { k: "topup", icon: "add", label: "Top up" },
          ].map((a) => (
            <TouchableOpacity key={a.k} testID={`w-${a.k}`} style={styles.action}>
              <View style={styles.actionIcon}><Ionicons name={a.icon as any} size={20} color={colors.primary} /></View>
              <Text style={styles.actionT}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Recent transactions</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          {TX.map((t) => (
            <View key={t.id} style={styles.tx}>
              <View style={[styles.txIcon, { backgroundColor: t.amount > 0 ? colors.successSoft : colors.surface2 }]}>
                <Ionicons name={t.icon} size={18} color={t.amount > 0 ? colors.success : colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txName}>{t.name}</Text>
                <Text style={styles.txMeta}>{t.note} · {t.time}</Text>
              </View>
              <Text style={[styles.txAmt, { color: t.amount > 0 ? colors.success : colors.text }]}>
                {t.amount > 0 ? "+" : ""}${Math.abs(t.amount)}
              </Text>
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
  card: { padding: 22, borderRadius: 24 },
  balance: { color: "#fff", fontSize: 38, fontWeight: "800", marginTop: 22, letterSpacing: -1 },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 28, alignItems: "center" },
  actions: { flexDirection: "row", marginTop: 18, gap: 8 },
  action: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6, backgroundColor: colors.primary + "1A" },
  actionT: { fontSize: 11, fontWeight: "700", color: colors.text },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 22 },
  tx: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txName: { fontWeight: "700", color: colors.text },
  txMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txAmt: { fontWeight: "800" },
});
