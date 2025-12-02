describe('Ext.field.Text', function() {
    var field,
    create = function(config) {
        field = Ext.create('Ext.field.Text', config || {});
    },
    render = function() {
        field.renderTo(Ext.getBody());
    };

    afterEach(function() {
        if (field) {
            field.destroy();
            field = null;
        }
    });

    describe('deprecated configurations + methods', function() {

    });

    describe("events", function() {
        describe("change", function() {
            it("should fire when you change the value from null", function() {
                create();

                var fired = false;

                field.on('change', function() {
                    fired = true;
                }, this);

                field.setValue('test');

                expect(fired).toBeTruthy();
            });

            it("should fire when you change the value", function() {
                create({
                    value: 'test'
                });

                var fired = false;

                field.on('change', function() {
                    fired = true;
                }, this);

                field.setValue('test2');

                expect(fired).toBeTruthy();
            });

            it("should not fire when you change the value", function() {
                create({
                    value: 'test'
                });

                var fired = false;

                field.on('change', function() {
                    fired = true;
                }, this);

                field.setValue('test');

                expect(fired).toBeFalsy();
            });
        });
    });

    describe("configurations", function() {
        describe("name", function() {
            var defaultConfig = {
                name: 'myname'
            };

            describe("configuration", function() {
                it("should add the name attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('name')).toEqual('myname');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the name attribute to the inputEl", function() {
                            create();
                            field.setName('myname');
                            render();
                            expect(field.getComponent().inputElement.getAttribute('name')).toEqual('myname');
                        });
                    });

                    describe("after render", function() {
                        it("should add the name attribute to the inputEl", function() {
                            create();
                            render();
                            field.setName('myname');
                            expect(field.getComponent().inputElement.getAttribute('name')).toEqual('myname');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the name attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setName(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('name')).toBeNull();
                        });

                    });

                    describe("after render", function() {
                        it("should remove the name attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setName(null);
                            expect(field.getComponent().inputElement.getAttribute('name')).toBeNull();
                        });

                    });
                });
            });
        });

        describe("tabIndex", function() {
           var defaultConfig = {
               tabIndex: 10
           };

           describe("configuration", function() {
                it("should add the tabindex attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('tabindex')).toEqual('10');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the tabindex attribute to the inputEl", function() {
                            create();
                            field.setTabIndex(10);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('tabindex')).toEqual('10');
                        });
                    });

                    describe("after render", function() {
                        it("should add the tabindex attribute to the inputEl", function() {
                            create();
                            render();
                            field.setTabIndex(10);
                            expect(field.getComponent().inputElement.getAttribute('tabindex')).toEqual('10');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the tabindex attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setTabIndex(null);
                            render();
                            waits(10);
                            runs(function() {
                                expect(field.getComponent().inputElement.getAttribute('tabindex')).toBeNull();
                            });
                        });

                    });

                    describe("after render", function() {
                        it("should remove the tabindex attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setTabIndex(null);

                            expect(field.getComponent().inputElement.getAttribute('tabindex')).toBeNull();
                        });

                    });

                });

            });

        });

        describe("maxLength", function() {
            var defaultConfig = {
                maxLength: 10
            };

            describe("configuration", function() {
                it("should add the maxlength attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('maxlength')).toEqual('10');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the maxlength attribute to the inputEl", function() {
                            create();
                            field.setMaxLength(10);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('maxlength')).toEqual('10');
                        });
                    });

                    describe("after render", function() {
                        it("should add the maxlength attribute to the inputEl", function() {
                            create();
                            render();
                            field.setMaxLength(10);
                            expect(field.getComponent().inputElement.getAttribute('maxlength')).toEqual('10');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the maxlength attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setMaxLength(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('maxlength')).toBeNull();
                        });
                    });

                    describe("after render", function() {
                        it("should remove the maxlength attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setMaxLength(null);
                            expect(field.getComponent().inputElement.getAttribute('maxlength')).toBeNull();
                        });
                    });

                });

            });
        });

        describe("placeHolder", function() {
            var defaultConfig = {
                placeHolder: 'testing'
            };

            describe("configuration", function() {
                it("should add the placeholder attribute to the inputEl", function() {
                    create(defaultConfig);
                    render();
                    expect(field.getComponent().inputElement.getAttribute('placeholder')).toEqual('testing');
                });
            });

            describe("method", function() {
                describe("setting", function() {
                    describe("before render", function() {
                        it("should add the placeholder attribute to the inputEl", function() {
                            create();
                            field.setPlaceHolder('testing');
                            render();
                            expect(field.getComponent().inputElement.getAttribute('placeholder')).toEqual('testing');
                        });
                    });

                    describe("after render", function() {
                        it("should add the placeholder attribute to the inputEl", function() {
                            create();
                            render();
                            field.setPlaceHolder('testing');
                            expect(field.getComponent().inputElement.getAttribute('placeholder')).toEqual('testing');
                        });
                    });
                });


                describe("removing", function() {
                    describe("before render", function() {
                        it("should remove the placeholder attribute from the inputEl", function() {
                            create(defaultConfig);
                            field.setPlaceHolder(null);
                            render();
                            expect(field.getComponent().inputElement.getAttribute('placeholder')).toBeNull();
                        });

                    });

                    describe("after render", function() {
                        it("should remove the placeholder attribute from the inputEl", function() {
                            create(defaultConfig);
                            render();
                            field.setPlaceHolder(null);
                            expect(field.getComponent().inputElement.getAttribute('placeholder')).toBeNull();
                        });
                    });
                });
            });
        });

        describe("autoComplete", function() {
            describe("using value 'on'", function() {
                var defaultConfig = {
                    autoComplete: 'on'
                };

                describe("configuration", function() {
                    it("should add the autocomplete attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                field.setAutoComplete('on');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoComplete('on');
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoComplete(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoComplete(null);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value true", function() {
                var defaultConfig = {
                    autoComplete: true
                };

                describe("configuration", function() {
                    it("should add the autocomplete attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                field.setAutoComplete(true);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoComplete(true);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoComplete(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoComplete(null);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value 'off'", function() {
                var defaultConfig = {
                    autoComplete: 'off'
                };

                describe("configuration", function() {
                    it("should add the autocomplete attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                field.setAutoComplete('off');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                            });
                        });
                        describe("after render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoComplete('off');
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                            });
                        });
                    });
                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoComplete(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });

                        });
                        describe("after render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoComplete(null);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value false", function() {
                var defaultConfig = {
                    autoComplete: false
                };

                describe("configuration", function() {
                    it("should add the autocomplete attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                field.setAutoComplete(false);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocomplete attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoComplete(false);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toEqual('off');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoComplete(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocomplete attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoComplete(null);
                                expect(field.getComponent().inputElement.getAttribute('autocomplete')).toBe('off');
                            });
                        });
                    });
                });
            });
        });

        describe("autoCapitalize", function() {
            describe("using value 'on'", function() {
                var defaultConfig = {
                    autoCapitalize: 'on'
                };

                describe("configuration", function() {
                    it("should add the autocapitalize attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                field.setAutoCapitalize('on');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCapitalize('on');
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCapitalize(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCapitalize(null);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value true", function() {
                var defaultConfig = {
                    autoCapitalize: true
                };

                describe("configuration", function() {
                    it("should add the autocapitalize attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                field.setAutoCapitalize(true);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCapitalize(true);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCapitalize(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCapitalize(null);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value 'off'", function() {
                var defaultConfig = {
                    autoCapitalize: 'off'
                };

                describe("configuration", function() {
                    it("should add the autocapitalize attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                field.setAutoCapitalize('off');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                            });
                        });
                        describe("after render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCapitalize('off');
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                            });
                        });
                    });
                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCapitalize(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });

                        });
                        describe("after render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCapitalize(null);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value false", function() {
                var defaultConfig = {
                    autoCapitalize: false
                };

                describe("configuration", function() {
                    it("should add the autocapitalize attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                field.setAutoCapitalize(false);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocapitalize attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCapitalize(false);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toEqual('off');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCapitalize(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocapitalize attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCapitalize(null);
                                expect(field.getComponent().inputElement.getAttribute('autocapitalize')).toBe('off');
                            });
                        });
                    });
                });
            });
        });


        describe("autoCorrect", function() {
            describe("using value 'on'", function() {
                var defaultConfig = {
                    autoCorrect: 'on'
                };

                describe("configuration", function() {
                    it("should add the autocorrect attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                field.setAutoCorrect('on');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCorrect('on');
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCorrect(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCorrect(null);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value true", function() {
                var defaultConfig = {
                    autoCorrect: true
                };

                describe("configuration", function() {
                    it("should add the autocorrect attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                field.setAutoCorrect(true);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCorrect(true);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('on');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCorrect(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCorrect(null);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value 'off'", function() {
                var defaultConfig = {
                    autoCorrect: 'off'
                };

                describe("configuration", function() {
                    it("should add the autocorrect attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                field.setAutoCorrect('off');
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                            });
                        });
                        describe("after render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCorrect('off');
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                            });
                        });
                    });
                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCorrect(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });

                        });
                        describe("after render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCorrect(null);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });
                        });
                    });
                });
            });

            describe("using value false", function() {
                var defaultConfig = {
                    autoCorrect: false
                };

                describe("configuration", function() {
                    it("should add the autocorrect attribute to the inputEl", function() {
                        create(defaultConfig);
                        render();
                        expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                    });
                });

                describe("method", function() {
                    describe("setting", function() {
                        describe("before render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                field.setAutoCorrect(false);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                            });
                        });

                        describe("after render", function() {
                            it("should add the autocorrect attribute to the inputEl", function() {
                                create();
                                render();
                                field.setAutoCorrect(false);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toEqual('off');
                            });
                        });
                    });


                    describe("removing", function() {
                        describe("before render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                field.setAutoCorrect(null);
                                render();
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });

                        });

                        describe("after render", function() {
                            it("should remove the autocorrect attribute from the inputEl", function() {
                                create(defaultConfig);
                                render();
                                field.setAutoCorrect(null);
                                expect(field.getComponent().inputElement.getAttribute('autocorrect')).toBe('off');
                            });
                        });
                    });
                });
            });
        });
    });

    describe("methods", function() {
        describe("reset", function() {
            beforeEach(function () {
                create({
                    value: 'foo'
                });
                render();
                field.setValue('foobar');
            });

            it("should update the input field element", function () {
                field.reset();

                expect(field.getComponent().input.dom.value).toBe('foo');
            });

            it("should synchronize the value of the component with the field", function () {
                field.reset();

                expect(field.getValue()).toBe('foo');
                expect(field.getComponent().getValue()).toBe('foo');
            });
        });
    });
});
