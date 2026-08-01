/**
 * Migration shim. All behaviour — sizing, width rule, variants — now lives in the
 * canonical <Button />; this alias exists so the existing call sites keep working
 * without a mass rename. The old fixed-52px StyleSheet is deleted, not orphaned.
 *
 * Prefer importing { Button } directly in new code.
 */
export { Button as PrimaryButton, type ButtonVariant } from './Button';
