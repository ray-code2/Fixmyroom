import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRoom, type Room } from '../api/roomApi';
import { listIssues } from '../api/issueApi';
import { IssueCard } from '../components/issue/IssueCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useNavigation } from '../navigation/NavigationContext';
import { colors } from '../theme/colors';
import type { EmployeeProfile } from '../types/auth';
import type { IssueSummary } from '../types/issue';

export function RoomDetailScreen({
  roomId,
  token,
  employee,
}: {
  roomId: string;
  token: string;
  employee: EmployeeProfile;
}) {
  const { goBack, navigate } = useNavigation();
  const [room, setRoom] = useState<Room | null>(null);
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [r, allIssues] = await Promise.all([
        getRoom(roomId, token),
        listIssues(token),
      ]);
      setRoom(r);
      setIssues(allIssues.filter((i) => i.unitNumber === r.unitNumber));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load room details.');
    } finally {
      setLoading(false);
    }
  }, [roomId, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openIssue = useCallback(
    (issueId: string) => navigate({ name: 'IssueDetail', issueId }),
    [navigate]
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.backRow}>
          <PrimaryButton label="← Back" variant="secondary" size="sm" inline onPress={goBack} />
        </View>

        {loading && <ActivityIndicator color={colors.coffee} style={{ marginTop: 32 }} />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {room && (
          <>
            {/* Room card */}
            <View style={styles.roomCard}>
              <View style={styles.roomCardHeader}>
                <View style={styles.roomBadge}>
                  <Text style={styles.roomBadgeText}>{room.unitNumber}</Text>
                </View>
                <View style={styles.roomMeta}>
                  <Text style={styles.roomNumber}>Room {room.unitNumber}</Text>
                  {room.floor && <Text style={styles.roomMetaText}>Floor {room.floor}</Text>}
                  {room.unitType && <Text style={styles.roomType}>{room.unitType}</Text>}
                </View>
                <View style={styles.roomIdBox}>
                  <Text style={styles.roomIdLabel}>Room ID</Text>
                  <Text style={styles.roomIdValue} selectable>{room.id}</Text>
                </View>
              </View>
            </View>

            {/* Report issue button — staff and technicians */}
            {(employee.role === 'STAFF') && (
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => navigate({ name: 'CreateIssue' })}
                activeOpacity={0.8}
              >
                <Text style={styles.reportBtnText}>Report Issue in This Room</Text>
              </TouchableOpacity>
            )}

            {/* Recent issues for this room */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Issues in this room</Text>
              {issues.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No reported issues for this room.</Text>
                </View>
              ) : (
                <View style={styles.issueList}>
                  {issues.map(issue => (
                    <IssueCard key={issue.id} issue={issue} onOpen={openIssue} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 60, maxWidth: 760, width: '100%', alignSelf: 'center' },

  errorText: { fontSize: 13, color: colors.danger, fontWeight: '600' },

  roomCard: {
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1,
    borderColor: colors.line, padding: 20,
  },
  roomCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  roomIdBox: { alignSelf: 'flex-start', alignItems: 'flex-end', maxWidth: 130, gap: 2 },
  roomIdLabel: {
    fontSize: 9, fontWeight: '700', color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  roomIdValue: { fontSize: 9, color: colors.muted, textAlign: 'right', lineHeight: 13 },
  roomBadge: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: colors.coffee, alignItems: 'center', justifyContent: 'center',
  },
  roomBadgeText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  roomMeta: { flex: 1, gap: 3 },
  roomNumber: { fontSize: 22, fontWeight: '700', color: colors.black },
  roomMetaText: { fontSize: 13, color: colors.muted },
  roomType: {
    alignSelf: 'flex-start', fontSize: 11, fontWeight: '700',
    color: colors.coffee, backgroundColor: '#F5EDE5',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },

  reportBtn: {
    backgroundColor: colors.coffee, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  reportBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  issueList: { gap: 8 },
  emptyBox: {
    backgroundColor: '#FAFAF8', borderRadius: 12, borderWidth: 1,
    borderColor: colors.line, padding: 20, alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },
  backRow: { alignSelf: 'flex-start' },
});
