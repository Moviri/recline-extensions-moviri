# RECLINE-EXTENSIONS-MOVIRI

This package extends recline package with new models and views (charts and controls). For more info on all additions see wiki on https://github.com/Moviri/recline/wiki/_pages
It uses slickgrid to generate tables and xCharts or NVD3 to generate charts.

For a list of examples, see all tutorials.

## DEVELOPER NOTES:

This project uses requireJS to solve all dependencies. Unfortunately xCharts needs D3v2 while other components like D3ChoroplethMap use D3v3. Since some required external components are not requireJS compliant, it was decided as a general workaround to:
- use a specific D3v2 AMD-compliant when needed
- use D3v3 as a globally exported variable for all cases when the external libraries do not comply with requireJS but, nevertheless, expect D3 to be present.

Also do not use Mustache versions >= 0.70 since they fail in rendering correctly our composedView component

In order to use this package as an imported bower library you must perform the following steps:

1) include it as usual in your bower.json file

2) put the following line in your main.js file, just before your "require.config":

require(['../bower_components/recline-extensions-moviri/app/scripts/main']);

Adjust the paths if necessary

3) Add REM variable to your paths in your "require.config" block. It shpuld point to folder holding file "main.js" from "recline-extensions-moviri" library. And MUST have a prefix './' before the actual path (this is VERY IMPORTANT! It will not work without this prefix).
In our case, the final variable declaration will be:

'REM' : './../bower_components/recline-extensions-moviri/app/scripts'

4) include in your main.scss file (or whatever file you use to load CSS styles) the files listed in 'styles/bower_components.css' if you need them. Make sure you also rename their extension from CSS to SCSS if you also plan to build (with 'grunt build') the distribution package of your application.
Currently there are only two CSS files for slickgrid and rickshaw. So, if you plan to use slickgrid, make a copy of the slick.grid.css and rename it to slick.grid.scss, then copy the line:
`@import '../bower_components/slickgrid-moviri/slick.grid.scss';`
(and correct path if necessary) into your main style file.
