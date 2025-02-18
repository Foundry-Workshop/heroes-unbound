export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('list_number', function (number, options) {
    if (typeof (number) === 'undefined' || number === null)
      return null;

    return number + 1;
  });
}