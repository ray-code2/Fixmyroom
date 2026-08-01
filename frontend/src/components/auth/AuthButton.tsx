/**
 * Migration shim. AuthButton was a near-duplicate of PrimaryButton — same 52px
 * height, padding and font size, differing only in border radius — so it now
 * delegates to the canonical <Button /> and its duplicate StyleSheet is deleted.
 *
 * Both rendered as pills; <Button /> derives a pill radius from the height token,
 * so the appearance is preserved at every breakpoint.
 *
 * Prefer importing { Button } directly in new code.
 */
export { Button as AuthButton } from '../Button';
