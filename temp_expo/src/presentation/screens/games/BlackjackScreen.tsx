import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Typography, Spacing } from '../../../shared/theme';
import { BlackjackEngine } from '../../../domain/casino/blackjack/BlackjackEngine';
import { setGameOutcome, setLoading } from '../../../infrastructure/storage/slices/casinoSlice';
import { RootState } from '../../../infrastructure/storage/store';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

const BlackjackScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.casino);
  const [bet, setBet] = useState(30);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'push' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [dealAnimation] = useState(new Animated.Value(0));

  const blackjackEngine = new BlackjackEngine();

  const playHand = async () => {
    if (gameState !== 'betting' || isLoading) return;
    
    setGameState('playing');
    dispatch(setLoading(true));

    // Animation for dealing cards
    Animated.timing(dealAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      try {
        // Get outcome from engine (engine handles the entire hand automatically)
        const seed = Date.now();
        const outcome = blackjackEngine.play({ bet }, seed);
        
        setPlayerHand(outcome.display.playerHand);
        setDealerHand(outcome.display.dealerHand);
        setPlayerTotal(outcome.display.playerTotal);
        setDealerTotal(outcome.display.dealerTotal);
        
        // Set game result and message
        switch (outcome.display.gameState) {
          case 'player_win':
            setGameResult('win');
            setResultMessage(`🎉 You Win! +${outcome.screenTimeDelta} minutes`);
            break;
          case 'dealer_bust':
            setGameResult('win');
            setResultMessage(`🎉 Dealer Bust! +${outcome.screenTimeDelta} minutes`);
            break;
          case 'player_bust':
            setGameResult('loss');
            setResultMessage(`💥 Bust! ${outcome.screenTimeDelta} minutes`);
            break;
          case 'dealer_win':
            setGameResult('loss');
            setResultMessage(`😔 Dealer Wins! ${outcome.screenTimeDelta} minutes`);
            break;
          case 'push':
            setGameResult('push');
            setResultMessage(`🤝 Push! No change to screen time`);
            break;
        }
        
        setGameState('finished');
        dispatch(setGameOutcome(outcome));
        
      } catch (error) {
        console.error('Blackjack game error:', error);
        setGameState('betting');
      }
      
      dispatch(setLoading(false));
      dealAnimation.setValue(0);
    }, 1000);
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'betting') return;
    
    const newBet = Math.max(
      blackjackEngine.config.minScreenTimeDelta,
      Math.min(blackjackEngine.config.maxScreenTimeDelta, bet + amount)
    );
    setBet(newBet);
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerTotal(0);
    setDealerTotal(0);
    setGameResult(null);
    setResultMessage('');
  };

  const getCardColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? Colors.red : Colors.primaryText;
  };

  const CardComponent: React.FC<{ card: Card; hidden?: boolean; index: number }> = ({ 
    card, 
    hidden = false, 
    index 
  }) => (
    <Animated.View 
      style={[
        styles.card,
        {
          transform: [
            {
              scale: dealAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
                extrapolate: 'clamp',
              }),
            },
            {
              translateY: dealAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50 * (index + 1), 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      {hidden ? (
        <View style={styles.cardBack}>
          <Text style={styles.cardBackText}>🂠</Text>
        </View>
      ) : (
        <View style={styles.cardFront}>
          <Text style={[styles.cardRank, { color: getCardColor(card.suit) }]}>
            {card.rank}
          </Text>
          <Text style={[styles.cardSuit, { color: getCardColor(card.suit) }]}>
            {card.suit}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const HandComponent: React.FC<{ 
    title: string; 
    cards: Card[]; 
    total: number; 
    hideFirstCard?: boolean 
  }> = ({ 
    title, 
    cards, 
    total, 
    hideFirstCard = false 
  }) => (
    <View style={styles.handContainer}>
      <Text style={styles.handTitle}>{title}</Text>
      <View style={styles.handCards}>
        {cards.map((card, index) => (
          <CardComponent
            key={`${card.suit}${card.rank}${index}`}
            card={card}
            hidden={hideFirstCard && index === 1}
            index={index}
          />
        ))}
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>
          {hideFirstCard && cards.length > 1 ? '?' : total}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BLACKJACK</Text>
        <Text style={styles.subtitle}>Beat the dealer to 21!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gameContainer} showsVerticalScrollIndicator={false}>
        {/* Dealer Hand */}
        {gameState !== 'betting' && (
          <HandComponent
            title="DEALER"
            cards={dealerHand}
            total={dealerTotal}
            hideFirstCard={gameState === 'playing'}
          />
        )}

        {/* Player Hand */}
        {gameState !== 'betting' && (
          <HandComponent
            title="PLAYER"
            cards={playerHand}
            total={playerTotal}
          />
        )}

        {/* Game Result */}
        {gameState === 'finished' && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              {
                color: gameResult === 'win' ? Colors.success : 
                       gameResult === 'loss' ? Colors.error : 
                       Colors.gray
              }
            ]}>
              {resultMessage}
            </Text>
          </View>
        )}

        {/* Betting Controls */}
        {gameState === 'betting' && (
          <View style={styles.bettingContainer}>
            <Text style={styles.betLabel}>Screen Time Bet</Text>
            <View style={styles.betControls}>
              <TouchableOpacity
                style={styles.betButton}
                onPress={() => adjustBet(-10)}
                disabled={bet <= blackjackEngine.config.minScreenTimeDelta}
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
                disabled={bet >= blackjackEngine.config.maxScreenTimeDelta}
              >
                <Text style={styles.betButtonText}>+10</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {gameState === 'betting' && (
            <TouchableOpacity
              style={styles.dealButton}
              onPress={playHand}
              disabled={isLoading}
            >
              <Text style={styles.dealButtonText}>
                {isLoading ? 'DEALING...' : 'DEAL CARDS'}
              </Text>
            </TouchableOpacity>
          )}

          {gameState === 'playing' && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>🎲 Playing optimal strategy...</Text>
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
          • Automatic optimal play • Dealer hits on 16, stands on 17 • Blackjack pays 1:1
        </Text>
        <Text style={styles.infoText}>
          • Min bet: {blackjackEngine.config.minScreenTimeDelta}m • Max bet: {blackjackEngine.config.maxScreenTimeDelta}m
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
    color: Colors.blackjack.primary,
    fontSize: 28,
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
  handContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  handTitle: {
    ...Typography.gameTitle,
    color: Colors.gold,
    marginBottom: Spacing.md,
    fontSize: 18,
  },
  handCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  card: {
    width: 60,
    height: 84,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  cardFront: {
    flex: 1,
    backgroundColor: Colors.primaryText,
    borderRadius: Spacing.borderRadius.small,
    padding: Spacing.sm,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  cardBack: {
    flex: 1,
    backgroundColor: Colors.blackjack.secondary,
    borderRadius: Spacing.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  cardBackText: {
    fontSize: 24,
    color: Colors.gold,
  },
  cardRank: {
    ...Typography.primaryButtonText,
    fontSize: 16,
    color: Colors.black,
    textAlign: 'left',
  },
  cardSuit: {
    fontSize: 20,
    textAlign: 'center',
    alignSelf: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.blackjack.secondary,
  },
  totalLabel: {
    ...Typography.label,
    color: Colors.secondaryText,
    marginRight: Spacing.sm,
  },
  totalValue: {
    ...Typography.gameTitle,
    color: Colors.blackjack.primary,
    fontSize: 20,
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
    fontSize: 18,
    textAlign: 'center',
  },
  bettingContainer: {
    marginVertical: Spacing.xl,
    alignItems: 'center',
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
    backgroundColor: Colors.blackjack.secondary,
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
  actionContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dealButton: {
    backgroundColor: Colors.blackjack.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.borderRadius.xlarge,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: Colors.blackjack.primary,
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
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  waitingText: {
    ...Typography.gameSubtitle,
    color: Colors.gold,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: Colors.blackjack.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.borderRadius.xlarge,
    minWidth: 200,
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

export default BlackjackScreen;