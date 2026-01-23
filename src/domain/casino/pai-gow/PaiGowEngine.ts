/**
 * Pai Gow Poker Game Engine
 * Simplified Pai Gow Poker with 7 cards split into 5-card high hand and 2-card low hand
 */

import { GameEngine, GameOutcome } from '../../../shared/types';
import { GAME_CONFIG } from '../../../shared/constants/games';

// Card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14 (A=14, K=13, Q=12, J=11)
}

interface PaiGowInput {
  bet: number;
}

interface PaiGowDisplay {
  playerCards: Card[];
  dealerCards: Card[];
  playerHighHand: Card[];
  playerLowHand: Card[];
  dealerHighHand: Card[];
  dealerLowHand: Card[];
  playerHighRank: string;
  playerLowRank: string;
  dealerHighRank: string;
  dealerLowRank: string;
  handComparison: {
    highHandResult: 'win' | 'lose' | 'tie';
    lowHandResult: 'win' | 'lose' | 'tie';
  };
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export class PaiGowEngine implements GameEngine<PaiGowInput, PaiGowDisplay> {
  config = GAME_CONFIG.paiGow;

  private readonly suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  private readonly ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  validateInput(input: PaiGowInput): boolean {
    return (
      input.bet >= this.config.minScreenTimeDelta &&
      input.bet <= this.config.maxScreenTimeDelta &&
      typeof input.bet === 'number' &&
      !isNaN(input.bet)
    );
  }

  play(input: PaiGowInput, seed: number): GameOutcome & { display: PaiGowDisplay } {
    const random = new SeededRandom(seed);
    const { bet: betAmount } = input;

    // Create and shuffle deck
    const deck = this.createDeck();
    this.shuffleDeck(deck, random);

    // Deal cards
    const playerCards = deck.slice(0, 7);
    const dealerCards = deck.slice(7, 14);

    // Optimal hand arrangement for player
    const { highHand: playerHighHand, lowHand: playerLowHand } = this.arrangeOptimalHands(playerCards);
    
    // House arrangement for dealer (follows house way)
    const { highHand: dealerHighHand, lowHand: dealerLowHand } = this.arrangeHouseWay(dealerCards);

    // Evaluate hands
    const playerHighRank = this.evaluateHand(playerHighHand);
    const playerLowRank = this.evaluateHand(playerLowHand);
    const dealerHighRank = this.evaluateHand(dealerHighHand);
    const dealerLowRank = this.evaluateHand(dealerLowHand);

    // Compare hands
    const handComparison = {
      highHandResult: this.compareHands(playerHighHand, dealerHighHand) as 'win' | 'lose' | 'tie',
      lowHandResult: this.compareHands(playerLowHand, dealerLowHand) as 'win' | 'lose' | 'tie',
    };

    // Determine overall result
    let result: 'win' | 'loss' | 'push';
    let screenTimeDelta: number;

    if (handComparison.highHandResult === 'win' && handComparison.lowHandResult === 'win') {
      // Player wins both hands
      result = 'win';
      screenTimeDelta = Math.round(betAmount * 0.95); // House edge
    } else if (handComparison.highHandResult === 'lose' && handComparison.lowHandResult === 'lose') {
      // Player loses both hands
      result = 'loss';
      screenTimeDelta = -betAmount;
    } else {
      // Split or ties - push
      result = 'push';
      screenTimeDelta = 0;
    }

    const display: PaiGowDisplay = {
      playerCards,
      dealerCards,
      playerHighHand,
      playerLowHand,
      dealerHighHand,
      dealerLowHand,
      playerHighRank,
      playerLowRank,
      dealerHighRank,
      dealerLowRank,
      handComparison,
    };

    return {
      result,
      screenTimeDelta,
      displayData: display,
      display,
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    
    for (const suit of this.suits) {
      for (let i = 0; i < this.ranks.length; i++) {
        const rank = this.ranks[i];
        let value = i + 2; // 2-14
        if (rank === 'A') value = 14; // Ace high
        
        deck.push({ suit, rank, value });
      }
    }
    
    return deck;
  }

  private shuffleDeck(deck: Card[], random: SeededRandom): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random.next() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  private arrangeOptimalHands(cards: Card[]): { highHand: Card[]; lowHand: Card[] } {
    // Simple strategy: put highest pair in low hand if possible, otherwise highest two cards
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    
    // Find pairs
    const pairs: Card[][] = [];
    const singles: Card[] = [];
    
    for (let i = 0; i < sortedCards.length; i++) {
      if (i < sortedCards.length - 1 && sortedCards[i].value === sortedCards[i + 1].value) {
        pairs.push([sortedCards[i], sortedCards[i + 1]]);
        i++; // Skip next card
      } else {
        singles.push(sortedCards[i]);
      }
    }

    let lowHand: Card[];
    let highHand: Card[];

    if (pairs.length > 0) {
      // Use highest pair for low hand
      lowHand = pairs[0];
      highHand = [...pairs.slice(1).flat(), ...singles].slice(0, 5);
    } else {
      // No pairs - use two highest cards for low hand
      lowHand = sortedCards.slice(0, 2);
      highHand = sortedCards.slice(2);
    }

    return { highHand, lowHand };
  }

  private arrangeHouseWay(cards: Card[]): { highHand: Card[]; lowHand: Card[] } {
    // Simplified house way - similar to optimal for now
    return this.arrangeOptimalHands(cards);
  }

  private evaluateHand(hand: Card[]): string {
    if (hand.length === 2) {
      // Two-card hand
      if (hand[0].value === hand[1].value) {
        return `Pair of ${hand[0].rank}s`;
      }
      const highCard = hand.reduce((max, card) => card.value > max.value ? card : max);
      return `${highCard.rank} High`;
    }

    // Five-card hand (simplified evaluation)
    const values = hand.map(card => card.value).sort((a, b) => b - a);
    const suits = hand.map(card => card.suit);
    
    // Check for pairs, three of a kind, etc.
    const valueCounts: { [key: number]: number } = {};
    values.forEach(value => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    
    if (counts[0] === 4) return 'Four of a Kind';
    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (new Set(suits).size === 1) return 'Flush';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    if (counts[0] === 2) return 'One Pair';
    
    return 'High Card';
  }

  private compareHands(playerHand: Card[], dealerHand: Card[]): 'win' | 'lose' | 'tie' {
    // Simplified comparison - just compare high cards for now
    const playerHigh = Math.max(...playerHand.map(card => card.value));
    const dealerHigh = Math.max(...dealerHand.map(card => card.value));
    
    if (playerHigh > dealerHigh) return 'win';
    if (playerHigh < dealerHigh) return 'lose';
    return 'tie';
  }
}