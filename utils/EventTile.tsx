import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface EventTileProps {
  event: any;
  onPress: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export default function EventTile({ event, onPress }: EventTileProps) {
  const { colors } = useTheme();
  
  const safeParticipants = Array.isArray(event.participants)
    ? event.participants.filter((p: any) => p && typeof p === 'object' && p.id && typeof p.id === 'string' && p.id.trim() !== '' && p.name && typeof p.name === 'string' && p.name.trim() !== '')
    : [];

  // Inner component for avatar
  const Avatar = ({ participant }: { participant: Participant }) => {
    if (participant && participant.avatar && typeof participant.avatar === 'string' && participant.avatar.trim() !== '') {
      return <Image source={{ uri: participant.avatar }} style={styles.avatar} />;
    }
    return (
      <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.textTertiary }]}>
        <Ionicons name="person" size={18} color={colors.background} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {event.image_uri ? (
        <Image source={{ uri: event.image_uri }} style={styles.eventImage} />
      ) : (
        <View style={[styles.eventImage, styles.eventImagePlaceholder, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="image" size={32} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.eventInfo}>
        <View style={styles.eventTitleRow}>
          <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
          {event.emoji && <Text style={styles.eventEmoji}>{event.emoji}</Text>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarsRow} contentContainerStyle={{ alignItems: 'center' }}>
          {safeParticipants.map((p: Participant, idx: number) => {
            return (
              <View key={`${p.id}-${idx}`} style={[styles.avatarWrap, { marginLeft: idx === 0 ? 0 : -14, backgroundColor: colors.cardBackground }]}>
                <Avatar participant={p} />
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  eventImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 14,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventEmoji: {
    fontSize: 18,
    marginLeft: 8,
  },
  avatarsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
}); 