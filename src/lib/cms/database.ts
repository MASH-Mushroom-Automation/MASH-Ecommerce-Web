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

// File-based database - Reading directly from JSON files in data/cms/

// Specific CMS operations - Reading from JSON files
export const HeroAPI = {
  async getAll() {
    const fileData = readJsonFile('hero.json');
    return fileData.data || [];
  },

  async getById(id: string) {
    const heroes = await this.getAll();
    return heroes.find((h: any) => h.id === id) || null;
  },

  async create(data: Record<string, unknown>) {
    const heroes = await this.getAll();
    const newHero = {
      id: data.id || `hero-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    heroes.push(newHero);
    writeJsonFile('hero.json', { data: heroes });
    return newHero;
  },

  async update(id: string, data: Record<string, unknown>) {
    const heroes = await this.getAll();
    const index = heroes.findIndex((h: any) => h.id === id);
    if (index === -1) return null;
    
    heroes[index] = {
      ...heroes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile('hero.json', { data: heroes });
    return heroes[index];
  },

  async delete(id: string) {
    const heroes = await this.getAll();
    const filtered = heroes.filter((h: Record<string, unknown>) => h.id !== id);
    if (filtered.length === heroes.length) return false;
    writeJsonFile('hero.json', { data: filtered });
    return true;
  }
};

export const FeaturesAPI = {
  async getAll() {
    const fileData = readJsonFile('features.json');
    return fileData.data || [];
  },

  async getById(id: string) {
    const features = await this.getAll();
    return features.find((f: Record<string, unknown>) => f.id === id) || null;
  },

  async create(data: Record<string, unknown>) {
    const features = await this.getAll();
    const newFeature = {
      id: data.id || `features-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    features.push(newFeature);
    writeJsonFile('features.json', { data: features });
    return newFeature;
  },

  async update(id: string, data: Record<string, unknown>) {
    const features = await this.getAll();
    const index = features.findIndex((f: Record<string, unknown>) => f.id === id);
    if (index === -1) return null;
    
    features[index] = {
      ...features[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile('features.json', { data: features });
    return features[index];
  },

  async delete(id: string) {
    const features = await this.getAll();
    const filtered = features.filter((f: Record<string, unknown>) => f.id !== id);
    if (filtered.length === features.length) return false;
    writeJsonFile('features.json', { data: filtered });
    return true;
  }
};

export const FAQAPI = {
  async getCategories() {
    const fileData = readJsonFile('faq-categories.json');
    return fileData.data || [];
  },

  async getFAQs() {
    const faqFileData = readJsonFile('faq.json');
    const faqs = faqFileData.data || [];
    const categories = await this.getCategories();

    // Group FAQs by category
    const groupedFAQs = categories.map((category: Record<string, unknown>) => ({
      ...category,
      questions: faqs.filter((faq: Record<string, unknown>) => faq.category === category.id)
    }));

    return groupedFAQs;
  },

  async createFAQ(data: Record<string, unknown>) {
    const faqs = (readJsonFile('faq.json').data || []);
    const newFAQ = {
      id: data.id || `faq-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    faqs.push(newFAQ);
    writeJsonFile('faq.json', { data: faqs });
    return newFAQ;
  },

  async updateFAQ(id: string, data: Record<string, unknown>) {
    const faqs = readJsonFile('faq.json').data || [];
    const index = faqs.findIndex((f: Record<string, unknown>) => f.id === id);
    if (index === -1) return null;
    
    faqs[index] = {
      ...faqs[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    writeJsonFile('faq.json', { data: faqs });
    return faqs[index];
  },

  async deleteFAQ(id: string) {
    const faqs = readJsonFile('faq.json').data || [];
    const filtered = faqs.filter((f: Record<string, unknown>) => f.id !== id);
    if (filtered.length === faqs.length) return false;
    writeJsonFile('faq.json', { data: filtered });
    return true;
  }
};
