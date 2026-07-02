import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';
import FomoBadge from '../components/FomoBadge';

export default function LoginScreen() {
  const { profile, logIn, resetAllData } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    const ok = logIn(password);
    if (!ok) setError('Wrong password.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.top}>
            <FomoBadge size={80} />
            <Text style={styles.welcome}>WELCOME BACK</Text>
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.handle}>@{profile?.username}</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              placeholder="Password"
              placeholderTextColor={Colors.dim}
              secureTextEntry
              autoFocus
            />
            {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.loginBtn, !password && styles.loginBtnOff]}
              disabled={!password}
              onPress={handleLogin}
            >
              <Text style={styles.loginTxt}>LOG IN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetLink} onPress={resetAllData}>
              <Text style={styles.resetLinkTxt}>Not you? Start fresh instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  content:      { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: 80, paddingBottom: 50 },
  top:          { alignItems: 'center', gap: 4 },
  welcome:      { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2, marginTop: 16 },
  name:         { fontSize: 24, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginTop: 4 },
  handle:       { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim },
  form:         { gap: 10 },
  input:        { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: Fonts.body, color: Colors.cream },
  errorTxt:     { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.red, textAlign: 'center' },
  loginBtn:     { backgroundColor: Colors.red, borderRadius: 5, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  loginBtnOff:  { backgroundColor: Colors.surface2 },
  loginTxt:     { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 2 },
  resetLink:    { alignItems: 'center', marginTop: 16 },
  resetLinkTxt: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim },
});
