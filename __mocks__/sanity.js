/**
 * Mock for Sanity CMS package
 * defineType, defineField, defineArrayMember are identity functions
 * that return the config object passed to them (used for TypeScript typing only)
 */

const defineType = (config) => config;
const defineField = (config) => config;
const defineArrayMember = (config) => config;

module.exports = {
  defineType,
  defineField,
  defineArrayMember,
};
