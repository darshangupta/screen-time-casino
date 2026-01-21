import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

interface BlackjackInput {
  bet: number;
  playerActions?: ('hit' | 'stand')[];
}

interface BlackjackDisplay {
  playerHand: Card[];
  dealerHand: Card[];
  playerTotal: number;
  dealerTotal: number;
  gameState: 'playing' | 'player_bust' | 'dealer_bust' | 'push' | 'player_win' | 'dealer_win';
}

export class BlackjackEngine implements GameEngine<BlackjackInput, BlackjackDisplay> {
  config = GAME_CONFIG.blackjack;

  private readonly SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
  private readonly RANKS: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  validateInput(input: BlackjackInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta
    );
  }

  play(input: BlackjackInput, seed: number): GameOutcome & { display: BlackjackDisplay } {
    if (!this.validateInput(input)) {
      throw new Error('Invalid bet amount');
    }

    const random = this.seededRandom(seed);
    const deck = this.shuffleDeck(random);
    
    // Initial deal
    const playerHand: Card[] = [deck.pop()!, deck.pop()!];
    const dealerHand: Card[] = [deck.pop()!, deck.pop()!];

    // Simple AI play (basic strategy simulation)
    this.playPlayerHand(playerHand, dealerHand[0], deck, random);
    
    let gameState: BlackjackDisplay['gameState'];
    const playerTotal = this.calculateHandValue(playerHand);
    
    if (playerTotal > 21) {
      gameState = 'player_bust';
    } else {
      // Dealer plays
      this.playDealerHand(dealerHand, deck);
      const dealerTotal = this.calculateHandValue(dealerHand);
      
      if (dealerTotal > 21) {
        gameState = 'dealer_bust';
      } else if (playerTotal > dealerTotal) {
        gameState = 'player_win';
      } else if (dealerTotal > playerTotal) {
        gameState = 'dealer_win';
      } else {
        gameState = 'push';
      }
    }

    let result: 'win' | 'loss' | 'push';
    let screenTimeDelta: number;

    switch (gameState) {
      case 'player_win':
      case 'dealer_bust':
        result = 'win';
        screenTimeDelta = input.bet;
        break;
      case 'player_bust':
      case 'dealer_win':
        result = 'loss';
        screenTimeDelta = -input.bet;
        break;
      case 'push':
        result = 'push';
        screenTimeDelta = 0;
        break;
    }

    const display: BlackjackDisplay = {
      playerHand,
      dealerHand,
      playerTotal,
      dealerTotal: this.calculateHandValue(dealerHand),
      gameState
    };

    return {
      result,
      screenTimeDelta,
      displayData: display,
      display
    };
  }

  private seededRandom(seed: number) {
    let value = seed;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.SUITS) {
      for (const rank of this.RANKS) {
        const value = this.getCardValue(rank);
        deck.push({ suit, rank, value });
      }
    }
    return deck;
  }

  private getCardValue(rank: Card['rank']): number {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  private shuffleDeck(random: () => number): Card[] {
    const deck = this.createDeck();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  private calculateHandValue(hand: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  private playPlayerHand(playerHand: Card[], dealerUpCard: Card, deck: Card[], random: () => number): void {
    // Basic strategy simulation
    while (this.shouldHit(playerHand, dealerUpCard)) {
      playerHand.push(deck.pop()!);
      if (this.calculateHandValue(playerHand) > 21) {
        break;
      }
    }
  }

  private shouldHit(hand: Card[], dealerUpCard: Card): boolean {
    const value = this.calculateHandValue(hand);
    const dealerValue = dealerUpCard.value;
    
    if (value <= 11) return true;
    if (value >= 17) return false;
    
    // Simplified basic strategy
    if (value <= 16 && dealerValue >= 7) return true;
    if (value <= 12 && dealerValue >= 4 && dealerValue <= 6) return false;
    
    return value <= 11;
  }

  private playDealerHand(dealerHand: Card[], deck: Card[]): void {
    while (this.calculateHandValue(dealerHand) < 17) {
      dealerHand.push(deck.pop()!);
    }
  }
}