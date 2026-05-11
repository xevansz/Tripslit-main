import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../src/components/Button";
import { colors } from "../src/theme";

const FEATURES = [
  { icon: "sparkles", t: "Unlimited TripBuddy AI", d: "GPT-class travel planning, no daily caps" },
  { icon: "stats-chart", t: "Advanced expense reports", d: "Per-category, per-trip, per-friend insights" },
  { icon: "book", t: "Unlimited trip journals", d: "With photo backup & memory timelines" },
  { icon: "shield-checkmark", t: "Priority safety support", d: "24/7 human-backed SOS escalation" },
  { icon: "globe", t: "Multi-currency wallet", d: "Auto-convert across 30+ currencies" },
];

export default function Premium() {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <LinearGradient colors={["#F59E0B", "#FB923C", "#EF4444"]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={["top"]}>
            <TouchableOpacity testID="p-back" onPress={() => router.back()} style={styles.back}><Ionicons name="close" size={22} color="#fff" /></TouchableOpacity>
            <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 24 }}>
              <View style={styles.crown}><Ionicons name="diamond" size={32} color="#fff" /></View>
              <Text style={styles.heroT}>TripSplit Premium</Text>
              <Text style={styles.heroS}>Unlock smarter travel,{"\n"}faster splits, deeper insights.</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          <Text style={styles.section}>Everything in Free, plus</Text>
          <View style={{ gap: 12, marginTop: 12 }}>
            {FEATURES.map((f) => (
              <View key={f.t} style={styles.fRow}>
                <View style={styles.fIcon}><Ionicons name={f.icon as any} size={20} color={colors.warning} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fT}>{f.t}</Text>
                  <Text style={styles.fD}>{f.d}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[styles.section, { marginTop: 26 }]}>Choose your plan</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            <TouchableOpacity testID="plan-yearly" onPress={() => setPlan("yearly")} style={[styles.plan, plan === "yearly" && styles.planActive]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Text style={styles.planT}>Yearly</Text>
                  <View style={styles.savePill}><Text style={styles.savePillT}>SAVE 33%</Text></View>
                </View>
                <Text style={styles.planP}>$59.99/yr · $5.00/mo</Text>
              </View>
              <View style={[styles.radio, plan === "yearly" && styles.radioActive]}>{plan === "yearly" && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
            </TouchableOpacity>
            <TouchableOpacity testID="plan-monthly" onPress={() => setPlan("monthly")} style={[styles.plan, plan === "monthly" && styles.planActive]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planT}>Monthly</Text>
                <Text style={styles.planP}>$7.49/mo</Text>
              </View>
              <View style={[styles.radio, plan === "monthly" && styles.radioActive]}>{plan === "monthly" && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 22 }} />
          <Button testID="p-checkout" title={`Start ${plan} plan`} onPress={() => Alert.alert("Checkout", "Stripe checkout would open here.")} />
          <Text style={styles.foot}>Cancel anytime · 7-day free trial</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  hero: { paddingHorizontal: 20 },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center", marginTop: 8 },
  crown: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  heroT: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 14, letterSpacing: -0.5 },
  heroS: { color: "rgba(255,255,255,0.9)", textAlign: "center", marginTop: 8, fontSize: 15, lineHeight: 22 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text },
  fRow: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  fIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.warningSoft, alignItems: "center", justifyContent: "center" },
  fT: { fontWeight: "800", color: colors.text },
  fD: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  plan: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, borderWidth: 2, borderColor: colors.border, backgroundColor: "#fff" },
  planActive: { borderColor: colors.warning, backgroundColor: colors.warningSoft + "30" },
  planT: { fontSize: 16, fontWeight: "800", color: colors.text },
  planP: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  savePill: { paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: colors.success, justifyContent: "center" },
  savePillT: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioActive: { backgroundColor: colors.warning, borderColor: colors.warning },
  foot: { textAlign: "center", marginTop: 14, color: colors.textMuted, fontSize: 12 },
});
