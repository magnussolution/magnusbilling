describe('Ext.plugin.Responsive', function () {
    var Responsive,
        oldGetOrientation, oldGetViewWidth, oldGetViewHeight,
        environments = {
            ipad: {
                landscape: {
                    width: 1024,
                    height: 768,
                    orientation: 'landscape'
                },
                portrait: {
                    width: 768,
                    height: 1024,
                    orientation: 'portrait'
                }
            }
        },
        env;

    beforeEach(function () {
        Responsive = Ext.mixin.Responsive;

        oldGetOrientation = Ext.dom.Element.getOrientation;
        oldGetViewWidth = Ext.dom.Element.getViewportWidth;
        oldGetViewHeight = Ext.dom.Element.getViewportHeight;

        Ext.dom.Element.getOrientation = function () {
            return env.orientation;
        };

        Ext.dom.Element.getViewportWidth = function () {
            return env.width;
        };

        Ext.dom.Element.getViewportHeight = function () {
            return env.height;
        };
    });

    afterEach(function () {
        Ext.dom.Element.getOrientation = oldGetOrientation;
        Ext.dom.Element.getViewportWidth = oldGetViewWidth;
        Ext.dom.Element.getViewportHeight = oldGetViewHeight;

        expect(Responsive.active).toBe(false);
        expect(Responsive.count).toBe(0);
    });

    describe('responsive border region', function () {
        var panel;

        beforeEach(function () {
            env = environments.ipad.landscape;
            Responsive.context = {
                platform: {
                    tablet: true
                }
            }
        });
        afterEach(function () {
            panel = Ext.destroy(panel);
        });

        function createPanel (plugin) {
            panel = Ext.create({
                xtype: 'panel',
                layout: 'border',
                width: 600,
                height: 600,
                renderTo: Ext.getBody(),
                referenceHolder: true,

                items: [{
                    reference: 'child',
                    title: 'Some Title',
                    plugins: plugin,

                    responsiveFormulas: {
                        narrow: function (state) {
                            return state.width < 800;
                        }
                    },
                    responsiveConfig: {
                        'width < 800': {
                            region: 'north'
                        },

                        'width >= 800': {
                            region: 'west'
                        },

                        narrow: {
                            title: 'Title - Narrow'
                        },
                        '!narrow': {
                            title: 'Title - Not Narrow'
                        }
                    }
                }, {
                    title: 'Center',
                    region: 'center'
                }]
            });
        }

        it('respond to size change', function () {
            createPanel('responsive');

            var child = panel.lookupReference('child');
            expect(child.region).toBe('west');
            expect(child.title).toBe('Title - Not Narrow');

            env = environments.ipad.portrait;
            Responsive.notify();

            expect(child.region).toBe('north');
            expect(child.title).toBe('Title - Narrow');
        });

        describe('creation', function (){
            it('should be created using config object', function () {
                createPanel({
                    ptype: 'responsive'
                });

                var child = panel.lookupReference('child');
                expect(child.region).toBe('west');
            });

            it('should be created using array of config objects', function () {
                createPanel([{
                    ptype: 'responsive'
                }]);

                var child = panel.lookupReference('child');
                expect(child.region).toBe('west');
            });
        });
    });
});
