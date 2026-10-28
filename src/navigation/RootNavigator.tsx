import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { navigationRef } from "@/navigation/navigationRef";
import { BlockedReturnDialog } from "@/components/BlockedReturnDialog";
import { ChildAppUsageBridge } from "@/components/ChildAppUsageBridge";
import { ChildScreenLockProvider } from "@/store/ChildScreenLockContext";
import { PushNotificationBridge } from "@/components/PushNotificationBridge";
import { AuthStackNavigator } from "@/navigation/AuthStackNavigator";
import { ParentStackNavigator } from "@/navigation/ParentStackNavigator";
import { ChildTabsNavigator } from "@/navigation/ChildTabsNavigator";
import { useAuth } from "@/store/AuthContext";
import { colors } from "@/theme/theme";

export function RootNavigator() {
  const { appMode, isBootstrapping } = useAuth();
  const paperTheme = useTheme();
  const navigationTheme = useMemo<Theme>(() => {
    const base = paperTheme.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: paperTheme.dark,
      colors: {
        ...base.colors,
        primary: paperTheme.colors.primary,
        background: paperTheme.colors.background,
        card: paperTheme.colors.surface,
        text: paperTheme.colors.onSurface,
        border: paperTheme.colors.outline,
        notification: paperTheme.colors.error,
      },
    };
  }, [paperTheme]);

  if (isBootstrapping) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        {appMode === "auth" ? (
          <AuthStackNavigator />
        ) : appMode === "parent" ? (
          <ParentStackNavigator />
        ) : (
          <ChildScreenLockProvider>
            <ChildTabsNavigator />
            <ChildAppUsageBridge />
            <BlockedReturnDialog />
          </ChildScreenLockProvider>
        )}
      </NavigationContainer>
      <PushNotificationBridge />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
