const mongoose = require('mongoose');
const Product = require('../models/Product');

// Mock MongoDB connection
jest.mock('mongoose');

describe('Product Model Tests', () => {
  
  describe('Property 3: Product Stock Removal', () => {
    /**
     * Feature: lynk-platform-transformation, Property 3: Product Stock Removal
     * Validates: Requirements 1.1, 1.4
     * 
     * For any product in the system, the product SHALL NOT have a stock field or stock-related information.
     */
    
    test('Product schema should not have stock field', () => {
      const schema = Product.schema;
      expect(schema.paths.stock).toBeUndefined();
    });

    test('Product schema should have driveLink field', () => {
      const schema = Product.schema;
      expect(schema.paths.driveLink).toBeDefined();
    });

    test('driveLink field should be required', () => {
      const schema = Product.schema;
      const driveLinkPath = schema.paths.driveLink;
      expect(driveLinkPath.isRequired).toBe(true);
    });

    test('Product should not accept stock field on creation', async () => {
      const productData = {
        name: 'Test Course',
        description: 'A test course',
        price: 99.99,
        category: 'Programming',
        image: 'test.jpg',
        driveLink: 'https://drive.google.com/test',
        stock: 100 // This should be ignored
      };

      const product = new Product(productData);
      expect(product.stock).toBeUndefined();
    });

    test('Product should have required fields: name, price, driveLink', async () => {
      const schema = Product.schema;
      expect(schema.paths.name.isRequired).toBe(true);
      expect(schema.paths.price.isRequired).toBe(true);
      expect(schema.paths.driveLink.isRequired).toBe(true);
    });

    test('Product should have optional fields: description, category, image', async () => {
      const schema = Product.schema;
      expect(schema.paths.description.isRequired).toBe(false);
      expect(schema.paths.category.isRequired).toBe(false);
      expect(schema.paths.image.isRequired).toBe(false);
    });

    test('Product creation should fail without driveLink', async () => {
      const productData = {
        name: 'Test Course',
        price: 99.99,
        category: 'Programming'
        // Missing driveLink
      };

      const product = new Product(productData);
      const error = product.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.driveLink).toBeDefined();
    });

    test('Product should have rating field with default 0', async () => {
      const schema = Product.schema;
      expect(schema.paths.rating).toBeDefined();
      expect(schema.paths.rating.defaultValue).toBe(0);
    });

    test('Product should have timestamps', async () => {
      const schema = Product.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    test('Valid product with all required fields should pass validation', async () => {
      const productData = {
        name: 'Advanced JavaScript',
        description: 'Learn advanced JavaScript concepts',
        price: 149.99,
        category: 'Programming',
        image: 'js-course.jpg',
        driveLink: 'https://drive.google.com/folders/advanced-js'
      };

      const product = new Product(productData);
      const error = product.validateSync();
      expect(error).toBeUndefined();
    });

    test('Product should not have stock-related methods or properties', async () => {
      const product = new Product({
        name: 'Test',
        price: 99,
        driveLink: 'https://drive.google.com/test'
      });

      expect(product.stock).toBeUndefined();
      expect(typeof product.decreaseStock).not.toBe('function');
      expect(typeof product.increaseStock).not.toBe('function');
    });
  });

  describe('Product Schema Structure', () => {
    test('Product should have correct field types', () => {
      const schema = Product.schema;
      expect(schema.paths.name.instance).toBe('String');
      expect(schema.paths.price.instance).toBe('Number');
      expect(schema.paths.driveLink.instance).toBe('String');
      expect(schema.paths.rating.instance).toBe('Number');
    });

    test('Product price should be a number', () => {
      const product = new Product({
        name: 'Test',
        price: 'not-a-number',
        driveLink: 'https://drive.google.com/test'
      });

      const error = product.validateSync();
      expect(error).toBeDefined();
    });

    test('Product should accept valid driveLink formats', () => {
      const validLinks = [
        'https://drive.google.com/file/d/1234567890/view',
        'https://drive.google.com/folders/1234567890',
        'https://example.com/course-materials',
        'https://dropbox.com/s/abc123/course.zip'
      ];

      validLinks.forEach(link => {
        const product = new Product({
          name: 'Test',
          price: 99,
          driveLink: link
        });
        const error = product.validateSync();
        expect(error).toBeUndefined();
      });
    });
  });
});
