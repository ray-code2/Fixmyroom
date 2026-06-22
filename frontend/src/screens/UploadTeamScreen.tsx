import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { bulkUploadEmployees, downloadTeamTemplate, type BulkUploadRowError } from '../api/employeeApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';

type PickedFile = { uri: string; name: string };

type UploadState =
  | { status: 'idle' }
  | { status: 'picked'; file: PickedFile }
  | { status: 'uploading'; file: PickedFile }
  | { status: 'done'; added: number; failed: number; errors: BulkUploadRowError[] }
  | { status: 'error'; message: string };

export function UploadTeamScreen({ token, employee: _ }: { token: string; employee: EmployeeProfile }) {
  const { goBack } = useNavigation();
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadTeamTemplate(token);
    } catch {
      // silently ignore — browser already shows an error if download fails
    } finally {
      setDownloading(false);
    }
  }

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setState({ status: 'picked', file: { uri: asset.uri, name: asset.name ?? 'team.xlsx' } });
  }

  async function upload() {
    if (state.status !== 'picked') return;
    const { file } = state;
    setState({ status: 'uploading', file });

    try {
      const result = await bulkUploadEmployees(file.uri, file.name, token);
      setState({ status: 'done', added: result.added, failed: result.failed, errors: result.errors });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Upload failed.' });
    }
  }

  function reset() {
    setState({ status: 'idle' });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity onPress={goBack} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Upload Team via Excel</Text>
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
            onPress={() => void handleDownload()}
            disabled={downloading}
            activeOpacity={0.75}
          >
            <Text style={styles.downloadBtnText}>{downloading ? 'Downloading…' : 'Download Excel Template'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Add multiple staff and technicians at once by uploading an Excel file (.xlsx).
        </Text>

        {/* Template instructions */}
        <View style={styles.templateCard}>
          <Text style={styles.templateTitle}>Required columns (in order)</Text>
          {[
            ['A', 'Name', 'Full name, required'],
            ['B', 'Email', 'Work email, required'],
            ['C', 'Role', 'STAFF or TECHNICIAN (all caps)'],
            ['D', 'Phone', 'Optional'],
            ['E', 'Password', 'Min 8 characters, required'],
          ].map(([col, field, note]) => (
            <View key={col} style={styles.colRow}>
              <View style={styles.colBadge}>
                <Text style={styles.colLetter}>{col}</Text>
              </View>
              <View style={styles.colText}>
                <Text style={styles.colField}>{field}</Text>
                <Text style={styles.colNote}>{note}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.templateHint}>Row 1 should be headers. Data starts at row 2.</Text>
        </View>

        {/* File picker */}
        {(state.status === 'idle' || state.status === 'picked') && (
          <>
            <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
              {state.status === 'picked' ? (
                <>
                  <Text style={styles.fileIcon}>📄</Text>
                  <Text style={styles.fileName}>{state.file.name}</Text>
                  <Text style={styles.fileTap}>Tap to change</Text>
                </>
              ) : (
                <>
                  <Text style={styles.fileIcon}>📁</Text>
                  <Text style={styles.filePickLabel}>Tap to select your Excel file</Text>
                  <Text style={styles.fileTap}>.xlsx format</Text>
                </>
              )}
            </TouchableOpacity>

            {state.status === 'picked' && (
              <PrimaryButton label="Upload Team" onPress={() => void upload()} />
            )}
          </>
        )}

        {/* Uploading */}
        {state.status === 'uploading' && (
          <View style={styles.uploadingBox}>
            <Text style={styles.uploadingText}>Uploading {state.file.name}…</Text>
          </View>
        )}

        {/* Results */}
        {state.status === 'done' && (
          <>
            <View style={styles.resultRow}>
              <ResultBadge count={state.added} label="Added" color={colors.success} bg={colors.successBg} />
              {state.failed > 0 && (
                <ResultBadge count={state.failed} label="Failed" color={colors.danger} bg={colors.dangerBg} />
              )}
            </View>

            {state.errors.length > 0 && (
              <View style={styles.errorCard}>
                <Text style={styles.errorCardTitle}>Rows with errors</Text>
                {state.errors.map((e, i) => (
                  <View key={i} style={styles.errorRow}>
                    <Text style={styles.errorRowNum}>Row {e.row}</Text>
                    <View style={styles.errorRowInfo}>
                      <Text style={styles.errorEmail}>{e.email || '—'}</Text>
                      <Text style={styles.errorReason}>{e.reason}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <PrimaryButton label="Upload Another File" onPress={reset} />
            <PrimaryButton label="Done" variant="secondary" onPress={goBack} />
          </>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <>
            <View style={[styles.uploadingBox, { backgroundColor: colors.dangerBg }]}>
              <Text style={[styles.uploadingText, { color: colors.danger }]}>{state.message}</Text>
            </View>
            <PrimaryButton label="Try Again" onPress={reset} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function ResultBadge({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.resultBadge, { backgroundColor: bg }]}>
      <Text style={[styles.resultCount, { color }]}>{count}</Text>
      <Text style={[styles.resultLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 48 },
  backRow: { marginBottom: 4 },
  backText: { color: colors.coffee, fontWeight: '600', fontSize: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.black },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  downloadBtn: {
    borderRadius: 99,
    backgroundColor: colors.coffee,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  templateCard: {
    backgroundColor: '#FAFAF8',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  templateTitle: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  colRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  colBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.coffee, alignItems: 'center', justifyContent: 'center' },
  colLetter: { color: '#fff', fontWeight: '700', fontSize: 13 },
  colText: { flex: 1 },
  colField: { fontSize: 13, fontWeight: '600', color: colors.black },
  colNote: { fontSize: 12, color: colors.muted, marginTop: 1 },
  templateHint: { fontSize: 12, color: colors.muted, marginTop: 4, fontStyle: 'italic' },

  filePicker: {
    borderWidth: 2,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFAF8',
  },
  fileIcon: { fontSize: 36 },
  filePickLabel: { fontSize: 15, fontWeight: '600', color: colors.black },
  fileName: { fontSize: 14, fontWeight: '600', color: colors.coffee },
  fileTap: { fontSize: 12, color: colors.muted },

  uploadingBox: {
    borderRadius: 16,
    backgroundColor: '#F0F9F4',
    padding: 20,
    alignItems: 'center',
  },
  uploadingText: { fontSize: 14, fontWeight: '600', color: colors.success },

  resultRow: { flexDirection: 'row', gap: 12 },
  resultBadge: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  resultCount: { fontSize: 28, fontWeight: '700' },
  resultLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },

  errorCard: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    backgroundColor: colors.dangerBg,
    padding: 14,
    gap: 10,
  },
  errorCardTitle: { fontSize: 12, fontWeight: '700', color: colors.danger, textTransform: 'uppercase' },
  errorRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  errorRowNum: { fontSize: 12, fontWeight: '700', color: colors.danger, width: 44 },
  errorRowInfo: { flex: 1 },
  errorEmail: { fontSize: 13, fontWeight: '600', color: colors.black },
  errorReason: { fontSize: 12, color: colors.danger, marginTop: 2 },
});
