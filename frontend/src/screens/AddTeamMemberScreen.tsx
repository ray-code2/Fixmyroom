import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addEmployee } from '../api/employeeApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueCategory } from '../types/issue';
import { CATEGORY_LABELS } from '../types/issue';

const SPECIALTY_OPTIONS = Object.entries(CATEGORY_LABELS) as [IssueCategory, string][];

type Role = 'STAFF' | 'TECHNICIAN';

const ROLES: Array<{ value: Role; label: string; desc: string }> = [
  { value: 'STAFF',      label: 'Staff',      desc: 'Reports issues, adds notes' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'Gets assigned, resolves issues' },
];

interface Props {
  token: string;
  employee: EmployeeProfile;
}

export function AddTeamMemberScreen({ token }: Props) {
  const { canGoBack, goBack } = useNavigation();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]     = useState('');
  const [notes, setNotes]     = useState('');
  const [role, setRole]       = useState<Role>('STAFF');
  const [specialties, setSpecialties] = useState<IssueCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  function toggleSpecialty(cat: IssueCategory) {
    setSpecialties(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');

    if (name.trim().length < 2) { setError('Enter the team member\'s full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setSubmitting(true);
    try {
      await addEmployee(
        {
          name: name.trim(),
          role,
          email: email.trim().toLowerCase(),
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(role === 'TECHNICIAN' && specialties.length > 0 ? { specialties } : {}),
        },
        token
      );
      setSuccess(`${name.trim()} has been added as ${role.toLowerCase()}.`);
      setName(''); setEmail(''); setPassword(''); setPhone(''); setNotes('');
      setSpecialties([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add team member.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {canGoBack && (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.heading}>Add Team Member</Text>
          <Text style={styles.sub}>
            They'll log in with the email and password you set here.
          </Text>

          {/* Role picker */}
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                  {r.label}
                </Text>
                <Text style={[styles.roleDesc, role === r.value && styles.roleDescActive]}>
                  {r.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <Field label="Full name" value={name} onChangeText={setName}
              placeholder="Arun Technician" autoCapitalize="words" />
            <Field label="Work email" value={email} onChangeText={setEmail}
              placeholder="arun@hotel.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Password" value={password} onChangeText={setPassword}
              placeholder="Set initial password (8+ chars)" secureTextEntry />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone}
              placeholder="+66 000 000 000" keyboardType="phone-pad" />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Night shift, speaks English & Thai…"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Specialties — technicians only; used to recommend the right person when assigning */}
          {role === 'TECHNICIAN' && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Specialties (optional)</Text>
              <Text style={styles.fieldHint}>
                Pick what this technician handles best — issues in these categories will
                recommend them first when assigning.
              </Text>
              <View style={styles.specialtyGrid}>
                {SPECIALTY_OPTIONS.map(([cat, label]) => {
                  const active = specialties.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.specialtyChip, active && styles.specialtyChipActive]}
                      onPress={() => toggleSpecialty(cat)}
                    >
                      <Text style={[styles.specialtyChipText, active && styles.specialtyChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {success}</Text>
              <TouchableOpacity onPress={() => setSuccess('')}>
                <Text style={styles.addAnother}>Add another</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <PrimaryButton
            label="Add Team Member"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string;
  secureTextEntry?: boolean; keyboardType?: 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 48, maxWidth: 760, width: '100%', alignSelf: 'center' },
  backBtn: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.black, lineHeight: 32 },
  sub: { fontSize: 14, color: colors.muted, marginTop: -8 },

  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1, borderRadius: 16, borderWidth: 1.5, borderColor: colors.line,
    padding: 14, gap: 4, backgroundColor: colors.white,
  },
  roleCardActive: { borderColor: colors.coffee, backgroundColor: '#FBF7F4' },
  roleLabel: { fontSize: 14, fontWeight: '700', color: colors.black },
  roleLabelActive: { color: colors.coffee },
  roleDesc: { fontSize: 12, color: colors.muted },
  roleDescActive: { color: colors.coffee + 'AA' },

  fields: { gap: 12 },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1, borderColor: '#D6CFC8', borderRadius: 14,
    padding: 13, fontSize: 14, color: colors.black,
  },
  notesInput: { minHeight: 72 },
  fieldHint: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  specialtyChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: '#F5F0EB', borderWidth: 1.5, borderColor: 'transparent',
  },
  specialtyChipActive: { backgroundColor: '#F6EFE8', borderColor: colors.coffee },
  specialtyChipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  specialtyChipTextActive: { color: colors.coffee },

  error: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  successBox: {
    backgroundColor: colors.successBg, borderRadius: 12,
    padding: 14, gap: 6,
  },
  successText: { fontSize: 14, color: colors.success, fontWeight: '600' },
  addAnother: { fontSize: 13, color: colors.coffee, fontWeight: '600', textDecorationLine: 'underline' },
  cta: { marginTop: 4 },
});
