import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
  ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';
import FomoBadge from '../components/FomoBadge';

const STEPS = ['contact', 'verify', 'password', 'name', 'birthday', 'username', 'photo', 'role'] as const;
type Step = typeof STEPS[number];

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'newuser';
}

export default function ProfileSetupScreen() {
  const { createProfile, isUsernameTaken, becomeAttendee, becomePromoter } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const demoCode = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [ageError, setAgeError] = useState('');
  const [username, setUsername] = useState('');
  const usernameTouchedRef = useRef(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const [showVenueInput, setShowVenueInput] = useState(false);
  const [venueName, setVenueName] = useState('');

  function next() {
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex(i => Math.max(i - 1, 0));
  }

  function handleUsernameChange(text: string) {
    usernameTouchedRef.current = true;
    setUsername(text);
    setUsernameChecking(true);
    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(() => setUsernameChecking(false), 500);
  }

  function checkBirthdayAndContinue() {
    const d = parseInt(birthDay, 10);
    const m = parseInt(birthMonth, 10);
    const y = parseInt(birthYear, 10);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) {
      setAgeError('Enter a valid date of birth.');
      return;
    }
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear = today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hasHadBirthdayThisYear) age -= 1;

    if (age < 18) {
      setAgeError('FOMO is for ages 18 and up.');
      return;
    }
    setAgeError('');
    next();
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function finishAsAttendee() {
    createProfile({
      contactMethod, contact, password, name, username,
      birthDay: parseInt(birthDay, 10),
      birthMonth: parseInt(birthMonth, 10),
      birthYear: parseInt(birthYear, 10),
      photoUri,
    });
    becomeAttendee();
  }

  function finishAsPromoter() {
    if (!venueName.trim()) return;
    createProfile({
      contactMethod, contact, password, name, username,
      birthDay: parseInt(birthDay, 10),
      birthMonth: parseInt(birthMonth, 10),
      birthYear: parseInt(birthYear, 10),
      photoUri,
    });
    becomePromoter(venueName.trim());
  }

  const usernameTaken = !usernameChecking && username.length > 0 && isUsernameTaken(username);
  const usernameOk = !usernameChecking && username.length > 0 && !usernameTaken;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={20}>

        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.dot, i <= stepIndex && styles.dotOn]} />
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {step === 'contact' && (
            <View style={styles.stepWrap}>
              <FomoBadge size={64} />
              <Text style={styles.title}>JOIN FOMO</Text>
              <Text style={styles.sub}>Sign up with your email or phone number.</Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, contactMethod === 'email' && styles.toggleBtnOn]}
                  onPress={() => setContactMethod('email')}
                >
                  <Text style={[styles.toggleTxt, contactMethod === 'email' && styles.toggleTxtOn]}>EMAIL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, contactMethod === 'phone' && styles.toggleBtnOn]}
                  onPress={() => setContactMethod('phone')}
                >
                  <Text style={[styles.toggleTxt, contactMethod === 'phone' && styles.toggleTxtOn]}>PHONE</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={setContact}
                placeholder={contactMethod === 'email' ? 'you@email.com' : '+234 800 000 0000'}
                placeholderTextColor={Colors.dim}
                autoCapitalize="none"
                keyboardType={contactMethod === 'email' ? 'email-address' : 'phone-pad'}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, !contact.trim() && styles.primaryBtnOff]}
                disabled={!contact.trim()}
                onPress={next}
              >
                <Text style={styles.primaryTxt}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'verify' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>ENTER THE CODE</Text>
              <Text style={styles.sub}>
                We've sent a 6-digit code to <Text style={{ color: '#EDE8DD' }}>{contact || 'your contact'}</Text>.
                {' '}Once a backend is connected, this arrives via {contactMethod === 'email' ? 'email' : 'SMS'}.
                For now, the code is shown below while the server is being built:
              </Text>
              <View style={styles.demoCodeBox}>
                <Text style={styles.demoCodeTxt}>{demoCode}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={codeInput}
                onChangeText={t => { setCodeInput(t); setCodeError(''); }}
                placeholder="6-digit code"
                placeholderTextColor={Colors.dim}
                keyboardType="number-pad"
                maxLength={6}
              />
              {codeError ? <Text style={styles.errorTxt}>{codeError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryBtn, codeInput.length !== 6 && styles.primaryBtnOff]}
                disabled={codeInput.length !== 6}
                onPress={() => {
                  if (codeInput === demoCode) next();
                  else setCodeError('That code doesn\'t match. Check above and try again.');
                }}
              >
                <Text style={styles.primaryTxt}>VERIFY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'password' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>CREATE A PASSWORD</Text>
              <Text style={styles.sub}>
                Heads up — there's no backend yet to securely store this, so don't reuse a password
                you actually rely on elsewhere. This is just to match the flow for now.
              </Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={Colors.dim}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryBtn, password.length < 4 && styles.primaryBtnOff]}
                disabled={password.length < 4}
                onPress={next}
              >
                <Text style={styles.primaryTxt}>CONTINUE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'name' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>WHAT'S YOUR NAME?</Text>
              <Text style={styles.sub}>This is how friends will recognize you.</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={Colors.dim}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.primaryBtn, !name.trim() && styles.primaryBtnOff]}
                disabled={!name.trim()}
                onPress={next}
              >
                <Text style={styles.primaryTxt}>CONTINUE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'birthday' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>WHEN'S YOUR BIRTHDAY?</Text>
              <Text style={styles.sub}>FOMO is nightlife content — you need to be 18 or older.</Text>
              <View style={styles.dobRow}>
                <TextInput style={[styles.input, styles.dobInput]} value={birthDay} onChangeText={t => { setBirthDay(t); setAgeError(''); }} placeholder="DD" placeholderTextColor={Colors.dim} keyboardType="number-pad" maxLength={2} />
                <TextInput style={[styles.input, styles.dobInput]} value={birthMonth} onChangeText={t => { setBirthMonth(t); setAgeError(''); }} placeholder="MM" placeholderTextColor={Colors.dim} keyboardType="number-pad" maxLength={2} />
                <TextInput style={[styles.input, styles.dobInputWide]} value={birthYear} onChangeText={t => { setBirthYear(t); setAgeError(''); }} placeholder="YYYY" placeholderTextColor={Colors.dim} keyboardType="number-pad" maxLength={4} />
              </View>
              {ageError ? <Text style={styles.errorTxt}>{ageError}</Text> : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={checkBirthdayAndContinue}>
                <Text style={styles.primaryTxt}>CONTINUE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'username' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>PICK A USERNAME</Text>
              <Text style={styles.sub}>This is how people find and tag you.</Text>
              <TextInput
                style={styles.input}
                value={username || slugify(name)}
                onChangeText={handleUsernameChange}
                placeholder="username"
                placeholderTextColor={Colors.dim}
                autoCapitalize="none"
              />
              {username.length > 0 && (
                <Text style={[
                  styles.usernameStatus,
                  usernameChecking ? styles.usernameChecking : usernameTaken ? styles.usernameTaken : styles.usernameOk,
                ]}>
                  {usernameChecking ? 'Checking availability...' : usernameTaken ? '✗ Username taken — try another' : '✓ Username available'}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, (!usernameOk) && styles.primaryBtnOff]}
                disabled={!usernameOk}
                onPress={next}
              >
                <Text style={styles.primaryTxt}>CONTINUE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'photo' && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>ADD A PROFILE PHOTO</Text>
              <Text style={styles.sub}>Optional — you can always add one later.</Text>
              <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImg} />
                ) : (
                  <Text style={styles.photoPlus}>+</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowVenueInput(false); next(); }}>
                <Text style={styles.primaryTxt}>{photoUri ? 'CONTINUE' : 'SKIP FOR NOW'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={back}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'role' && (
            <View style={styles.stepWrap}>
              {!showVenueInput ? (
                <>
                  <Text style={styles.title}>ONE LAST THING</Text>
                  <Text style={styles.sub}>What brings you to FOMO?</Text>

                  <TouchableOpacity style={styles.roleCard} onPress={finishAsAttendee} activeOpacity={0.85}>
                    <Text style={styles.roleIcon}>🔥</Text>
                    <Text style={styles.roleTitle}>I'M GOING OUT</Text>
                    <Text style={styles.roleSub}>Find tonight's parties, see what's popping, link up with friends</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.roleCard} onPress={() => setShowVenueInput(true)} activeOpacity={0.85}>
                    <Text style={styles.roleIcon}>📋</Text>
                    <Text style={styles.roleTitle}>I'M AN EVENT OWNER</Text>
                    <Text style={styles.roleSub}>Post your events, sell tickets, track your crowd live</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.title}>YOUR VENUE OR BRAND</Text>
                  <Text style={styles.sub}>What's it called?</Text>
                  <TextInput
                    style={styles.input}
                    value={venueName}
                    onChangeText={setVenueName}
                    placeholder="e.g. FOMO Events"
                    placeholderTextColor={Colors.dim}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.primaryBtn, !venueName.trim() && styles.primaryBtnOff]}
                    disabled={!venueName.trim()}
                    onPress={finishAsPromoter}
                  >
                    <Text style={styles.primaryTxt}>FINISH</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.backLink} onPress={() => setShowVenueInput(false)}>
                    <Text style={styles.backLinkTxt}>← back</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:             { flex: 1, backgroundColor: Colors.bg },
  progressRow:      { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 16, paddingBottom: 6 },
  dot:              { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surface2 },
  dotOn:            { backgroundColor: Colors.red },
  content:          { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 },
  stepWrap:         { alignItems: 'center', gap: 14 },
  title:            { fontSize: 26, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, textAlign: 'center', marginTop: 6 },
  sub:              { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
  input:            { width: '100%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: Fonts.body, color: Colors.cream, marginTop: 4 },
  toggleRow:        { flexDirection: 'row', gap: 8, marginTop: 4 },
  toggleBtn:        { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: Colors.border2 },
  toggleBtnOn:      { backgroundColor: Colors.red, borderColor: Colors.red },
  toggleTxt:        { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  toggleTxtOn:      { color: '#fff' },
  primaryBtn:       { width: '100%', backgroundColor: Colors.red, borderRadius: 5, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  primaryBtnOff:    { backgroundColor: Colors.surface2 },
  primaryTxt:       { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 2 },
  backLink:         { marginTop: 4 },
  backLinkTxt:      { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim },
  errorTxt:         { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.red, textAlign: 'center' },
  demoCodeBox:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.redDim, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 28 },
  demoCodeTxt:      { fontSize: 30, fontFamily: Fonts.display, color: Colors.red, letterSpacing: 6 },
  codeInput:        { textAlign: 'center', fontSize: 20, letterSpacing: 6 },
  dobRow:           { flexDirection: 'row', gap: 8, width: '100%' },
  dobInput:         { flex: 1, textAlign: 'center' },
  dobInputWide:     { flex: 1.4, textAlign: 'center' },
  usernameStatus:   { fontSize: 11, fontFamily: Fonts.bodySemiBold },
  usernameChecking: { color: Colors.dim },
  usernameTaken:    { color: Colors.red },
  usernameOk:       { color: '#7aaa78' },
  photoCircle:      { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoImg:         { width: '100%', height: '100%' },
  photoPlus:        { fontSize: 36, color: Colors.dim },
  roleCard:         { width: '100%', backgroundColor: Colors.surface, borderRadius: 10, padding: 20, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  roleIcon:         { fontSize: 24 },
  roleTitle:        { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  roleSub:          { fontSize: 11, fontFamily: Fonts.body, color: Colors.mid, lineHeight: 16, textAlign: 'left' },
});
