import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Typography, Spacing } from '../../../shared/theme';
import { MathChallengeEngine, MathProblem } from '../../../domain/casino/math-challenge/MathChallengeEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const MathProblemsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeSpent, setTimeSpent] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastOutcome, setLastOutcome] = useState<any>(null);

  const mathEngine = new MathChallengeEngine();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const adjustBet = (amount: number) => {
    if (gameState !== 'setup') return;
    
    const newBet = Math.max(
      mathEngine.config.minScreenTimeDelta,
      Math.min(mathEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const startGame = async () => {
    if (gameState !== 'setup' || isLoading) return;

    setGameState('playing');
    dispatch(setLoading(true));

    try {
      const seed = Date.now();
      const problemCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3;
      const generatedProblems = mathEngine.generateProblems(difficulty, problemCount, seed);
      
      setProblems(generatedProblems);
      setCurrentProblemIndex(0);
      setUserAnswers([]);
      setTimeSpent([]);
      setStartTime(Date.now());
      startTimer(); // Start the first problem timer

    } catch (error) {
      Alert.alert('Error', 'Failed to generate problems. Please try again.');
      setGameState('setup');
    }
    
    dispatch(setLoading(false));
  };

  const submitAnswer = (answer: number) => {
    const timeForProblem = (Date.now() - startTime) / 1000;
    const newUserAnswers = [...userAnswers, answer];
    const newTimeSpent = [...timeSpent, timeForProblem];
    
    setUserAnswers(newUserAnswers);
    setTimeSpent(newTimeSpent);

    if (currentProblemIndex < problems.length - 1) {
      // Move to next problem
      setCurrentProblemIndex(currentProblemIndex + 1);
      setStartTime(Date.now());
      startTimer(); // Start timer for next problem
    } else {
      // Game finished - calculate results
      finishGame(newUserAnswers, newTimeSpent);
    }
  };

  const finishGame = async (finalAnswers: number[], finalTimeSpent: number[]) => {
    try {
      const seed = Date.now() - (problems.length * 30000); // Approximate seed used for generation
      const outcome = mathEngine.play(
        { bet, difficulty, timeLimit: 300 },
        seed,
        finalAnswers,
        finalTimeSpent
      );
      
      setLastOutcome(outcome);
      setGameState('finished');
      dispatch(setGameOutcome(outcome));
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate results. Please try again.');
      setGameState('setup');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setProblems([]);
    setCurrentProblemIndex(0);
    setUserAnswers([]);
    setTimeSpent([]);
    setLastOutcome(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getTimeLimit = () => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 8;
      case 'hard': return 5;
      default: return 10;
    }
  };

  const startTimer = () => {
    const timeLimit = getTimeLimit();
    setTimeRemaining(timeLimit);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - submit wrong answer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setTimeout(() => submitAnswer(-999), 100); // Invalid answer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getDifficultyColor = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.gold;
      case 'hard': return Colors.error;
    }
  };

  const currentProblem = problems[currentProblemIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MATH CHALLENGE</Text>
          <Text style={styles.subtitle}>Solve problems to win screen time</Text>
        </View>

        {/* Setup Screen */}
        {gameState === 'setup' && (
          <>
            {/* Game Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Bet</Text>
                <Text style={styles.statValue}>{bet}m</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={[styles.statValue, { color: getDifficultyColor(difficulty) }]}>
                  {difficulty.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Difficulty Selection */}
            <View style={styles.difficultyContainer}>
              <Text style={styles.sectionTitle}>Choose Difficulty</Text>
              <View style={styles.difficultyButtons}>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.difficultyButton,
                      { 
                        backgroundColor: difficulty === diff ? getDifficultyColor(diff) : Colors.cardBackground,
                        borderColor: getDifficultyColor(diff)
                      }
                    ]}
                    onPress={() => setDifficulty(diff)}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      { color: difficulty === diff ? Colors.black : getDifficultyColor(diff) }
                    ]}>
                      {diff.toUpperCase()}
                    </Text>
                    <Text style={[
                      styles.difficultyInfo,
                      { color: difficulty === diff ? Colors.black : Colors.secondaryText }
                    ]}>
                      {diff === 'easy' ? '5 problems' : diff === 'medium' ? '4 problems' : '3 problems'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Betting Controls */}
            <View style={styles.controlsContainer}>
              <Text style={styles.betLabel}>Screen Time Bet</Text>
              <View style={styles.betControls}>
                <TouchableOpacity
                  style={styles.betButton}
                  onPress={() => adjustBet(-5)}
                  disabled={bet <= mathEngine.config.minScreenTimeDelta}
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
                  disabled={bet >= mathEngine.config.maxScreenTimeDelta}
                >
                  <Text style={styles.betButtonText}>+5</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>START CHALLENGE</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && currentProblem && (
          <View style={styles.gameArea}>
            {/* Progress and Timer */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  Problem {currentProblemIndex + 1} of {problems.length}
                </Text>
                <View style={[styles.timerContainer, { 
                  backgroundColor: timeRemaining <= 3 ? Colors.error : timeRemaining <= 5 ? Colors.gold : Colors.success 
                }]}>
                  <Text style={styles.timerText}>{timeRemaining}s</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }
                  ]}
                />
              </View>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{currentProblem.question}</Text>
            </View>

            {/* Answer Options */}
            <View style={styles.optionsContainer}>
              {currentProblem.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => submitAnswer(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Difficulty Badge */}
            <View style={styles.difficultyBadge}>
              <Text style={[styles.difficultyBadgeText, { color: getDifficultyColor(difficulty) }]}>
                {difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Results Screen */}
        {gameState === 'finished' && lastOutcome && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultHeader}>
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
                <Text style={[styles.resultText, { color: Colors.gold }]}>
                  🤝 Good Try! No change to screen time.
                </Text>
              )}
            </View>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Correct</Text>
                <Text style={styles.scoreValue}>
                  {lastOutcome.display.totalCorrect}/{lastOutcome.display.totalProblems}
                </Text>
              </View>
              
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Accuracy</Text>
                <Text style={styles.scoreValue}>
                  {Math.round(lastOutcome.display.accuracy * 100)}%
                </Text>
              </View>
              
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Bonus</Text>
                <Text style={styles.scoreValue}>
                  {lastOutcome.display.bonusMultiplier.toFixed(2)}x
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>
            • Higher difficulty = more screen time • Speed bonus for fast answers
          </Text>
          <Text style={styles.infoText}>
            • Min bet: {mathEngine.config.minScreenTimeDelta}m • Max bet: {mathEngine.config.maxScreenTimeDelta}m
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  title: {
    ...Typography.casinoTitle,
    color: Colors.gold,
    fontSize: 24,
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
    borderColor: Colors.gold,
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
  difficultyContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 2,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  difficultyButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  difficultyInfo: {
    ...Typography.caption,
    fontSize: 12,
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
    backgroundColor: Colors.gold,
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
  startButton: {
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
  startButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 18,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  gameArea: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.label,
    color: Colors.secondaryText,
  },
  timerContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.large,
    minWidth: 50,
    alignItems: 'center',
  },
  timerText: {
    ...Typography.primaryButtonText,
    color: Colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.cardBackground,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  questionContainer: {
    backgroundColor: Colors.modalBackground,
    borderRadius: Spacing.borderRadius.large,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  question: {
    ...Typography.gameTitle,
    color: Colors.primaryText,
    textAlign: 'center',
    fontSize: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  optionText: {
    ...Typography.primaryButtonText,
    color: Colors.primaryText,
    fontSize: 18,
  },
  difficultyBadge: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gold,
    marginTop: Spacing.lg,
  },
  difficultyBadgeText: {
    ...Typography.caption,
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resultText: {
    ...Typography.gameTitle,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  scoreLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    ...Typography.gameTitle,
    color: Colors.gold,
    fontSize: 20,
  },
  playAgainButton: {
    backgroundColor: Colors.gold,
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
});

export default MathProblemsScreen;