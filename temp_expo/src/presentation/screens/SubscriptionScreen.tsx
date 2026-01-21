import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../infrastructure/storage/store';
import { setSubscriptionStatus } from '../../infrastructure/storage/slices/subscriptionSlice';
import { updateSubscriptionStatus } from '../../infrastructure/storage/slices/userSlice';
import { Colors, Typography, Spacing } from '../../shared/theme';
import { SUBSCRIPTION_PRICE, DAILY_SPINS_FREE, DAILY_SPINS_PREMIUM, FREE_GAMES, PAID_GAMES } from '../../shared/constants/games';

const { width } = Dimensions.get('window');

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isSubscribed, isLoading } = useSelector((state: RootState) => state.subscription);
  const { profile } = useSelector((state: RootState) => state.user);
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const handlePurchase = async () => {
    Alert.alert(
      'Confirm Subscription',
      `Subscribe to Screen Time Casino Premium for ${SUBSCRIPTION_PRICE}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe',
          onPress: async () => {
            try {
              // Mock subscription purchase - replace with actual RevenueCat implementation
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const subscriptionData = {
                isSubscribed: true,
                productId: 'screen_time_casino_premium_monthly',
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isInGracePeriod: false,
                isTrialing: false,
              };
              
              dispatch(setSubscriptionStatus(subscriptionData));
              dispatch(updateSubscriptionStatus({ 
                isSubscribed: true, 
                subscriptionExpiry: subscriptionData.expirationDate.getTime()
              }));
              
              Alert.alert('Welcome to Premium!', 'You now have access to all casino games and unlimited spins.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Purchase Failed', 'Please try again later.');
            }
          }
        },
      ]
    );
  };

  const handleRestore = async () => {
    Alert.alert('Restore Purchases', 'No previous purchases found.');
  };

  if (isSubscribed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.premiumHeader}>
            <Ionicons name="diamond" size={80} color={Colors.gold} />
            <Text style={styles.premiumTitle}>Premium Active</Text>
            <Text style={styles.premiumSubtitle}>You're all set with premium access!</Text>
          </View>

          <View style={styles.premiumBenefits}>
            <Text style={styles.sectionTitle}>Your Premium Benefits</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>All 7 Casino Games</Text>
                <Text style={styles.benefitDescription}>Access to premium games like Plinko, Pai Gow, and more</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>10 Daily Spins</Text>
                <Text style={styles.benefitDescription}>More than triple the daily play limit</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Priority Support</Text>
                <Text style={styles.benefitDescription}>Get help faster when you need it</Text>
              </View>
            </View>
          </View>

          <View style={styles.managementSection}>
            <TouchableOpacity style={styles.manageButton}>
              <Ionicons name="settings-outline" size={20} color={Colors.gold} />
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Ionicons name="diamond" size={60} color={Colors.gold} />
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>Unlock the full casino experience</Text>
        </View>

        {/* Comparison Cards */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Choose Your Experience</Text>
          
          {/* Free Tier */}
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierName}>Free Player</Text>
              <Text style={styles.tierPrice}>$0</Text>
            </View>
            
            <View style={styles.tierFeatures}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{FREE_GAMES.length} Casino Games</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{DAILY_SPINS_FREE} Daily Spins</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="close" size={16} color={Colors.error} />
                <Text style={styles.featureTextDisabled}>Premium Games</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="close" size={16} color={Colors.error} />
                <Text style={styles.featureTextDisabled}>Priority Support</Text>
              </View>
            </View>
          </View>

          {/* Premium Tier */}
          <View style={[styles.tierCard, styles.premiumTierCard]}>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={16} color={Colors.gold} />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
            
            <View style={styles.tierHeader}>
              <Text style={styles.tierName}>Premium Member</Text>
              <Text style={styles.tierPrice}>{SUBSCRIPTION_PRICE}/month</Text>
            </View>
            
            <View style={styles.tierFeatures}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>All {FREE_GAMES.length + PAID_GAMES.length} Casino Games</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{DAILY_SPINS_PREMIUM} Daily Spins</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>Premium Games</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
                <Text style={styles.featureText}>Priority Support</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.subscribeButton, isLoading && styles.buttonDisabled]}
              onPress={handlePurchase}
              disabled={isLoading}
            >
              <Ionicons name="diamond" size={20} color={Colors.black} />
              <Text style={styles.subscribeButtonText}>
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Games Preview */}
        <View style={styles.gamesPreview}>
          <Text style={styles.sectionTitle}>Unlock Premium Games</Text>
          <View style={styles.gamesList}>
            {PAID_GAMES.map((gameType, index) => (
              <View key={gameType} style={styles.gamePreviewItem}>
                <View style={styles.gameIcon}>
                  <Ionicons name="diamond-outline" size={24} color={Colors.gold} />
                </View>
                <Text style={styles.gamePreviewName}>
                  {gameType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.gray} />
              </View>
            ))}
          </View>
        </View>

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <Text style={styles.sectionTitle}>Why Premium?</Text>
          
          <View style={styles.valueItem}>
            <Ionicons name="flash" size={24} color={Colors.neonBlue} />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>More Playing Time</Text>
              <Text style={styles.valueDescription}>
                Get {DAILY_SPINS_PREMIUM - DAILY_SPINS_FREE} extra spins every day
              </Text>
            </View>
          </View>
          
          <View style={styles.valueItem}>
            <Ionicons name="trophy" size={24} color={Colors.neonGreen} />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Higher Stakes Games</Text>
              <Text style={styles.valueDescription}>
                Access exclusive games with bigger screen time rewards
              </Text>
            </View>
          </View>
          
          <View style={styles.valueItem}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.neonPurple} />
            <View style={styles.valueText}>
              <Text style={styles.valueTitle}>Priority Experience</Text>
              <Text style={styles.valueDescription}>
                Get the best casino experience with premium support
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
          
          <Text style={styles.legalText}>
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </Text>
          
          <View style={styles.legalLinks}>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  heroTitle: {
    ...Typography.casinoTitle,
    fontSize: 28,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  comparisonSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.screenTitle,
    fontSize: 20,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  tierCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.large,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.veryDarkGray,
  },
  premiumTierCard: {
    borderColor: Colors.gold,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.medium,
  },
  premiumBadgeText: {
    ...Typography.caption,
    color: Colors.black,
    fontWeight: '700',
    marginLeft: Spacing.xs / 2,
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  tierName: {
    ...Typography.gameTitle,
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  tierPrice: {
    ...Typography.glowText,
    fontSize: 24,
  },
  tierFeatures: {
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
  },
  featureTextDisabled: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
    color: Colors.tertiaryText,
    textDecorationLine: 'line-through',
  },
  subscribeButton: {
    backgroundColor: Colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.darkGray,
    shadowOpacity: 0,
  },
  subscribeButtonText: {
    ...Typography.primaryButtonText,
    marginLeft: Spacing.sm,
  },
  gamesPreview: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  gamesList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.medium,
    padding: Spacing.md,
  },
  gamePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.veryDarkGray,
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  gamePreviewName: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  valueSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  valueText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  valueTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  valueDescription: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  footerActions: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  restoreButton: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  restoreButtonText: {
    ...Typography.secondaryButtonText,
    fontSize: 16,
  },
  legalText: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    ...Typography.caption,
    color: Colors.gold,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    ...Typography.caption,
    marginHorizontal: Spacing.sm,
  },
  premiumHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  premiumTitle: {
    ...Typography.casinoTitle,
    fontSize: 28,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  premiumSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  premiumBenefits: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
  },
  benefitText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  benefitTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  benefitDescription: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  managementSection: {
    paddingHorizontal: Spacing.screenHorizontal,
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: Colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  manageButtonText: {
    ...Typography.secondaryButtonText,
    marginLeft: Spacing.sm,
  },
});

export default SubscriptionScreen;