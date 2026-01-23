import React, { useState } from 'react';
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
import { PaiGowEngine, Card } from '../../../domain/casino/pai-gow/PaiGowEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

const PaiGowScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(20);
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'revealing' | 'finished'>('betting');
  const [lastOutcome, setLastOutcome] = useState<any>(null);
  const [revealedCards, setRevealedCards] = useState<number>(0);

  const paiGowEngine = new PaiGowEngine();

  const adjustBet = (amount: number) => {
    if (gameState !== 'betting') return;
    
    const newBet = Math.max(
      paiGowEngine.config.minScreenTimeDelta,
      Math.min(paiGowEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const dealCards = async () => {
    if (gameState !== 'betting' || isLoading) return;

    setGameState('dealing');
    dispatch(setLoading(true));

    try {
      const seed = Date.now();
      const outcome = paiGowEngine.play({ bet }, seed);
      
      setLastOutcome(outcome);
      setGameState('revealing');
      setRevealedCards(0);
      
      // Start card reveal animation
      startCardReveal(outcome);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to deal cards. Please try again.');
      setGameState('betting');
    }
    
    dispatch(setLoading(false));
  };

  const startCardReveal = (outcome: any) => {
    const totalCards = 14; // 7 player + 7 dealer cards
    let currentCard = 0;
    
    const revealNextCard = () => {
      if (currentCard < totalCards) {
        setRevealedCards(currentCard + 1);
        currentCard++;
        setTimeout(revealNextCard, 300); // 300ms between each card
      } else {
        // All cards revealed, show final result
        setTimeout(() => {
          setGameState('finished');
          dispatch(setGameOutcome(outcome));
        }, 500);
      }
    };
    
    setTimeout(revealNextCard, 500); // Start after brief delay
  };

  const resetGame = () => {
    setGameState('betting');
    setLastOutcome(null);
    setRevealedCards(0);
  };

  const renderCard = (card: Card, index: number, cardPosition: number = 0) => {
    const shouldReveal = gameState === 'finished' || revealedCards > cardPosition;
    
    if (!shouldReveal && (gameState === 'revealing' || gameState === 'dealing')) {
      return (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.hiddenCard}>
            <Text style={styles.hiddenCardText}>?</Text>
          </View>
        </View>
      );
    }

    // Simple card representation
    const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

    return (
      <View key={index} style={[styles.cardContainer, styles.playingCard]}>
        <Text style={[styles.cardRank, { color: isRed ? Colors.error : Colors.black }]}>
          {card.rank}
        </Text>
        <Text style={[styles.cardSuit, { color: isRed ? Colors.error : Colors.black }]}>
          {suitSymbols[card.suit]}
        </Text>
      </View>
    );
  };

  const renderHand = (cards: Card[], title: string, isDealer = false, startPosition = 0) => {
    return (
      <View style={styles.handContainer}>
        <Text style={styles.handTitle}>{title}</Text>
        <View style={styles.cardsRow}>
          {cards.map((card, index) => renderCard(card, index, startPosition + index))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PAI GOW POKER</Text>
          <Text style={styles.subtitle}>Split 7 cards into high and low hands</Text>
        </View>

        {/* Game Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Bet</Text>
            <Text style={styles.statValue}>{bet}m</Text>
          </View>
          
          {lastOutcome && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Result</Text>
              <Text style={[styles.statValue, { 
                color: lastOutcome.result === 'win' ? Colors.success : 
                       lastOutcome.result === 'loss' ? Colors.error : Colors.gold 
              }]}>
                {lastOutcome.result.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Game Area */}
        {lastOutcome && (
          <View style={styles.gameArea}>
            {/* Dealer Section */}
            <View style={styles.dealerSection}>
              <Text style={styles.sectionTitle}>DEALER</Text>
              {renderHand(lastOutcome.display.dealerHighHand, 'High Hand (5 cards)', true, 0)}
              {renderHand(lastOutcome.display.dealerLowHand, 'Low Hand (2 cards)', true, 5)}
              
              {gameState === 'finished' && (
                <View style={styles.handRanks}>
                  <Text style={styles.handRankText}>High: {lastOutcome.display.dealerHighRank}</Text>
                  <Text style={styles.handRankText}>Low: {lastOutcome.display.dealerLowRank}</Text>
                </View>
              )}
            </View>

            {/* VS Indicator */}
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Player Section */}
            <View style={styles.playerSection}>
              <Text style={styles.sectionTitle}>PLAYER</Text>
              {renderHand(lastOutcome.display.playerHighHand, 'High Hand (5 cards)', false, 7)}
              {renderHand(lastOutcome.display.playerLowHand, 'Low Hand (2 cards)', false, 12)}
              
              {gameState === 'finished' && (
                <View style={styles.handRanks}>
                  <Text style={styles.handRankText}>High: {lastOutcome.display.playerHighRank}</Text>
                  <Text style={styles.handRankText}>Low: {lastOutcome.display.playerLowRank}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Game Controls */}
        {gameState === 'betting' && (
          <View style={styles.controlsContainer}>
            <Text style={styles.betLabel}>Screen Time Bet</Text>
            <View style={styles.betControls}>
              <TouchableOpacity
                style={styles.betButton}
                onPress={() => adjustBet(-5)}
                disabled={bet <= paiGowEngine.config.minScreenTimeDelta}
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
                disabled={bet >= paiGowEngine.config.maxScreenTimeDelta}
              >
                <Text style={styles.betButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.dealButton} onPress={dealCards}>
              <Text style={styles.dealButtonText}>DEAL CARDS</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'dealing' && (
          <View style={styles.controlsContainer}>
            <Text style={styles.dealingText}>Dealing cards...</Text>
          </View>
        )}

        {gameState === 'revealing' && (
          <View style={styles.controlsContainer}>
            <Text style={styles.dealingText}>
              Revealing cards... ({revealedCards}/14)
            </Text>
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
                <Text style={[styles.resultText, { color: Colors.gold }]}>
                  🤝 Push! No change to screen time.
                </Text>
              )}
              
              <View style={styles.handResults}>
                <Text style={styles.handResultText}>
                  High Hand: {lastOutcome.display.handComparison.highHandResult === 'win' ? '✅ Win' : 
                             lastOutcome.display.handComparison.highHandResult === 'lose' ? '❌ Lose' : '🤝 Tie'}
                </Text>
                <Text style={styles.handResultText}>
                  Low Hand: {lastOutcome.display.handComparison.lowHandResult === 'win' ? '✅ Win' : 
                            lastOutcome.display.handComparison.lowHandResult === 'lose' ? '❌ Lose' : '🤝 Tie'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>DEAL AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>
            • Win both hands to gain screen time • Lose both to lose time • Split = push
          </Text>
          <Text style={styles.infoText}>
            • Min bet: {paiGowEngine.config.minScreenTimeDelta}m • Max bet: {paiGowEngine.config.maxScreenTimeDelta}m
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
  gameArea: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.lg,
  },
  dealerSection: {
    backgroundColor: '#6A6A6A', // Light grey background
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.error + '60',
  },
  playerSection: {
    backgroundColor: '#7A7A7A', // Slightly lighter grey
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.success + '60',
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  handContainer: {
    marginBottom: Spacing.md,
  },
  handTitle: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: Spacing.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardContainer: {
    margin: 2,
  },
  playingCard: {
    width: 40,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardRank: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSuit: {
    fontSize: 14,
    marginTop: -2,
  },
  hiddenCard: {
    width: 40,
    height: 56,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenCardText: {
    ...Typography.label,
    color: Colors.primaryText,
    fontSize: 20,
  },
  handRanks: {
    marginTop: Spacing.sm,
  },
  handRankText: {
    ...Typography.caption,
    color: Colors.tertiaryText,
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  vsText: {
    ...Typography.gameTitle,
    color: Colors.gold,
    fontSize: 16,
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
  dealButton: {
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
  dealButtonText: {
    ...Typography.primaryButtonText,
    fontSize: 18,
    color: Colors.primaryText,
    letterSpacing: 1,
  },
  dealingText: {
    ...Typography.gameTitle,
    color: Colors.gold,
    textAlign: 'center',
    fontSize: 18,
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
    marginBottom: Spacing.md,
  },
  handResults: {
    alignItems: 'center',
  },
  handResultText: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginBottom: Spacing.xs,
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

export default PaiGowScreen;