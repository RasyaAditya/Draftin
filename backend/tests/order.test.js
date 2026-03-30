const mongoose = require('mongoose');
const Order = require('../models/Order');

jest.mock('mongoose');

describe('Order Model Tests', () => {
  
  describe('Property 2: No Address in Orders', () => {
    /**
     * Feature: lynk-platform-transformation, Property 2: No Address in Orders
     * Validates: Requirements 2.3, 2.4
     * 
     * For any order created in the system, the order SHALL NOT contain address information.
     */
    
    test('Order schema should not have shippingAddress field', () => {
      const schema = Order.schema;
      expect(schema.paths.shippingAddress).toBeUndefined();
    });

    test('Order should not accept shippingAddress on creation', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Test Course',
          price: 99.99,
          driveLink: 'https://drive.google.com/test'
        }],
        totalPrice: 99.99,
        shippingAddress: {
          fullName: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          province: 'NY',
          postalCode: '10001'
        }
      };

      const order = new Order(orderData);
      expect(order.shippingAddress).toBeUndefined();
    });

    test('Order should have required fields: userId, products, totalPrice, paymentStatus', async () => {
      const schema = Order.schema;
      expect(schema.paths.userId.isRequired).toBe(true);
      expect(schema.paths.totalPrice.isRequired).toBe(true);
    });

    test('Order should only contain: userId, products, totalPrice, paymentStatus, status, isReviewed', async () => {
      const schema = Order.schema;
      const allowedFields = ['userId', 'orderNumber', 'products', 'totalPrice', 'status', 'paymentStatus', 'isReviewed', 'createdAt', 'updatedAt', '_id', '__v'];
      
      Object.keys(schema.paths).forEach(field => {
        expect(allowedFields).toContain(field);
      });
    });

    test('Order should not have address-related fields', async () => {
      const schema = Order.schema;
      expect(schema.paths.shippingAddress).toBeUndefined();
      expect(schema.paths.fullName).toBeUndefined();
      expect(schema.paths.phone).toBeUndefined();
      expect(schema.paths.address).toBeUndefined();
      expect(schema.paths.city).toBeUndefined();
      expect(schema.paths.province).toBeUndefined();
      expect(schema.paths.postalCode).toBeUndefined();
    });

    test('Order creation should fail without userId', async () => {
      const orderData = {
        products: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Test Course',
          price: 99.99,
          driveLink: 'https://drive.google.com/test'
        }],
        totalPrice: 99.99
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    test('Order creation should fail without totalPrice', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Test Course',
          price: 99.99,
          driveLink: 'https://drive.google.com/test'
        }]
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.totalPrice).toBeDefined();
    });

    test('Valid order without address should pass validation', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Advanced JavaScript',
          price: 149.99,
          driveLink: 'https://drive.google.com/folders/advanced-js'
        }],
        totalPrice: 149.99,
        paymentStatus: 'paid'
      };

      const order = new Order(orderData);
      const error = order.validateSync();
      expect(error).toBeUndefined();
    });

    test('Order should have products array with driveLink', async () => {
      const schema = Order.schema;
      expect(schema.paths.products).toBeDefined();
      
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [{
          productId: new mongoose.Types.ObjectId(),
          name: 'Test Course',
          price: 99.99,
          driveLink: 'https://drive.google.com/test'
        }],
        totalPrice: 99.99
      };

      const order = new Order(orderData);
      expect(order.products).toBeDefined();
      expect(order.products.length).toBe(1);
      expect(order.products[0].driveLink).toBe('https://drive.google.com/test');
    });

    test('Order should have correct status enum values', async () => {
      const schema = Order.schema;
      const statusEnum = schema.paths.status.enumValues;
      expect(statusEnum).toContain('pending');
      expect(statusEnum).toContain('processing');
      expect(statusEnum).toContain('completed');
      expect(statusEnum).toContain('success');
      expect(statusEnum).toContain('cancelled');
    });

    test('Order should have correct paymentStatus enum values', async () => {
      const schema = Order.schema;
      const paymentStatusEnum = schema.paths.paymentStatus.enumValues;
      expect(paymentStatusEnum).toContain('pending');
      expect(paymentStatusEnum).toContain('paid');
      expect(paymentStatusEnum).toContain('failed');
    });

    test('Order should have timestamps', async () => {
      const schema = Order.schema;
      expect(schema.paths.createdAt).toBeDefined();
      expect(schema.paths.updatedAt).toBeDefined();
    });

    test('Multiple products in order should all have driveLinks', async () => {
      const orderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            productId: new mongoose.Types.ObjectId(),
            name: 'Course 1',
            price: 99.99,
            driveLink: 'https://drive.google.com/course1'
          },
          {
            productId: new mongoose.Types.ObjectId(),
            name: 'Course 2',
            price: 149.99,
            driveLink: 'https://drive.google.com/course2'
          }
        ],
        totalPrice: 249.98
      };

      const order = new Order(orderData);
      expect(order.products.length).toBe(2);
      expect(order.products[0].driveLink).toBe('https://drive.google.com/course1');
      expect(order.products[1].driveLink).toBe('https://drive.google.com/course2');
    });
  });

  describe('Order Schema Structure', () => {
    test('Order should have correct field types', () => {
      const schema = Order.schema;
      expect(schema.paths.totalPrice.instance).toBe('Number');
      expect(schema.paths.status.instance).toBe('String');
      expect(schema.paths.paymentStatus.instance).toBe('String');
      expect(schema.paths.isReviewed.instance).toBe('Boolean');
    });

    test('Order should have default values', () => {
      const schema = Order.schema;
      expect(schema.paths.status.defaultValue).toBe('pending');
      expect(schema.paths.paymentStatus.defaultValue).toBe('pending');
      expect(schema.paths.isReviewed.defaultValue).toBe(false);
    });

    test('Order totalPrice should be a number', () => {
      const order = new Order({
        userId: new mongoose.Types.ObjectId(),
        products: [],
        totalPrice: 'not-a-number'
      });

      const error = order.validateSync();
      expect(error).toBeDefined();
    });
  });
});
