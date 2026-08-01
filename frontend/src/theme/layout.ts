import { BUTTON_SIZE } from './buttonSizes';

/**
 * Layout measures. One source of truth — these numbers are shared between the
 * DashboardShell header and its content column, and must not drift apart.
 */

/** The reading measure for desktop content. The topBar's inner wrapper and the
 *  scroll content column BOTH cap at this, so the page title always sits directly
 *  above the cards it heads. Capping only one of them misaligns the header. */
export const CONTENT_MAX_WIDTH = 1200;

/** Manager decision-pairs (Approve/Decline, Approve/Reject) split this row 50/50 via
 *  flex: 1. The cap is what bounds their growth — the buttons keep flex: 1. */
export const DECISION_ROW_MAX_WIDTH = 420;

/** Horizontal padding shared by the topBar inner wrapper and the content column.
 *  If these two disagree the header and content will not line up, even with an
 *  identical maxWidth. */
export const CONTENT_PADDING_X = 32;

/** Re-exported, NOT redeclared. Button minWidth is per-breakpoint and already lives
 *  in buttonSizes.ts (0 / 180 / 200); hardcoding a second `200` here is exactly the
 *  drift this file exists to prevent. */
export const BUTTON_MIN_WIDTH = BUTTON_SIZE.desktop.minWidth;
