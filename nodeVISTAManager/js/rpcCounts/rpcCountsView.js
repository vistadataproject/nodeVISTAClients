/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'backgrid',
    'rpcCounts/rpcCountCollection',
    'rpcCounts/emulatedRPCCollection',
    'rpcCounts/rpcCategoryCollection',
    'text!rpcCounts/rpcCounts.hbs',
    'text!rpcCounts/rpcReceived.hbs',
    'text!rpcCounts/top20.hbs',
    'eventBus',
    'd3',
    'pie',
    'rpcsCategorized',
    'templateHelpers',
    'backbone.paginator',
    'backgrid.paginator',
    'backgridCustomCells'
], function ($, _, Backbone, Handlebars, Backgrid, RPCCountCollection, EmulatedRPCCollection, RPCCategoryCollection, rpcCountsTemplate, rpcReceivedTemplate, top20Template, EventBus, d3) {
    'use strict';
    var RPCCounts = Backbone.View.extend({

        template: Handlebars.compile(rpcCountsTemplate),
        rpcReceivedTemplate: Handlebars.compile(rpcReceivedTemplate),
        top20Template: Handlebars.compile(top20Template),

        initialize: function () {

            this.listenTo(EventBus, 'countEvent', function(model) {
                this.renderRPCTotal();
                this.renderTop20();

                this.isRenderDistinctChart = true;
                this.isRenderEmulatedChart = true;
            });

            this.listenTo(EventBus, 'rpcCategoryEvent', function(model) {
                this.isRenderCategoryChart = true;
            });

            this.listenToOnce(EmulatedRPCCollection, 'reset', function(model) {
                this.$el.find('.emulated-total').html(EmulatedRPCCollection.fullCollection.size());
            });

            this.emulatedGrid = new Backgrid.Grid({
                columns: [{
                    name: 'name',
                    label: 'RPC',
                    editable: false,
                    cell: 'String'
                }, {
                    name: 'catag',
                    label: 'Category',
                    editable: false,
                    cell: 'String'
                }, {
                    name: 'count',
                    label: '# Received',
                    editable: false,
                    cell: 'integer'
                }],
                collection: EmulatedRPCCollection
            });

            this.emulatedPaginator = new Backgrid.Extension.Paginator({
                collection: EmulatedRPCCollection,
                goBackFirstOnSort: false
            });

        },

        render: function() {

            this.$el.html(this.template({
                emulatedRPCCount: EmulatedRPCCollection.fullCollection.size(),
                total: Object.keys(rpcsCategorized).length
            }));

            this.renderRPCTotal();
            this.renderTop20();
            this.renderEmulatedTable();

            var self = this;
            _.delay(function() {
                self.renderCategoryChart();
                self.renderDistinctChart();
                self.renderEmulatedChart();
            }, 100);

            //check if chart needs to be redrawn every five seconds
            this.renderChartsIntervalId = setInterval(function() {
                if (self.isRenderCategoryChart) {
                    self.renderCategoryChart();

                    self.isRenderCategoryChart = false;
                }

                if (self.isRenderDistinctChart) {
                    self.renderDistinctChart();

                    self.isRenderDistinctChart = false;
                }

                if (self.isRenderEmulatedChart) {
                    self.renderEmulatedChart();

                    self.isRenderEmulatedChart = false;
                }
            }, 50);

            return this;
        },

        renderRPCTotal: function() {
            this.$el.find('.rpc-received').html(this.rpcReceivedTemplate({
                total: RPCCountCollection.total()
            }));
        },
        renderTop20: function() {

            //populate empty top 20 spaces
            var top20 = RPCCountCollection.top(20);

            if (!top20 || top20.length < 20) {
                if (!top20) {
                    top20 = [];
                }

                var len = top20.length;
                for(var i = len; i < 20; i++) {
                    top20[i] = {
                        name: '&nbsp;'
                    };
                }
            }

            this.$el.find('.top20').html(this.top20Template({
                topList: top20
            }));
        },
        renderDistinctChart: function() {
            var self = this;
            var renderChart = function() {

                self.$el.find('#distinct-svg').remove();
                var container = self.$el.find('.distinct-pie-chart-container');
                container.append('<div id="distinct-svg" class="pie-chart">');

                IFG.displayPie({
                    divId: 'distinct-svg',
                    data: [
                        {
                            "LABEL": "Distinct Pass Through",
                            "COUNT": RPCCountCollection.distinctTotal()
                        },
                        {
                            "LABEL": "Distinct Emulated",
                            "COUNT": RPCCountCollection.distinctEmulatedTotal()
                        }
                    ],
                    categoryTitle: 'LABEL',
                    valueTitle: 'COUNT',
                    width: 300,
                    height: 300,
                    innerCircleRadius: 50
                });
            };

            renderChart();
        },
        renderCategoryChart: function() {

            var self = this;
            var renderChart = function() {

                self.$el.find('#category-svg').remove();
                var container = self.$el.find('.category-pie-chart-container');
                container.append('<div id="category-svg" class="pie-chart">');

                var categoryMap = {
                    "AUTHENTICATION": 0,
                    "CHANGE": 0,
                    "READ": 0,
                    "UTILITY": 0
                };

                RPCCategoryCollection.models.forEach(function(model) {
                    categoryMap[model.get('category')] = model.get('count');
                });

                var data = [];

                Object.keys(categoryMap).forEach(function(category) {
                    data.push({"LABEL": category, "COUNT": categoryMap[category]});
                });

                IFG.displayPie({
                    divId: 'category-svg',
                    data: data,
                    categoryTitle: 'LABEL',
                    valueTitle: 'COUNT',
                    width: 300,
                    height: 300,
                    innerCircleRadius: 50
                });
            };

            renderChart();
        },
        renderEmulatedChart: function() {

            var self = this;
            var renderChart = function() {

                self.$el.find('#emulated-svg').remove();
                var container = self.$el.find('.emulated-pie-chart-container');
                container.append('<div id="emulated-svg" class="pie-chart">');

                IFG.displayPie({
                    divId: 'emulated-svg',
                    data: [
                        {
                            "LABEL": "Pass Through",
                            "COUNT": RPCCountCollection.total()
                        },
                        {
                            "LABEL": "Emulated",
                            "COUNT": RPCCountCollection.emulatedTotal()
                        }
                    ],
                    categoryTitle: 'LABEL',
                    valueTitle: 'COUNT',
                    width: 300,
                    height: 300,
                    innerCircleRadius: 50
                });
            };

            renderChart();
        },
        renderEmulatedTable: function() {
            this.$el.find('#emulated-rpc-table').append(this.emulatedGrid.render().el);

            //render paginator
            this.$el.find('#emulated-rpc-table').append(this.emulatedPaginator.render().el);

            //apply bootstrap table styles to grid
            this.$el.find('.backgrid').addClass('table table-condensed table-striped table-bordered table-hover');

        },
        onClose: function () {
            clearInterval(this.renderChartsIntervalId);
        }
    });

    return RPCCounts;
});


