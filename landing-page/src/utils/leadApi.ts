import { logClientEvent } from './logger';
import type { LeadPayload } from './leadValidation';

type SubmitLeadResult =
  | {
      ok: true;
      mode: 'api' | 'local';
      id: string;
    }
  | {
      ok: false;
      message: string;
    };

const LOCAL_LEADS_KEY = 'fmr_phase1_leads';

export async function submitLead(payload: LeadPayload): Promise<SubmitLeadResult> {
  // Unset on purpose in a static marketing deploy with no backend behind it —
  // leads are then kept in localStorage rather than lost.
  const baseUrl = import.meta.env.VITE_API_URL;

  if (!baseUrl) {
    return saveLeadLocally(payload);
  }

  const apiUrl = `${baseUrl.replace(/\/+$/, '')}/api/leads`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Lead API returned ${response.status}`);
    }

    const data = (await response.json()) as { id?: string };
    return {
      ok: true,
      mode: 'api',
      id: data.id ?? crypto.randomUUID()
    };
  } catch (error) {
    logClientEvent('error', 'lead_api_submit_failed', error, {
      propertyName: payload.propertyName,
      leadType: payload.leadType
    });

    return saveLeadLocally(payload);
  }
}

function saveLeadLocally(payload: LeadPayload): SubmitLeadResult {
  try {
    const id = crypto.randomUUID();
    const existing = window.localStorage.getItem(LOCAL_LEADS_KEY);
    const leads = existing ? (JSON.parse(existing) as Array<LeadPayload & { id: string }>) : [];
    const nextLeads = [{ ...payload, id }, ...leads].slice(0, 100);
    window.localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(nextLeads));
    return { ok: true, mode: 'local', id };
  } catch (error) {
    logClientEvent('error', 'lead_local_save_failed', error);
    return {
      ok: false,
      message: 'We could not save the request in this browser. Please try again.'
    };
  }
}
