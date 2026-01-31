// Manual Jest mock for '@/lib/cookies'
// Exposes spyable functions that call through to the real implementation
const real = jest.requireActual('../src/lib/cookies');

const setCookie = jest.fn((...args) => real.setCookie(...args));
const getCookie = jest.fn((...args) => real.getCookie(...args));
const getCookieJSON = jest.fn((...args) => real.getCookieJSON(...args));
const removeCookie = jest.fn((...args) => real.removeCookie(...args));
const setSecureCookie = jest.fn((...args) => real.setSecureCookie(...args));
const clearSecureCookie = jest.fn((...args) => real.clearSecureCookie(...args));
const getCartCookie = jest.fn((...args) => real.getCartCookie(...args));
const setCartCookie = jest.fn((...args) => real.setCartCookie(...args));
const getWishlistCookie = jest.fn((...args) => real.getWishlistCookie(...args));
const setWishlistCookie = jest.fn((...args) => real.setWishlistCookie(...args));
const clearCartCookie = jest.fn((...args) => real.clearCartCookie(...args));
const clearWishlistCookie = jest.fn((...args) => real.clearWishlistCookie(...args));
const getThemeCookie = jest.fn((...args) => real.getThemeCookie(...args));
const setThemeCookie = jest.fn((...args) => real.setThemeCookie(...args));
const getLanguageCookie = jest.fn((...args) => real.getLanguageCookie(...args));
const setLanguageCookie = jest.fn((...args) => real.setLanguageCookie(...args));
const clearAllCookies = jest.fn((...args) => real.clearAllCookies(...args));

module.exports = {
  // Named exports
  setCookie,
  getCookie,
  getCookieJSON,
  removeCookie,
  setSecureCookie,
  clearSecureCookie,
  getCartCookie,
  setCartCookie,
  getWishlistCookie,
  setWishlistCookie,
  clearCartCookie,
  clearWishlistCookie,
  getThemeCookie,
  setThemeCookie,
  getLanguageCookie,
  setLanguageCookie,
  clearAllCookies,

  // Default export object (matching the real module's default export)
  default: {
    setCookie,
    getCookie,
    getCookieJSON,
    removeCookie,
    setSecureCookie,
    clearSecureCookie,
    getCartCookie,
    setCartCookie,
    getWishlistCookie,
    setWishlistCookie,
    clearCartCookie,
    clearWishlistCookie,
    getThemeCookie,
    setThemeCookie,
    getLanguageCookie,
    setLanguageCookie,
    clearAllCookies,
  },
};