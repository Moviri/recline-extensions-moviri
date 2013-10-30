## RECLINE-EXTENSIONS-MOVIRI

This package extends recline package with new models and views (charts and controls). For more info on all additions see wiki on https://github.com/Moviri/recline/wiki/_pages
It uses slickgrid to generate tables and xCharts and NVD3 to generate charts.

For a list of examples, see all tutorials.

# DEVELOPER NOTES:

This project uses requireJS to solve all dependencies. Unfortunately xCharts needs D3v2 while other components like D3ChoroplethMap use D3v3. Since some required external components are not requireJS compliant, it was decided as a general workaround to:
_use a specific D3v2 AMD-compliant when needed
_use D3v3 as a globally exported variable for all cases when the external libraries do not comply with requireJS but, nevertheless, expect D3 to be present.

Also do not use Mustache versions >= 0.70 since they fail in rendering correctly our composedView component

In order to use this package as an imported bower library you must perform the following steps:

1) include it as usual in your bower.json file
2) in your main index.html you must include in the <head> section a <meta> line that tells where to find some vendor files that are in recline-extensions-movir hierarchy and must be made visible to your container application. This line should be something like this:     <meta name="reclineVendorPath" content="../bower_components/recline-extensions-moviri/app/scripts/">
In other words, the relatibe path must point to the directory containing "vendor" folder inside recline-moviri-extensions
3) in the same <head> section you should also include, possibly at the end of the section a line that loads dependencies.js file. Something like this:
<script src="../bower_components/recline-extensions-moviri/app/scripts/dependencies.js"></script>
4) instead of calling the main.js as usual, you should wrap it in a requireJS "define", possibly just after the end of the <head> section. Something like this:
<script>
    require(['../bower_components/recline-extensions-moviri/app/scripts/main']);
</script>
5) include in your main.scss file (or whatever file you use to load CSS styles) the files listed in file styles/bower_components.css if you need to use them. Currently there are only two files for slickgrid and rickshaw. So, if you plan to use slickgrid, copy the relavant line:
@import '../bower_components/slickgrid-moviri/slick.grid.css';
(and correct path if necessary) to your main style file.
