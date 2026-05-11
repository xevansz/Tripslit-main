import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/auth";

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !password) return Alert.alert("Missing fields", "Email and password required");
    setLoading(true);
    try {
      await signUp({ email, password, phone });
      router.push({ pathname: "/(auth)/otp", params: { email } });
    } catch (e: any) {
      Alert.alert("Sign up failed", e.message || "Try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="signup-back" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Create your{"\n"}account</Text>
          <Text style={styles.subtitle}>Join thousands splitting bills, planning trips, and travelling smarter.</Text>

          <View style={styles.form}>
            <Input testID="signup-email" label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
              icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />} />
            <Input testID="signup-phone" label="Phone (optional)" placeholder="+1 555 000 1234" keyboardType="phone-pad" value={phone} onChangeText={setPhone}
              icon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />} />
            <Input testID="signup-password" label="Password" placeholder="Minimum 6 characters" secureTextEntry value={password} onChangeText={setPassword}
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />} />
          </View>

          <Button testID="signup-submit" title="Create account" onPress={submit} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.or}>or continue with</Text><View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity testID="signup-google" style={styles.social}>
              <Ionicons name="logo-google" size={22} color={colors.text} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="signup-apple" style={styles.social}>
              <Ionicons name="logo-apple" size={22} color={colors.text} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity testID="signup-go-login" onPress={() => router.replace("/(auth)/login")} style={{ alignSelf: "center", marginTop: 22 }}>
            <Text style={styles.bottomLink}>Already a user? <Text style={{ color: colors.primary }}>Log in</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24, paddingBottom: 36 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5, lineHeight: 38 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 10, lineHeight: 22 },
  form: { marginTop: 28, gap: 14, marginBottom: 22 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 22, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
  socialRow: { flexDirection: "row", gap: 12 },
  social: {
    flex: 1, height: 54, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#fff",
  },
  socialText: { fontSize: 15, fontWeight: "600", color: colors.text },
  bottomLink: { color: colors.textMuted, fontSize: 14 },
});
