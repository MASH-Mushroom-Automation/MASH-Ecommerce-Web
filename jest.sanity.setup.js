/**
 * Setup file for Sanity Schema Tests
 * Explicitly mocks sanity and @sanity/icons before any test runs,
 * ensuring the correct identity-function mocks are used instead of
 * the client mock at src/__mocks__/sanity.ts.
 */

jest.mock('sanity', () => ({
  defineType: (config) => config,
  defineField: (config) => config,
  defineArrayMember: (config) => config,
}));

const createIconMock = (name) => {
  const icon = () => null;
  icon.displayName = name;
  return icon;
};

jest.mock('@sanity/icons', () => ({
  PackageIcon: createIconMock('PackageIcon'),
  TagIcon: createIconMock('TagIcon'),
  UsersIcon: createIconMock('UsersIcon'),
  DocumentIcon: createIconMock('DocumentIcon'),
  StarIcon: createIconMock('StarIcon'),
  SparklesIcon: createIconMock('SparklesIcon'),
  ImageIcon: createIconMock('ImageIcon'),
  FolderIcon: createIconMock('FolderIcon'),
  HelpCircleIcon: createIconMock('HelpCircleIcon'),
  DocumentTextIcon: createIconMock('DocumentTextIcon'),
  UserIcon: createIconMock('UserIcon'),
  MenuIcon: createIconMock('MenuIcon'),
  PinIcon: createIconMock('PinIcon'),
  EnvelopeIcon: createIconMock('EnvelopeIcon'),
  ChartUpwardIcon: createIconMock('ChartUpwardIcon'),
  ClipboardIcon: createIconMock('ClipboardIcon'),
  CogIcon: createIconMock('CogIcon'),
}));
