import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { RATING_TIERS } from '../utils/social';

type Props = {
  visible: boolean;
  personName: string;
  onClose: () => void;
  onRate: (delta: number) => void;
};

export default function RateVibeModal({ visible, personName, onClose, onRate }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>RATE {personName.toUpperCase()}'S VIBE</Text>
          <Text style={styles.sub}>How were they when you met up tonight?</Text>
          <View style={styles.tierList}>
            {RATING_TIERS.map(tier => (
              <TouchableOpacity
                key={tier.label}
                style={styles.tierBtn}
                onPress={() => { onRate(tier.delta); onClose(); }}
              >
                <Text style={styles.tierTxt}>{tier.label}</Text>
                <Text style={styles.tierDelta}>{tier.delta > 0 ? '+' : ''}{tier.delta}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelTxt}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create;
const styles = S({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card:       { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  title:      { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  sub:        { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, marginTop: 4, marginBottom: 16 },
  tierList:   { gap: 8 },
  tierBtn:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: Colors.border },
  tierTxt:    { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  tierDelta:  { fontSize: 13, fontFamily: Fonts.display, color: Colors.red },
  cancelBtn:  { marginTop: 14, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  cancelTxt:  { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
});
