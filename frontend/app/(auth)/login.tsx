import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/auth";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Login failed", e.message || "Check your credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="login-back" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue planning trips with your crew.</Text>

          <View style={styles.form}>
            <Input testID="login-email" label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
              icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />} />
            <Input testID="login-password" label="Password" placeholder="Your password" secureTextEntry value={password} onChangeText={setPassword}
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />} />
            <TouchableOpacity style={{ alignSelf: "flex-end" }}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button testID="login-submit" title="Log in" onPress={submit} loading={loading} />

          <TouchableOpacity testID="login-go-signup" onPress={() => router.replace("/(auth)/signup")} style={{ alignSelf: "center", marginTop: 22 }}>
            <Text style={styles.bottomLink}>New to TripSplit? <Text style={{ color: colors.primary }}>Sign up</Text></Text>
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
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 10, lineHeight: 22 },
  form: { marginTop: 28, gap: 14, marginBottom: 22 },
  forgot: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  bottomLink: { color: colors.textMuted, fontSize: 14 },
});
