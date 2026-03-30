const mongoose = require('mongoose');
const Feed = require('../models/Feed');

jest.mock('mongoose');

describe('Feed Model Tests', () => {
  
  describe('Property 5: Feed/Reel Admin-Only Upload', () => {
    /**
     * Feature: lynk-platform-transformation, Property 5: Feed/Reel Admin-Only Upload
     * Validates: Requirements 4.1, 4.2
     * 
     * For any feed or reel in the system, it SHALL only be created by admin users through the dashboard.
     */
    
    test('Feed schema should have required adminId field', () => {
      const schema = Feed.schema;
      expect(schema.paths.adminId).toBeDefined();
      expect(schema.paths.adminId.isRequired).toBe(true);
    });

    test('Feed schema should have required title field', () => {
      const schema = Feed.schema;
      expect(schema.paths.title).toBeDefined();
      expect(schema.paths.title.isRequired).toBe(true);
    });

    test('Feed should accept image or video file', () => {
      const schema = Feed.schema;
      expect(schema.paths.image).toBeDefined();
      expect(schema.paths.video).toBeDefined();
    });

    test('Feed should have type field with enum values', () => {
      const schema = Feed.schema;
      expect(schema.paths.type).toBeDefined();
      const typeEnum = schema.paths.type.enumValues;
      expect(typeEnum).toContain('feed');
      expect(typeEnum).toContain('reel');
    });

    test('Feed creation should fail without adminId', async () => {
      const feedData = {
        title: 'Test Feed',
        description: 'A test feed',
        image: 'test.jpg'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.adminId).toBeDefined();
    });

    test('Feed creation should fail without title', async () => {
      const feedData = {
        adminId: new mongoose.Types.ObjectId(),
        description: 'A test feed',
        image: 'test.jpg'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    test('Valid feed with required fields should pass validation', async () => {
      const feedData = {
        title: 'Learning Tips',
        description: 'Tips for effective learning',
        image: 'tips.jpg',
        adminId: new mongoose.Types.ObjectId(),
        type: 'feed'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeUndefined();
    });

    test('Feed should have isActive field with default true', () => {
      const schema = Feed.schema;
      expect(schema.paths.isActive).toBeDefined();
      expect(schema.paths.isActive.defaultValue).toBe(true);
    });

    test('Feed should have timestamps', () => {
      const schema = Feed.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    test('Feed should reference User model for adminId', () => {
      const schema = Feed.schema;
      const adminIdPath = schema.paths.adminId;
      expect(adminIdPath.options.ref).toBe('User');
    });

    test('Feed type should default to feed', () => {
      const schema = Feed.schema;
      expect(schema.paths.type.defaultValue).toBe('feed');
    });

    test('Feed should accept both image and video', async () => {
      const feedData = {
        title: 'Video Tutorial',
        adminId: new mongoose.Types.ObjectId(),
        image: 'thumbnail.jpg',
        video: 'https://example.com/video.mp4',
        type: 'reel'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeUndefined();
      expect(feed.image).toBe('thumbnail.jpg');
      expect(feed.video).toBe('https://example.com/video.mp4');
    });

    test('Feed should accept only image without video', async () => {
      const feedData = {
        title: 'Image Post',
        adminId: new mongoose.Types.ObjectId(),
        image: 'post.jpg'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeUndefined();
    });

    test('Feed should accept only video without image', async () => {
      const feedData = {
        title: 'Video Post',
        adminId: new mongoose.Types.ObjectId(),
        video: 'https://example.com/video.mp4'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeUndefined();
    });

    test('Feed description should be optional', () => {
      const schema = Feed.schema;
      expect(schema.paths.description.isRequired).toBe(false);
    });

    test('Feed should have correct field types', () => {
      const schema = Feed.schema;
      expect(schema.paths.title.instance).toBe('String');
      expect(schema.paths.description.instance).toBe('String');
      expect(schema.paths.image.instance).toBe('String');
      expect(schema.paths.video.instance).toBe('String');
      expect(schema.paths.type.instance).toBe('String');
      expect(schema.paths.isActive.instance).toBe('Boolean');
    });
  });

  describe('Feed Schema Structure', () => {
    test('Feed should have all required fields defined', () => {
      const schema = Feed.schema;
      expect(schema.paths.title).toBeDefined();
      expect(schema.paths.adminId).toBeDefined();
    });

    test('Feed should accept valid type values', async () => {
      const validTypes = ['feed', 'reel'];
      
      for (const type of validTypes) {
        const feedData = {
          title: 'Test',
          adminId: new mongoose.Types.ObjectId(),
          type: type
        };

        const feed = new Feed(feedData);
        const error = feed.validateSync();
        expect(error).toBeUndefined();
      }
    });

    test('Feed should reject invalid type values', async () => {
      const feedData = {
        title: 'Test',
        adminId: new mongoose.Types.ObjectId(),
        type: 'invalid-type'
      };

      const feed = new Feed(feedData);
      const error = feed.validateSync();
      expect(error).toBeDefined();
    });
  });
});
