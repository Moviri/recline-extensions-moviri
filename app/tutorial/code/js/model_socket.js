var dataset = new recline.Model.SocketDataset({
    url: '192.168.200.130',
    port: 80,
    queue: "message",
    subscribeData: {channel: "message", content: "ALL"},
    queueSize: 20,
    resource: "socket.io",
    fields: [
        {id: 'text', type: 'string'},
        {id: 'text', type: 'string'}
    ]
});



/*jshint multistr: true */

var tweetFormatter2 = [
    {
        id: "text",
        formula: function (record) {
            var data = {
                text: record.attributes.text,
                created_at: record.attributes.created_at,
                profile_image_url: record.attributes.user.profile_image_url,
                profile_banner_url: record.attributes.user.profile_banner_url,
                name: record.attributes.user.name
            };

            var tmpl = '<div class="twitter-article">\
                            <div class="twitter-pic"><a href="https://twitter.com/{{name}}" >\
                                <img src="{{profile_image_url}}" width="42" height="42" alt="twitter icon" /></a></div>\
                            <div class="twitter-text"><p><span class="tweetprofilelink"><strong><a href="https://twitter.com/{{username}}" >\
                            {{profile_image_url}}</a></strong> <a href="https://twitter.com/{{username}}" >@{{name}}</a>\
                            </span><span class="tweet-time"><a href="https://twitter.com/{{username}}/status/{{tweetid}}">{{created_at}}</a></span><br/></p></div>\
                            </div>\
                            </div></div>';

            var out = Mustache.render(tmpl, data);

            return out;
        }
    }
];

var tweetFormatter = [
    {
        id: "text",
        formula: function (record) {
            var data = {
                text: record.attributes.text,
                created_at: record.attributes.created_at,
                profile_image_url: record.attributes.user.profile_image_url,
                profile_banner_url: record.attributes.user.profile_banner_url,
                name: record.attributes.user.name
            };

            console.log(data);

            var tmpl = '<div style="height: 200px"><a class="u-url permalink customisable-highlight" ><time pubdate="" class="dt-updated">{{created_at}}</time></a>\
                            <div class="header h-card p-author">\
                                <a class="u-url profile" href="{{profile_banner_url}}" >\
                                    <img class="u-photo avatar" alt="" src="{{profile_image_url}}" >\
                                        <span class="full-name">                                       \
                                            <span class="p-name customisable-highlight">{{name}}</span>\
                                        </span>                                                  \
                                        <span class="p-nickname" dir="ltr">@<b>{{name}}</b></span>  \
                                    </a>                                                     \
                                </div>                                                     \
                                <div class="e-entry-content">                             \
                                    <p class="e-entry-title">{{text}}</p>                 \
                                </div></div>';

            var out = Mustache.render(tmpl, data);

            return out;
        }
    }
];


var $el = $('#grid1');
var grid1 = new recline.View.SlickGridGraph({
    model: dataset,
    el: $el,
    state: {
        customHtmlFormatters: tweetFormatter2,
        fitColumns: true,
        useCondensedStyle: true
    }
});

grid1.visible = true;
grid1.render();


dataset.attach();
