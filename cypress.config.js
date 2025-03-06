const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://ua.sinoptik.ua",
    setupNodeEvents(on, config) {
    },
  },
});
