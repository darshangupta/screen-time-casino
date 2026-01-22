import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setProfile } from '../../infrastructure/storage/slices/userSlice';
import { Colors, Typography, Spacing } from '../../shared/theme';

const { width, height } = Dimensions.get('window');

const LandingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Mock Apple ID authentication - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser = {
        id: 'mock-user-123',
        email: 'user@example.com',
        createdAt: Date.now(),
        isSubscribed: false,
      };
      
      dispatch(setProfile(mockUser));
    } catch (error) {
      Alert.alert('Authentication Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestScreenTimePermission = () => {
    Alert.alert(
      'Screen Time Access Required',
      'Screen Time Casino needs access to your device screen time data to adjust your app limits based on game outcomes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Grant Access', onPress: () => console.log('Screen time permission granted') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Casino Atmosphere Background */}
      <View style={styles.backgroundOverlay} />
      
      <View style={styles.content}>
        {/* Casino Logo/Branding */}
        <View style={styles.logoSection}>
          <Ionicons 
            name="diamond" 
            size={80} 
            color={Colors.gold} 
            style={styles.logoIcon} 
          />
          <Text style={styles.appTitle}>SCREEN TIME</Text>
          <Text style={styles.appSubtitle}>CASINO</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Where Time is Your Currency</Text>
        </View>

        {/* Main CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.welcomeText}>
            Welcome to the most thrilling way to manage your screen time
          </Text>
          
          <TouchableOpacity 
            style={[styles.appleButton, isLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Signing In...</Text>
            ) : (
              <>
                <Ionicons name="logo-apple" size={24} color={Colors.black} />
                <Text style={styles.buttonText}>Continue with Apple ID</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestScreenTimePermission}
          >
            <Ionicons name="time-outline" size={20} color={Colors.gold} />
            <Text style={styles.permissionButtonText}>Grant Screen Time Access</Text>
          </TouchableOpacity>
        </View>

        {/* Casino Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Ionicons name="dice-outline" size={24} color={Colors.neonBlue} />
            <Text style={styles.featureText}>7 Casino Games</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="trophy-outline" size={24} color={Colors.neonGreen} />
            <Text style={styles.featureText}>Win Extra Screen Time</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="diamond-outline" size={24} color={Colors.neonPurple} />
            <Text style={styles.featureText}>Premium Games</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
          <Text style={styles.disclaimerText}>
            This app modifies your device screen time limits
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.darkBackground,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenHorizontal,
    justifyContent: 'space-between',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logoIcon: {
    marginBottom: Spacing.md,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  appTitle: {
    ...Typography.casinoTitle,
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    ...Typography.casinoTitle,
    fontSize: 28,
    color: Colors.red,
    marginBottom: Spacing.md,
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: Colors.gold,
    marginBottom: Spacing.md,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.lightGold,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaSection: {
    alignItems: 'center',
  },
  welcomeText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
    color: Colors.secondaryText,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.large,
    marginBottom: Spacing.lg,
    width: width * 0.8,
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.darkGray,
    shadowOpacity: 0,
  },
  buttonText: {
    ...Typography.primaryButtonText,
    marginLeft: Spacing.sm,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.gold,
    width: width * 0.8,
    justifyContent: 'center',
  },
  permissionButtonText: {
    ...Typography.secondaryButtonText,
    marginLeft: Spacing.sm,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    ...Typography.caption,
    marginTop: Spacing.sm,
    textAlign: 'center',
    color: Colors.tertiaryText,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  disclaimerText: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.warning,
    fontSize: 10,
  },
});

export default LandingScreen;