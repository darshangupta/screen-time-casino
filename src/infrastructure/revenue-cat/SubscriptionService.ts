import { SubscriptionStatus } from '../../shared/types';
import { SUBSCRIPTION_PRODUCT_ID } from '../../shared/constants/games';

export interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: Package[];
}

export interface Package {
  identifier: string;
  packageType: string;
  product: Product;
}

export interface Product {
  identifier: string;
  description: string;
  title: string;
  price: string;
  priceString: string;
  currencyCode: string;
}

export interface PurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
  purchasedAt: Date;
}

export interface CustomerInfo {
  originalAppUserId: string;
  allPurchaseDates: Record<string, Date>;
  activeSubscriptions: string[];
  allExpirationDates: Record<string, Date>;
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
}

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: Date;
  expirationDate: Date | null;
  store: string;
  productIdentifier: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private isInitialized = false;
  private listeners: Array<(status: SubscriptionStatus) => void> = [];

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // TODO: Initialize RevenueCat with API key
      console.log('Initializing RevenueCat...');
      
      // Mock initialization for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<Offering[]> {
    if (!this.isInitialized) {
      throw new Error('SubscriptionService not initialized');
    }

    try {
      // TODO: Get actual offerings from RevenueCat
      console.log('Fetching offerings...');
      
      // Mock offerings for development
      const mockOfferings: Offering[] = [
        {
          identifier: 'default',
          serverDescription: 'Default offering',
          availablePackages: [
            {
              identifier: 'monthly',
              packageType: 'monthly',
              product: {
                identifier: SUBSCRIPTION_PRODUCT_ID,
                description: 'Premium Screen Time Casino access',
                title: 'Screen Time Casino Premium',
                price: '2.99',
                priceString: '$2.99',
                currencyCode: 'USD',
              },
            },
          ],
        },
      ];

      return mockOfferings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      throw new Error('SubscriptionService not initialized');
    }

    try {
      // TODO: Implement actual RevenueCat purchase
      console.log(`Purchasing subscription: ${productId}`);
      
      // Mock purchase flow for development
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockPurchaseResult: PurchaseResult = {
        customerInfo: await this.getMockCustomerInfo(true),
        productIdentifier: productId,
        purchasedAt: new Date(),
      };

      // Notify listeners of status change
      const status = this.extractSubscriptionStatus(mockPurchaseResult.customerInfo);
      this.notifyListeners(status);

      return mockPurchaseResult;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // TODO: Get actual customer info from RevenueCat
      console.log('Getting subscription status...');
      
      // Mock customer info for development
      const customerInfo = await this.getMockCustomerInfo(false);
      return this.extractSubscriptionStatus(customerInfo);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        isSubscribed: false,
        productId: null,
        expirationDate: null,
        renewalDate: null,
        isInGracePeriod: false,
        isTrialing: false,
      };
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      throw new Error('SubscriptionService not initialized');
    }

    try {
      // TODO: Implement actual RevenueCat restore
      console.log('Restoring purchases...');
      
      // Mock restore for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const customerInfo = await this.getMockCustomerInfo(false);
      
      // Notify listeners of status change
      const status = this.extractSubscriptionStatus(customerInfo);
      this.notifyListeners(status);

      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  onSubscriptionStatusChange(callback: (status: SubscriptionStatus) => void): void {
    this.listeners.push(callback);
  }

  removeSubscriptionStatusListener(callback: (status: SubscriptionStatus) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(status: SubscriptionStatus): void {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in subscription status listener:', error);
      }
    });
  }

  private async getMockCustomerInfo(isSubscribed: boolean): Promise<CustomerInfo> {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    return {
      originalAppUserId: 'mock-user-id',
      allPurchaseDates: isSubscribed ? { [SUBSCRIPTION_PRODUCT_ID]: now } : {},
      activeSubscriptions: isSubscribed ? [SUBSCRIPTION_PRODUCT_ID] : [],
      allExpirationDates: isSubscribed ? { [SUBSCRIPTION_PRODUCT_ID]: expirationDate } : {},
      entitlements: {
        active: isSubscribed ? {
          premium: {
            identifier: 'premium',
            isActive: true,
            willRenew: true,
            periodType: 'normal',
            latestPurchaseDate: now,
            expirationDate,
            store: 'app_store',
            productIdentifier: SUBSCRIPTION_PRODUCT_ID,
          }
        } : {},
        all: isSubscribed ? {
          premium: {
            identifier: 'premium',
            isActive: true,
            willRenew: true,
            periodType: 'normal',
            latestPurchaseDate: now,
            expirationDate,
            store: 'app_store',
            productIdentifier: SUBSCRIPTION_PRODUCT_ID,
          }
        } : {},
      },
    };
  }

  private extractSubscriptionStatus(customerInfo: CustomerInfo): SubscriptionStatus {
    const premiumEntitlement = customerInfo.entitlements.active.premium;
    
    if (premiumEntitlement && premiumEntitlement.isActive) {
      return {
        isSubscribed: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        renewalDate: premiumEntitlement.expirationDate, // Simplified
        isInGracePeriod: false,
        isTrialing: false,
      };
    }

    return {
      isSubscribed: false,
      productId: null,
      expirationDate: null,
      renewalDate: null,
      isInGracePeriod: false,
      isTrialing: false,
    };
  }
}