import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const[name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[error, setError] = useState("");
  const router = useRouter();
  const { signup } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      // Reset error
      setError("");

      // Validation
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      if (name.trim().length < 2) {
        setError("Name must be at least 2 characters");
        return;
      }
      if (!email.trim()) {
        setError("Email is required");
        return;
      }
      if (!validateEmail(email)) {
        setError("Please enter a valid email");
        return;
      }
      if (!password) {
        setError("Password is required");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Registration logic here
      console.log("Registration with:", { name, email, password });

      await signup(name,email,password);

      // Navigate to login after successful registration
      router.push("/(auth)/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.subtitle}>Register your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={(text) => {
                setName(text);
                error && setError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                error && setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                error && setError("");
              }}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <Text style={styles.loginButtonText}>Register </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  welcome: {
    fontSize: 38,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 6,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111",
  },
  errorText: {
    backgroundColor: "#fee",
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: "#c62828",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 36,
  },
  footerText: {
    fontSize: 14,
    color: "#888",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textDecorationLine: "underline",
  },
});