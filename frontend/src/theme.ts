// Centralised theme tokens — Apple Wallet × Airbnb × Revolut
import { Platform } from "react-native";

export const colors = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surface2: "#F1F5F9",
  surface3: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  textFaint: "#94A3B8",
  border: "#E5E7EB",
  primary: "#007AFF",
  primaryDark: "#0058D6",
  teal: "#14B8A6",
  blueGrad: ["#0066FF", "#14B8A6"] as const,
  blueGradSoft: ["#E0F2FE", "#CCFBF1"] as const,
  danger: "#FF3B30",
  dangerSoft: "#FEE2E2",
  success: "#34C759",
  successSoft: "#DCFCE7",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  premium: "#F59E0B",
  black: "#000000",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const font = {
  family: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
  h1: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.5, color: colors.text },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3, color: colors.text },
  h3: { fontSize: 18, fontWeight: "700" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: "400" as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: "500" as const, color: colors.textMuted },
  overline: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: colors.textFaint,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
};

export const shadow = {
  sm: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: "#0066FF",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const ASSETS = {
  onboarding: [
    "https://images.unsplash.com/photo-1776108139547-53b6eb223635?w=900",
    "https://images.unsplash.com/photo-1760892369598-ee19d5a78a13?w=900",
    "https://images.unsplash.com/photo-1776570380445-1a419559f603?w=900",
  ],
  destinations: [
    "https://images.unsplash.com/photo-1724568834522-81eb8e5c048c?w=900",
    "https://images.unsplash.com/photo-1726251678171-c9eddd2331f3?w=900",
  ],
  vendors: [
    "https://images.unsplash.com/photo-1757264119016-7e6b568b810d?w=900",
    "https://images.unsplash.com/photo-1757439401991-2c6c3df38349?w=900",
    "https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=900",
  ],
};
