# CUI-Dropdown

## Description
Cui-dropdown generates a dropdown with the help of tether.

## Usage Example

```html
  <cui-dropdown options="app.options" return-value="option.name" display-value="(option.name | cuiI18n)" ng-model="app.selectedOption"></cui-dropdown>
```

## Optional attributes

 * `class`: (default 'cui-dropdown') Class or classes to be applied to the div that holds the selected value
 * `dropdown-class`: (default 'cui-dropdown__wrapper') Class to be applied to the dropdown
 * `dropdown-item-class`: (default 'cui-dropdown__item') Class to be applied to each item in the dropdown
 * `attachment`: (default 'top middle') Tether attachment
 * `target-attachment`: (default 'bottom middle') Tether target attachment
 * `offset`: (default '0 0') Tether offset
 * `returnValue`: (default 'option') This is what gets assigned to ng-model. If left default it passes the whole object that got selected.
 * `displayValue`: (defaul 'option') This is what gets shown in the dropdown and in the box that holds the current value. Can be any property from the selected object (`display-value="option.name"`) or even use a filter (`display-value="(option.name | cuiI18n)"`). NOTE: If you are using a filter follow the parenthesis syntax.

## Changelog

### 2/3/2017

- Added default dropdown keyboard functionality:
 - Enter/Space/Up/Down keyboard keys now open the dropdown when it is tab targeted.
 - Up/Down keyboard arrow keys cycle up/down the dropdown items, even if openened with the mouse.
 - Added switching between cycling through dropdown items via mouse and keyboard.
 - Enter/Space now selects the current highlighted dropdown item and closes it.
 - Tabing out of the dropdown when it is expanded now closes the dropdown.
 - Pressing buttons (A-Z) will now highlight/cycle through all dropdown items that start with that corresponding letter.

### 5/17/2016

* Now using scope.$eval to parse return / display values. The only breaking change is that strings must now be passed wrapped in quotes within the display-value, return-value and default-option attributes. The benefit of adding this mechanism is that you can now concatenate strings and values within these, meaning you can do `display-value="'Question ' +  object.question"`, for example.

### 5/3/2016

* We can now loop over an object's key value pairs, simply put that object in the `options` and use "key" or "value" in `return-value` or `display-value`.

### 4/11/2016

 * You can now add a default option ( with the attribute default-option, which you can pass a string or a filter with the parenthesis syntax ) and `ng-required` validation (you have to use default-option for this to work). Note that if you set a default option, but your ng-model matches one of the return-values, then the dropdown will still auto-select the option that contains that value.
