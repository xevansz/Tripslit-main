import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

type Msg = { role: "user" | "ai"; text: string };
const SUGGESTIONS = ["Plan a 5-day Bali itinerary", "Split last dinner equally", "Find vegan restaurants nearby", "Safety tips for solo trip"];

export default function TripBuddy() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm TripBuddy. Ask me anything about your trip — splits, plans, vendors, or safety." },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(() => `s-${Date.now()}`);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs, typing]);

  async function send(prompt?: string) {
    const t = (prompt ?? text).trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setText("");
    setTyping(true);
    try {
      const r = await api.aiChat({ session_id: sessionId, message: t });
      setMsgs((m) => [...m, { role: "ai", text: r.reply }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "ai", text: "Sorry, I couldn't reach the assistant. Please try again." }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.aiBadge}>
          <LinearGradient colors={colors.blueGrad as any} style={styles.aiBadgeBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </LinearGradient>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>TripBuddy AI</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <View style={styles.live} />
            <Text style={styles.sub}>Online · Powered by Claude</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={88}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
          {msgs.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, m.role === "user" && { color: "#fff" }]}>{m.text}</Text>
            </View>
          ))}
          {typing && <TypingDots />}
        </ScrollView>

        {msgs.length <= 1 && (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} testID={`suggest-${s}`} onPress={() => send(s)} style={styles.suggestPill}>
                <Text style={styles.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <TextInput testID="chat-input" placeholder="Ask TripBuddy anything..." value={text} onChangeText={setText} placeholderTextColor={colors.textFaint} style={styles.input} multiline />
            <TouchableOpacity testID="chat-voice" style={styles.voice}>
              <Ionicons name="mic" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity testID="chat-send" onPress={() => send()} style={styles.sendBtn}>
            <LinearGradient colors={colors.blueGrad as any} style={styles.sendBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TypingDots() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={[styles.bubble, styles.aiBubble, { flexDirection: "row", gap: 6 }]}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  aiBadge: { width: 44, height: 44 },
  aiBadgeBg: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  sub: { color: colors.textMuted, fontSize: 12, fontWeight: "500" },
  bubble: { maxWidth: "82%", padding: 12, borderRadius: 18, marginBottom: 10 },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  aiBubble: { alignSelf: "flex-start", backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  suggestions: { paddingHorizontal: 18, paddingBottom: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestPill: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
  suggestText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", padding: 14, gap: 10, alignItems: "flex-end", borderTopWidth: 1, borderTopColor: colors.border },
  inputBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 14, minHeight: 44, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10, maxHeight: 90 },
  voice: { padding: 6 },
  sendBtn: { width: 44, height: 44 },
  sendBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
