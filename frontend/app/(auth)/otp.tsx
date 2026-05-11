import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

export default function Otp() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);

  function setAt(i: number, v: string) {
    const c = [...code];
    c[i] = v.replace(/\D/g, "").slice(-1);
    setCode(c);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  async function verify() {
    const value = code.join("");
    if (value.length !== 6) return Alert.alert("Invalid", "Enter all 6 digits");
    setLoading(true);
    try {
      await api.verifyOtp({ email, code: value });
      router.replace("/(auth)/profile-setup");
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <TouchableOpacity testID="otp-back" onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>We sent a 6-digit code to {String(email)}. Use <Text style={{ fontWeight: "700" }}>123456</Text> for demo.</Text>
      </View>

      <View style={styles.codeRow}>
        {code.map((c, i) => (
          <TextInput
            key={i}
            ref={(r) => { refs.current[i] = r; }}
            testID={`otp-input-${i}`}
            value={c}
            onChangeText={(v) => setAt(i, v)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.cell, c ? styles.cellActive : null]}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
        <Button testID="otp-verify" title="Verify" onPress={verify} loading={loading} />
        <TouchableOpacity style={{ alignSelf: "center", marginTop: 18 }}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Resend code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  back: { margin: 24, marginBottom: 0, width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5, marginTop: 14 },
  sub: { color: colors.textMuted, marginTop: 10, fontSize: 15, lineHeight: 22 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, marginTop: 36 },
  cell: {
    width: 48, height: 56, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, textAlign: "center", fontSize: 22, fontWeight: "700", color: colors.text,
  },
  cellActive: { borderColor: colors.primary, backgroundColor: "#fff" },
});
