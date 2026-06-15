import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

type AuthInputProps = TextInputProps & {
  label: string;
};

export function AuthInput({ label, style, ...props }: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#A09186"
        autoCorrect={false}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: colors.black,
    fontSize: 13,
    fontWeight: '600'
  },
  input: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.black,
    fontSize: 15,
    paddingHorizontal: 14
  }
});
