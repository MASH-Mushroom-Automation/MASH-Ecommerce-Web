/**
 * Help Tooltip Definitions
 * 
 * Context-sensitive help tooltips for the seller platform
 */

import { HelpTooltip, TutorialCategory } from '@/lib/types/onboarding';

// Dashboard Tooltips
export const DASHBOARD_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'dashboard-stats',
    target: '[data-tooltip="stats-cards"]',
    title: 'Quick Stats',
    content: 'Monitor your business performance at a glance. Click any card for detailed reports.',
    category: TutorialCategory.DASHBOARD,
    placement: 'bottom',
    isDismissible: true,
    priority: 3,
  },
  {
    id: 'dashboard-sales-chart',
    target: '[data-tooltip="sales-chart"]',
    title: 'Sales Trends',
    content: 'Track your revenue over time. Hover over the chart for daily details.',
    category: TutorialCategory.DASHBOARD,
    placement: 'top',
    isDismissible: true,
    showOnce: true,
    priority: 2,
  },
];

// Products Tooltips
export const PRODUCTS_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'add-product-tip',
    target: '[data-tooltip="add-product"]',
    title: 'List Your First Product',
    content: 'Start selling by adding your mushroom products. High-quality photos increase sales by 40%!',
    category: TutorialCategory.PRODUCTS,
    placement: 'left',
    isDismissible: true,
    priority: 5,
  },
  {
    id: 'product-photos',
    target: '[data-tooltip="product-photos"]',
    title: 'Product Photos',
    content: 'Upload clear, well-lit photos. Recommended: 1200x1200px, white background.',
    category: TutorialCategory.PRODUCTS,
    placement: 'right',
    isDismissible: true,
    priority: 4,
  },
  {
    id: 'pricing-strategy',
    target: '[data-tooltip="product-price"]',
    title: 'Competitive Pricing',
    content: 'Check competitor prices before setting yours. Factor in costs and desired profit margin.',
    category: TutorialCategory.PRODUCTS,
    placement: 'top',
    isDismissible: true,
    priority: 3,
  },
  {
    id: 'inventory-tracking',
    target: '[data-tooltip="product-stock"]',
    title: 'Stock Management',
    content: 'Keep inventory updated to avoid overselling. Enable low stock alerts in settings.',
    category: TutorialCategory.PRODUCTS,
    placement: 'top',
    isDismissible: true,
    priority: 4,
  },
];

// Orders Tooltips
export const ORDERS_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'order-status',
    target: '[data-tooltip="order-status"]',
    title: 'Order Statuses',
    content: 'Move orders through stages: Pending → Confirmed → Ready → Completed. Fast processing builds trust!',
    category: TutorialCategory.ORDERS,
    placement: 'bottom',
    isDismissible: true,
    priority: 5,
  },
  {
    id: 'order-notification',
    target: '[data-tooltip="order-notifications"]',
    title: 'Customer Communication',
    content: 'Keep customers informed! Send updates when order status changes.',
    category: TutorialCategory.ORDERS,
    placement: 'left',
    isDismissible: true,
    priority: 4,
  },
  {
    id: 'shipping-label',
    target: '[data-tooltip="shipping-label"]',
    title: 'Shipping Labels',
    content: 'Print shipping labels directly from here. Integrate with courier services for tracking.',
    category: TutorialCategory.ORDERS,
    placement: 'top',
    isDismissible: true,
    priority: 2,
  },
];

// Settings Tooltips
export const SETTINGS_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'business-hours',
    target: '[data-tooltip="business-hours"]',
    title: 'Business Hours',
    content: 'Let customers know when you are available. Affects delivery scheduling and pickup times.',
    category: TutorialCategory.SETTINGS,
    placement: 'right',
    isDismissible: true,
    priority: 4,
  },
  {
    id: 'social-media',
    target: '[data-tooltip="social-media"]',
    title: 'Social Media Links',
    content: 'Connect your social profiles to build trust and increase engagement.',
    category: TutorialCategory.SETTINGS,
    placement: 'right',
    isDismissible: true,
    priority: 3,
  },
  {
    id: 'seo-meta',
    target: '[data-tooltip="seo-meta"]',
    title: 'SEO Optimization',
    content: 'Improve your store visibility in search engines. Use relevant keywords!',
    category: TutorialCategory.SETTINGS,
    placement: 'right',
    isDismissible: true,
    priority: 3,
  },
  {
    id: 'profile-preview',
    target: '[data-tooltip="profile-preview"]',
    title: 'Preview Your Store',
    content: 'See how your store appears to customers before publishing changes.',
    category: TutorialCategory.SETTINGS,
    placement: 'left',
    isDismissible: true,
    priority: 2,
  },
];

// Inventory Tooltips
export const INVENTORY_TOOLTIPS: HelpTooltip[] = [
  {
    id: 'low-stock-alert',
    target: '[data-tooltip="low-stock"]',
    title: 'Low Stock Alert',
    content: 'Items below your threshold are highlighted. Restock soon to avoid losing sales!',
    category: TutorialCategory.INVENTORY,
    placement: 'top',
    isDismissible: true,
    priority: 4,
  },
  {
    id: 'batch-update',
    target: '[data-tooltip="batch-update"]',
    title: 'Bulk Actions',
    content: 'Select multiple items to update prices, stock, or status at once.',
    category: TutorialCategory.INVENTORY,
    placement: 'left',
    isDismissible: true,
    priority: 3,
  },
];

// All tooltips
export const ALL_HELP_TOOLTIPS: HelpTooltip[] = [
  ...DASHBOARD_TOOLTIPS,
  ...PRODUCTS_TOOLTIPS,
  ...ORDERS_TOOLTIPS,
  ...SETTINGS_TOOLTIPS,
  ...INVENTORY_TOOLTIPS,
];

// Get tooltips by category
export function getTooltipsByCategory(category: TutorialCategory): HelpTooltip[] {
  return ALL_HELP_TOOLTIPS.filter(tooltip => tooltip.category === category);
}

// Get tooltip by ID
export function getTooltipById(id: string): HelpTooltip | undefined {
  return ALL_HELP_TOOLTIPS.find(tooltip => tooltip.id === id);
}

// Get tooltips for a specific page
export function getTooltipsForPage(route: string): HelpTooltip[] {
  const routeCategoryMap: Record<string, TutorialCategory> = {
    '/seller/dashboard': TutorialCategory.DASHBOARD,
    '/seller/products': TutorialCategory.PRODUCTS,
    '/seller/inventory': TutorialCategory.INVENTORY,
    '/seller/orders': TutorialCategory.ORDERS,
    '/seller/settings': TutorialCategory.SETTINGS,
  };

  const category = routeCategoryMap[route];
  return category ? getTooltipsByCategory(category) : [];
}
