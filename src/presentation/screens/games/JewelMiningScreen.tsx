import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Typography, Spacing } from '../../../shared/theme';
import { JewelMiningEngine } from '../../../domain/casino/jewel-mining/JewelMiningEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const { width } = Dimensions.get('window');
const GRID_MARGIN = 40;
const CELL_MARGIN = 4;
const GRID_WIDTH = width - GRID_MARGIN;
const CELL_SIZE = (GRID_WIDTH - CELL_MARGIN * 6) / 4; // 4x4 grid with margins

const GRID_SIZE = 16;

const JewelMiningScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(40);
  const [clickedPositions, setClickedPositions] = useState<number[]>([]);
  const [gameGrid, setGameGrid] = useState<Array<'gem' | 'bomb' | 'hidden'>>(
    new Array(GRID_SIZE).fill('hidden')
  );
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [accumulatedWinnings, setAccumulatedWinnings] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'push' | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));

  const jewelMiningEngine = new JewelMiningEngine();

  useEffect(() => {
    // Pulse animation for the gem symbols
    const pulseLoop = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    pulseLoop();
  }, []);

  const startNewGame = () => {
    setGameState('playing');
    setClickedPositions([]);
    setGameGrid(new Array(GRID_SIZE).fill('hidden'));
    setAccumulatedWinnings(0);
    setGameResult(null);
  };

  const handleCellPress = async (position: number) => {
    if (gameState !== 'playing' || clickedPositions.includes(position) || isLoading) {
      return;
    }

    const newClickedPositions = [...clickedPositions, position];
    setClickedPositions(newClickedPositions);
    dispatch(setLoading(true));

    try {
      // Get outcome from engine
      const seed = Date.now() + position;
      const outcome = jewelMiningEngine.play({ bet, clickedPositions: newClickedPositions }, seed);
      
      // Update grid to show revealed tiles
      const updatedGrid = [...gameGrid];
      outcome.display.revealed.forEach((pos) => {
        updatedGrid[pos] = outcome.display.grid[pos];
      });
      
      setGameGrid(updatedGrid);
      setAccumulatedWinnings(outcome.display.accumulatedWinnings);

      if (outcome.display.finalState === 'lost') {
        // Hit a bomb
        setGameState('finished');
        setGameResult('loss');
        dispatch(setGameOutcome(outcome));
        
        // Show all bombs after a delay
        setTimeout(() => {
          setGameGrid(outcome.display.grid);
        }, 500);
        
      } else if (outcome.display.finalState === 'won') {
        // Max payout reached
        setGameState('finished');
        setGameResult('win');
        dispatch(setGameOutcome(outcome));
        
      } else {
        // Continue playing
        // Player can choose to continue or cash out
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process move. Please try again.');
    }
    
    dispatch(setLoading(false));
  };

  const cashOut = () => {
    if (accumulatedWinnings === 0) {
      setGameResult('push');
    } else {
      setGameResult('win');
    }
    
    setGameState('finished');
    
    // Create final outcome for Redux
    const finalOutcome = {
      result: accumulatedWinnings === 0 ? 'push' as const : 'win' as const,
      screenTimeDelta: accumulatedWinnings,
      displayData: {
        grid: gameGrid,
        revealed: clickedPositions,
        finalState: 'won' as const,
        accumulatedWinnings,
      },
    };
    
    dispatch(setGameOutcome(finalOutcome));
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'betting') return;
    
    const newBet = Math.max(
      jewelMiningEngine.config.minScreenTimeDelta,
      Math.min(jewelMiningEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const resetGame = () => {
    setGameState('betting');
    setClickedPositions([]);
    setGameGrid(new Array(GRID_SIZE).fill('hidden'));
    setAccumulatedWinnings(0);
    setGameResult(null);
  };

  const getCellContent = (position: number) => {
    if (!clickedPositions.includes(position) && gameState !== 'finished') {
      return '?';
    }
    
    const cellType = gameGrid[position];
    switch (cellType) {
      case 'gem':
        return '💎';
      case 'bomb':
        return '💣';
      default:
        return '?';
    }
  };

  const getCellStyle = (position: number) => {
    const isRevealed = clickedPositions.includes(position) || gameState === 'finished';
    const cellType = gameGrid[position];
    
    if (isRevealed && cellType === 'bomb') {
      return [styles.gridCell, styles.bombCell];
    } else if (isRevealed && cellType === 'gem') {
      return [styles.gridCell, styles.gemCell];
    } else if (isRevealed) {
      return [styles.gridCell, styles.revealedCell];
    }
    
    return [styles.gridCell, styles.hiddenCell];
  };

  const maxPossibleWin = bet; // Max payout is the wagered amount
  const gemsNeeded = Math.ceil(maxPossibleWin / (bet * 0.2)); // Gems needed for max payout

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GEM MINING</Text>
          <Text style={styles.subtitle}>Find gems, avoid bombs!</Text>
        </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bet</Text>
          <Text style={styles.statValue}>{bet}m</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Winnings</Text>
          <Animated.Text 
            style={[
              styles.statValue, 
              styles.winningsText,
              { transform: [{ scale: pulseAnimation }] }
            ]}
          >
            {accumulatedWinnings}m
          </Animated.Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max Win</Text>
          <Text style={styles.statValue}>{maxPossibleWin}m</Text>
        </View>
      </View>

      {/* 4x4 Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {Array.from({ length: GRID_SIZE }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={getCellStyle(index)}
              onPress={() => handleCellPress(index)}
              disabled={gameState !== 'playing' || isLoading}
            >
              <Text style={styles.cellText}>{getCellContent(index)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {gameState === 'playing' && (
          <Text style={styles.gridInstructions}>
            Tap cells to reveal gems. Find {gemsNeeded} gems to win max payout! Avoid bombs or lose everything.
          </Text>
        )}
      </View>

      {/* Game Controls */}
      {gameState === 'betting' && (
        <View style={styles.controlsContainer}>
          <Text style={styles.betLabel}>Screen Time Bet</Text>
          <View style={styles.betControls}>
            <TouchableOpacity
              style={styles.betButton}
              onPress={() => adjustBet(-10)}
              disabled={bet <= jewelMiningEngine.config.minScreenTimeDelta}
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
              disabled={bet >= jewelMiningEngine.config.maxScreenTimeDelta}
            >
              <Text style={styles.betButtonText}>+10</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
            <Text style={styles.startButtonText}>START MINING</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'playing' && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.cashOutButton,
              accumulatedWinnings === 0 && styles.cashOutButtonDisabled
            ]}
            onPress={cashOut}
            disabled={accumulatedWinnings === 0}
          >
            <Text style={styles.cashOutButtonText}>
              {accumulatedWinnings > 0 ? `CASH OUT ${accumulatedWinnings}m` : 'NO WINNINGS YET'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'finished' && (
        <View style={styles.controlsContainer}>
          <View style={styles.resultContainer}>
            {gameResult === 'win' && (
              <Text style={[styles.resultText, { color: Colors.success }]}>
                💎 You Won {accumulatedWinnings} minutes! 💎
              </Text>
            )}
            {gameResult === 'loss' && (
              <Text style={[styles.resultText, { color: Colors.error }]}>
                💣 Bomb! You lost {bet} minutes! 💣
              </Text>
            )}
            {gameResult === 'push' && (
              <Text style={[styles.resultText, { color: Colors.gray }]}>
                No gems found. No change to screen time.
              </Text>
            )}
          </View>
          
          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.infoText}>
          • 4 bombs hidden in 16 tiles • Each gem = 20% of bet • Cash out anytime
        </Text>
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  title: {
    ...Typography.casinoTitle,
    color: Colors.jewels.primary,
    fontSize: 26,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.gameSubtitle,
    color: Colors.gold,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.jewels.secondary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.gameTitle,
    color: Colors.primaryText,
    fontSize: 18,
  },
  winningsText: {
    color: Colors.jewels.primary,
  },
  gridContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GRID_WIDTH,
    marginBottom: Spacing.md,
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_MARGIN / 2,
    borderRadius: Spacing.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  hiddenCell: {
    backgroundColor: Colors.modalBackground,
    borderColor: Colors.jewels.secondary,
  },
  revealedCell: {
    backgroundColor: Colors.darkGray,
    borderColor: Colors.gray,
  },
  gemCell: {
    backgroundColor: Colors.jewels.secondary,
    borderColor: Colors.jewels.primary,
    shadowColor: Colors.jewels.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  bombCell: {
    backgroundColor: Colors.darkRed,
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cellText: {
    fontSize: 24,
    textAlign: 'center',
  },
  gridInstructions: {
    ...Typography.bodySmall,
    color: Colors.tertiaryText,
    textAlign: 'center',
    maxWidth: 280,
  },
  controlsContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
  betButton: {
    backgroundColor: Colors.jewels.secondary,
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
    fontSize: 28,
    color: Colors.gold,
  },
  betUnit: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  startButton: {
    backgroundColor: Colors.jewels.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    alignItems: 'center',
    shadowColor: Colors.jewels.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  startButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 18,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  cashOutButton: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  cashOutButtonDisabled: {
    backgroundColor: Colors.darkGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  cashOutButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 16,
    color: Colors.black,
    letterSpacing: 1,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultText: {
    ...Typography.gameTitle,
    fontSize: 18,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: Colors.jewels.primary,
    paddingVertical: Spacing.lg,
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
    alignItems: 'center',
  },
  infoText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    textAlign: 'center',
  },
});

export default JewelMiningScreen;