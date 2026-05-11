import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadow } from "../theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: React.ReactNode;
  full?: boolean;
};

export default function Button({
  title, onPress, variant = "primary", loading, disabled, testID, icon, full = true,
}: Props) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? "#fff" : colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isPrimary || isDanger ? { color: "#fff" } : { color: colors.text },
              variant === "ghost" && { color: colors.primary },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[full && { alignSelf: "stretch" }, disabled && { opacity: 0.5 }]}
      >
        <LinearGradient
          colors={colors.blueGrad as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, shadow.lg]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        full && { alignSelf: "stretch" },
        variant === "secondary" && { backgroundColor: colors.surface2 },
        variant === "ghost" && { backgroundColor: "transparent" },
        isDanger && { backgroundColor: colors.danger },
        disabled && { opacity: 0.5 },
      ]}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 16, fontWeight: "700" },
});
