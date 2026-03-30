const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

jest.mock('mongoose');

describe('Complaint Model Tests', () => {
  
  describe('Property 4: Complaint Category Filtering', () => {
    /**
     * Feature: lynk-platform-transformation, Property 4: Complaint Category Filtering
     * Validates: Requirements 3.1, 3.2, 3.3
     * 
     * For any complaint submitted, the system SHALL only accept non-delivery complaint categories 
     * (product-quality, content-issue, technical-problem).
     */
    
    test('Complaint schema should only have non-delivery categories', () => {
      const schema = Complaint.schema;
      const categoryEnum = schema.paths.category.enumValues;
      
      expect(categoryEnum).toContain('product-quality');
      expect(categoryEnum).toContain('content-issue');
      expect(categoryEnum).toContain('technical-problem');
      expect(categoryEnum).not.toContain('delivery');
      expect(categoryEnum).not.toContain('shipping');
      expect(categoryEnum).not.toContain('payment');
      expect(categoryEnum).not.toContain('service');
      expect(categoryEnum).not.toContain('other');
    });

    test('Complaint should reject delivery category', async () => {
      const complaintData = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '1234567890',
        subject: 'Delivery Issue',
        category: 'delivery',
        message: 'Package not delivered'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test('Complaint should reject shipping category', async () => {
      const complaintData = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '1234567890',
        subject: 'Shipping Issue',
        category: 'shipping',
        message: 'Shipping took too long'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test('Complaint should accept product-quality category', async () => {
      const complaintData = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '1234567890',
        subject: 'Poor Course Quality',
        category: 'product-quality',
        message: 'The course content is not clear'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeUndefined();
    });

    test('Complaint should accept content-issue category', async () => {
      const complaintData = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '1234567890',
        subject: 'Content Issue',
        category: 'content-issue',
        message: 'The course material is outdated'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeUndefined();
    });

    test('Complaint should accept technical-problem category', async () => {
      const complaintData = {
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '1234567890',
        subject: 'Technical Problem',
        category: 'technical-problem',
        message: 'Cannot access the drive link'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeUndefined();
    });

    test('Complaint should have default category as product-quality', () => {
      const schema = Complaint.schema;
      expect(schema.paths.category.defaultValue).toBe('product-quality');
    });

    test('Complaint should have required fields', () => {
      const schema = Complaint.schema;
      expect(schema.paths.userName.isRequired).toBe(true);
      expect(schema.paths.userEmail.isRequired).toBe(true);
      expect(schema.paths.userPhone.isRequired).toBe(true);
      expect(schema.paths.subject.isRequired).toBe(true);
      expect(schema.paths.message.isRequired).toBe(true);
    });

    test('Valid complaint with product-quality category should pass validation', async () => {
      const complaintData = {
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        userPhone: '9876543210',
        subject: 'Course Quality Feedback',
        category: 'product-quality',
        message: 'The course could be improved with more examples',
        priority: 'medium'
      };

      const complaint = new Complaint(complaintData);
      const error = complaint.validateSync();
      expect(error).toBeUndefined();
    });

    test('Complaint should not have delivery-related fields', () => {
      const schema = Complaint.schema;
      expect(schema.paths.shippingAddress).toBeUndefined();
      expect(schema.paths.trackingNumber).toBeUndefined();
      expect(schema.paths.deliveryDate).toBeUndefined();
    });

    test('All valid categories should be accepted', async () => {
      const validCategories = ['product-quality', 'content-issue', 'technical-problem'];
      
      for (const category of validCategories) {
        const complaintData = {
          userName: 'Test User',
          userEmail: 'test@example.com',
          userPhone: '1234567890',
          subject: 'Test Complaint',
          category: category,
          message: 'Test message'
        };

        const complaint = new Complaint(complaintData);
        const error = complaint.validateSync();
        expect(error).toBeUndefined();
      }
    });

    test('Complaint should have status enum values', () => {
      const schema = Complaint.schema;
      const statusEnum = schema.paths.status.enumValues;
      expect(statusEnum).toContain('open');
      expect(statusEnum).toContain('in-progress');
      expect(statusEnum).toContain('resolved');
      expect(statusEnum).toContain('closed');
    });

    test('Complaint should have priority enum values', () => {
      const schema = Complaint.schema;
      const priorityEnum = schema.paths.priority.enumValues;
      expect(priorityEnum).toContain('low');
      expect(priorityEnum).toContain('medium');
      expect(priorityEnum).toContain('high');
    });

    test('Complaint should have timestamps', () => {
      const schema = Complaint.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });
  });

  describe('Complaint Schema Structure', () => {
    test('Complaint should have correct field types', () => {
      const schema = Complaint.schema;
      expect(schema.paths.userName.instance).toBe('String');
      expect(schema.paths.userEmail.instance).toBe('String');
      expect(schema.paths.userPhone.instance).toBe('String');
      expect(schema.paths.subject.instance).toBe('String');
      expect(schema.paths.category.instance).toBe('String');
      expect(schema.paths.message.instance).toBe('String');
      expect(schema.paths.status.instance).toBe('String');
      expect(schema.paths.priority.instance).toBe('String');
    });

    test('Complaint should have default values', () => {
      const schema = Complaint.schema;
      expect(schema.paths.category.defaultValue).toBe('product-quality');
      expect(schema.paths.status.defaultValue).toBe('open');
      expect(schema.paths.priority.defaultValue).toBe('medium');
    });

    test('Complaint should have attachments array', () => {
      const schema = Complaint.schema;
      expect(schema.paths.attachments).toBeDefined();
    });
  });
});
