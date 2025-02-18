const {DialogV2} = foundry.applications.api;

export default class ValueDialog extends DialogV2 {
  static create({text, title, defaultValue = "", type = String}) {
    text = game.i18n.localize(text);
    title = game.i18n.localize(title);

    const content = `
      <div class="value-dialog">
          <p>${text || "Enter Value"}</p>
          <input class="value" type="text" value="${defaultValue}">
      </div>
    `;

    return Dialog.wait({
      title: title || "Value Dialog",
      content: content,
      buttons: {
        submit: {
          label: game.i18n.localize("Submit"),
          callback: (html) => {
            return type(html.find(".value")[0]?.value);
          }
        }
      },
      default: "submit",
      close: () => {
        return null;
      }
    });
  }
}