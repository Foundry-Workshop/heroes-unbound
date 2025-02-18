import fs from "fs";
import copy from "rollup-plugin-copy";
import {dirname} from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let manifest = JSON.parse(fs.readFileSync(`${__dirname}/dist/system.json`));

export default {
  input: `${__dirname}/src/${manifest.id}.mjs`,
  output: {
    file: `${__dirname}/dist/${manifest.id}.mjs`,
    format: 'es'
  },
  watch: {
    clearScreen: true,
    chokidar: {
      usePolling: true
    }
  },
  plugins: [
    copy({
      targets: [
        {src: `${__dirname}/src/languages`, dest: `${__dirname}/dist/`},
        {src: `${__dirname}/src/templates`, dest: `${__dirname}/dist/`},
      ]
    })
  ]
}