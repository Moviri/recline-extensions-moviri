define(['backbone', 'recline-extensions-amd', 'mustache'], function (Backbone, recline, Mustache,) {

    recline.View = recline.View || {};

    var my = recline.View;

    my.VisualSearch = Backbone.View.extend({

        template:'<div id="search_box_container" id="{{uid}}"> </div><div id="search_query">&nbsp;</div>',

        initialize:function (options) {
            var self = this;

            this.el = $(this.el);
            _.bindAll(this, 'render', 'redraw');

            this.uid = options.id || ("d3_" + new Date().getTime() + Math.floor(Math.random() * 10000)); // generating an unique id for the chart

            /*
            this.model.bind('change', self.render);
            this.model.fields.bind('reset', self.render);
            this.model.fields.bind('add', self.render);
            this.model.records.bind('add', self.redraw);
            this.model.records.bind('reset', self.redraw);
            */


        },

        render:function () {
            var self = this;

            var out = Mustache.render(this.template, this);
            this.el.html(out);

            return this;
        },

        redraw:function () {
            var self = this;

            console.log($().jquery);
            console.log($.ui.version);

            window.visualSearch = VS.init({
                container  : $('#search_box_container'),
                query      : 'country: "South Africa" account: 5-samuel "U.S. State": California',
                showFacets : true,
                unquotable : [
                    'text',
                    'account',
                    'filter',
                    'access'
                ],
                callbacks  : {
                    search : function(query, searchCollection) {
                        var $query = $('#search_query');
                        $query.stop().animate({opacity : 1}, {duration: 300, queue: false});
                        $query.html('<span class="raquo">&raquo;</span> You searched for: <b>' + searchCollection.serialize() + '</b>');
                        clearTimeout(window.queryHideDelay);
                        window.queryHideDelay = setTimeout(function() {
                            $query.animate({
                                opacity : 0
                            }, {
                                duration: 1000,
                                queue: false
                            });
                        }, 2000);
                    },
                    valueMatches : function(category, searchTerm, callback) {
                        switch (category) {
                            case 'account':
                                callback([
                                    { value: '1-amanda', label: 'Amanda' },
                                    { value: '2-aron',   label: 'Aron' },
                                    { value: '3-eric',   label: 'Eric' },
                                    { value: '4-jeremy', label: 'Jeremy' },
                                    { value: '5-samuel', label: 'Samuel' },
                                    { value: '6-scott',  label: 'Scott' }
                                ]);
                                break;
                            case 'filter':
                                callback(['published', 'unpublished', 'draft']);
                                break;
                            case 'access':
                                callback(['public', 'private', 'protected']);
                                break;
                            case 'title':
                                callback([
                                    'Pentagon Papers',
                                    'CoffeeScript Manual',
                                    'Laboratory for Object Oriented Thinking',
                                    'A Repository Grows in Brooklyn'
                                ]);
                                break;
                            case 'city':
                                callback([
                                    'Cleveland',
                                    'New York City',
                                    'Brooklyn',
                                    'Manhattan',
                                    'Queens',
                                    'The Bronx',
                                    'Staten Island',
                                    'San Francisco',
                                    'Los Angeles',
                                    'Seattle',
                                    'London',
                                    'Portland',
                                    'Chicago',
                                    'Boston'
                                ])
                                break;
                            case 'U.S. State':
                                callback([
                                    "Alabama", "Alaska", "Arizona", "Arkansas", "California",
                                    "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida",
                                    "Georgia", "Guam", "Hawaii", "Idaho", "Illinois",
                                    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
                                    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
                                    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
                                    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
                                    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
                                    "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
                                    "Texas", "Utah", "Vermont", "Virginia", "Virgin Islands",
                                    "Washington", "West Virginia", "Wisconsin", "Wyoming"
                                ]);
                                break
                            case 'country':
                                callback([
                                    "China", "India", "United States", "Indonesia", "Brazil",
                                    "Pakistan", "Bangladesh", "Nigeria", "Russia", "Japan",
                                    "Mexico", "Philippines", "Vietnam", "Ethiopia", "Egypt",
                                    "Germany", "Turkey", "Iran", "Thailand", "D. R. of Congo",
                                    "France", "United Kingdom", "Italy", "Myanmar", "South Africa",
                                    "South Korea", "Colombia", "Ukraine", "Spain", "Tanzania",
                                    "Sudan", "Kenya", "Argentina", "Poland", "Algeria",
                                    "Canada", "Uganda", "Morocco", "Iraq", "Nepal",
                                    "Peru", "Afghanistan", "Venezuela", "Malaysia", "Uzbekistan",
                                    "Saudi Arabia", "Ghana", "Yemen", "North Korea", "Mozambique",
                                    "Taiwan", "Syria", "Ivory Coast", "Australia", "Romania",
                                    "Sri Lanka", "Madagascar", "Cameroon", "Angola", "Chile",
                                    "Netherlands", "Burkina Faso", "Niger", "Kazakhstan", "Malawi",
                                    "Cambodia", "Guatemala", "Ecuador", "Mali", "Zambia",
                                    "Senegal", "Zimbabwe", "Chad", "Cuba", "Greece",
                                    "Portugal", "Belgium", "Czech Republic", "Tunisia", "Guinea",
                                    "Rwanda", "Dominican Republic", "Haiti", "Bolivia", "Hungary",
                                    "Belarus", "Somalia", "Sweden", "Benin", "Azerbaijan",
                                    "Burundi", "Austria", "Honduras", "Switzerland", "Bulgaria",
                                    "Serbia", "Israel", "Tajikistan", "Hong Kong", "Papua New Guinea",
                                    "Togo", "Libya", "Jordan", "Paraguay", "Laos",
                                    "El Salvador", "Sierra Leone", "Nicaragua", "Kyrgyzstan", "Denmark",
                                    "Slovakia", "Finland", "Eritrea", "Turkmenistan"
                                ], {preserveOrder: true});
                                break;
                        }
                    },
                    facetMatches : function(callback) {
                        callback([
                            'account', 'filter', 'access', 'title',
                            { label: 'city',    category: 'location' },
                            { label: 'address', category: 'location' },
                            { label: 'country', category: 'location' },
                            { label: 'U.S. State', category: 'location' }
                        ]);
                    }
                }
            });

        },



        doActions:function (actions, records) {

            _.each(actions, function (d) {
                d.action.doAction(records, d.mapping);
            });

        },

        getActionsForEvent:function (eventType) {
            var self = this;
            var actions = [];

            _.each(self.options.actions, function (d) {
                if (_.contains(d.event, eventType))
                    actions.push(d);
            });

            return actions;
        }


    });

    return my.VisualSearch;
});

