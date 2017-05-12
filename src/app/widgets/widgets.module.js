(function() {
    'use strict';

    angular.module('app.widgets', [
        'app.services',
        'rzModule',
        'ui.knob',
        'web.colorpicker',
        'n3-line-chart',
        'sprintf',
        'ui.codemirror',
        'ds.clock',
        'aCKolor'
    ])
    .value('WidgetTypes', [])
    .factory('Widgets', WidgetsService)
    .directive('genericWidget', GenericWidgetDirective)
    .directive('widgetIcon', WidgetIcon)
    .directive('itemPicker', ItemPicker);
    

    WidgetsService.$inject = ['WidgetTypes'];
    function WidgetsService(widgetTypes) {

        var service = {
            registerType: registerType,
            getWidgetTypes: getWidgetTypes
        };

        return service;

        ////////////////
        
        function registerType(widget) {
            widgetTypes.push(widget);
            console.log("Registered widget type: " + widget.type);
        }

        function getWidgetTypes() {
            return widgetTypes;
        }

    }

    GenericWidgetDirective.$inject = ['$compile', 'Widgets'];
    function GenericWidgetDirective($compile, widgets) {
        var directive = {
            restrict: 'AE',
            replace: true,
            scope: {
                type   : '=',
                ngModel: '='
            },
            link: function (scope, element, attrs) {
                element.html('<widget-' + scope.type + ' ng-model="ngModel"></widget-' + scope.type + '>');
                $compile(element.contents())(scope);
            }
        };

        return directive;
    }

    WidgetIcon.$inject = ['IconService'];

    function WidgetIcon(IconService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: 
                '<div class="icon" ng-class="{backdrop: backdrop, center: center, inline: inline}">' +
                '<img ng-if="backdrop" height="100%" ng-class="{ colorize: colorize }" class="icon-tile-backdrop" ng-src="{{iconUrl}}" />' +
                '<img ng-if="!backdrop" ng-style="{ width: size + \'px\' }" ng-class="{ colorize: colorize, off: state==\'OFF\' }" class="icon-tile" ng-src="{{iconUrl}}" />' +
                '</div>',
            scope: {
                iconset : '=',
                icon    : '=',
                backdrop: '=?',
                center  : '=?',
                inline  : '=?',
                size    : '=?',
                state   : '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            if (!scope.size) scope.size = 32;
            scope.colorize = IconService.getIconSet(scope.iconset).colorize;
            scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);

            scope.$watch('state', function (state) {
                scope.iconUrl = IconService.getIconUrl(
                    scope.iconset,
                    scope.icon,
                    (state) ? state.toString() : null
                );
            });
        }
    }
    
    ItemPicker.$inject = ['$filter', 'OHService'];

    function ItemPicker($filter, OHService) {
        var directive = {
            bindToController: true,
            link: link,
            controller: ItemPickerController,
            controllerAs: 'vm',
            restrict: 'AE',
            template:
                '<div><input type="text" ng-model="vm.selectedItem" ng-model-options="{updateOn: \'keyup\'}" theme="selectize" title="Choose an item" ng-disabled="vm.loading" style="width: calc(100% - 60px)"/>' +
                '<button type="button" ng-click="showDialog()" class="btn pull-right" style="height: 31px;" ng-disabled="vm.loading"><i class="glyphicon glyphicon-list"></i>...</button></div>' +
                '<span style="font-size: 10px" ng-bind="vm.selectedName"></span>',
            scope: {
                ngModel: '=',
                filterType: '@',
                includeGroups: '=?'
            }
        };
        return directive;

        function link(scope, element, attrs) {
        }
    }
    ItemPickerController.$inject = ['$scope', '$filter', 'OHService'];

    function _(a) {return a;}

    function ItemPickerController ($scope, $filter, OHService) {
        var vm = this;
        vm.loading = true;

        OHService.getObject(this.ngModel).then(function (obj) {
            vm.loading = false;
            obj = obj || {common: {}};
            if (vm.selectedItem !== (obj._id || '')) {
                vm.selectedItem = obj._id || '';
            }
            vm.selectedName = obj.common.name || obj._id || '';
        });

        $scope.$watch('vm.selectedItem', function (newitem, oldvalue) {
            if (newitem === oldvalue) return;
            $scope.vm.ngModel = newitem || '';
            if (newitem) {
                OHService.getObject(newitem).then(function (obj) {
                    vm.selectedName = obj && obj.common ? obj.common.name || '' : '';
                });
            } else {
                vm.selectedName = '';
            }
        });

        $scope.showDialog = function() {
            vm.loading = true;
            return OHService.getObjects().then(function (objs) {
                vm.loading = false;
                if (!window.sid) {
                    var $dialog = $('#dialog-select-member');
                    if (!$dialog.length) {
                        $('body').append('<div id="dialog-select-member" style="display: none; z-index: 1100"></div>');
                        $dialog = $('#dialog-select-member');
                    }

                    window.sid = $dialog.selectId('init', {
                        objects: objs,
                        noMultiselect: true,
                        imgPath: '../../lib/css/fancytree/',
                        filter: {type: 'state'},
                        name: 'rules-select-state',
                        zindex: 1100,
                        texts: {
                            select: _('Select'),
                            cancel: _('Cancel'),
                            all: _('All'),
                            id: _('ID'),
                            name: _('Name'),
                            role: _('Role'),
                            room: _('Room'),
                            value: _('Value'),
                            selectid: _('Select ID'),
                            from: _('From'),
                            lc: _('Last changed'),
                            ts: _('Time stamp'),
                            wait: _('Processing...'),
                            ack: _('Acknowledged'),
                            selectAll: _('Select all'),
                            unselectAll: _('Deselect all'),
                            invertSelection: _('Invert selection')
                        },
                        columns: ['image', 'name', 'role', 'function', 'room', 'value']
                    });
                }
                window.sid.selectId('option', 'filterPresets', {role: ''});

                window.sid.selectId('show', vm.selectedItem, function (newId, oldId, obj) {
                    obj = obj || {common: {}};
                    vm.selectedItem = obj._id || '';
                    vm.selectedName = obj.common.name || obj._id || '';
                });
            });
        };
    }
})();
