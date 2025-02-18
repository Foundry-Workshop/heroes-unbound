import {LINKS} from './copyright.mjs';
import API from "./modules/API.mjs";
import {debug, Debug} from "./modules/utility/Debug.mjs";
import {hooks} from "./modules/constants.mjs";
import {registerHandlebarsHelpers} from "./modules/handlebars.mjs";
import {initialConfig, registerDataModels, registerSheets, setDocumentClasses} from "./modules/config.mjs";
import {registerSettings} from "./modules/Settings.mjs";
import Utility from "./modules/utility/Utility.mjs";
import EffectRoll from "./modules/features/EffectRoll.mjs";

Hooks.once("init", () => {
  game.system.links = LINKS;

  setDocumentClasses();
  registerSheets();
  registerDataModels();

  registerHandlebarsHelpers();

  registerSettings();
  Debug.registerSetting();

  game.system.api = new API();

  Hooks.callAll(hooks.init);
  debug("System initialized.");
});

Hooks.once("setup", () => {

  Hooks.callAll(hooks.setup);
  debug("System setup.");
})

Hooks.once("i18nInit", () => {
  Hooks.callAll(hooks.i18nInit);
  debug("System i18nInit.");
})

Hooks.once("ready", () => {
  Debug.logSettings();
  initialConfig();
  Hooks.callAll(hooks.ready);
  Utility.notify("System ready.", {consoleOnly: true});
});

Hooks.once("renderChatLog", (app, html, _options) => {
  html.addClass("champions-now");
});

Hooks.on("chatMessage", (html, content, msg) => {
  const rollMode = game.settings.get("core", "rollMode");

  if (["gmroll", "blindroll"].includes(rollMode))
    msg["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);

  if (rollMode === "blindroll")
    msg["blind"] = true;

  const regExp = /(\S+)/g;
  const commands = content.match(regExp);
  const command = commands[0];

  if (command === "/effect") {
    const amount = Number(commands[1]) ?? 3;
    const roll = new EffectRoll(`${amount}d6`);
    roll.toMessage();

    return false;
  }
});