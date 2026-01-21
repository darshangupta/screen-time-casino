import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../infrastructure/storage/store';
import { clearProfile, updatePreferences } from '../../infrastructure/storage/slices/userSlice';
import { Colors, Typography, Spacing } from '../../shared/theme';
// Game name mapping
const GAME_NAMES: Record<string, string> = {
  slots: 'Slots',
  blackjack: 'Blackjack',
  roulette: 'Roulette',
  plinko: 'Plinko',
  'pai-gow': 'Pai Gow',
  'math-problems': 'Math Challenge',
  'jewel-mining': 'Jewel Mining',
};

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { profile, gameHistory, preferences } = useSelector((state: RootState) => state.user);
  const { dailyStats } = useSelector((state: RootState) => state.casino);
  const { isSubscribed } = useSelector((state: RootState) => state.subscription);
  
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const totalGames = gameHistory.length;
  const totalWins = gameHistory.filter(game => game.outcome === 'win').length;
  const totalLosses = gameHistory.filter(game => game.outcome === 'loss').length;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const netScreenTimeChange = gameHistory.reduce((sum, game) => sum + game.screenTimeDelta, 0);

  const recentGames = gameHistory.slice(0, 10);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Screen Time Casino?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => dispatch(clearProfile())
        },
      ]
    );
  };

  const handleToggleSetting = (setting: keyof typeof preferences) => {
    dispatch(updatePreferences({ [setting]: !preferences[setting] }));
  };

  const getGameOutcomeColor = (outcome: 'win' | 'loss' | 'push') => {
    switch (outcome) {
      case 'win': return Colors.success;
      case 'loss': return Colors.error;
      case 'push': return Colors.warning;
      default: return Colors.secondaryText;
    }
  };

  const getGameOutcomeIcon = (outcome: 'win' | 'loss' | 'push') => {
    switch (outcome) {
      case 'win': return 'trending-up';
      case 'loss': return 'trending-down';
      case 'push': return 'remove';
      default: return 'help';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={Colors.gold} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Casino Player</Text>
            <Text style={styles.userEmail}>{profile?.email || 'user@example.com'}</Text>
            <View style={styles.subscriptionBadge}>
              <Ionicons 
                name={isSubscribed ? 'diamond' : 'diamond-outline'} 
                size={16} 
                color={isSubscribed ? Colors.gold : Colors.gray} 
              />
              <Text style={[styles.subscriptionText, { color: isSubscribed ? Colors.gold : Colors.gray }]}>
                {isSubscribed ? 'Premium Member' : 'Free Player'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={Colors.gold} />
              <Text style={styles.statValue}>{totalWins}</Text>
              <Text style={styles.statLabel}>Total Wins</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color={Colors.red} />
              <Text style={styles.statValue}>{totalLosses}</Text>
              <Text style={styles.statLabel}>Total Losses</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="bar-chart" size={24} color={Colors.neonBlue} />
              <Text style={styles.statValue}>{winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={Colors.neonGreen} />
              <Text style={[styles.statValue, { color: netScreenTimeChange >= 0 ? Colors.success : Colors.error }]}>
                {netScreenTimeChange >= 0 ? '+' : ''}{Math.round(netScreenTimeChange / 60 * 10) / 10}h
              </Text>
              <Text style={styles.statLabel}>Net Time</Text>
            </View>
          </View>
        </View>

        {/* Today's Performance */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.todayCard}>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <Text style={styles.todayValue}>{dailyStats.totalGamesPlayed}</Text>
                <Text style={styles.todayLabel}>Games</Text>
              </View>
              <View style={styles.todayStat}>
                <Text style={styles.todayValue}>{dailyStats.winCount}</Text>
                <Text style={styles.todayLabel}>Wins</Text>
              </View>
              <View style={styles.todayStat}>
                <Text style={[styles.todayValue, { color: dailyStats.netScreenTimeChange >= 0 ? Colors.success : Colors.error }]}>
                  {dailyStats.netScreenTimeChange >= 0 ? '+' : ''}{dailyStats.netScreenTimeChange}m
                </Text>
                <Text style={styles.todayLabel}>Change</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Games */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {recentGames.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="dice-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyStateText}>No games played yet</Text>
              <Text style={styles.emptyStateSubtext}>Head to the Casino Floor to start playing!</Text>
            </View>
          ) : (
            <View style={styles.gamesList}>
              {recentGames.map((game, index) => (
                <View key={game.id} style={styles.gameItem}>
                  <View style={styles.gameInfo}>
                    <View style={styles.gameHeader}>
                      <Text style={styles.gameName}>{GAME_NAMES[game.gameType] || game.gameType}</Text>
                      <Text style={styles.gameTime}>
                        {new Date(game.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.gameDetails}>
                      <View style={[styles.outcomeChip, { backgroundColor: getGameOutcomeColor(game.outcome) + '20' }]}>
                        <Ionicons 
                          name={getGameOutcomeIcon(game.outcome)} 
                          size={12} 
                          color={getGameOutcomeColor(game.outcome)} 
                        />
                        <Text style={[styles.outcomeText, { color: getGameOutcomeColor(game.outcome) }]}>
                          {game.outcome.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.screenTimeDelta, { color: game.screenTimeDelta >= 0 ? Colors.success : Colors.error }]}>
                        {game.screenTimeDelta >= 0 ? '+' : ''}{game.screenTimeDelta}m
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity 
            style={styles.settingsHeader}
            onPress={() => setSettingsExpanded(!settingsExpanded)}
          >
            <Text style={styles.sectionTitle}>Settings</Text>
            <Ionicons 
              name={settingsExpanded ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={Colors.secondaryText} 
            />
          </TouchableOpacity>
          
          {settingsExpanded && (
            <View style={styles.settingsContent}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="volume-high-outline" size={20} color={Colors.secondaryText} />
                  <Text style={styles.settingLabel}>Sound Effects</Text>
                </View>
                <Switch
                  value={preferences.soundEnabled}
                  onValueChange={() => handleToggleSetting('soundEnabled')}
                  trackColor={{ false: Colors.darkGray, true: Colors.gold + '40' }}
                  thumbColor={preferences.soundEnabled ? Colors.gold : Colors.gray}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="phone-portrait-outline" size={20} color={Colors.secondaryText} />
                  <Text style={styles.settingLabel}>Vibrations</Text>
                </View>
                <Switch
                  value={preferences.vibrationsEnabled}
                  onValueChange={() => handleToggleSetting('vibrationsEnabled')}
                  trackColor={{ false: Colors.darkGray, true: Colors.gold + '40' }}
                  thumbColor={preferences.vibrationsEnabled ? Colors.gold : Colors.gray}
                />
              </View>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="help-circle-outline" size={20} color={Colors.secondaryText} />
                  <Text style={styles.settingLabel}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.secondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="document-text-outline" size={20} color={Colors.secondaryText} />
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.screenHorizontal,
    backgroundColor: Colors.cardBackground,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.screenTitle,
    fontSize: 22,
    marginBottom: Spacing.xs / 2,
  },
  userEmail: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    marginBottom: Spacing.sm,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.screenTitle,
    fontSize: 20,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.glowText,
    fontSize: 24,
    marginVertical: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
  },
  todaySection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  todayCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayStat: {
    alignItems: 'center',
  },
  todayValue: {
    ...Typography.glowText,
    fontSize: 20,
  },
  todayLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs / 2,
  },
  recentSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  emptyState: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.bodyLarge,
    color: Colors.secondaryText,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  gamesList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  gameItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.veryDarkGray,
  },
  gameInfo: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  gameName: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  gameTime: {
    ...Typography.caption,
    color: Colors.tertiaryText,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outcomeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Spacing.borderRadius.small,
  },
  outcomeText: {
    ...Typography.caption,
    marginLeft: Spacing.xs / 2,
    fontWeight: '600',
    fontSize: 10,
  },
  screenTimeDelta: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  settingsSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.veryDarkGray,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
  },
  signOutSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: Spacing.xxl,
  },
  signOutButton: {
    backgroundColor: Colors.cardBackground,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  signOutText: {
    ...Typography.bodyLarge,
    color: Colors.error,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
});

export default ProfileScreen;