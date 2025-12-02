describe('Ext.field.Number', function() {
    var field,
        create = function(config) {
            field = Ext.create('Ext.field.Number', config || {});
        },
        render = function() {
            field.renderTo(Ext.getBody());
        };

    beforeEach(function() {

    });

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe('deprecated configurations + methods', function() {

    });

    describe("configurations", function() {
        describe("minValue", function() {
            var defaultConfig = {
                minValue: 10
            };
            describe("configuration", function() {
                it("should add the min attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('min')).toEqual('10');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the min attribute to the inputEl", function() {
                            create();
                            field.setMinValue(10);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('min')).toEqual('10');
                        });
                    });

                    describe("after render", function() {
                        it("should add the min attribute to the inputEl", function() {
                            create();
                            render();
                            field.setMinValue(10);
                            expect(field.getComponent().inputElement.getAttribute('min')).toEqual('10');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the min attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setMinValue(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('min')).toBeNull();
                        });

                    });

                    describe("after render", function() {
                        it("should remove the min attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setMinValue(null);
                            expect(field.getComponent().inputElement.getAttribute('min')).toBeNull();
                        });

                    });
                });
            });
        });

        describe("maxValue", function() {
            var defaultConfig = {
                maxValue: 10
            };

            describe("configuration", function() {
                it("should add the max attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('max')).toEqual('10');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the max attribute to the inputEl", function() {
                            create();
                            field.setMaxValue(10);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('max')).toEqual('10');
                        });
                    });

                    describe("after render", function() {
                        it("should add the max attribute to the inputEl", function() {
                            create();
                            render();
                            field.setMaxValue(10);
                            expect(field.getComponent().inputElement.getAttribute('max')).toEqual('10');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the max attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setMaxValue(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('max')).toBeNull();
                        });
                    });

                    describe("after render", function() {
                        it("should remove the max attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setMaxValue(null);
                            expect(field.getComponent().inputElement.getAttribute('max')).toBeNull();
                        });
                    });

                });

            });

        });

        describe("stepValue", function() {
            var defaultConfig = {
                stepValue: 10
            };

            describe("configuration", function() {
                it("should add the step attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('step')).toEqual('10');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the step attribute to the inputEl", function() {
                            create();
                            field.setStepValue(10);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('step')).toEqual('10');
                        });
                    });

                    describe("after render", function() {
                        it("should add the step attribute to the inputEl", function() {
                            create();
                            render();
                            field.setStepValue(10);
                            expect(field.getComponent().inputElement.getAttribute('step')).toEqual('10');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the step attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setStepValue(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('step')).toBeNull();
                        });

                    });

                    describe("after render", function() {
                        it("should remove the step attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setStepValue(null);
                            expect(field.getComponent().inputElement.getAttribute('step')).toBeNull();
                        });

                    });
                });
            });
        });
    });
});























































