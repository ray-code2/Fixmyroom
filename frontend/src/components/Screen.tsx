import { SafeAreaView, StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../theme/colors';

export function Screen({ children, style, ...props }: ViewProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white
  },
  container: {
    flex: 1,
    backgroundColor: colors.white
  }
});
