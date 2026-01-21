import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Typography, Spacing } from '../../../shared/theme';
import { RouletteEngine } from '../../../domain/casino/roulette/RouletteEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 40, 300);

interface RouletteBet {
  type: 'red' | 'black' | 'odd' | 'even' | 'single' | 'dozen' | 'column';
  amount: number;
  value?: number;
}

const RouletteScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'finished'>('betting');
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [wheelAnimation] = useState(new Animated.Value(0));
  const [ballAnimation] = useState(new Animated.Value(0));

  const rouletteEngine = new RouletteEngine();

  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  const getNumberColor = (number: number): 'red' | 'black' | 'green' => {
    if (number === 0) return 'green';
    if (RED_NUMBERS.includes(number)) return 'red';
    return 'black';
  };

  const placeBet = (bet: Omit<RouletteBet, 'amount'>) => {
    if (gameState !== 'betting') return;
    
    const newBet: RouletteBet = { ...bet, amount: betAmount };
    const existingBetIndex = bets.findIndex(b => 
      b.type === bet.type && b.value === bet.value
    );
    
    if (existingBetIndex >= 0) {
      // Add to existing bet
      const updatedBets = [...bets];
      updatedBets[existingBetIndex].amount += betAmount;
      setBets(updatedBets);
    } else {
      // Place new bet
      setBets([...bets, newBet]);
    }
  };

  const clearBets = () => {
    if (gameState !== 'betting') return;
    setBets([]);
  };

  const getTotalBet = () => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  };

  const spin = async () => {
    if (gameState !== 'betting' || bets.length === 0 || isLoading) return;
    
    setGameState('spinning');
    dispatch(setLoading(true));

    // Start wheel spinning animation
    const spinDuration = 3000;
    Animated.parallel([
      Animated.timing(wheelAnimation, {
        toValue: 1,
        duration: spinDuration,
        useNativeDriver: true,
      }),
      Animated.timing(ballAnimation, {
        toValue: 1,
        duration: spinDuration,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      try {
        // Get outcome from engine
        const seed = Date.now();
        const outcome = rouletteEngine.play({ bets }, seed);
        
        setWinningNumber(outcome.display.winningNumber);
        
        // Create result message
        const netResult = outcome.screenTimeDelta;
        const winningColor = outcome.display.winningColor;
        
        let message = `🎯 ${outcome.display.winningNumber} (${winningColor.toUpperCase()})`;
        
        if (netResult > 0) {
          message += `\n🎉 You won +${netResult} minutes!`;
        } else if (netResult < 0) {
          message += `\n😔 You lost ${Math.abs(netResult)} minutes`;
        } else {
          message += `\n🤝 Break even!`;
        }
        
        setResultMessage(message);
        setGameState('finished');
        dispatch(setGameOutcome(outcome));
        
      } catch (error) {
        console.error('Roulette game error:', error);
        setGameState('betting');
      }
      
      dispatch(setLoading(false));
    }, spinDuration);
  };

  const resetGame = () => {
    setGameState('betting');
    setBets([]);
    setWinningNumber(null);
    setResultMessage('');
    wheelAnimation.setValue(0);
    ballAnimation.setValue(0);
  };

  const adjustBetAmount = (amount: number) => {
    const newAmount = Math.max(5, Math.min(50, betAmount + amount));
    setBetAmount(newAmount);
  };

  const wheelRotation = wheelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'], // 4 full rotations
  });

  const ballRotation = ballAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-2160deg'], // 6 full rotations opposite direction
  });

  const RouletteWheel = () => (
    <View style={styles.wheelContainer}>
      <Animated.View style={[styles.wheel, { transform: [{ rotate: wheelRotation }] }]}>
        <View style={styles.wheelInner}>
          <Text style={styles.wheelText}>ROULETTE</Text>
        </View>
      </Animated.View>
      
      {/* Ball */}
      <Animated.View 
        style={[
          styles.ball,
          {
            transform: [{ rotate: ballRotation }]
          }
        ]}
      >
        <View style={styles.ballDot} />
      </Animated.View>
      
      {/* Winning Number Display */}
      {winningNumber !== null && (
        <View style={styles.winningNumberContainer}>
          <View style={[
            styles.winningNumber,
            { backgroundColor: getNumberColor(winningNumber) === 'red' ? Colors.red : 
                               getNumberColor(winningNumber) === 'black' ? Colors.black : 
                               Colors.roulette.primary }
          ]}>
            <Text style={styles.winningNumberText}>{winningNumber}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const BettingBoard = () => (
    <View style={styles.bettingBoard}>
      <Text style={styles.bettingTitle}>Place Your Bets</Text>
      
      {/* Outside Bets */}
      <View style={styles.outsideBets}>
        <View style={styles.outsideBetRow}>
          <TouchableOpacity
            style={[styles.outsideBetButton, { backgroundColor: Colors.red }]}
            onPress={() => placeBet({ type: 'red' })}
          >
            <Text style={styles.outsideBetText}>RED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.outsideBetButton, { backgroundColor: Colors.black }]}
            onPress={() => placeBet({ type: 'black' })}
          >
            <Text style={styles.outsideBetText}>BLACK</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.outsideBetRow}>
          <TouchableOpacity
            style={styles.outsideBetButton}
            onPress={() => placeBet({ type: 'odd' })}
          >
            <Text style={styles.outsideBetText}>ODD</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.outsideBetButton}
            onPress={() => placeBet({ type: 'even' })}
          >
            <Text style={styles.outsideBetText}>EVEN</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.outsideBetRow}>
          <TouchableOpacity
            style={styles.outsideBetButton}
            onPress={() => placeBet({ type: 'dozen', value: 1 })}
          >
            <Text style={styles.outsideBetText}>1st 12</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.outsideBetButton}
            onPress={() => placeBet({ type: 'dozen', value: 2 })}
          >
            <Text style={styles.outsideBetText}>2nd 12</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.outsideBetButton}
            onPress={() => placeBet({ type: 'dozen', value: 3 })}
          >
            <Text style={styles.outsideBetText}>3rd 12</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Straight Up Numbers (simplified - just 0-9 for demo) */}
      <View style={styles.numberGrid}>
        <Text style={styles.numberGridTitle}>Single Numbers (0-9)</Text>
        <View style={styles.numberRow}>
          {Array.from({ length: 10 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.numberButton,
                { backgroundColor: i === 0 ? Colors.roulette.primary : 
                                  getNumberColor(i) === 'red' ? Colors.red : Colors.black }
              ]}
              onPress={() => placeBet({ type: 'single', value: i })}
            >
              <Text style={styles.numberButtonText}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EUROPEAN ROULETTE</Text>
        <Text style={styles.subtitle}>Place your bets and spin!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gameContainer} showsVerticalScrollIndicator={false}>
        {/* Roulette Wheel */}
        <RouletteWheel />

        {/* Game Result */}
        {gameState === 'finished' && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{resultMessage}</Text>
          </View>
        )}

        {/* Betting Controls */}
        {gameState === 'betting' && (
          <>
            {/* Bet Amount Controls */}
            <View style={styles.betAmountContainer}>
              <Text style={styles.betAmountLabel}>Bet Amount: {betAmount} minutes</Text>
              <View style={styles.betAmountControls}>
                <TouchableOpacity
                  style={styles.betAmountButton}
                  onPress={() => adjustBetAmount(-5)}
                  disabled={betAmount <= 5}
                >
                  <Text style={styles.betAmountButtonText}>-5</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.betAmountButton}
                  onPress={() => adjustBetAmount(5)}
                  disabled={betAmount >= 50}
                >
                  <Text style={styles.betAmountButtonText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            <BettingBoard />

            {/* Current Bets Display */}
            {bets.length > 0 && (
              <View style={styles.currentBets}>
                <Text style={styles.currentBetsTitle}>Your Bets ({getTotalBet()}m total)</Text>
                {bets.map((bet, index) => (
                  <Text key={index} style={styles.currentBetText}>
                    {bet.type.toUpperCase()}
                    {bet.value !== undefined ? ` ${bet.value}` : ''}: {bet.amount}m
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {gameState === 'betting' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.clearButton, bets.length === 0 && styles.disabledButton]}
                onPress={clearBets}
                disabled={bets.length === 0}
              >
                <Text style={styles.clearButtonText}>CLEAR BETS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.spinButton,
                  (bets.length === 0 || isLoading || getTotalBet() > rouletteEngine.config.maxScreenTimeDelta) && 
                  styles.disabledButton
                ]}
                onPress={spin}
                disabled={bets.length === 0 || isLoading || getTotalBet() > rouletteEngine.config.maxScreenTimeDelta}
              >
                <Text style={styles.spinButtonText}>
                  {isLoading ? 'SPINNING...' : 'SPIN WHEEL'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'spinning' && (
            <View style={styles.spinningContainer}>
              <Text style={styles.spinningText}>🎲 The wheel is spinning...</Text>
            </View>
          )}

          {gameState === 'finished' && (
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>
          • Red/Black, Odd/Even pay 1:1 • Dozens pay 2:1 • Single numbers pay 35:1
        </Text>
        <Text style={styles.infoText}>
          • Max total bet: {rouletteEngine.config.maxScreenTimeDelta}m
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
    color: Colors.roulette.primary,
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.gameSubtitle,
    color: Colors.gold,
  },
  gameContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: Spacing.xl,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
    position: 'relative',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: Colors.roulette.secondary,
    borderWidth: 8,
    borderColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  wheelInner: {
    width: WHEEL_SIZE - 40,
    height: WHEEL_SIZE - 40,
    borderRadius: (WHEEL_SIZE - 40) / 2,
    backgroundColor: Colors.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.roulette.accent,
  },
  wheelText: {
    ...Typography.gameTitle,
    color: Colors.gold,
    fontSize: 16,
  },
  ball: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ballDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryText,
    marginTop: 15,
    shadowColor: Colors.primaryText,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  winningNumberContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
  },
  winningNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  winningNumberText: {
    ...Typography.gameTitle,
    color: Colors.primaryText,
    fontSize: 20,
  },
  bettingBoard: {
    marginVertical: Spacing.lg,
  },
  bettingTitle: {
    ...Typography.gameTitle,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  outsideBets: {
    marginBottom: Spacing.lg,
  },
  outsideBetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  outsideBetButton: {
    flex: 1,
    backgroundColor: Colors.roulette.secondary,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: Spacing.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  outsideBetText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
    fontSize: 14,
  },
  numberGrid: {
    marginVertical: Spacing.md,
  },
  numberGridTitle: {
    ...Typography.label,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  numberButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  numberButtonText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
    fontSize: 12,
  },
  betAmountContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  betAmountLabel: {
    ...Typography.label,
    color: Colors.gold,
    marginBottom: Spacing.md,
  },
  betAmountControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betAmountButton: {
    backgroundColor: Colors.roulette.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.medium,
    marginHorizontal: Spacing.sm,
  },
  betAmountButtonText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
  },
  currentBets: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.roulette.secondary,
  },
  currentBetsTitle: {
    ...Typography.gameTitle,
    color: Colors.gold,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  currentBetText: {
    ...Typography.bodyMedium,
    color: Colors.primaryText,
    marginBottom: Spacing.xs,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.large,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  resultText: {
    ...Typography.gameTitle,
    fontSize: 16,
    textAlign: 'center',
    color: Colors.primaryText,
    lineHeight: 22,
  },
  actionContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  clearButton: {
    backgroundColor: Colors.darkGray,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    flex: 1,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  clearButtonText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
    fontSize: 14,
  },
  spinButton: {
    backgroundColor: Colors.roulette.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    flex: 2,
    marginLeft: Spacing.sm,
    alignItems: 'center',
    shadowColor: Colors.roulette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  spinButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 16,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: Colors.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  spinningContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  spinningText: {
    ...Typography.gameSubtitle,
    color: Colors.gold,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: Colors.roulette.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.borderRadius.xlarge,
    alignItems: 'center',
  },
  playAgainButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 18,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  gameInfo: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  infoText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});

export default RouletteScreen;