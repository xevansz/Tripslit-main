import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import { colors, ASSETS } from "../../src/theme";
import { api } from "../../src/api";

export default function CreateTrip() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dest, setDest] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [partInput, setPartInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name || !dest || !start || !end) return Alert.alert("Missing", "Fill all trip details");
    setLoading(true);
    try {
      await api.createTrip({ name, destination: dest, start_date: start, end_date: end, participants: parts, cover_image: ASSETS.destinations[0] });
      setStep(2);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 0 && step < 2 ? setStep(step - 1) : router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          {step === 0 && (
            <>
              <Text style={styles.h1}>Where are{"\n"}you headed?</Text>
              <Text style={styles.sub}>Tell us about the trip and we'll set everything up.</Text>
              <View style={{ gap: 14, marginTop: 28 }}>
                <Input testID="trip-name" label="Trip name" placeholder="e.g. Bali Crew 2026" value={name} onChangeText={setName} icon={<Ionicons name="pricetag-outline" size={20} color={colors.textMuted} />} />
                <Input testID="trip-dest" label="Destination" placeholder="Search city or country" value={dest} onChangeText={setDest} icon={<Ionicons name="location-outline" size={20} color={colors.textMuted} />} />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}><Input testID="trip-start" label="Start" placeholder="2026-03-12" value={start} onChangeText={setStart} icon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />} /></View>
                  <View style={{ flex: 1 }}><Input testID="trip-end" label="End" placeholder="2026-03-18" value={end} onChangeText={setEnd} icon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />} /></View>
                </View>
              </View>
              <View style={{ height: 24 }} />
              <Button testID="trip-next" title="Add participants" onPress={() => name && dest && start && end ? setStep(1) : Alert.alert("Fill all fields")} />
            </>
          )}
          {step === 1 && (
            <>
              <Text style={styles.h1}>Invite your{"\n"}crew</Text>
              <Text style={styles.sub}>Add friends by name now — share the invite link from the dashboard later.</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
                <View style={{ flex: 1 }}><Input testID="part-input" placeholder="Friend's name" value={partInput} onChangeText={setPartInput} icon={<Ionicons name="person-add-outline" size={18} color={colors.textMuted} />} /></View>
                <TouchableOpacity testID="part-add" onPress={() => { if (partInput.trim()) { setParts([...parts, partInput.trim()]); setPartInput(""); } }} style={styles.addBtn}>
                  <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 20, gap: 10 }}>
                {parts.map((p, i) => (
                  <View key={i} style={styles.partRow}>
                    <View style={styles.partAv}><Text style={{ color: "#fff", fontWeight: "800" }}>{p.charAt(0).toUpperCase()}</Text></View>
                    <Text style={{ flex: 1, fontWeight: "600", color: colors.text }}>{p}</Text>
                    <TouchableOpacity onPress={() => setParts(parts.filter((_, j) => j !== i))}><Ionicons name="close" size={18} color={colors.textMuted} /></TouchableOpacity>
                  </View>
                ))}
                {parts.length === 0 && <Text style={{ color: colors.textFaint, textAlign: "center", marginTop: 18 }}>No participants yet</Text>}
              </View>
              <View style={{ height: 24 }} />
              <Button testID="trip-create" title="Create trip" onPress={submit} loading={loading} />
            </>
          )}
          {step === 2 && (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={56} color="#fff" />
              </View>
              <Text style={[styles.h1, { textAlign: "center", marginTop: 24 }]}>Trip created!</Text>
              <Text style={[styles.sub, { textAlign: "center" }]}>Your crew is ready. Time to add expenses, plan, and explore.</Text>
              <View style={{ height: 32 }} />
              <Button testID="trip-success-go" title="Go to dashboard" onPress={() => router.replace("/(tabs)/trips")} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface2 },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.primary },
  h1: { fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5, lineHeight: 36 },
  sub: { color: colors.textMuted, marginTop: 10, fontSize: 15, lineHeight: 22 },
  addBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 24 },
  partRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  partAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.success, alignItems: "center", justifyContent: "center", shadowColor: colors.success, shadowOpacity: 0.3, shadowRadius: 20 },
});
