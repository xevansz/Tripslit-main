import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../src/components/Button";
import { colors } from "../../src/theme";

const CREW = ["Maya", "Jordan", "Priya", "Alex", "Me"];

export default function GroupPaySession() {
  const router = useRouter();
  const { merchant, amount } = useLocalSearchParams<{ merchant: string; amount: string }>();
  const total = parseFloat(amount || "0");
  const [selected, setSelected] = useState<string[]>(["Me", "Maya", "Jordan"]);
  const [split, setSplit] = useState<"equal" | "percent" | "custom">("equal");
  const [step, setStep] = useState<"setup" | "approving" | "processing" | "success">("setup");
  const [approved, setApproved] = useState<string[]>(["Me"]);
  const [seconds, setSeconds] = useState(45);
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step !== "approving") return;
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "approving") {
      const t1 = setTimeout(() => setApproved((a) => [...new Set([...a, "Maya"])]), 1500);
      const t2 = setTimeout(() => setApproved((a) => [...new Set([...a, "Jordan"])]), 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  useEffect(() => {
    if (step === "approving" && approved.length === selected.length) {
      setStep("processing");
      setTimeout(() => {
        setStep("success");
        Animated.spring(successScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
      }, 1400);
    }
  }, [approved, step, selected.length]);

  function toggleMember(m: string) {
    setSelected((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);
  }

  const share = selected.length ? total / selected.length : 0;

  if (step === "success") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Animated.View style={[styles.success, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark" size={64} color="#fff" />
          </Animated.View>
          <Text style={[styles.title, { textAlign: "center", marginTop: 24 }]}>Payment successful</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, textAlign: "center" }}>${total.toFixed(2)} paid to {merchant}</Text>

          <View style={styles.receipt}>
            <Text style={styles.rTitle}>DIGITAL RECEIPT</Text>
            <View style={styles.rRow}><Text style={styles.rL}>Merchant</Text><Text style={styles.rV}>{merchant}</Text></View>
            <View style={styles.rRow}><Text style={styles.rL}>Total</Text><Text style={styles.rV}>${total.toFixed(2)}</Text></View>
            <View style={styles.rRow}><Text style={styles.rL}>Members</Text><Text style={styles.rV}>{selected.length}</Text></View>
            <View style={styles.rRow}><Text style={styles.rL}>Per person</Text><Text style={styles.rV}>${share.toFixed(2)}</Text></View>
            <View style={[styles.rRow, { marginTop: 8 }]}><Text style={styles.rL}>Reference</Text><Text style={styles.rV}>TS{Date.now().toString().slice(-8)}</Text></View>
          </View>

          <View style={{ height: 24 }} />
          <Button testID="gp-done" title="Done" onPress={() => router.replace("/(tabs)/home")} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === "processing") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={styles.processing}><LinearGradient colors={colors.blueGrad as any} style={styles.processingInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="lock-closed" size={36} color="#fff" />
          </LinearGradient></View>
          <Text style={[styles.title, { marginTop: 28 }]}>Processing payment</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>Encrypted · PIN verified</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="gp-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Group Pay</Text>
        {step === "approving" ? (
          <View style={styles.timer}><Text style={styles.timerT}>{seconds}s</Text></View>
        ) : <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 16 }}>
        <View style={styles.merchCard}>
          <View style={styles.merchIcon}><Ionicons name="storefront" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.merchName}>{merchant}</Text>
            <Text style={styles.merchSub}>Bali · Trip linked: Bali Crew 2026</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountL}>TOTAL TO PAY</Text>
          <Text style={styles.amountV}>${total.toFixed(2)}</Text>
          <View style={styles.shareRow}>
            <Ionicons name="people" size={14} color={colors.textMuted} />
            <Text style={styles.shareT}>${share.toFixed(2)} × {selected.length} members</Text>
          </View>
        </View>

        <Text style={styles.section}>Select members</Text>
        <View style={{ gap: 8 }}>
          {CREW.map((c) => {
            const isSel = selected.includes(c);
            const isApp = approved.includes(c);
            return (
              <TouchableOpacity key={c} testID={`gp-member-${c}`} onPress={() => step === "setup" && toggleMember(c)}
                style={[styles.memRow, isSel && styles.memRowSel]} activeOpacity={0.85}>
                <View style={styles.memAv}><Text style={{ color: "#fff", fontWeight: "800" }}>{c.charAt(0)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memName}>{c}</Text>
                  <Text style={styles.memSub}>{isSel ? `Pays $${share.toFixed(2)}` : "Excluded"}</Text>
                </View>
                {step === "approving" ? (
                  isApp ? <View style={styles.approvedTag}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.approvedT}>APPROVED</Text></View>
                  : <View style={styles.pendingTag}><Text style={styles.pendingT}>PENDING…</Text></View>
                ) : (
                  <View style={[styles.checkbox, isSel && styles.checkboxSel]}>
                    {isSel && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {step === "setup" && (
          <>
            <Text style={styles.section}>Split method</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["equal", "percent", "custom"] as const).map((s) => (
                <TouchableOpacity key={s} testID={`gp-split-${s}`} onPress={() => setSplit(s)}
                  style={[styles.split, split === s && styles.splitActive]}>
                  <Text style={[styles.splitT, split === s && { color: "#fff" }]}>
                    {s === "equal" ? "Equal" : s === "percent" ? "%" : "Custom"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.security}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.securityT}>End-to-end encrypted · Biometric required</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.payBar}>
        {step === "setup" ? (
          <Button testID="gp-request-approval" title={`Request approval from ${selected.length}`} onPress={() => {
            if (selected.length === 0) return Alert.alert("Pick members");
            setStep("approving");
          }} />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="hourglass" size={20} color={colors.warning} />
            <Text style={{ flex: 1, color: colors.textMuted, fontSize: 13 }}>Waiting for {selected.length - approved.length} member(s) to approve…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  timer: { paddingHorizontal: 12, height: 30, borderRadius: 15, backgroundColor: colors.warningSoft, alignItems: "center", justifyContent: "center" },
  timerT: { color: colors.warning, fontWeight: "800", fontSize: 12 },
  merchCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  merchIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  merchName: { fontSize: 16, fontWeight: "800", color: colors.text },
  merchSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amountCard: { padding: 22, borderRadius: 22, backgroundColor: "#0F172A", alignItems: "center" },
  amountL: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  amountV: { color: "#fff", fontSize: 44, fontWeight: "800", marginTop: 6, letterSpacing: -1 },
  shareRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  shareT: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  section: { fontSize: 16, fontWeight: "800", color: colors.text },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  memRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  memRowSel: { borderColor: colors.primary, backgroundColor: "#F0F9FF" },
  memAv: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  memName: { fontWeight: "700", color: colors.text },
  memSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  checkboxSel: { backgroundColor: colors.primary, borderColor: colors.primary },
  approvedTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: colors.success },
  approvedT: { color: "#fff", fontSize: 9, fontWeight: "800" },
  pendingTag: { paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: colors.warningSoft, justifyContent: "center" },
  pendingT: { color: colors.warning, fontSize: 9, fontWeight: "800" },
  split: { flex: 1, height: 44, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  splitActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  splitT: { fontWeight: "700", fontSize: 13, color: colors.text },
  security: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.successSoft },
  securityT: { color: colors.success, fontSize: 12, fontWeight: "700" },
  payBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border },
  success: { width: 130, height: 130, borderRadius: 65, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  receipt: { marginTop: 28, padding: 18, borderRadius: 18, backgroundColor: colors.surface, alignSelf: "stretch" },
  rTitle: { fontSize: 11, fontWeight: "800", color: colors.textFaint, letterSpacing: 1.5, marginBottom: 12 },
  rRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rL: { color: colors.textMuted, fontSize: 13 },
  rV: { color: colors.text, fontWeight: "700", fontSize: 13 },
  processing: { width: 100, height: 100 },
  processingInner: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
});
