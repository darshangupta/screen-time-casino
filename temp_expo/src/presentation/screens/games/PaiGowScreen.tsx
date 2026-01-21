import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Typography, Spacing } from '../../../shared/theme';

const PaiGowScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pai Gow</Text>
        <Text style={styles.subtitle}>Premium Game</Text>
        <Text style={styles.description}>
          Master this ancient poker variant! This premium casino game requires a subscription.
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
  },
  title: {
    ...Typography.casinoTitle,
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.screenSubtitle,
    color: Colors.gold,
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    color: Colors.secondaryText,
  },
});

export default PaiGowScreen;