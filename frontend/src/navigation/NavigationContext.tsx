import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

// ── Screen registry ──────────────────────────────────────────────────────────

export type AppScreen =
  | { name: 'Dashboard' }
  | { name: 'Profile' }
  | { name: 'IssueList'; filter?: string }
  | { name: 'IssueDetail'; issueId: string; refreshKey?: number }
  | { name: 'CreateIssue' }
  | { name: 'AssignTechnician'; issueId: string }
  | { name: 'AddTeamMember' }
  | { name: 'ManageTeam' }
  | { name: 'UploadTeam' }
  | { name: 'UpdateStatus'; issueId: string; currentStatus: string }
  | { name: 'Finance' };

type StackEntry = AppScreen;

// ── State ────────────────────────────────────────────────────────────────────

type NavState = { stack: StackEntry[] };
type NavAction =
  | { type: 'PUSH'; screen: AppScreen }
  | { type: 'POP' }
  | { type: 'REPLACE_TOP'; screen: AppScreen }
  | { type: 'RESET' };

function reducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'PUSH':
      return { stack: [...state.stack, action.screen] };
    case 'POP':
      return state.stack.length > 1
        ? { stack: state.stack.slice(0, -1) }
        : state;
    case 'REPLACE_TOP':
      return state.stack.length > 0
        ? { stack: [...state.stack.slice(0, -1), action.screen] }
        : { stack: [action.screen] };
    case 'RESET':
      return { stack: [{ name: 'Dashboard' }] };
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

type NavContextValue = {
  current: AppScreen;
  canGoBack: boolean;
  navigate: (screen: AppScreen) => void;
  goBack: () => void;
  replace: (screen: AppScreen) => void;
  reset: () => void;
};

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { stack: [{ name: 'Dashboard' }] });

  const navigate = useCallback((screen: AppScreen) => {
    dispatch({ type: 'PUSH', screen });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'POP' });
  }, []);

  const replace = useCallback((screen: AppScreen) => {
    dispatch({ type: 'REPLACE_TOP', screen });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo<NavContextValue>(() => ({
    current: state.stack[state.stack.length - 1] ?? { name: 'Dashboard' },
    canGoBack: state.stack.length > 1,
    navigate,
    goBack,
    replace,
    reset,
  }), [state.stack, navigate, goBack, replace, reset]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNavigation must be inside NavigationProvider.');
  return ctx;
}
