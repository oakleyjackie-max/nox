import { Link, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { NeonText } from "@/components/ui/NeonText";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <NeonText size={20} intensity={0.8}>
          This screen doesn't exist.
        </NeonText>
        <Link href="/" style={styles.link}>
          <NeonText size={14} intensity={0.6}>
            Go to home screen
          </NeonText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
