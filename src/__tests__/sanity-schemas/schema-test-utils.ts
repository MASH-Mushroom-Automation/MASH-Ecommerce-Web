/**
 * Sanity Schema Test Utilities
 * Helper functions for validating Sanity CMS schema definitions
 */

/**
 * Find a field by name in a schema's fields array
 */
export function findField(schema: any, fieldName: string): any {
  if (!schema.fields) return undefined;
  return schema.fields.find((f: any) => f.name === fieldName);
}

/**
 * Get all field names from a schema
 */
export function getFieldNames(schema: any): string[] {
  if (!schema.fields) return [];
  return schema.fields.map((f: any) => f.name);
}

/**
 * Assert schema has the correct basic structure
 */
export function assertSchemaBasics(
  schema: any,
  expected: {
    name: string;
    title: string;
    type: string;
    icon?: boolean;
    preview?: boolean;
  }
) {
  expect(schema).toBeDefined();
  expect(schema.name).toBe(expected.name);
  expect(schema.title).toBe(expected.title);
  expect(schema.type).toBe(expected.type);
  if (expected.icon) {
    expect(schema.icon).toBeDefined();
  }
  if (expected.preview) {
    expect(schema.preview).toBeDefined();
    expect(schema.preview.select).toBeDefined();
  }
}

/**
 * Assert a field exists with the expected type
 */
export function assertFieldType(schema: any, fieldName: string, expectedType: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.type).toBe(expectedType);
}

/**
 * Assert a field has a validation rule
 */
export function assertFieldHasValidation(schema: any, fieldName: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.validation).toBeDefined();
}

/**
 * Assert a field has an initial value
 */
export function assertFieldHasInitialValue(schema: any, fieldName: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.initialValue).toBeDefined();
}

/**
 * Assert a field is read-only
 */
export function assertFieldReadOnly(schema: any, fieldName: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.readOnly).toBe(true);
}

/**
 * Assert a field is a reference to a specific type
 */
export function assertFieldReference(schema: any, fieldName: string, refType: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.type).toBe('reference');
  expect(field.to).toBeDefined();
  const refTypes = field.to.map((ref: any) => ref.type);
  expect(refTypes).toContain(refType);
}

/**
 * Assert a field is a slug with a specific source
 */
export function assertSlugField(schema: any, fieldName: string, source: string) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.type).toBe('slug');
  expect(field.options).toBeDefined();
  expect(field.options.source).toBe(source);
}

/**
 * Assert schema has orderings defined
 */
export function assertHasOrderings(schema: any, count?: number) {
  expect(schema.orderings).toBeDefined();
  expect(Array.isArray(schema.orderings)).toBe(true);
  if (count !== undefined) {
    expect(schema.orderings.length).toBe(count);
  }
}

/**
 * Assert schema has groups defined
 */
export function assertHasGroups(schema: any, groupNames: string[]) {
  expect(schema.groups).toBeDefined();
  expect(Array.isArray(schema.groups)).toBe(true);
  const names = schema.groups.map((g: any) => g.name);
  for (const name of groupNames) {
    expect(names).toContain(name);
  }
}

/**
 * Assert a field has options with a list of values
 */
export function assertFieldHasOptions(schema: any, fieldName: string, expectedValues?: string[]) {
  const field = findField(schema, fieldName);
  expect(field).toBeDefined();
  expect(field.options).toBeDefined();
  if (expectedValues && field.options.list) {
    const listValues = field.options.list.map((item: any) =>
      typeof item === 'string' ? item : item.value
    );
    for (const val of expectedValues) {
      expect(listValues).toContain(val);
    }
  }
}

/**
 * Count all fields (including nested) in a schema
 */
export function countFields(schema: any): number {
  return schema.fields?.length ?? 0;
}
