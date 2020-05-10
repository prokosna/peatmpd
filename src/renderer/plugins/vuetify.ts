import Vue from "vue";
import Vuetify from "vuetify/lib";
import { Ripple } from "vuetify/lib/directives";

Vue.use(Vuetify, {
  directives: {
    Ripple
  }
});

export default new Vuetify({
  theme: {
    dark: true,
    options: {
      customProperties: true
    },
    // c.f. https://lobotuerto.com/vuetify-color-theme-builder/
    themes: {
      dark: {
        primary: "#9CCC65",
        accent: "#2196F3",
        secondary: "#0A230C",
        success: "#81C784",
        info: "#90CAF9",
        warning: "#FFB74D",
        error: "#E57373"
      },
      light: {
        primary: "#689F38",
        accent: "#FFB74D",
        secondary: "#AED581",
        success: "#1B5E20",
        info: "#0D47A1",
        warning: "#E65100",
        error: "#B71C1C"
      }
    }
  }
});
