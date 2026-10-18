/**
 * One-shot guard for the auth auto-redirect chain
 * (RoleSelect -> ParentLogin -> ParentSignUp / ParentResetPassword).
 *
 * The pending flags (pendingParentSignup / pendingPasswordReset) stay true until
 * the user finishes the flow, so a naive `useEffect` re-forwards every time a
 * screen remounts. That made the Back button bounce forward again (and re-show
 * the "email verified" toast). This guard lets each hop fire only once per
 * pending episode; it is reset when nothing is pending so a later episode works.
 */
let step = 0;

export function resetPendingRedirect(): void {
  step = 0;
}

/** Claims a single hop of the chain. Returns false once that hop already ran. */
export function claimPendingRedirect(expectedStep: number): boolean {
  if (step !== expectedStep) {
    return false;
  }
  step = expectedStep + 1;
  return true;
}
