import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

const CATS = [
  { k: "Food", icon: "restaurant", color: colors.warning },
  { k: "Stay", icon: "bed", color: colors.primary },
  { k: "Transport", icon: "car", color: colors.teal },
  { k: "Activity", icon: "rocket", color: "#EC4899" },
  { k: "Shopping", icon: "bag-handle", color: "#8B5CF6" },
  { k: "Other", icon: "ellipsis-horizontal", color: colors.textMuted },
];

export default function AddExpense() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [tripId, setTripId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Food");
  const [paidBy, setPaidBy] = useState("Me");
  const [split, setSplit] = useState<"equal" | "percentage" | "custom">("equal");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listTrips().then((t) => { setTrips(t); if (t[0]) setTripId(t[0].id); }).catch(() => {});
  }, []);

  async function submit() {
    if (!tripId) return Alert.alert("No trip", "Create a trip first");
    if (!amount || !desc) return Alert.alert("Missing", "Amount and description required");
    setLoading(true);
    try {
      await api.createExpense({
        trip_id: tripId, amount: parseFloat(amount), description: desc, category: cat,
        paid_by: paidBy, split_method: split, split_between: [],
      });
      setDone(true);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={styles.success}><Ionicons name="checkmark" size={56} color="#fff" /></View>
          <Text style={[styles.h1, { textAlign: "center", marginTop: 24 }]}>Expense added!</Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 8 }}>${amount} · {desc}</Text>
          <View style={{ height: 32 }} />
          <Button testID="exp-done" title="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="exp-back" onPress={() => router.back()} style={styles.back}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          <Text style={styles.htitle}>Add Expense</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={styles.amountWrap}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Text style={styles.dollar}>$</Text>
              <Input testID="exp-amount" placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad"
                style={{ fontSize: 48, fontWeight: "800", padding: 0, height: 56 }} />
            </View>
          </View>

          <Input testID="exp-desc" label="Description" placeholder="Beach dinner, taxi to airport..." value={desc} onChangeText={setDesc} />

          <Text style={styles.label}>Category</Text>
          <View style={styles.catGrid}>
            {CATS.map((c) => (
              <TouchableOpacity key={c.k} testID={`cat-${c.k}`} onPress={() => setCat(c.k)} style={[styles.catItem, cat === c.k && { borderColor: c.color, backgroundColor: c.color + "1A" }]}>
                <Ionicons name={c.icon as any} size={22} color={c.color} />
                <Text style={styles.catLabel}>{c.k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Paid by</Text>
          <View style={styles.row}>
            <View style={styles.av}><Text style={{ color: "#fff", fontWeight: "800" }}>M</Text></View>
            <Text style={{ flex: 1, fontWeight: "700", color: colors.text }}>{paidBy}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </View>

          <Text style={styles.label}>Split method</Text>
          <View style={styles.splitRow}>
            {(["equal", "percentage", "custom"] as const).map((s) => (
              <TouchableOpacity key={s} testID={`split-${s}`} onPress={() => setSplit(s)} style={[styles.split, split === s && styles.splitActive]}>
                <Text style={[styles.splitText, split === s && { color: "#fff" }]}>{s === "equal" ? "Equal" : s === "percentage" ? "%" : "Custom"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity testID="exp-receipt" onPress={() => Alert.alert("OCR", "Camera ready — point at receipt to auto-extract amount, items & vendor")} style={styles.receipt}>
            <Ionicons name="scan-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Scan receipt with OCR</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
          <Button testID="exp-submit" title="Save expense" onPress={submit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text },
  amountWrap: { padding: 20, borderRadius: 22, backgroundColor: colors.surface, marginBottom: 18 },
  amountLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "700" },
  dollar: { fontSize: 32, fontWeight: "800", color: colors.text, marginRight: 4, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "700", color: colors.textMuted, marginTop: 18, marginBottom: 8 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catItem: { width: "31.5%", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 6, backgroundColor: "#fff" },
  catLabel: { fontSize: 12, fontWeight: "700", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  splitRow: { flexDirection: "row", gap: 8 },
  split: { flex: 1, height: 46, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  splitActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  splitText: { fontWeight: "700", color: colors.text, fontSize: 13 },
  receipt: { flexDirection: "row", gap: 8, marginTop: 18, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  success: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
});
