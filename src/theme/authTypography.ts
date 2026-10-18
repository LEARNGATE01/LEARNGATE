import type { TextStyle } from "react-native";

export const POPPINS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

const TITLE_COLOR = "#1A1A1A";
const MUTED_COLOR = "#6B7280";

export const authTypography = {
  /** Screen / card headline, e.g. "Who is using LearnGate?" */
  title: {
    fontFamily: POPPINS.bold,
    fontSize: 22,
    lineHeight: 28,
    color: TITLE_COLOR,
    textAlign: "center",
  },
  /** Supporting line under a title */
  subtitle: {
    fontFamily: POPPINS.medium,
    fontSize: 15,
    lineHeight: 21,
    color: MUTED_COLOR,
    textAlign: "center",
  },
  /** Text inside the bordered input fields */
  input: {
    fontFamily: POPPINS.regular,
    fontSize: 16,
    color: "#1F2937",
  },
  /** Filled / outlined primary button labels */
  button: {
    fontFamily: POPPINS.bold,
    fontSize: 17,
    lineHeight: 22,
  },
  /** Secondary provider label (e.g. Continue with Google) */
  label: {
    fontFamily: POPPINS.semiBold,
    fontSize: 16,
  },
  /** Inline text action (e.g. Forgot password, Back to login) */
  link: {
    fontFamily: POPPINS.semiBold,
    fontSize: 14,
  },
  /** Small all-caps divider / eyebrow text */
  caption: {
    fontFamily: POPPINS.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  /** Inline feedback (error / info / warning) */
  feedback: {
    fontFamily: POPPINS.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
} satisfies Record<string, TextStyle>;
