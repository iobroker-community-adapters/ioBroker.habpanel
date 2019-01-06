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

	adapter.log.info('test 123');
	
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

    const that = this;
    // Cache
    this.users = {};

    const __construct = (function () {
        that.adapter.log.info((that.settings.secure ? 'Secure ' : '') + 'habpanel server listening on port ' + that.settings.port);
        adapter.log.info('Install extension on /' + that.namespace + '/');
        that.app.use('/' + that.namespace + '/', (req, res, next) => {
			adapter.log.info('req "' + req.url + '"');
		});
    }.bind(this))();
}

module.exports = HabpanelAPI;