import {constants, defaults, settings} from "./constants.mjs";
import HeroSheet from "./apps/sheets/actor/HeroSheet.mjs";

/**
 * Registers settings with the Foundry
 */
function registerSettings() {
  game.settings.register(constants.systemId, settings.initialized, {
    scope: 'world',
    config: false,
    default: defaults.initialized,
    type: String
  });

  game.settings.register(constants.systemId, settings.colourHeaders, {
    name: "Champions.Settings.ColourHeaders.Name",
    hint: "Champions.Settings.ColourHeaders.Hint",
    scope: 'user',
    config: true,
    default: defaults.colourHeaders,
    type: Boolean,
    onChange: () => {
      foundry.applications.instances.forEach(async (app) => {
        if (app instanceof HeroSheet)
          await app.render(true);
      })
    }
  });
}

export {registerSettings};
