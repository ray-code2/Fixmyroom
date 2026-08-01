import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const satinIconAsset = require('../assets/satin-icon.png');

type SatinLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  color?: string;
  iconColor?: string;
  textColor?: string;
  badge?: boolean;
};

/**
 * Official standalone Satin. 'S' door icon image with #C7A36B golden sand brand color.
 */
export function SatinLogoIcon({ size = 48, color = '#C7A36B' }: { size?: number; color?: string }) {
  const isWhite = color === '#FFFFFF' || color === '#fff' || color === 'white';

  return (
    <Image
      source={satinIconAsset}
      style={{
        width: size,
        height: size,
        tintColor: isWhite ? '#FFFFFF' : (color || '#C7A36B'),
      }}
      resizeMode="contain"
    />
  );
}

/** White rounded square badge icon with soft elevation shadow */
export function SatinAppBadge({ size = 76, color = '#C7A36B' }: { size?: number; color?: string }) {
  return (
    <View
      style={[
        styles.appBadge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        },
      ]}
    >
      <SatinLogoIcon size={Math.round(size * 0.65)} color={color} />
    </View>
  );
}

export function SatinLogo({
  size = 'md',
  showTagline = true,
  color,
  iconColor = '#C7A36B',
  textColor,
  badge = false,
}: SatinLogoProps) {
  const iconSize = size === 'sm' ? 42 : size === 'lg' ? 72 : 54;
  const badgeSize = size === 'sm' ? 52 : size === 'lg' ? 86 : 66;

  const actualTextColor = textColor || color || colors.black;
  const actualIconColor = iconColor || (color === '#FFFFFF' ? '#FFFFFF' : '#C7A36B');

  const isWhite = actualTextColor === '#FFFFFF' || actualTextColor === '#fff' || actualTextColor === 'white';
  const taglineColor = isWhite ? 'rgba(255, 255, 255, 0.85)' : '#3B2418';

  return (
    <View style={styles.container}>
      {badge ? (
        <SatinAppBadge size={badgeSize} color={actualIconColor} />
      ) : (
        <SatinLogoIcon size={iconSize} color={actualIconColor} />
      )}
      <View style={styles.textColumn}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandText, size === 'sm' && styles.brandSm, size === 'lg' && styles.brandLg, { color: actualTextColor }]}>
            Satin.
          </Text>
        </View>
        {showTagline && (
          <Text style={[styles.tagline, size === 'sm' && styles.taglineSm, size === 'lg' && styles.taglineLg, { color: taglineColor }]}>
            HOTEL & PROPERTY MAINTENANCE PLATFORM
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  appBadge: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B2418',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  textColumn: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  brandSm: {
    fontSize: 26,
  },
  brandLg: {
    fontSize: 44,
  },
  tagline: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginTop: 2,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  taglineSm: {
    fontSize: 8,
    letterSpacing: 0.6,
  },
  taglineLg: {
    fontSize: 12,
    letterSpacing: 1.1,
  },
});
