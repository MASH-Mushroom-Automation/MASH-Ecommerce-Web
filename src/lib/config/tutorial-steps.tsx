/**
 * Tutorial Step Definitions
 * 
 * Comprehensive step-by-step guides for all seller platform features
 */

import { TutorialSequence, TutorialCategory } from '@/lib/types/onboarding';
import React from 'react';

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
      content: (
        <div>
          <h2 className="text-xl font-bold mb-3">🍄 Welcome to MASH Seller Center!</h2>
          <p className="mb-2">We're excited to have you here. This quick tour will help you:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Navigate the seller dashboard</li>
            <li>Add your first product</li>
            <li>Manage orders and inventory</li>
            <li>Configure your store settings</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">⏱️ Takes about 2 minutes</p>
        </div>
      ),
      placement: 'center',
      category: TutorialCategory.GETTING_STARTED,
      disableBeacon: true,
    },
    {
      id: 'dashboard-overview',
      target: '[data-tour="dashboard"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">📊 Your Dashboard</h3>
          <p>This is your control center! Here you can see:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Total sales and revenue</li>
            <li>Active orders</li>
            <li>Product performance</li>
            <li>Quick stats at a glance</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'navigation-menu',
      target: '[data-tour="sidebar-nav"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">🧭 Navigation Menu</h3>
          <p>Use this sidebar to access all seller features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Products</strong> - Add and manage your mushrooms</li>
            <li><strong>Orders</strong> - View and fulfill customer orders</li>
            <li><strong>Inventory</strong> - Track stock levels</li>
            <li><strong>Settings</strong> - Configure your store</li>
          </ul>
        </div>
      ),
      placement: 'right',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'stats-cards',
      target: '[data-tour="stats-cards"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">📈 Key Metrics</h3>
          <p>Monitor your business performance with real-time stats:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Sales trends and growth</li>
            <li>Order volume</li>
            <li>Revenue tracking</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">💡 Click any card for detailed insights</p>
        </div>
      ),
      placement: 'bottom',
      category: TutorialCategory.GETTING_STARTED,
    },
    {
      id: 'next-steps',
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-3">🎉 You're All Set!</h2>
          <p className="mb-3">Great job! You now know the basics.</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold mb-2">📝 Recommended Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Complete your store profile</li>
              <li>Add your first product</li>
              <li>Set up business hours</li>
              <li>Configure delivery options</li>
            </ol>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            💬 Need help? Click the help icon anytime!
          </p>
        </div>
      ),
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
      content: (
        <div>
          <h3 className="font-semibold mb-2">📊 Sales Analytics</h3>
          <p>Track your sales performance over time:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Daily, weekly, monthly views</li>
            <li>Revenue trends</li>
            <li>Comparison with previous periods</li>
          </ul>
        </div>
      ),
      placement: 'top',
      category: TutorialCategory.DASHBOARD,
    },
    {
      id: 'recent-orders',
      target: '[data-tour="recent-orders"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">📦 Recent Orders</h3>
          <p>Quick access to latest customer orders:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Order status at a glance</li>
            <li>Click to view full details</li>
            <li>Quick actions available</li>
          </ul>
        </div>
      ),
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
      content: (
        <div>
          <h3 className="font-semibold mb-2">➕ Add Your First Product</h3>
          <p>Click here to start listing your mushrooms:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Upload high-quality photos</li>
            <li>Set competitive prices</li>
            <li>Write compelling descriptions</li>
            <li>Manage stock levels</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      category: TutorialCategory.PRODUCTS,
    },
    {
      id: 'product-list',
      target: '[data-tour="product-list"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">📋 Product Catalog</h3>
          <p>Manage all your products in one place:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Search and filter products</li>
            <li>Quick edit options</li>
            <li>Enable/disable listings</li>
            <li>Track inventory status</li>
          </ul>
        </div>
      ),
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
      content: (
        <div>
          <h3 className="font-semibold mb-2">📦 Order Status Tabs</h3>
          <p>Orders are organized by their current status:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Pending</strong> - New orders awaiting confirmation</li>
            <li><strong>Confirmed</strong> - Ready to prepare</li>
            <li><strong>Ready</strong> - Prepared for pickup/delivery</li>
            <li><strong>Completed</strong> - Successfully delivered</li>
          </ul>
        </div>
      ),
      placement: 'bottom',
      category: TutorialCategory.ORDERS,
    },
    {
      id: 'order-actions',
      target: '[data-tour="order-actions"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">⚡ Quick Actions</h3>
          <p>Process orders efficiently:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Confirm new orders</li>
            <li>Mark as ready for pickup</li>
            <li>Update delivery status</li>
            <li>Contact customer directly</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">💡 Faster processing = Happier customers!</p>
        </div>
      ),
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
      content: (
        <div>
          <h3 className="font-semibold mb-2">🏪 Store Profile</h3>
          <p>Complete your store information:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Store name and logo</li>
            <li>Contact details</li>
            <li>Business location</li>
            <li>Store description</li>
          </ul>
        </div>
      ),
      placement: 'right',
      category: TutorialCategory.SETTINGS,
    },
    {
      id: 'store-setup-tab',
      target: '[data-tour="settings-store-setup"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">⚙️ Store Setup</h3>
          <p>Configure advanced settings:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Business Hours</strong> - When you're open</li>
            <li><strong>Social Media</strong> - Connect your profiles</li>
            <li><strong>SEO</strong> - Improve search visibility</li>
            <li><strong>Preview</strong> - See how customers see you</li>
          </ul>
        </div>
      ),
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
