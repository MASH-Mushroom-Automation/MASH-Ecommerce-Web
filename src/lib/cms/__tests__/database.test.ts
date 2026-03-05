/**
 * Tests for CMS File-based Database (HeroAPI, FeaturesAPI, FAQAPI)
 * Uses fs mocking for file I/O operations
 */

import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = jest.mocked(fs);

// Mock path.join to return predictable paths
const CMS_DATA_DIR = path.join(process.cwd(), 'data', 'cms');

import { HeroAPI, FeaturesAPI, FAQAPI } from '../database';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HeroAPI', () => {
  describe('getAll', () => {
    it('returns data from hero.json', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'hero-1', title: 'Welcome' }],
      }));

      const result = await HeroAPI.getAll();
      expect(result).toEqual([{ id: 'hero-1', title: 'Welcome' }]);
    });

    it('returns empty array when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      const result = await HeroAPI.getAll();
      expect(result).toEqual([]);
    });

    it('returns empty array on JSON parse error', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json{');
      const result = await HeroAPI.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('finds hero by id', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [
          { id: 'hero-1', title: 'First' },
          { id: 'hero-2', title: 'Second' },
        ],
      }));

      const result = await HeroAPI.getById('hero-2');
      expect(result).toEqual({ id: 'hero-2', title: 'Second' });
    });

    it('returns null when not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));

      const result = await HeroAPI.getById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new hero entry', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await HeroAPI.create({ title: 'New Hero', id: 'hero-new' });
      expect(result.id).toBe('hero-new');
      expect(result.title).toBe('New Hero');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('auto-generates id when not provided', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await HeroAPI.create({ title: 'Auto ID' });
      expect(result.id).toMatch(/^hero-\d+$/);
    });
  });

  describe('update', () => {
    it('updates existing hero', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'hero-1', title: 'Old Title', createdAt: '2024-01-01' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await HeroAPI.update('hero-1', { title: 'New Title' });
      expect(result).not.toBeNull();
      expect(result!.title).toBe('New Title');
      expect(result!.updatedAt).toBeDefined();
    });

    it('returns null when hero not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));

      const result = await HeroAPI.update('nonexistent', { title: 'X' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes existing hero', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'hero-1' }, { id: 'hero-2' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await HeroAPI.delete('hero-1');
      expect(result).toBe(true);
    });

    it('returns false when hero not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [{ id: 'hero-1' }] }));

      const result = await HeroAPI.delete('nonexistent');
      expect(result).toBe(false);
    });
  });
});

describe('FeaturesAPI', () => {
  describe('getAll', () => {
    it('returns features data', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'feat-1', name: 'Feature A' }],
      }));

      const result = await FeaturesAPI.getAll();
      expect(result).toEqual([{ id: 'feat-1', name: 'Feature A' }]);
    });

    it('returns empty array when file missing', async () => {
      mockFs.existsSync.mockReturnValue(false);
      const result = await FeaturesAPI.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('finds feature by id', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'feat-1', name: 'Test' }],
      }));

      const result = await FeaturesAPI.getById('feat-1');
      expect(result).toEqual({ id: 'feat-1', name: 'Test' });
    });
  });

  describe('create', () => {
    it('creates a new feature', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FeaturesAPI.create({ name: 'New Feature' });
      expect(result.name).toBe('New Feature');
      expect(result.id).toMatch(/^features-\d+$/);
    });
  });

  describe('update', () => {
    it('updates existing feature', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'feat-1', name: 'Old' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FeaturesAPI.update('feat-1', { name: 'Updated' });
      expect(result!.name).toBe('Updated');
    });

    it('returns null when not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      const result = await FeaturesAPI.update('x', { name: 'Y' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes existing feature', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'feat-1' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FeaturesAPI.delete('feat-1');
      expect(result).toBe(true);
    });

    it('returns false when not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      const result = await FeaturesAPI.delete('x');
      expect(result).toBe(false);
    });
  });
});

describe('FAQAPI', () => {
  describe('getCategories', () => {
    it('returns FAQ categories', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'cat-1', name: 'General' }],
      }));

      const result = await FAQAPI.getCategories();
      expect(result).toEqual([{ id: 'cat-1', name: 'General' }]);
    });
  });

  describe('getFAQs', () => {
    it('groups FAQs by category', async () => {
      // First call gets faq.json, second gets faq-categories.json
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify({
          data: [
            { id: 'faq-1', question: 'Q1', category: 'cat-1' },
            { id: 'faq-2', question: 'Q2', category: 'cat-2' },
            { id: 'faq-3', question: 'Q3', category: 'cat-1' },
          ],
        }))
        .mockReturnValueOnce(JSON.stringify({
          data: [
            { id: 'cat-1', name: 'General' },
            { id: 'cat-2', name: 'Shipping' },
          ],
        }));

      const result = await FAQAPI.getFAQs();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('General');
      expect(result[0].questions).toHaveLength(2);
      expect(result[1].name).toBe('Shipping');
      expect(result[1].questions).toHaveLength(1);
    });
  });

  describe('createFAQ', () => {
    it('creates a new FAQ entry', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FAQAPI.createFAQ({ question: 'Q?', answer: 'A', category: 'cat-1' });
      expect(result.question).toBe('Q?');
      expect(result.id).toMatch(/^faq-\d+$/);
    });
  });

  describe('updateFAQ', () => {
    it('updates existing FAQ', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'faq-1', question: 'Old Q' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FAQAPI.updateFAQ('faq-1', { question: 'New Q' });
      expect(result!.question).toBe('New Q');
    });

    it('returns null when not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      const result = await FAQAPI.updateFAQ('x', { question: 'Q' });
      expect(result).toBeNull();
    });
  });

  describe('deleteFAQ', () => {
    it('deletes existing FAQ', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        data: [{ id: 'faq-1' }],
      }));
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await FAQAPI.deleteFAQ('faq-1');
      expect(result).toBe(true);
    });

    it('returns false when not found', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
      const result = await FAQAPI.deleteFAQ('x');
      expect(result).toBe(false);
    });
  });
});

describe('writeJsonFile error handling', () => {
  it('creates directory if it does not exist', async () => {
    // First existsSync for reading file, then for directory check during write
    mockFs.existsSync
      .mockReturnValueOnce(true) // reading file exists
      .mockReturnValueOnce(false); // CMS_DATA_DIR doesn't exist
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
    mockFs.mkdirSync.mockImplementation(() => undefined as any);
    mockFs.writeFileSync.mockImplementation(() => {});

    await HeroAPI.create({ title: 'Test' });
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('cms'),
      { recursive: true }
    );
  });

  it('rethrows write errors', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ data: [] }));
    mockFs.writeFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    await expect(HeroAPI.create({ title: 'Fail' })).rejects.toThrow('Permission denied');
  });
});
