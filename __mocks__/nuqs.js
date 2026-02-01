// Mock for nuqs library (URL state management)
const React = require('react');

// Mock useQueryState hook
const useQueryState = (key, options) => {
  const [value, setValue] = React.useState(options?.defaultValue || null);
  
  return [
    value,
    (newValue) => {
      setValue(newValue);
      return Promise.resolve();
    },
  ];
};

// Mock useQueryStates hook
const useQueryStates = (schema, options) => {
  const [values, setValues] = React.useState(() => {
    const initial = {};
    Object.keys(schema).forEach(key => {
      initial[key] = schema[key].defaultValue || null;
    });
    return initial;
  });

  const setQueryStates = (updates) => {
    setValues(prev => ({ ...prev, ...updates }));
    return Promise.resolve();
  };

  return [values, setQueryStates];
};

// Mock NuqsAdapter component
const NuqsAdapter = ({ children }) => React.createElement(React.Fragment, null, children);

module.exports = {
  useQueryState,
  useQueryStates,
  NuqsAdapter,
  parseAsString: { defaultValue: '' },
  parseAsArrayOf: (parser) => ({ defaultValue: [] }),
  parseAsInteger: { defaultValue: null },
};
