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

    function loadWidgetsList(url, topics, res, page) {
        adapter.log.info('habpanel web extension - Load Topics From: ' + url + '/');
        let data = "";
        let request = https.get(url, (response) => {
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                adapter.log.debug('HapanelAPI - Send Data "' + data + '"');
                let parsed = JSON.parse(data);
                topics.push(...parsed.topic_list.topics);
                if (parsed.topic_list.more_topics_url) {
                    loadWidgetsList(COMMUNITY_GALLERY_URL + "?page=" + (page++), topics, res, page);
                } else {
                    let wlst = [];
                    for (let i of topics) {
                        wlst.push({ id: i.id, title: i.title, imageUrl: i.image_url, likes: i.like_count, views: i.views, posts: i.post_count, createdDate: i.created_at });
                    }
                    res.end(JSON.stringify(wlst), 'utf8');
                }
            });
        });
    }

    function replaceAll(target, search, replacement) {
        return target.split(search).join(replacement);
    };

    function loadWidgetDataDL(item, links, res, number) {
        if (number < links.length) {
            let link = links[number];

            if (link.url.startsWith("https://github.com")) {
                item.githubLink = link.url.split("/", 6).slice(0, 5).join('/');
                loadWidgetDataDL(item, links, res, ++number);
            } else if (link.url.endsWith(".json")) {
                let widget = {};
                if (link.url.startsWith("//")) {
                    link.url = "https:" + link.url;
                }
                widget.sourceUrl = link.url;
                adapter.log.info('Load Widget Info From: ' + link.url + '/');
                
                https.get(link.url, (response) => {
                    try {
                        let cd = response.headers['content-disposition'];
                        if (cd && cd.indexOf("=") != -1 && cd.indexOf(".widget.json") != -1) {
                            widget.id = replaceAll(replaceAll(replaceAll(cd.split("=")[1], "\"", ""), "]", ""), ".widget.json", "");
                            item.widgets.push(widget);
                        }
                    } catch (e) {
                        adapter.log.error('habpanel web extension - : ' + e + '/');
                    }
                    loadWidgetDataDL(item, links, res, ++number);
                }).on('error', (e) => {
                    adapter.log.error('habpanel web extension - : ' + e + '/');
                    loadWidgetDataDL(item, links, res, ++number);
                });
            } else {
                loadWidgetDataDL(item, links, res, ++number);
            }
        } else {
            adapter.log.debug('habpanel web extension - : send result');
            res.end(JSON.stringify(item), 'utf8');
        }
    }

    function loadWidgetData(url, res) {
        adapter.log.info('habpanel web extension - Load Widget Info From: ' + url + '/');
        let data = "";
        let request = https.get(url, (response) => {
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => {
                adapter.log.debug('HapanelAPI - Send Data "' + data + '"');
                let i = JSON.parse(data);
                let item = {
                    id: i.id,
                    title: i.title,
                    description: i.post_stream.posts[0].cooked,
                    author: i.details.created_by.username,
                    authorName: i.post_stream.posts[0].display_username,
                    authorAvatarUrl: COMMUNITY_BASE_URL + i.details.created_by.avatar_template,
                    createdDate: i.created_at,
                    likes: i.like_count,
                    views: i.views,
                    posts: i.posts_count,
                    widgets: []
                };

                if (i.post_stream.posts[0].link_counts != null) {
                    loadWidgetDataDL(item, i.post_stream.posts[0].link_counts, res, 0);
                } else {
                    res.end(JSON.stringify(item), 'utf8');
                }
            });
        });
    }

    const __construct = (function () {
        that.adapter.log.info((that.settings.secure ? 'Secure ' : '') + 'habpanel server listening on port ' + that.settings.port);
        adapter.log.info('habpanel web extension - Install extension on /' + that.namespace + '/');
        that.app.use('/' + that.namespace + '/', (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = 200;
            if (req.url === '/gallery/community/widgets') {
                let topics = [];
                loadWidgetsList(COMMUNITY_GALLERY_URL, topics, res, 1);
            } else if (req.url.startsWith('/gallery/community/widgets/')) {
                let id = req.url.substr(27);
                let url = COMMUNITY_TOPIC_URL + id + ".json";
                loadWidgetData(url, res);
            }
        });
    }.bind(this))();


}

module.exports = HabpanelAPI;