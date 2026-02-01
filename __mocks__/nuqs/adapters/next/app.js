// Mock for nuqs Next.js adapter
const React = require('react');

const NuqsAdapter = ({ children }) => React.createElement(React.Fragment, null, children);

module.exports = {
  NuqsAdapter,
};
