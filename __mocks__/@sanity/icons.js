/**
 * Mock for @sanity/icons package
 * All icons are simple React components returning null
 */

const createIconMock = (name) => {
  const icon = () => null;
  icon.displayName = name;
  return icon;
};

// Document icons
module.exports = {
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
  InfoOutlineIcon: createIconMock('InfoOutlineIcon'),
  LinkIcon: createIconMock('LinkIcon'),
  TextIcon: createIconMock('TextIcon'),
  BulbOutlineIcon: createIconMock('BulbOutlineIcon'),
};
