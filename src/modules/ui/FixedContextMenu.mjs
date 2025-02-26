export default class FixedContextMenu extends ContextMenu {

  static create(app, html, selector, menuItems, {hookName = "EntryContext", ...options} = {}) {
    app._callHooks?.(className => `get${className}${hookName}`, menuItems);
    return new this(html, selector, menuItems, options);
  }

  /**
   * Set the position of the context menu, taking into consideration whether the menu should expand upward or downward
   * @param {jQuery} html                   The context menu element.
   * @param {jQuery} target                 The element that the context menu was spawned on.
   * @param {object} [options]
   * @param {PointerEvent} [options.event]  The event that triggered the context menu opening.
   * @protected
   */
  _setPosition(html, target, {event} = {}) {
    // Append to target and get the context bounds
    html.css("visibility", "hidden");
    html.css("top", event.clientY);
    html.css("left", event.clientX);
    html.addClass("heroes-unbound");

    $(document.body).append(html);
    // Display the menu
    html.toggleClass("expand-down");
    html.css("visibility", "");
    target.addClass("context");
  }

  render(target, options) {
    if (options.event.target.classList.contains("prevent-context") || ui.context.menu.length !== 0)
      return;

    super.render(target, options);
  }
}