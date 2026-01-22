import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../infrastructure/storage/store';

// Screens
import LandingScreen from '../screens/LandingScreen';
import CasinoFloorScreen from '../screens/CasinoFloorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

// Game Screens
import SlotsScreen from '../screens/games/SlotsScreen';
import BlackjackScreen from '../screens/games/BlackjackScreen';
import RouletteScreen from '../screens/games/RouletteScreen';
import PlinkoScreen from '../screens/games/PlinkoScreen';
import PaiGowScreen from '../screens/games/PaiGowScreen';
import MathProblemsScreen from '../screens/games/MathProblemsScreen';
import JewelMiningScreen from '../screens/games/JewelMiningScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Slots: { bet: number };
  Blackjack: { bet: number };
  Roulette: { bet: number };
  Plinko: { bet: number };
  PaiGow: { bet: number };
  MathProblems: { bet: number };
  JewelMining: { bet: number };
  Subscription: undefined;
};

export type MainTabParamList = {
  CasinoFloor: undefined;
  Profile: undefined;
  Subscription: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { isSubscribed } = useSelector((state: RootState) => state.subscription);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'CasinoFloor') {
            iconName = focused ? 'dice' : 'dice-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Subscription') {
            iconName = focused ? 'diamond' : 'diamond-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopColor: '#2C2C2E',
        },
        headerStyle: {
          backgroundColor: '#1C1C1E',
        },
        headerTintColor: '#FFFFFF',
      })}
    >
      <Tab.Screen 
        name="CasinoFloor" 
        component={CasinoFloorScreen}
        options={{ title: 'Casino Floor' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      {!isSubscribed && (
        <Tab.Screen 
          name="Subscription" 
          component={SubscriptionScreen}
          options={{ title: 'Premium' }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Defensive selector with type checking and debugging
  const userState = useSelector((state: RootState) => state.user);
  const isAuthenticated = useMemo(() => {
    console.log('🔍 SELECTOR DEBUG:', {
      userState: userState,
      isAuthenticated: userState.isAuthenticated,
      type: typeof userState.isAuthenticated,
      rawValue: JSON.stringify(userState.isAuthenticated)
    });
    
    // Defensive boolean conversion to prevent string coercion errors
    if (typeof userState.isAuthenticated === 'string') {
      console.warn('🚨 STRING DETECTED: Converting to boolean');
      return userState.isAuthenticated === 'true';
    }
    
    return Boolean(userState.isAuthenticated);
  }, [userState.isAuthenticated]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1C1C1E',
          },
          headerTintColor: '#FFFFFF',
          cardStyle: { backgroundColor: '#000000' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={LandingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            
            {/* Game Screens as Modals */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen 
                name="Slots" 
                component={SlotsScreen}
                options={{ title: 'Slot Machine' }}
              />
              <Stack.Screen 
                name="Blackjack" 
                component={BlackjackScreen}
                options={{ title: 'Blackjack' }}
              />
              <Stack.Screen 
                name="Roulette" 
                component={RouletteScreen}
                options={{ title: 'Roulette' }}
              />
              <Stack.Screen 
                name="Plinko" 
                component={PlinkoScreen}
                options={{ title: 'Plinko' }}
              />
              <Stack.Screen 
                name="PaiGow" 
                component={PaiGowScreen}
                options={{ title: 'Pai Gow Poker' }}
              />
              <Stack.Screen 
                name="MathProblems" 
                component={MathProblemsScreen}
                options={{ title: 'Math Challenge' }}
              />
              <Stack.Screen 
                name="JewelMining" 
                component={JewelMiningScreen}
                options={{ title: 'Jewel Mining' }}
              />
            </Stack.Group>
            
            <Stack.Screen 
              name="Subscription" 
              component={SubscriptionScreen}
              options={{ title: 'Premium Subscription' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}