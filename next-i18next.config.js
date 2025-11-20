module.exports = {
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en', 'tr', 'ar'],
    localeDetection: false, // Disabled - we manage locale via query param
  },
  debug:false,
  localePath: typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : '/locales',
};
