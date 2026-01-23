import React, { useState, useRef, useCallback } from 'react';
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
import { PlinkoEngine } from '../../../domain/casino/plinko/PlinkoEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const { width, height } = Dimensions.get('window');
const BOARD_WIDTH = width - 80; // Smaller board
const BOARD_HEIGHT = height * 0.35; // Good board size
const PEG_SIZE = 8;
const SLOT_HEIGHT = 50;
const BALL_SIZE = 12;
const ROWS = 10; // Reduced from 12 to 10 rows
const SLOTS = 11; // Match engine's 11 slots

// Physics constants tuned to match GitHub original feel
const PHYSICS = {
  gravity: 0.8, // Stronger gravity for better movement
  friction: 0.5,
  frictionAir: 0.002, // Much lower air resistance
  restitution: 0.7,
  pegRadius: PEG_SIZE / 2,
  ballRadius: BALL_SIZE / 2,
};

const PlinkoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(20);
  const [gameState, setGameState] = useState<'betting' | 'dropping' | 'finished'>('betting');
  const [lastOutcome, setLastOutcome] = useState<any>(null);
  const [chipPath, setChipPath] = useState<{row: number; position: number}[]>([]);
  
  // Animated ball position
  const ballX = useRef(new Animated.Value(BOARD_WIDTH / 2)).current;
  const ballY = useRef(new Animated.Value(20)).current;
  const ballOpacity = useRef(new Animated.Value(0)).current;

  const plinkoEngine = new PlinkoEngine();


  const animateBallDrop = useCallback((enginePath: {row: number; position: number}[], finalSlot: number) => {
    // Start position with proper initial velocity
    let posX = BOARD_WIDTH / 2 - BALL_SIZE / 2;
    let posY = 30;
    let velocityX = (Math.random() - 0.5) * 3; // Moderate horizontal movement
    let velocityY = 2; // Initial downward velocity
    
    // Reset position
    ballX.setValue(posX);
    ballY.setValue(posY);
    
    // Show ball
    Animated.timing(ballOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Generate peg positions matching engine's 12 rows
    const pegPositions: {x: number; y: number; row: number; pegIndex: number}[] = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 2; // Start with 2, increase each row (matches engine logic)
      const rowY = (row * (BOARD_HEIGHT - 120)) / ROWS + 80;
      for (let peg = 0; peg < pegsInRow; peg++) {
        const pegX = (BOARD_WIDTH / 2) - ((pegsInRow - 1) * 30) / 2 + (peg * 30);
        pegPositions.push({ x: pegX, y: rowY, row, pegIndex: peg });
      }
    }
    
    // Calculate target slot position for final destination
    const slotWidth = BOARD_WIDTH / SLOTS;
    const targetSlotX = finalSlot * slotWidth + (slotWidth / 2) - (BALL_SIZE / 2);
    
    // Final destination alignment based on engine outcome
    // (Natural physics will mostly handle the path, with final guidance)
    
    // Simple physics simulation based on GitHub original approach
    const frameRate = 60;
    const frameTime = 1000 / frameRate;
    let frame = 0;
    const maxFrames = 300; // ~5 seconds at 60fps
    
    const simulateFrame = () => {
      // Check if animation should end
      if (frame >= maxFrames || posY > BOARD_HEIGHT - 30) {
        if (posY > BOARD_HEIGHT - 30) {
          // Snap to final slot for alignment
          posX = targetSlotX;
          posY = BOARD_HEIGHT - 25;
          ballX.setValue(posX);
          ballY.setValue(posY);
          
          Animated.timing(ballOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }).start(() => {
            setGameState('finished');
          });
          return;
        }
      }
      
      // Simple physics: gravity and air resistance
      velocityY += PHYSICS.gravity;
      velocityX *= (1 - PHYSICS.frictionAir);
      velocityY *= (1 - PHYSICS.frictionAir);
      
      // Light guidance toward final slot in lower half (to ensure correct outcome)
      if (posY > BOARD_HEIGHT * 0.6) {
        const distanceToTarget = targetSlotX - (posX + BALL_SIZE / 2);
        const guidance = distanceToTarget * 0.002; // Very light guidance
        velocityX += guidance;
      }
      
      // Update position
      posX += velocityX;
      posY += velocityY;
      
      // Simple collision detection with pegs
      for (const peg of pegPositions) {
        const dx = posX + BALL_SIZE/2 - peg.x;
        const dy = posY + BALL_SIZE/2 - peg.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < PHYSICS.pegRadius + PHYSICS.ballRadius + 2) {
          // Simple bounce physics
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(velocityX*velocityX + velocityY*velocityY) * PHYSICS.restitution;
          
          velocityX = Math.cos(angle) * speed;
          velocityY = Math.sin(angle) * speed;
          
          // Ensure some downward motion
          if (velocityY < 0.3) {
            velocityY = 0.3;
          }
          
          // Separate from peg
          const separationDistance = PHYSICS.pegRadius + PHYSICS.ballRadius + 3;
          posX = peg.x + Math.cos(angle) * separationDistance - BALL_SIZE/2;
          posY = peg.y + Math.sin(angle) * separationDistance - BALL_SIZE/2;
          
          break;
        }
      }
      
      // Boundary collisions
      if (posX < 0) {
        posX = 0;
        velocityX = -velocityX * PHYSICS.restitution;
      } else if (posX > BOARD_WIDTH - BALL_SIZE) {
        posX = BOARD_WIDTH - BALL_SIZE;
        velocityX = -velocityX * PHYSICS.restitution;
      }
      
      // Update animated values
      ballX.setValue(posX);
      ballY.setValue(posY);
      
      frame++;
      setTimeout(simulateFrame, frameTime);
    };
    
    // Start simulation after ball appears
    setTimeout(simulateFrame, 300);
  }, [ballX, ballY, ballOpacity]);

  const adjustBet = (amount: number) => {
    if (gameState !== 'betting') return;
    
    const newBet = Math.max(
      plinkoEngine.config.minScreenTimeDelta,
      Math.min(plinkoEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const dropChip = async () => {
    if (gameState !== 'betting' || isLoading) return;

    setGameState('dropping');
    dispatch(setLoading(true));

    try {
      const seed = Date.now();
      const outcome = plinkoEngine.play({ bet }, seed);
      
      // Store outcome for when animation completes
      setLastOutcome(outcome);
      setChipPath(outcome.display.chipPosition);
      
      // Start physics animation with final slot guidance
      animateBallDrop(outcome.display.chipPosition, outcome.display.finalSlot);
      
      // Dispatch outcome when animation completes (handled in animateBallDrop callback)
      setTimeout(() => {
        dispatch(setGameOutcome(outcome));
      }, 3000);

    } catch (error) {
      Alert.alert('Error', 'Failed to drop chip. Please try again.');
      setGameState('betting');
    }
    
    dispatch(setLoading(false));
  };

  const resetGame = () => {
    setGameState('betting');
    setLastOutcome(null);
    setChipPath([]);
    ballOpacity.setValue(0);
    ballX.stopAnimation();
    ballY.stopAnimation();
  };

  const renderPlinkoBoard = () => {
    const pegs: React.ReactElement[] = [];
    
    // Generate pegs matching engine's 12 rows
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 2; // Start with 2 pegs, increase each row (matches engine logic)
      const rowY = (row * (BOARD_HEIGHT - 120)) / ROWS + 80; // Better spacing for 12 rows
      
      for (let peg = 0; peg < pegsInRow; peg++) {
        const pegX = (BOARD_WIDTH / 2) - ((pegsInRow - 1) * 30) / 2 + (peg * 30); // Tighter spacing for more pegs
        
        pegs.push(
          <View
            key={`peg-${row}-${peg}`}
            style={[
              styles.peg,
              {
                left: pegX - PEG_SIZE / 2,
                top: rowY - PEG_SIZE / 2,
              },
            ]}
          />
        );
      }
    }

    return pegs;
  };

  const renderAnimatedBall = () => {
    return (
      <Animated.View
        style={[
          styles.animatedBall,
          {
            transform: [
              { translateX: ballX },
              { translateY: ballY },
            ],
            opacity: ballOpacity,
          },
        ]}
      />
    );
  };

  const renderMultiplierSlots = () => {
    const multipliers = [0.1, 0.3, 0.5, 1.0, 1.5, 2.0, 1.5, 1.0, 0.5, 0.3, 0.1]; // Match engine's multipliers exactly
    return multipliers.map((multiplier, index) => {
      const slotWidth = BOARD_WIDTH / SLOTS;
      const isWinningSlot = lastOutcome?.display.finalSlot === index && gameState === 'finished';
      
      return (
        <View
          key={`slot-${index}`}
          style={[
            styles.multiplierSlot,
            {
              width: slotWidth,
              backgroundColor: isWinningSlot ? Colors.gold : getSlotColor(multiplier),
              borderColor: isWinningSlot ? Colors.gold : Colors.gray,
              borderWidth: isWinningSlot ? 3 : 1,
            },
          ]}
        >
          <Text style={[
            styles.multiplierText, 
            isWinningSlot && { 
              color: Colors.black,
              fontWeight: 'bold',
              fontSize: 14,
            }
          ]}>
            {multiplier}x
          </Text>
        </View>
      );
    });
  };

  const getSlotColor = (multiplier: number) => {
    if (multiplier >= 2.0) return Colors.neonGreen + '40';
    if (multiplier >= 1.0) return Colors.neonBlue + '40';
    if (multiplier >= 0.5) return Colors.gold + '40';
    return Colors.red + '40';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PLINKO</Text>
          <Text style={styles.subtitle}>Drop the chip and watch it bounce!</Text>
        </View>

        {/* Game Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Bet</Text>
            <Text style={styles.statValue}>{bet}m</Text>
          </View>
          
          {lastOutcome && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Multiplier</Text>
              <Text style={[styles.statValue, { color: Colors.gold }]}>
                {lastOutcome.display.multiplier}x
              </Text>
            </View>
          )}
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Max Win</Text>
            <Text style={styles.statValue}>{Math.round(bet * 2)}m</Text>
          </View>
        </View>

        {/* Plinko Board */}
        <View style={styles.boardContainer}>
          <View style={styles.plinkoBoard}>
            {renderPlinkoBoard()}
            {renderAnimatedBall()}
          </View>
          
          {/* Multiplier Slots */}
          <View style={styles.multiplierRow}>
            {renderMultiplierSlots()}
          </View>
        </View>

        {/* Game Controls */}
        {gameState === 'betting' && (
          <View style={styles.controlsContainer}>
            <Text style={styles.betLabel}>Screen Time Bet</Text>
            <View style={styles.betControls}>
              <TouchableOpacity
                style={styles.betButton}
                onPress={() => adjustBet(-5)}
                disabled={bet <= plinkoEngine.config.minScreenTimeDelta}
              >
                <Text style={styles.betButtonText}>-5</Text>
              </TouchableOpacity>
              
              <View style={styles.betDisplay}>
                <Text style={styles.betAmount}>{bet}</Text>
                <Text style={styles.betUnit}>minutes</Text>
              </View>
              
              <TouchableOpacity
                style={styles.betButton}
                onPress={() => adjustBet(5)}
                disabled={bet >= plinkoEngine.config.maxScreenTimeDelta}
              >
                <Text style={styles.betButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.dropButton} onPress={dropChip}>
              <Text style={styles.dropButtonText}>DROP CHIP</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'dropping' && (
          <View style={styles.controlsContainer}>
            <Text style={styles.droppingText}>Chip is dropping...</Text>
          </View>
        )}

        {gameState === 'finished' && lastOutcome && (
          <View style={styles.controlsContainer}>
            <View style={styles.resultContainer}>
              {lastOutcome.result === 'win' && (
                <Text style={[styles.resultText, { color: Colors.success }]}>
                  🎉 You Won {lastOutcome.screenTimeDelta} minutes! 🎉
                </Text>
              )}
              {lastOutcome.result === 'loss' && (
                <Text style={[styles.resultText, { color: Colors.error }]}>
                  💸 You Lost {Math.abs(lastOutcome.screenTimeDelta)} minutes! 💸
                </Text>
              )}
              {lastOutcome.result === 'push' && (
                <Text style={[styles.resultText, { color: Colors.gray }]}>
                  Even! No change to screen time.
                </Text>
              )}
            </View>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>DROP ANOTHER</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>
            • Higher multipliers in center slots • Edge slots have lower payouts
          </Text>
          <Text style={styles.infoText}>
            • Min bet: {plinkoEngine.config.minScreenTimeDelta}m • Max bet: {plinkoEngine.config.maxScreenTimeDelta}m
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
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.sm, // Reduced padding
    paddingHorizontal: Spacing.screenHorizontal,
  },
  title: {
    ...Typography.casinoTitle,
    color: Colors.plinko.primary,
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
    marginBottom: Spacing.sm, // Reduced margin
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.plinko.secondary,
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
  boardContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.sm, // Reduced margin
  },
  plinkoBoard: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    position: 'relative',
    backgroundColor: Colors.modalBackground,
    borderRadius: Spacing.borderRadius.large,
    borderWidth: 2,
    borderColor: Colors.plinko.secondary,
  },
  peg: {
    position: 'absolute',
    width: PEG_SIZE,
    height: PEG_SIZE,
    borderRadius: PEG_SIZE / 2,
    backgroundColor: Colors.plinko.primary,
    shadowColor: Colors.plinko.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  multiplierRow: {
    flexDirection: 'row',
    width: BOARD_WIDTH,
    marginTop: Spacing.sm,
  },
  multiplierSlot: {
    height: SLOT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  multiplierText: {
    ...Typography.caption, // Smaller font size
    color: Colors.primaryText,
    fontWeight: 'bold',
    fontSize: 12, // Even smaller than caption
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
    backgroundColor: Colors.plinko.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    minWidth: 50,
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
  dropButton: {
    backgroundColor: Colors.plinko.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Spacing.borderRadius.xlarge,
    alignItems: 'center',
    shadowColor: Colors.plinko.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  dropButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 18,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  droppingText: {
    ...Typography.gameTitle,
    color: Colors.gold,
    textAlign: 'center',
    fontSize: 20,
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
    backgroundColor: Colors.plinko.primary,
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
    paddingBottom: Spacing.xxl,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  animatedBall: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
});

export default PlinkoScreen;