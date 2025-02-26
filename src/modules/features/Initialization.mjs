import {constants, settings} from "../constants.mjs";
import {debug} from "../utility/Debug.mjs";

export async function initializeFonts() {
  await game.settings.set("core", "fonts", {
    "Bangers": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/Bangers/Bangers-Regular.ttf"
          ],
          weight: 400,
          style: "normal"
        }
      ]
    },
    "Comic Neue": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Regular.ttf"
          ],
          weight: 400,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Bold.ttf"
          ],
          weight: 700,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-BoldItalic.ttf"
          ],
          weight: 700,
          style: "italic"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Italic.ttf"
          ],
          weight: 400,
          style: "italic"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-Light.ttf"
          ],
          weight: 300,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/Comic_Neue/ComicNeue-LightItalic.ttf"
          ],
          weight: 300,
          style: "italic"
        }
      ]
    },
    "Comic Helvetic": {
      editor: true,
      fonts: [
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Medium.otf"
          ],
          weight: 400,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Light.otf"
          ],
          weight: 300,
          style: "normal"
        },
        {
          urls: [
            "systems/heroes-unbound/fonts/ComicHelvetic/ComicHelvetic_Heavy.otf"
          ],
          weight: 700,
          style: "normal"
        }
      ]
    }
  });

  debug(`System Fonts initialized.`);
}