/**
 * Tutorial Step Definitions
 * 
 * Comprehensive step-by-step guides for all seller platform features
 */

import { TutorialSequence, TutorialCategory } from '@/lib/types/onboarding';

// Getting Started Tutorial
export const GETTING_STARTED_TUTORIAL: TutorialSequence = {
  id: 'getting-started',
  name: 'Welcome to MASH Seller Center',
  description: 'Learn the basics of managing your mushroom business on MASH',
  category: TutorialCategory.GETTING_STARTED,
  isRequired: true,
  estimatedDuration: 120, // 2 minutes
  steps: [
    {
      id: 'welcome-step',
      target: 'body',
      content: 'Welcome to MASH Seller Center! This quick tour will help you navigate the dashboard, add products, manage orders, and configure settings. Takes about 2 minutes.',
      title: 'Welcome to MASH Seller Center!',
      placement: 'center',
      category: TutorialCategory.GETTING_STARTED,
      disableBeacon: true,
    },
    {
      id: 'dashboard-overview',
      target: '[data-tour="dashboard"]',
      content: 'This is your control center! Here you can see total sales, revenue, active orders, and product performance at a glance.',
      title: 'Your Dashboard',
      placement: 'bottom',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'navigation-menu',
      target: '[data-tour="sidebar-nav"]',
      content: 'Use this sidebar to access all seller features: Products (add and manage), Orders (view and fulfill), Inventory (track stock), and Settings (configure store).',
      title: 'Navigation Menu',
      placement: 'right',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'stats-cards',
      target: '[data-tour="stats-cards"]',
      content: 'Monitor your business performance with real-time stats: sales trends, order volume, and revenue tracking. Click any card for detailed insights.',
      title: 'Key Metrics',
      placement: 'bottom',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'next-steps',
      target: 'body',
      content: 'Great job! You now know the basics. Next steps: Complete your store profile, add your first product, set up business hours, and configure delivery options. Need help? Click the help icon anytime!',
      title: 'You\'re All Set!',
      placement: 'center',
      category: TutorialCategory.GETTING_STARTED,
    },
  ],
};

// Dashboard Tutorial
export const DASHBOARD_TUTORIAL: TutorialSequence = {
  id: 'dashboard-deep-dive',
  name: 'Master Your Dashboard',
  description: 'Understand all dashboard features and insights',
  category: TutorialCategory.DASHBOARD,
  isRequired: false,
  estimatedDuration: 90,
  steps: [
    {
      id: 'sales-chart',
      target: '[data-tour="sales-chart"]',
      content: 'Track your sales performance over time with daily, weekly, and monthly views. See revenue trends and compare with previous periods.',
      title: 'Sales Analytics',
      placement: 'top',
      category: TutorialCategory.DASHBOARD,
    },
    {
      id: 'recent-orders',
      target: '[data-tour="recent-orders"]',
      content: 'Quick access to latest customer orders. View order status at a glance, click for full details, and access quick actions.',
      title: 'Recent Orders',
      placement: 'top',
      category: TutorialCategory.DASHBOARD,
    },
  ],
};

// Products Tutorial
export const PRODUCTS_TUTORIAL: TutorialSequence = {
  id: 'products-management',
  name: 'Product Management Guide',
  description: 'Learn how to add and manage your mushroom products',
  category: TutorialCategory.PRODUCTS,
  isRequired: false,
  estimatedDuration: 150,
  steps: [
    {
      id: 'add-product-button',
      target: '[data-tour="add-product"]',
      content: 'Click here to start listing your mushrooms. Upload high-quality photos, set competitive prices, write compelling descriptions, and manage stock levels.',
      title: 'Add Your First Product',
      placement: 'bottom',
      category: TutorialCategory.PRODUCTS,
    },
    {
      id: 'product-list',
      target: '[data-tour="product-list"]',
      content: 'Manage all your products in one place. Search and filter products, use quick edit options, enable/disable listings, and track inventory status.',
      title: 'Product Catalog',
      placement: 'top',
      category: TutorialCategory.PRODUCTS,
    },
  ],
};

// Orders Tutorial
export const ORDERS_TUTORIAL: TutorialSequence = {
  id: 'orders-processing',
  name: 'Order Processing Guide',
  description: 'Efficiently manage and fulfill customer orders',
  category: TutorialCategory.ORDERS,
  isRequired: false,
  estimatedDuration: 120,
  steps: [
    {
      id: 'order-tabs',
      target: '[data-tour="order-tabs"]',
      content: 'Orders are organized by status: Pending (new orders), Confirmed (ready to prepare), Ready (prepared for pickup/delivery), and Completed (successfully delivered).',
      title: 'Order Status Tabs',
      placement: 'bottom',
      category: TutorialCategory.ORDERS,
    },
    {
      id: 'order-actions',
      target: '[data-tour="order-actions"]',
      content: 'Process orders efficiently: Confirm new orders, mark as ready for pickup, update delivery status, and contact customers directly. Faster processing means happier customers!',
      title: 'Quick Actions',
      placement: 'left',
      category: TutorialCategory.ORDERS,
    },
  ],
};

// Settings Tutorial
export const SETTINGS_TUTORIAL: TutorialSequence = {
  id: 'store-settings',
  name: 'Store Configuration',
  description: 'Set up your store profile and preferences',
  category: TutorialCategory.SETTINGS,
  isRequired: false,
  estimatedDuration: 180,
  steps: [
    {
      id: 'profile-tab',
      target: '[data-tour="settings-profile"]',
      content: 'Complete your store information: Store name and logo, contact details, business location, and store description.',
      title: 'Store Profile',
      placement: 'right',
      category: TutorialCategory.SETTINGS,
    },
    {
      id: 'store-setup-tab',
      target: '[data-tour="settings-store-setup"]',
      content: 'Configure advanced settings: Business Hours (when you\'re open), Social Media (connect profiles), SEO (improve search visibility), and Preview (see how customers see you).',
      title: 'Store Setup',
      placement: 'right',
      category: TutorialCategory.SETTINGS,
    },
  ],
};

// All tutorial sequences
export const ALL_TUTORIAL_SEQUENCES: TutorialSequence[] = [
  GETTING_STARTED_TUTORIAL,
  DASHBOARD_TUTORIAL,
  PRODUCTS_TUTORIAL,
  ORDERS_TUTORIAL,
  SETTINGS_TUTORIAL,
];

// Get tutorials by category
export function getTutorialsByCategory(category: TutorialCategory): TutorialSequence[] {
  return ALL_TUTORIAL_SEQUENCES.filter(seq => seq.category === category);
}

// Get tutorial by ID
export function getTutorialById(id: string): TutorialSequence | undefined {
  return ALL_TUTORIAL_SEQUENCES.find(seq => seq.id === id);
}
