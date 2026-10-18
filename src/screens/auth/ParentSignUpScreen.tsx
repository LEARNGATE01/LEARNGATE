import { useEffect, useState } from "react";
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
import { Checkbox, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegalFooterLinks } from "@/components/legal/LegalFooterLinks";
import { LegalLinkButton } from "@/components/legal/LegalLinkButton";
import { openLegalDocument } from "@/navigation/openLegalDocument";
import { AuthStackParamList } from "@/types/navigation";
import { useAuth } from "@/store/AuthContext";
import { useAppToast } from "@/store/AppToastContext";
import { colors } from "@/theme/theme";
import { authTypography } from "@/theme/authTypography";
import { supabase } from "@/services/supabase";
import { useLocale } from "@/store/LocaleContext";
import { signInWithGoogleOAuth } from "@/services/googleOAuth";
import { completeParentSignup, sendParentSignupVerifyEmail } from "@/services/parentEmailAuth";
import { formatAppError } from "@/utils/errors";

type Props = NativeStackScreenProps<AuthStackParamList, "ParentSignUp">;
type SignUpStep = "email" | "wait" | "complete";

const GREEN = colors.roleSelectGreen;
const SHEET_BG = "#F6F7EC";
const CARD_OVERLAP = 20;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (809 / 1080));

export function ParentSignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isSupabaseConfigured, pendingParentSignup, signOut, holdOnAuth, releaseAuthHold } = useAuth();
  const { t } = useLocale();
  const { showToast } = useAppToast();
  const [step, setStep] = useState<SignUpStep>(pendingParentSignup ? "complete" : "email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (pendingParentSignup) {
      setStep("complete");
      setError(null);
      setSuccessMessage(null);
      showToast(t("auth.signUp.emailVerifiedToast"));
    }
  }, [pendingParentSignup, showToast, t]);

  const handleSendVerify = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(t("auth.signUp.supabaseNotConfigured"));
      return;
    }
    if (!email.trim()) {
      setError(t("auth.signUp.emailRequired"));
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const trimmedEmail = email.trim();
    const { error: sendError } = await sendParentSignupVerifyEmail(trimmedEmail);
    setIsSubmitting(false);

    if (sendError) {
      setError(formatAppError(sendError));
      return;
    }

    setPendingEmail(trimmedEmail);
    setStep("wait");
    setSuccessMessage(t("auth.signUp.waitBody", { email: trimmedEmail }));
    showToast(t("auth.signUp.verifySentToast"));
  };

  const handleResend = async () => {
    const target = pendingEmail ?? email.trim();
    if (!target) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const { error: resendError } = await sendParentSignupVerifyEmail(target);
    setIsSubmitting(false);
    if (resendError) {
      setError(formatAppError(resendError));
      return;
    }
    setSuccessMessage(t("auth.signUp.resendSent"));
    showToast(t("auth.signUp.resendSent"));
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(t("auth.login.googleNeedsSupabase"));
      return;
    }
    setError(null);
    setGoogleBusy(true);
    const { error: oauthError } = await signInWithGoogleOAuth(supabase);
    setGoogleBusy(false);
    if (oauthError) {
      setError(formatAppError(oauthError));
    }
  };

  const handleComplete = async () => {
    if (!password.trim()) {
      setError(t("auth.signUp.emailPasswordRequired"));
      return;
    }
    if (!acceptedLegal) {
      setError(t("auth.signUp.acceptLegalRequired"));
      return;
    }

    setError(null);
    setIsSubmitting(true);
    holdOnAuth();
    const { error: completeError } = await completeParentSignup({
      fullName: fullName.trim(),
      password: password.trim(),
    });

    if (completeError) {
      releaseAuthHold();
      setIsSubmitting(false);
      setError(formatAppError(completeError));
      return;
    }

    const loginEmail = pendingEmail ?? email.trim();
    await signOut();
    showToast(t("auth.signUp.accountCreated"));
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "ParentLogin",
          params: {
            email: loginEmail || undefined,
            notice: t("auth.signUp.accountCreated"),
          },
        },
      ],
    });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrap, { height: HERO_HEIGHT + insets.top, paddingTop: insets.top }]}>
        <Image
          source={require("../../../assets/parent-signup-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="LearnGate Parent Sign Up"
        />
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => navigation.navigate("ParentLogin")}
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
            {step === "complete" ? (
              <Text style={styles.cardTitle}>{t("auth.signUp.completeTitle")}</Text>
            ) : null}
            <Text style={styles.cardSubtitle}>
              {step === "email"
                ? t("auth.signUp.subtitleEmail")
                : step === "wait"
                  ? t("auth.signUp.waitTitle")
                  : t("auth.signUp.completeSubtitle")}
            </Text>

            {step === "email" ? (
              <>
                <View style={styles.field}>
                  <MaterialCommunityIcons name="email-outline" size={22} color={GREEN} style={styles.fieldIcon} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={t("auth.signUp.email")}
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Pressable
                  onPress={() => void handleSendVerify()}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || isSubmitting) && styles.btnPressed,
                    isSubmitting && styles.btnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t("auth.signUp.sendVerify")}
                >
                  <Text style={styles.primaryLabel}>
                    {isSubmitting ? t("auth.signUp.sendingVerify") : t("auth.signUp.sendVerify")}
                  </Text>
                </Pressable>
              </>
            ) : null}

            {step === "wait" ? (
              <Pressable
                onPress={() => void handleResend()}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.outlineBtn,
                  (pressed || isSubmitting) && styles.btnPressed,
                  isSubmitting && styles.btnDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("auth.signUp.resendEmail")}
              >
                <Text style={styles.outlineLabel}>{t("auth.signUp.resendEmail")}</Text>
              </Pressable>
            ) : null}

            {step === "complete" ? (
              <>
                <View style={styles.field}>
                  <MaterialCommunityIcons name="account-outline" size={22} color={GREEN} style={styles.fieldIcon} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={t("auth.signUp.fullName")}
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.field}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color={GREEN} style={styles.fieldIcon} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={t("auth.signUp.password")}
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#9CA3AF"
                    />
                  </Pressable>
                </View>

                <View style={styles.legalRow}>
                  <Checkbox status={acceptedLegal ? "checked" : "unchecked"} onPress={() => setAcceptedLegal((v) => !v)} />
                  <View style={styles.legalTextWrap}>
                    <Text variant="bodySmall" style={styles.legalText}>
                      {t("auth.signUp.legalPrefix")}
                    </Text>
                    <View style={styles.legalLinks}>
                      <LegalLinkButton label={t("auth.signUp.terms")} onPress={() => openLegalDocument("terms")} />
                      <Text variant="bodySmall" style={styles.legalText}>
                        {t("auth.signUp.and")}
                      </Text>
                      <LegalLinkButton label={t("auth.signUp.privacy")} onPress={() => openLegalDocument("privacy")} />
                      <Text variant="bodySmall" style={styles.legalText}>
                        .
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => void handleComplete()}
                  disabled={isSubmitting || !acceptedLegal}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    (pressed || isSubmitting) && styles.btnPressed,
                    (isSubmitting || !acceptedLegal) && styles.btnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t("auth.signUp.createAccount")}
                >
                  <Text style={styles.primaryLabel}>{t("auth.signUp.createAccount")}</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("auth.signUp.or")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {isSupabaseConfigured ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("auth.login.continueWithGoogle")}
                    disabled={googleBusy || isSubmitting}
                    onPress={() => void handleGoogle()}
                    style={({ pressed }) => [
                      styles.googleBtn,
                      (pressed || googleBusy) && styles.btnPressed,
                      googleBusy && styles.btnDisabled,
                    ]}
                  >
                    <Image
                      source={require("../../../assets/google-signin-g.png")}
                      style={styles.googleIcon}
                      accessibilityIgnoresInvertColors
                    />
                    <Text style={styles.googleLabel}>
                      {googleBusy ? t("auth.login.openingGoogle") : t("auth.login.continueWithGoogle")}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}

            {successMessage ? <Text style={styles.info}>{successMessage}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={() => navigation.navigate("ParentLogin")}
              style={({ pressed }) => [styles.backToLogin, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel={t("auth.signUp.backToLogin")}
            >
              <Text style={styles.backToLoginLabel}>{t("auth.signUp.backToLogin")}</Text>
            </Pressable>

            <LegalFooterLinks />
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
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  googleLabel: {
    ...authTypography.label,
    color: "#374151",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    ...authTypography.caption,
    color: "#9CA3AF",
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
  backToLogin: {
    alignItems: "center",
    paddingVertical: 6,
  },
  backToLoginLabel: {
    ...authTypography.link,
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
  info: {
    ...authTypography.feedback,
    color: "#166534",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 4,
  },
  legalTextWrap: {
    flex: 1,
    gap: 2,
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  legalText: {
    color: colors.subtext,
    lineHeight: 20,
  },
});
