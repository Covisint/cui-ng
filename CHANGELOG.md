# CUI-NG Changelog

## [1.10.7] - Unreleased

### Added
- Cui-Dropdown
 - Dropdown now opens using enter/space and up/down arrow keys when tab targetted.
 - The up/down arrow keys now cycle up/down the dropdown items.
 - Enter/Space now selects the current highlighted item and closes the dropdown.
 - Tabbing out of the dropdown now closes the dropdown.
 - Pressing buttons (A-Z) will now highlight/cycle through all the dropdown items  that start with that corresponding letter.
 

## [1.10.6] - 2017-1-4

### Changed
* Locked down all dependency versions

## [1.10.5] - 2017-1-4

### Changed
* Changed Angular dependency to fixed 1.5.9 version.

## [1.10.4] - 2016-10-31

### Fixed
* dist folder compiled down to es5

## [1.10.3] - 2016-10-25

### Added
* Adds class to results-per-page dropdown for responsive styling

## [1.10.2] - 2016-10-18

### Fixed
* Fixed inconsitent width rendering of the dropdown in `cui-dropdown`. 


## [1.10.1] - 2016-10-17

### Added
* Added `custom-error-loading` attribute in the `custom-error` showcase example.
* Added `cui-table` directive along with a showcase demo and documentation.

### Fixed
* Fixed `custom-error` optional `custom-error-loading` attribute not working properly.
* Fixed `inline-edit` example not properly showing the random word.
* Fixed issue with pageChangeHandler not properly being initialized in some instances when dealing with delayed data.


## [1.10.0] - 2016-10-10

### Added
* CUI-Paginate: By default, pagination will not display if results are below the first value in the interval array in app-config.json.

### Changed
* CUI-Paginate: paginationOptions now takes an object instead of an array.
* Adds new table of contents screen to use instead of side menus.
* Minor general styling for table of contents.
* Covisint logo on header.
* Added consistent documentation links to each directive demo.
* Paginate now hides itself if the results are less than the first item in the paginationOptions object.
* Directory restructure
    * Moved all directive showcase files into their own folders in `assets/app/directives-showcase/components`.
    * Each directive demo has their own state and controller instead of utilizing one master controller.
    * Demo factories are now split into their own files in `assets/app/directives-showcase/factories`.
    * Index has been broken down into more manageable files inside `assets/common-templates/index/`.
* Disabled side menus as they were not used anymore.
* Extracted directive demo styling into own scss files.
* Disables snap menu mouse dragging.

### Fixed
* Fixes browserSync grunt task to reload on all important markup files.
* Fixes match directive game not working properly.
* Fixes custom-error directive showcase error by removing the loader functionality for now.


## [1.9.20] - 2016-09-20

### Changed
* CUI-Paginate: Removes the default unicode characters (`<` and `>`) in favor of background images.

### Added
* CUI-Wizard: Adds new optional attribute `dirty-validation`. This revolves around showing input field errors when they are `$dirty` instead
of the default of `$touched`. This also done not work with an `ng-messages-include=""`. This sets all input fields as `$dirty` when clicking the next button.
