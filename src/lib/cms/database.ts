// CMS Database Connection and Operations
// src/lib/cms/database.ts

import { CMS_CONFIG } from './config';
import fs from 'fs';
import path from 'path';

// File-based database reading from data/cms/ directory
interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

// Path to CMS data directory
const CMS_DATA_DIR = path.join(process.cwd(), 'data', 'cms');

// Helper to read JSON file
function readJsonFile(filename: string): any {
  try {
    const filePath = path.join(CMS_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`CMS file not found: ${filePath}`);
      return { data: [] };
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading CMS file ${filename}:`, error);
    return { data: [] };
  }
}

// Helper to write JSON file
function writeJsonFile(filename: string, data: any): void {
  try {
    const filePath = path.join(CMS_DATA_DIR, filename);
    // Ensure directory exists
    if (!fs.existsSync(CMS_DATA_DIR)) {
      fs.mkdirSync(CMS_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing CMS file ${filename}:`, error);
    throw error;
  }
}

// Initialize default data (no longer needed - reading from files)
function initializeDefaultData() {
  // Hero sections
  cmsStorage.set('hero', [
    {
      id: 'hero-1',
      title: 'Freshly Harvested Mushrooms, Straight From a Grower Near You.',
      subtitle: 'Discover the best of Philippine-grown gourmet mushrooms. Supporting local farmers with every order.',
      backgroundImages: ['/Hero Section.png', '/hero-1.jpg', '/hero-2.jpg'],
      primaryButton: {
        text: 'Shop All Mushrooms',
        url: '/shop',
        variant: 'primary'
      },
      secondaryButton: {
        text: 'Meet Our Growers',
        url: '/grower',
        variant: 'outline'
      },
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Feature sections
  cmsStorage.set('features', [
    {
      id: 'features-1',
      title: 'Why MASH?',
      subtitle: 'Freshness and Quality You Can Trust',
      features: [
        {
          id: 'feature-1',
          icon: 'Leaf',
          headline: 'Locally Sourced',
          subheadline: 'Every mushroom is cultivated with care by our network of trusted Filipino growers.',
          displayOrder: 1,
          isActive: true
        },
        {
          id: 'feature-2',
          icon: 'Truck',
          headline: 'Peak Freshness',
          subheadline: 'Harvested and delivered fresh, ensuring the best flavor and nutritional value.',
          displayOrder: 2,
          isActive: true
        },
        {
          id: 'feature-3',
          icon: 'Heart',
          headline: 'Support Local',
          subheadline: 'Your purchase directly empowers small-scale farmers and promotes sustainable agriculture.',
          displayOrder: 3,
          isActive: true
        }
      ],
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // FAQ Categories
  cmsStorage.set('faq_categories', [
    { id: 'cat-1', name: 'Orders & Delivery', displayOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-2', name: 'Products', displayOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-3', name: 'Payment & Pricing', displayOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-4', name: 'Returns & Refunds', displayOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-5', name: 'Account & Security', displayOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]);

  // FAQ Items
  cmsStorage.set('faq_items', [
    {
      id: 'faq-1',
      categoryId: 'cat-1',
      question: 'How long does delivery take?',
      answer: 'Standard delivery typically takes 2-3 business days within Metro Manila and 3-5 business days for provincial areas.',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // Add more FAQ items as needed
  ]);
}

// Initialize data on module load
initializeDefaultData();

// Generic CRUD operations
export const CMS = {
  // Get all records of a type
  async findAll(type: string, options?: { activeOnly?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<DatabaseRecord[]> {
    const records = cmsStorage.get(type) || [];

    let filtered = records;

    if (options?.activeOnly) {
      filtered = records.filter(r => r.isActive !== false);
    }

    if (options?.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[options.sortBy!];
        const bVal = b[options.sortBy!];

        if (options.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return filtered;
  },

  // Get record by ID
  async findById(type: string, id: string): Promise<DatabaseRecord | null> {
    const records = cmsStorage.get(type) || [];
    return records.find(r => r.id === id) || null;
  },

  // Create new record
  async create(type: string, data: Partial<DatabaseRecord>): Promise<DatabaseRecord> {
    const records = cmsStorage.get(type) || [];

    const newRecord: DatabaseRecord = {
      id: data.id || `${type}-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    records.push(newRecord);
    cmsStorage.set(type, records);

    return newRecord;
  },

  // Update record
  async update(type: string, id: string, data: Partial<DatabaseRecord>): Promise<DatabaseRecord | null> {
    const records = cmsStorage.get(type) || [];
    const index = records.findIndex(r => r.id === id);

    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    cmsStorage.set(type, records);
    return records[index];
  },

  // Delete record
  async delete(type: string, id: string): Promise<boolean> {
    const records = cmsStorage.get(type) || [];
    const filtered = records.filter(r => r.id !== id);

    if (filtered.length === records.length) return false;

    cmsStorage.set(type, filtered);
    return true;
  },

  // Search records
  async search(type: string, query: string, fields: string[]): Promise<DatabaseRecord[]> {
    const records = cmsStorage.get(type) || [];
    const searchTerm = query.toLowerCase();

    return records.filter(record => {
      return fields.some(field => {
        const value = record[field];
        return value && String(value).toLowerCase().includes(searchTerm);
      });
    });
  }
};

// Specific CMS operations
export const HeroAPI = {
  async getAll() {
    return await CMS.findAll('hero', { activeOnly: true, sortBy: 'displayOrder', sortOrder: 'asc' });
  },

  async getById(id: string) {
    return await CMS.findById('hero', id);
  },

  async create(data: any) {
    return await CMS.create('hero', data);
  },

  async update(id: string, data: any) {
    return await CMS.update('hero', id, data);
  },

  async delete(id: string) {
    return await CMS.delete('hero', id);
  }
};

export const FeaturesAPI = {
  async getAll() {
    return await CMS.findAll('features', { activeOnly: true, sortBy: 'displayOrder', sortOrder: 'asc' });
  },

  async getById(id: string) {
    return await CMS.findById('features', id);
  },

  async create(data: any) {
    return await CMS.create('features', data);
  },

  async update(id: string, data: any) {
    return await CMS.update('features', id, data);
  },

  async delete(id: string) {
    return await CMS.delete('features', id);
  }
};

export const FAQAPI = {
  async getCategories() {
    return await CMS.findAll('faq_categories', { activeOnly: true, sortBy: 'displayOrder', sortOrder: 'asc' });
  },

  async getFAQs() {
    const faqs = await CMS.findAll('faq_items', { activeOnly: true, sortBy: 'displayOrder', sortOrder: 'asc' });
    const categories = await this.getCategories();

    // Group FAQs by category
    const groupedFAQs = categories.map(category => ({
      ...category,
      questions: faqs.filter(faq => faq.categoryId === category.id)
    }));

    return groupedFAQs;
  },

  async createFAQ(data: any) {
    return await CMS.create('faq_items', data);
  },

  async updateFAQ(id: string, data: any) {
    return await CMS.update('faq_items', id, data);
  },

  async deleteFAQ(id: string) {
    return await CMS.delete('faq_items', id);
  }
};
