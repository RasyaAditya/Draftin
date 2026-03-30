/**
 * Basic setup test to verify Jest is working correctly
 */

describe('Project Setup', () => {
  test('Jest is configured correctly', () => {
    expect(true).toBe(true);
  });

  test('ES modules are supported', () => {
    const testModule = { name: 'cleanup-tool' };
    expect(testModule.name).toBe('cleanup-tool');
  });
});
