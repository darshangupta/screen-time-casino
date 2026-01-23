import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../../infrastructure/storage/store';
import { Colors, Typography, Spacing } from '../../shared/theme';
import { FREE_GAMES, PAID_GAMES, DAILY_SPINS_FREE, DAILY_SPINS_PREMIUM, GAME_CONFIG } from '../../shared/constants/games';
import { GameType } from '../../shared/types';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const cardWidth = (width - (Spacing.screenHorizontal * 2) - Spacing.gameCardMargin * 2) / 2;

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface GameCardProps {
  gameType: GameType;
  isPremiumOnly: boolean;
  isLocked: boolean;
  onPress: () => void;
}

const GAME_ICONS: Record<GameType, keyof typeof Ionicons.glyphMap> = {
  slots: 'diamond',
  blackjack: 'card',
  roulette: 'ellipse',
  plinko: 'golf',
  'pai-gow': 'library',
  'math-problems': 'calculator',
  'jewel-mining': 'diamond-outline',
};

const GAME_COLORS: Record<GameType, string> = {
  slots: Colors.slots.primary,
  blackjack: Colors.blackjack.primary,
  roulette: Colors.roulette.primary,
  plinko: Colors.plinko.primary,
  'pai-gow': Colors.paigow.primary,
  'math-problems': Colors.math.primary,
  'jewel-mining': Colors.jewels.primary,
};

const GAME_NAMES: Record<GameType, string> = {
  slots: 'Slots',
  blackjack: 'Blackjack',
  roulette: 'Roulette',
  plinko: 'Plinko',
  'pai-gow': 'Pai Gow',
  'math-problems': 'Math Challenge',
  'jewel-mining': 'Jewel Mining',
};

const GameCard: React.FC<GameCardProps> = ({ gameType, isPremiumOnly, isLocked, onPress }) => {
  const config = GAME_CONFIG[gameType];
  const winRate = Math.round(config.winProbability * 100);

  return (
    <TouchableOpacity
      style={[
        styles.gameCard,
        isLocked && styles.gameCardLocked,
        { borderColor: GAME_COLORS[gameType] }
      ]}
      onPress={onPress}
      disabled={isLocked}
    >
      {isPremiumOnly && (
        <View style={styles.premiumBadge}>
          <Ionicons name="diamond" size={12} color={Colors.gold} />
        </View>
      )}
      
      {isLocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={24} color={Colors.gray} />
        </View>
      )}
      
      <View style={[styles.gameIconContainer, { backgroundColor: GAME_COLORS[gameType] + '20' }]}>
        <Ionicons 
          name={GAME_ICONS[gameType]} 
          size={32} 
          color={GAME_COLORS[gameType]} 
        />
      </View>
      
      <Text style={styles.gameTitle}>{GAME_NAMES[gameType]}</Text>
      
      <View style={styles.gameStats}>
        <Text style={styles.winRate}>{winRate}% Win Rate</Text>
        <Text style={styles.timeRange}>
          {config.minScreenTimeDelta}-{config.maxScreenTimeDelta}m
        </Text>
      </View>
      
      {isLocked && (
        <Text style={styles.lockedText}>Premium Only</Text>
      )}
    </TouchableOpacity>
  );
};

const CasinoFloorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  
  const { profile } = useSelector((state: RootState) => state.user);
  const { dailyStats } = useSelector((state: RootState) => state.casino);
  const { isSubscribed } = useSelector((state: RootState) => state.subscription);
  
  const [selectedBet] = useState(15); // Default bet amount in minutes
  
  const isSubscriber = profile?.isSubscribed || isSubscribed;
  const spinsRemaining = isSubscriber 
    ? DAILY_SPINS_PREMIUM - dailyStats.totalSpinsUsed
    : DAILY_SPINS_FREE - dailyStats.totalSpinsUsed;
  
  const canPlay = spinsRemaining > 0;

  const handleGamePress = (gameType: GameType) => {
    if (!canPlay) {
      Alert.alert(
        'No Spins Remaining',
        isSubscriber 
          ? 'You\'ve used all your spins for today. Come back tomorrow!'
          : 'Upgrade to Premium for more daily spins!'
      );
      return;
    }

    // Navigate to specific game screen
    switch (gameType) {
      case 'slots':
        navigation.navigate('Slots', { bet: selectedBet });
        break;
      case 'blackjack':
        navigation.navigate('Blackjack', { bet: selectedBet });
        break;
      case 'roulette':
        navigation.navigate('Roulette', { bet: selectedBet });
        break;
      case 'plinko':
        navigation.navigate('Plinko', { bet: selectedBet });
        break;
      case 'pai-gow':
        navigation.navigate('PaiGow', { bet: selectedBet });
        break;
      case 'math-problems':
        navigation.navigate('MathProblems', { bet: selectedBet });
        break;
      case 'jewel-mining':
        navigation.navigate('JewelMining', { bet: selectedBet });
        break;
      default:
        console.warn('Unknown game type:', gameType);
    }
  };

  const handlePremiumGamePress = (gameType: GameType) => {
    if (!isSubscriber) {
      Alert.alert(
        'Premium Game',
        'This game requires a Premium subscription. Upgrade now for access to all games and more spins!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }
    
    handleGamePress(gameType);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={Colors.neonBlue} />
            <Text style={styles.statValue}>
              {dailyStats.netScreenTimeChange >= 0 ? '+' : ''}{dailyStats.netScreenTimeChange}m
            </Text>
            <Text style={styles.statLabel}>Today's Change</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="refresh-outline" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>{spinsRemaining}</Text>
            <Text style={styles.statLabel}>Spins Left</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={24} color={Colors.neonGreen} />
            <Text style={styles.statValue}>{dailyStats.winCount}</Text>
            <Text style={styles.statLabel}>Wins Today</Text>
          </View>
        </View>

        {/* Current Screen Time Status */}
        <View style={styles.screenTimeStatus}>
          <Text style={styles.sectionTitle}>Current Limits</Text>
          <View style={styles.screenTimeCard}>
            <View style={styles.screenTimeInfo}>
              <Ionicons name="phone-portrait-outline" size={20} color={Colors.secondaryText} />
              <Text style={styles.screenTimeText}>All Apps: 4h 30m remaining</Text>
            </View>
            <TouchableOpacity style={styles.adjustButton}>
              <Text style={styles.adjustButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Games Section - TEMPORARILY UNLOCKED FOR TESTING */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>All Games (Testing Mode)</Text>
          <View style={styles.gamesGrid}>
            {FREE_GAMES.map((gameType) => (
              <GameCard
                key={gameType}
                gameType={gameType}
                isPremiumOnly={false}
                isLocked={false}
                onPress={() => handleGamePress(gameType)}
              />
            ))}
          </View>
        </View>

        {/* Upgrade CTA */}
        {!isSubscriber && (
          <View style={styles.upgradeSection}>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Ionicons name="diamond" size={24} color={Colors.black} />
              <Text style={styles.upgradeButtonText}>Unlock All Games - $2.99/month</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  statValue: {
    ...Typography.glowText,
    fontSize: 20,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  screenTimeStatus: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.screenTitle,
    fontSize: 22,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  screenTimeCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  screenTimeText: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
  },
  adjustButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.small,
  },
  adjustButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 14,
  },
  gamesSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: cardWidth,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.large,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  gameCardLocked: {
    backgroundColor: Colors.veryDarkGray,
    opacity: 0.6,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.black,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black + '80',
    borderRadius: Spacing.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gameTitle: {
    ...Typography.gameTitle,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  gameStats: {
    alignItems: 'center',
  },
  winRate: {
    ...Typography.caption,
    color: Colors.neonGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  timeRange: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontSize: 10,
  },
  lockedText: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: Spacing.xs,
    fontSize: 10,
  },
  upgradeSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: Spacing.xxl,
  },
  upgradeButton: {
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.large,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeButtonText: {
    ...Typography.primaryButtonText,
    marginLeft: Spacing.sm,
  },
});

export default CasinoFloorScreen;