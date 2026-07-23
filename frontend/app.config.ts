import 'dotenv/config';

export default {
  expo: {
    name: "TripSplit",
    slug: "frontend",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kemurizen.frontend",
    },

    android: {
      package: "com.kemurizen.frontend",
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000",
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000",
        },
      ],
      "expo-font",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      backendUrl: "https://tripslit-main-production.up.railway.app",
      eas: {
        projectId: "53cd212f-740f-4638-98ae-f6e12078910b",
      },
    },
  },
};
