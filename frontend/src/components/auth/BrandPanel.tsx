import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { SatinLogo } from '../SatinLogo';

const bullets = [
  'Photo-based issue reporting for any property type',
  'Manager-reviewed approval workflow',
  'Technician assignment and accountability',
  'Before/after proof-of-fix records',
  'Full repair history per room or unit',
  'See who fixed what, when, and at what cost',
  'Works for hotels, villas, apartments, and rentals',
  'Reduce repeated problems and guest complaints'
];

export function BrandPanel({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.panel, compact ? styles.compactPanel : null]}>
      <View style={styles.logoRow}>
        <SatinLogo size={compact ? 'sm' : 'lg'} />
      </View>

      <Text style={[styles.headline, compact ? styles.compactHeadline : null]}>
        Fix room issues before they become bad reviews.
      </Text>
      <Text style={styles.copy}>
        Satin. helps property teams turn staff-reported problems into tracked repair tickets,
        manager-approved actions, and a complete fix history per unit.
      </Text>

      <View style={styles.bullets}>
        {bullets.map((bullet) => (
          <View key={bullet} style={styles.bulletRow}>
            <View style={styles.dot} />
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    maxWidth: 560,
    paddingTop: 2,
    paddingBottom: 24
  },
  compactPanel: {
    maxWidth: '100%',
    paddingVertical: 0
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.coffee,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  brand: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '700'
  },
  tagline: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  headline: {
    color: colors.black,
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '700',
    marginTop: 30
  },
  compactHeadline: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: 26
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 18,
    maxWidth: 500
  },
  bullets: {
    gap: 12,
    marginTop: 28
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.coffee
  },
  bulletText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '600'
  }
});
