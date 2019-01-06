/* jshint -W097 */
/* jshint strict:false */
/*jslint node: true */
/*jshint -W061 */
'use strict';

/**
 * HabpanelAPI class
 *
 * From settings used only secure, auth and crossDomain
 *
 * @class
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @return {object} object instance
 */
function HabpanelAPI(server, webSettings, adapter, instanceSettings, app) {
    if (!(this instanceof HabpanelAPI)) return new HabpanelAPI(server, webSettings, adapter, instanceSettings, app);

    const COMMUNITY_BASE_URL = "https://community.openhab.org";
    const COMMUNITY_GALLERY_URL = COMMUNITY_BASE_URL + "/tags/c/apps-services/habpanel/widgetgallery.json";
    const COMMUNITY_TOPIC_URL = COMMUNITY_BASE_URL + "/t/";

    this.app = app;
    this.adapter = adapter;
    this.settings = webSettings;
    this.config = instanceSettings ? instanceSettings.native : {};
    this.namespace = 'rest/habpanel';

    this.restApiDelayed = {
        timer: null,
        responseType: '',
        response: null,
        waitId: 0
    };

    const https = require('https');
    const that = this;
    // Cache
    this.users = {};

    const __construct = (function () {
        that.adapter.log.info((that.settings.secure ? 'Secure ' : '') + 'habpanel server listening on port ' + that.settings.port);
        adapter.log.info('Install extension on /' + that.namespace + '/');
        that.app.use('/' + that.namespace + '/', (req, res, next) => {
            adapter.log.debug('HapanelAPI - Request "' + req.url + '"');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = 200;
            if (req.url === '/gallery/community/widgets') {
                let data = "";
                let topics = [];
                let request = https.get(COMMUNITY_GALLERY_URL, (response) => {
                    response.on('data', (chunk) => { data += chunk; });
                    response.on('end', () => {
                        adapter.log.debug('HapanelAPI - Send Data "' + data + '"');
                        let parsed = JSON.parse(data);
                        topics.push(...parsed.topic_list);
                        if (parsed.topic_list.more_topics_url) {

                        }
                        let wlst = [];
                        for (let i of topics){
                            wlst.push({id: i.id, title: i.title, imageUrl: i.image_url, likes: i.like_count, views: i.views, posts: i.post_count, createdDate: i.created_at});
                        }
                        res.end(JSON.stringify(wlst), 'utf8');
                    });
                });
                request.end();
                //res.end(JSON.stringify(content), 'utf8');
            }
        });
    }.bind(this))();
}

module.exports = HabpanelAPI;