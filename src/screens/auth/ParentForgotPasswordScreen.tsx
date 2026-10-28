import { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthStackParamList } from "@/types/navigation";
import { useAuth } from "@/store/AuthContext";
import { useAppToast } from "@/store/AppToastContext";
import { useLocale } from "@/store/LocaleContext";
import { colors } from "@/theme/theme";
import { authTypography } from "@/theme/authTypography";
import { supabase } from "@/services/supabase";
import { sendParentPasswordResetEmail } from "@/services/parentEmailAuth";
import { formatAppError } from "@/utils/errors";

type Props = NativeStackScreenProps<AuthStackParamList, "ParentForgotPassword">;

const GREEN = colors.roleSelectGreen;
const SHEET_BG = "#F6F7EC";
const CARD_OVERLAP = 20;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (809 / 1080));

export function ParentForgotPasswordScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { isSupabaseConfigured } = useAuth();
  const { t } = useLocale();
  const { showToast } = useAppToast();
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToLogin = () => {
    navigation.navigate("ParentLogin", { email: email.trim() || undefined });
  };

  const handleSend = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(t("auth.forgotPassword.supabaseNotConfigured"));
      return;
    }
    if (!email.trim()) {
      setError(t("auth.forgotPassword.emailRequired"));
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const trimmed = email.trim();
    const { error: sendError, reason } = await sendParentPasswordResetEmail(trimmed);
    setIsSubmitting(false);

    if (sendError) {
      if (reason === "not_registered") {
        setError(t("auth.forgotPassword.notRegistered"));
        return;
      }
      setError(formatAppError(sendError));
      return;
    }

    setSent(true);
    showToast(t("auth.forgotPassword.sentToast"));
  };

  const submitLabel = isSubmitting
    ? t("auth.forgotPassword.sending")
    : sent
      ? t("auth.forgotPassword.resend")
      : t("auth.forgotPassword.sendLink");

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrap, { height: HERO_HEIGHT + insets.top, paddingTop: insets.top }]}>
        <Image
          source={require("../../../assets/parent-forgot-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel={t("auth.forgotPassword.title")}
        />
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={goToLogin}
          accessibilityRole="button"
          accessibilityLabel={t("auth.login.goBack")}
          hitSlop={12}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("auth.forgotPassword.title")}</Text>
            <Text style={styles.cardSubtitle}>
              {sent ? t("auth.forgotPassword.waitBody", { email: email.trim() }) : t("auth.forgotPassword.subtitle")}
            </Text>

            {!sent ? (
              <View style={styles.field}>
                <MaterialCommunityIcons name="email-outline" size={22} color={GREEN} style={styles.fieldIcon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder={t("auth.forgotPassword.email")}
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : null}

            <Pressable
              onPress={() => void handleSend()}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || isSubmitting) && styles.btnPressed,
                isSubmitting && styles.btnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={submitLabel}
            >
              <Text style={styles.primaryLabel}>{submitLabel}</Text>
            </Pressable>

            <Pressable
              onPress={goToLogin}
              style={({ pressed }) => [styles.outlineBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel={t("auth.forgotPassword.backToLogin")}
            >
              <Text style={styles.outlineLabel}>{t("auth.forgotPassword.backToLogin")}</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SHEET_BG,
  },
  flex: {
    flex: 1,
  },
  headerWrap: {
    width: SCREEN_WIDTH,
    backgroundColor: GREEN,
    overflow: "hidden",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    marginTop: -CARD_OVERLAP,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...authTypography.title,
  },
  cardSubtitle: {
    ...authTypography.subtitle,
    marginBottom: 4,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: GREEN,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  fieldIcon: {
    marginRight: 2,
  },
  fieldInput: {
    ...authTypography.input,
    flex: 1,
    paddingVertical: 12,
  },
  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryLabel: {
    ...authTypography.button,
    color: "#FFFFFF",
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  outlineLabel: {
    ...authTypography.button,
    color: GREEN,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  error: {
    ...authTypography.feedback,
    color: "#B91C1C",
  },
});
