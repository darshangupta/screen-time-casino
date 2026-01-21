import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Typography, Spacing } from '../../../shared/theme';
import { SlotsEngine } from '../../../domain/casino/slots/SlotsEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const { width } = Dimensions.get('window');
const REEL_WIDTH = (width - 80) / 3;

const SlotsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, lastOutcome } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(30);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<[string, string, string]>(['🍒', '🍋', '🍊']);
  const [spinAnimation] = useState(new Animated.Value(0));
  const [glowAnimation] = useState(new Animated.Value(0));
  const [payoutMessage, setPayoutMessage] = useState<string>('');
  
  const slotsEngine = new SlotsEngine();

  useEffect(() => {
    // Glowing effect for the machine
    const glowLoop = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    glowLoop();
  }, []);

  const spin = async () => {
    if (isSpinning || isLoading) return;
    
    setIsSpinning(true);
    setPayoutMessage('');
    dispatch(setLoading(true));

    // Spinning animation
    Animated.timing(spinAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Simulate spinning with random symbols during animation
    const spinInterval = setInterval(() => {
      const randomReels: [string, string, string] = [
        ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '🔔'][Math.floor(Math.random() * 7)],
        ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '🔔'][Math.floor(Math.random() * 7)],
        ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '🔔'][Math.floor(Math.random() * 7)]
      ];
      setReels(randomReels);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Get actual outcome from engine
      const seed = Date.now();
      const outcome = slotsEngine.play({ bet }, seed);
      
      setReels(outcome.display.reels);
      dispatch(setGameOutcome(outcome));
      
      // Set payout message
      if (outcome.result === 'win') {
        setPayoutMessage(`🎉 ${outcome.display.payline} +${outcome.screenTimeDelta} minutes!`);
      } else if (outcome.result === 'loss') {
        setPayoutMessage(`😔 ${outcome.display.payline} ${outcome.screenTimeDelta} minutes`);
      } else {
        setPayoutMessage(`😐 ${outcome.display.payline} No change`);
      }
      
      setIsSpinning(false);
      dispatch(setLoading(false));
      
      // Reset animation
      spinAnimation.setValue(0);
    }, 2000);
  };

  const adjustBet = (amount: number) => {
    const newBet = Math.max(
      slotsEngine.config.minScreenTimeDelta,
      Math.min(slotsEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const glowColor = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.gold, Colors.neonPink],
  });

  const spinRotation = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LUCKY SLOTS</Text>
        <Text style={styles.winRate}>10% Win Rate • Max Win: 2x Bet</Text>
      </View>

      {/* Slot Machine */}
      <Animated.View style={[styles.slotMachine, { borderColor: glowColor }]}>
        <View style={styles.reelsContainer}>
          {reels.map((symbol, index) => (
            <Animated.View
              key={index}
              style={[
                styles.reel,
                isSpinning && { transform: [{ rotateY: spinRotation }] }
              ]}
            >
              <Text style={styles.symbol}>{symbol}</Text>
            </Animated.View>
          ))}
        </View>
        
        {/* Payline indicator */}
        <View style={styles.payline} />
      </Animated.View>

      {/* Payout Display */}
      <View style={styles.payoutContainer}>
        {payoutMessage ? (
          <Text style={[
            styles.payoutMessage,
            lastOutcome?.result === 'win' && { color: Colors.success },
            lastOutcome?.result === 'loss' && { color: Colors.error },
          ]}>
            {payoutMessage}
          </Text>
        ) : (
          <Text style={styles.payoutPlaceholder}>Spin to play!</Text>
        )}
      </View>

      {/* Betting Controls */}
      <View style={styles.bettingContainer}>
        <Text style={styles.betLabel}>Screen Time Bet</Text>
        <View style={styles.betControls}>
          <TouchableOpacity
            style={styles.betButton}
            onPress={() => adjustBet(-10)}
            disabled={bet <= slotsEngine.config.minScreenTimeDelta}
          >
            <Text style={styles.betButtonText}>-10</Text>
          </TouchableOpacity>
          
          <View style={styles.betDisplay}>
            <Text style={styles.betAmount}>{bet}</Text>
            <Text style={styles.betUnit}>minutes</Text>
          </View>
          
          <TouchableOpacity
            style={styles.betButton}
            onPress={() => adjustBet(10)}
            disabled={bet >= slotsEngine.config.maxScreenTimeDelta}
          >
            <Text style={styles.betButtonText}>+10</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spin Button */}
      <TouchableOpacity
        style={[
          styles.spinButton,
          (isSpinning || isLoading) && styles.spinButtonDisabled
        ]}
        onPress={spin}
        disabled={isSpinning || isLoading}
      >
        <Text style={styles.spinButtonText}>
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </Text>
      </TouchableOpacity>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>
          • Three matching symbols win • Higher value symbols pay more
        </Text>
        <Text style={styles.infoText}>
          • Min bet: {slotsEngine.config.minScreenTimeDelta}m • Max bet: {slotsEngine.config.maxScreenTimeDelta}m
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  title: {
    ...Typography.casinoTitle,
    color: Colors.slots.primary,
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  winRate: {
    ...Typography.caption,
    color: Colors.gold,
    fontSize: 12,
  },
  slotMachine: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.large,
    borderWidth: 3,
    borderColor: Colors.gold,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.md,
  },
  reel: {
    width: REEL_WIDTH - 10,
    height: 80,
    backgroundColor: Colors.darkBackground,
    borderRadius: Spacing.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.slots.secondary,
  },
  symbol: {
    fontSize: 36,
    textAlign: 'center',
  },
  payline: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.neonGreen,
    position: 'absolute',
    top: '50%',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  payoutContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    minHeight: 60,
    justifyContent: 'center',
  },
  payoutMessage: {
    ...Typography.gameTitle,
    fontSize: 18,
    textAlign: 'center',
  },
  payoutPlaceholder: {
    ...Typography.gameSubtitle,
    color: Colors.tertiaryText,
  },
  bettingContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  betLabel: {
    ...Typography.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.gold,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  betButton: {
    backgroundColor: Colors.slots.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    minWidth: 60,
  },
  betButtonText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  betDisplay: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  betAmount: {
    ...Typography.casinoTitle,
    fontSize: 32,
    color: Colors.gold,
  },
  betUnit: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  spinButton: {
    backgroundColor: Colors.slots.primary,
    marginHorizontal: Spacing.screenHorizontal,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    alignItems: 'center',
    shadowColor: Colors.slots.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  spinButtonDisabled: {
    backgroundColor: Colors.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  spinButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 20,
    color: Colors.primaryText,
    letterSpacing: 2,
  },
  gameInfo: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  infoText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});

export default SlotsScreen;