describe("Ext.Container", function() {
    var ct;

    afterEach(function() {
        ct = Ext.destroy(ct);
    });

    function makeContainer(cfg) {
        if (Ext.isArray(cfg)) {
            cfg = {
                items: cfg
            };
        }
        ct = new Ext.container.Container(cfg);
        return ct;
    }
    
    describe("add", function() {
        beforeEach(function() {
            makeContainer();
        });
        
        it("should return the item when adding single item", function() {
            var c = ct.add({
                xtype: 'component'
            });
            
            expect(ct.items.getAt(0)).toBe(c);
        });
        
        it("should return the array of added items when passed an array", function() {
            var cs = ct.add([{ xtype: 'component' }]);
            
            expect(Ext.isArray(cs)).toBe(true);
            expect(cs.length).toBe(1);
            expect(ct.items.getAt(0)).toBe(cs[0]);
        });
        
        it("should return the array of added items when adding more than one", function() {
            var cs = ct.add([
                { xtype: 'component' },
                { xtype: 'component' }
            ]);
            
            expect(Ext.isArray(cs)).toBe(true);
            expect(cs.length).toBe(2);
            expect(ct.items.getAt(0)).toBe(cs[0]);
            expect(ct.items.getAt(1)).toBe(cs[1]);
        });
    });
    
    describe("remove", function() {
        var c0, c1;
        
        beforeEach(function() {
            makeContainer({
                items: [{
                    // itemIds are reversed to trip the tests
                    // if something goes wrong
                    xtype: 'component',
                    itemId: '1'
                }, {
                    xtype: 'component',
                    itemId: '0'
                }]
            });
            
            c0 = ct.items.getAt(0);
            c1 = ct.items.getAt(1);
        });
        
        afterEach(function() {
            Ext.destroy(c0, c1);
            c0 = c1 = null;
        });
        
        describe("by instance", function() {
            it("should remove an item", function() {
                ct.remove(c0);
                
                expect(ct.items.getCount()).toBe(1);
            });
            
            it("should return the removed item", function() {
                var ret = ct.remove(c0);
                
                expect(ret).toBe(c0);
            });
            
            it("should destroy the item when asked to", function() {
                var ret = ct.remove(c0, true);
                
                expect(ret.destroyed).toBe(true);
            });
            
            it("should not remove the remaining item", function() {
                var ret = ct.remove(c0);
                
                expect(ct.items.getAt(0)).toBe(c1);
            });
        });
        
        describe("by index", function() {
            it("should remove an item", function() {
                ct.remove(0);
                
                expect(ct.items.getCount()).toBe(1);
            });
            
            it("should return the removed item", function() {
                var ret = ct.remove(0);
                
                expect(ret).toBe(c0);
            });
            
            it("should destroy the item when asked to", function() {
                var ret = ct.remove(0, true);
                
                expect(ret.destroyed).toBe(true);
            });
            
            it("should not remove the remaining item", function() {
                ct.remove(0);
                
                expect(ct.items.getAt(0)).toBe(c1);
            });
        });
        
        describe("by itemId", function() {
            it("should remove an item", function() {
                ct.remove('0');
                
                expect(ct.items.getCount()).toBe(1);
            });
            
            it("should return the removed item", function() {
                var ret = ct.remove('0');
                
                expect(ret).toBe(c1);
            });
            
            it("should destroy the item when asked to", function() {
                var ret = ct.remove('0');
                
                expect(ret.destroyed).toBe(true);
            });
            
            it("should not remove the remaining item", function() {
                ct.remove('0');
                
                expect(ct.items.getAt(0)).toBe(c0);
            });
        });
    });
    
    describe("removeAll", function() {
        var c0, c1;
        
        beforeEach(function() {
            makeContainer({
                items: [{
                    xtype: 'component'
                }, {
                    xtype: 'component'
                }]
            });
            
            c0 = ct.items.getAt(0);
            c1 = ct.items.getAt(1);
        });
        
        afterEach(function() {
            Ext.destroy(c0, c1);
            c0 = c1 = null;
        });
        
        it("should remove all items", function() {
            ct.removeAll();
            
            expect(ct.items.getCount()).toBe(0);
        });
        
        it("should return the removed items", function() {
            var ret = ct.removeAll();
            
            expect(Ext.isArray(ret)).toBe(true);
            expect(ret.length).toBe(2);
            expect(ret[0]).toBe(c0);
            expect(ret[1]).toBe(c1);
        });
        
        it("should destroy the items when asked", function() {
            var ret = ct.removeAll(true);
            
            expect(ret[0].destroyed).toBe(true);
            expect(ret[1].destroyed).toBe(true);
        });
        
        // TODO removeAll(true, true)
        xit("should remove everything", function() {
        });
    });
    
    describe("removeAt", function() {
        var c0, c1;
        
        beforeEach(function() {
            makeContainer({
                items: [{
                    xtype: 'component'
                }, {
                    xtype: 'component'
                }]
            });
            
            c0 = ct.items.getAt(0);
            c1 = ct.items.getAt(1);
        });
        
        afterEach(function() {
            Ext.destroy(c0, c1);
            c0 = c1 = null;
        });
        
        it("should remove the item at index", function() {
            ct.removeAt(0);
            
            expect(ct.items.getCount()).toBe(1);
        });
        
        it("should return the removed item", function() {
            var ret = ct.removeAt(0);
            
            expect(ret).toBe(c0);
        });
        
        it("should not remove other items", function() {
            ct.removeAt(0);
            
            expect(ct.items.getAt(0)).toBe(c1);
        });
    });
    
    // TODO Not sure what an inner item is and how to add it? - AT
    xdescribe("removeInnerAt", function() {
    });

    describe("references", function() {
        describe("static", function() {
            it("should not be a reference holder by default", function() {
                makeContainer({
                    items: {
                        xtype: 'component',
                        reference: 'a'
                    }
                });    
                expect(ct.lookupReference('foo')).toBeNull();
            });
            
            it("should support a direct child", function() {
                makeContainer({
                    referenceHolder: true,
                    items: {
                        xtype: 'component',
                        itemId: 'compA',
                        reference: 'a'
                    }
                });
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
            });
            
            it("should support a deep child", function() {
                makeContainer({
                    referenceHolder: true,
                    items: {
                        xtype: 'container',
                        items: {
                            xtype: 'container',
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compA',
                                    reference: 'a'
                                }
                            }
                        }
                    }
                });
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
            });
            
            it("should support children at multiple depths", function() {
                makeContainer({
                    referenceHolder: true,
                    items: [{
                        xtype: 'component',
                        itemId: 'compA',
                        reference: 'a'
                    }, {
                        xtype: 'container',
                        items: {
                            xtype: 'component',
                            itemId: 'compB',
                            reference: 'b'
                        }
                    }]
                }); 
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                expect(ct.lookupReference('b')).toBe(ct.down('#compB'));
            });
            
            it("should support multiple children at the same depth", function() {
                makeContainer({
                    referenceHolder: true,
                    items: [{
                        xtype: 'component',
                        itemId: 'compA',
                        reference: 'a'
                    }, {
                        xtype: 'component',
                        itemId: 'compB',
                        reference: 'b'
                    }]
                });
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                expect(ct.lookupReference('b')).toBe(ct.down('#compB'));
            });
            
            it("should support multiple children down the some tree", function() {
                    makeContainer({
                    referenceHolder: true,
                    items: [{
                        xtype: 'container',
                        itemId: 'compA',
                        reference: 'a',
                        items: {
                            xtype: 'container',
                            itemId: 'compB',
                            reference: 'b',
                            items: {
                                xtype: 'component',
                                itemId: 'compC',
                                reference: 'c'
                            }
                        }
                    }]
                });
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                expect(ct.lookupReference('b')).toBe(ct.down('#compB'));
                expect(ct.lookupReference('c')).toBe(ct.down('#compC'));
            });
            
            it("should support a reference holder not being at the root", function() {
                makeContainer({
                    items: {
                        xtype: 'container',
                        items: {
                            xtype: 'container',
                            itemId: 'ref',
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compA',
                                    reference: 'a'
                                }
                            }
                        }
                    }
                });  
                var ref = ct.down('#ref');
                expect(ref.lookupReference('a')).toBe(ref.down('#compA'));
            });
            
            it("should support multiple ref holders in a tree", function() {
                makeContainer({
                    referenceHolder: true,
                    items: {
                        xtype: 'container',
                        itemId: 'compA',
                        reference: 'a',
                        items: {
                            xtype: 'container',
                            referenceHolder: true,
                            itemId: 'ref',
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compB',
                                    reference: 'b'
                                }
                            }
                        }
                    }
                });
                var ref = ct.down('#ref');
                expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                expect(ref.lookupReference('b')).toBe(ref.down('#compB'));
            });
            
            it("should hide inner references from outer holders", function() {
                makeContainer({
                    referenceHolder: true,
                    items: {
                        xtype: 'container',
                        itemId: 'compA',
                        reference: 'a',
                        items: {
                            xtype: 'container',
                            referenceHolder: true,
                            itemId: 'ref',
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compB',
                                    reference: 'b'
                                }
                            }
                        }
                    }
                });
                expect(ct.lookupReference('b')).toBeNull();
            });
            
            it("should allow a reference holder to have a reference", function() {
                makeContainer({
                    referenceHolder: true,
                    items: {
                        referenceHolder: true,
                        xtype: 'container',
                        itemId: 'compA',
                        reference: 'a',
                        items: {
                            xtype: 'container',
                            itemId: 'compB',
                            reference: 'b'
                        }
                    }
                });
                
                var inner = ct.down('#compA');
                
                expect(inner.lookupReference('b')).toBe(inner.down('#compB'));
                expect(ct.lookupReference('a')).toBe(inner);
            });
            
            describe("docking", function() {
                it("should get a reference to a direct child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            docked: 'top',
                            xtype: 'component',
                            itemId: 'compA',
                            reference: 'a'
                        }
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                it("should get a reference to an indirect child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            xtype: 'container',
                            docked: 'top',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        }
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
            });
            
            describe("chained references", function() {
                it("should gain a reference to a deep child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'parent>',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        }]
                    });
                    expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                });
                
                it("should strip the > from the parent reference", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'a>',
                            itemId: 'compA',
                            items: {
                                xtype: 'component',
                                reference: 'b'
                            }
                        }]
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                it("should allow the parent to be reference even if there's no children", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'a>',
                            itemId: 'compA'
                        }]
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                it("should not setup a deep reference if the there's an intervening referenceHolder", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            referenceHolder: true,
                            reference: 'a>',
                            items: {
                                xtype: 'component',
                                reference: 'b'
                            }
                        }]
                    });
                    expect(ct.lookupReference('b')).toBeNull();
                });
                
                it("should allow for a multiple depth reference", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'a>',
                            items: {
                                xtype: 'container',
                                reference: 'b>',
                                items: {
                                    xtype: 'container',
                                    reference: 'c>',
                                    items: {
                                        xtype: 'container',
                                        reference: 'd>',
                                        items: {
                                            xtype: 'component',
                                            reference: 'e',
                                            itemId: 'compE'
                                        }
                                    }
                                }
                            }
                        }]
                    });
                    expect(ct.lookupReference('a.b.c.d.e')).toBe(ct.down('#compE'));
                });
                
                it("should isolate references by parent", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'parent1>',
                            items: {
                                xtype: 'component',
                                reference: 'child',
                                itemId: 'compA'
                            }
                        }, {
                            xtype: 'container',
                            reference: 'parent2>',
                            items: {
                                xtype: 'component',
                                reference: 'child',
                                itemId: 'compB'
                            }
                        }]
                    });
                    expect(ct.lookupReference('parent1.child')).toBe(ct.down('#compA'));
                    expect(ct.lookupReference('parent2.child')).toBe(ct.down('#compB'));
                });
                
                it("should allow the reference holder to begin at any depth", function() {
                    makeContainer({
                        items: [{
                            xtype: 'container',
                            reference: 'a>',
                            items: {
                                xtype: 'container',
                                reference: 'b>',
                                items: {
                                    xtype: 'container',
                                    referenceHolder: true,
                                    reference: 'c>',
                                    itemId: 'compC',
                                    items: {
                                        xtype: 'container',
                                        reference: 'd>',
                                        items: {
                                            xtype: 'component',
                                            reference: 'e',
                                            itemId: 'compE'
                                        }
                                    }
                                }
                            }
                        }]
                    });
                    var inner = ct.down('#compC');
                    expect(inner.lookupReference('d.e')).toBe(ct.down('#compE'));
                });
                
                it("should allow multiple references in the tree", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: [{
                            xtype: 'container',
                            reference: 'a>',
                            itemId: 'compA',
                            items: {
                                xtype: 'container',
                                reference: 'b>',
                                itemId: 'compB',
                                items: {
                                    xtype: 'container',
                                    referenceHolder: true,
                                    reference: 'c>',
                                    itemId: 'compC',
                                    items: {
                                        xtype: 'container',
                                        reference: 'd>',
                                        itemId: 'compD',
                                        items: {
                                            xtype: 'component',
                                            reference: 'e',
                                            itemId: 'compE'
                                        }
                                    }
                                }
                            }
                        }]
                    });
                    expect(ct.lookupReference('a.b')).toBe(ct.down('#compB'));
                    expect(ct.lookupReference('a.b.c')).toBe(ct.down('#compC'));
                    expect(ct.lookupReference('a.b.c.d')).toBeNull();
                    expect(ct.lookupReference('a.b.c.d.e')).toBeNull();
                }); 
                
                describe("docking", function() {
                    it("should get a reference to an indirect child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                docked: 'top',
                                reference: 'a>',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compB',
                                    reference: 'b'
                                }
                            }
                        });
                        expect(ct.lookupReference('a.b')).toBe(ct.down('#compB'));
                    });
                });
            });
        });
        
        describe("dynamic", function() {
            describe("adding", function() {
                it("should gain a reference to a direct child", function() {
                    makeContainer({
                        referenceHolder: true
                    });
                    ct.add({
                        xtype: 'component',
                        itemId: 'compA',
                        reference: 'a'
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                }); 
                
                it("should gain a reference to an indirect child", function() {
                    makeContainer({
                        referenceHolder: true
                    });
                    ct.add({
                        xtype: 'container',
                        items: {
                            xtype: 'component',
                            itemId: 'compA',
                            reference: 'a'
                        }
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                it("should gain a reference to a component inside an already constructed container", function() {
                    var local = new Ext.container.Container({
                        items: {
                            xtype: 'component',
                            itemId: 'compA',
                            reference: 'a'
                        }
                    });    
                    
                    makeContainer({
                        referenceHolder: true,
                        items: local
                    });
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                it("should gain a reference to a component added to containers child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            xtype: 'container'
                        }
                    });  
                    ct.items.first().add({
                        xtype: 'component',
                        itemId: 'compA',
                        reference: 'a'
                    });  
                    expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                });
                
                describe("chained references", function() {
                    it("should gain a reference to an indirect child", function() {
                        makeContainer({
                            referenceHolder: true
                        });
                        ct.add({
                            xtype: 'container',
                            reference: 'parent>',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        });
                        expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                    });

                    it("should gain a reference to a component inside an already constructed container", function() {
                        var local = new Ext.container.Container({
                            reference: 'parent>',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        });    

                        makeContainer({
                            referenceHolder: true,
                            items: local
                        });
                        expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                    });

                    it("should gain a reference to a component added to containers child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                reference: 'parent>'
                            }
                        });  
                        ct.items.first().add({
                            xtype: 'component',
                            itemId: 'compA',
                            reference: 'a'
                        });  
                        expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                    });
                    
                    describe("docking", function() {
                        it("should gain a reference to an indirect child", function() {
                            makeContainer({
                                referenceHolder: true
                            });
                            ct.add({
                                xtype: 'container',
                                docked: 'top',
                                reference: 'parent>',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compA',
                                    reference: 'a'
                                }
                            });
                            expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                        });

                        it("should gain a reference to a component inside an already constructed container", function() {
                            var local = new Ext.container.Container({
                                docked: 'top',
                                reference: 'parent>',
                                items: {
                                    xtype: 'component',
                                    itemId: 'compA',
                                    reference: 'a'
                                }
                            });    

                            makeContainer({
                                referenceHolder: true,
                                items: local
                            });
                            expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                        });

                        it("should gain a reference to a component added to containers child", function() {
                            makeContainer({
                                referenceHolder: true,
                                items: {
                                    docked: 'top',
                                    xtype: 'container',
                                    itemId: 'docked',
                                    reference: 'parent>'
                                }
                            });  
                            ct.down('#docked').add({
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            });  
                            expect(ct.lookupReference('parent.a')).toBe(ct.down('#compA'));
                        });
                    });
                });
                
                describe("docking", function() {
                    it("should gain a reference to a direct child", function() {
                        makeContainer({
                            referenceHolder: true
                        });
                        ct.add({
                            xtype: 'component',
                            docked: 'top',
                            itemId: 'compA',
                            reference: 'a'
                        });
                        expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                    }); 
                    
                    it("should gain a reference to an indirect child", function() {
                        makeContainer({
                            referenceHolder: true
                        });
                        ct.add({
                            xtype: 'container',
                            docked: 'top',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        });
                        expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                    });
                    
                    it("should gain a reference to a component inside an already constructed container", function() {
                        var local = new Ext.container.Container({
                            docked: 'top',
                            items: {
                                xtype: 'component',
                                itemId: 'compA',
                                reference: 'a'
                            }
                        });    
                        
                        makeContainer({
                            referenceHolder: true,
                            items: local
                        });
                        expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                    });
                    
                    it("should gain a reference to a component added to containers child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                docked: 'top',
                                itemId: 'docked'
                            }
                        });  
                        ct.down('#docked').add({
                            xtype: 'component',
                            itemId: 'compA',
                            reference: 'a'
                        });  
                        expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
                    });
                });   
            });
            
            describe("removing", function() {
                it("should not have a reference when removing a direct child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            xtype: 'component',
                            reference: 'a'
                        }
                    });    
                    var c = ct.lookupReference('a');
                    c.destroy();
                    expect(ct.lookupReference('a')).toBeNull();
                });
                
                it("should not have a reference when removing an indirect child", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            xtype: 'container',
                            items: {
                                xtype: 'component',
                                reference: 'a'
                            }
                        }
                    });    
                    var c = ct.lookupReference('a');
                    c.destroy();
                    expect(ct.lookupReference('a')).toBeNull();
                });
                
                it("should not have a reference when removing+destroying a container that has references", function() {
                    makeContainer({
                        referenceHolder: true,
                        items: {
                            xtype: 'container',
                            items: {
                                xtype: 'component',
                                reference: 'a'
                            }
                        }
                    });    
                    var c = ct.lookupReference('a');
                    var removed = ct.remove(0);
                    expect(ct.lookupReference('a')).toBeNull();
                    removed.destroy();
                });
                
                it("should not have a reference when only removing a container that has references", function() {
                    makeContainer({
                        id: 'a',
                        referenceHolder: true,
                        items: {
                            id: 'b',
                            xtype: 'container',
                            items: {
                                id: 'c',
                                xtype: 'component',
                                reference: 'a'
                            }
                        }
                    });
                    
                    var c = ct.lookupReference('a');
                    var removed = ct.remove(0, false);
                    expect(ct.lookupReference('a')).toBeNull();
                    removed.destroy();
                });
                
                describe("chained references", function() {
                    it("should not have a reference when removing an indirect child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                reference: 'parent>',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });    
                        var c = ct.lookupReference('parent.a');
                        c.destroy();
                        expect(ct.lookupReference('parent.a')).toBeNull();
                    });

                    it("should not have a reference when removing+destroying a container that has references", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                reference: 'parent>',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });    
                        var c = ct.lookupReference('parent.a');
                        var removed = ct.remove(0);
                        expect(ct.lookupReference('parent.a')).toBeNull();
                        removed.destroy();
                    });

                    it("should not have a reference when only removing a container that has references", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                reference: 'parent>',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });    
                        var c = ct.lookupReference('parent.a');
                        var removed = ct.remove(0, false);
                        expect(ct.lookupReference('parent.a')).toBeNull();
                        removed.destroy();
                    });
                    
                    describe("docking", function() {
                        it("should not have a reference when removing an indirect child", function() {
                            makeContainer({
                                referenceHolder: true,
                                items: {
                                    xtype: 'container',
                                    docked: 'top',
                                    reference: 'parent>',
                                    items: {
                                        xtype: 'component',
                                        reference: 'a'
                                    }
                                }
                            });    
                            var c = ct.lookupReference('parent.a');
                            c.destroy();
                            expect(ct.lookupReference('parent.a')).toBeNull();
                        });

                        it("should not have a reference when removing+destroying a container that has references", function() {
                            makeContainer({
                                referenceHolder: true,
                                items: {
                                    xtype: 'container',
                                    docked: 'top',
                                    itemId: 'docked',
                                    reference: 'parent>',
                                    items: {
                                        xtype: 'component',
                                        reference: 'a'
                                    }
                                }
                            });    
                            var dock = ct.down('#docked');

                            ct.remove(dock);
                            expect(ct.lookupReference('parent.a')).toBeNull();
                        });

                        it("should not have a reference when only removing a container that has references", function() {
                            makeContainer({
                                referenceHolder: true,
                                items: {
                                    xtype: 'container',
                                    docked: 'top',
                                    itemId: 'docked',
                                    reference: 'parent>',
                                    items: {
                                        xtype: 'component',
                                        reference: 'a'
                                    }
                                }
                            });    
                            var dock = ct.down('#docked');

                            var removed = ct.remove(dock, false);
                            expect(ct.lookupReference('parent.a')).toBeNull();
                            removed.destroy();
                        }); 
                    });
                });
                
                describe("docking", function() {
                    it("should not have a reference when removing a direct child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'component',
                                docked: 'top',
                                reference: 'a'
                            }
                        });    
                        var c = ct.lookupReference('a');
                        c.destroy();
                        expect(ct.lookupReference('a')).toBeNull();
                    });
                    
                    it("should not have a reference when removing an indirect child", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                docked: 'top',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });    
                        var c = ct.lookupReference('a');
                        c.destroy();
                        expect(ct.lookupReference('a')).toBeNull();
                    });
                    
                    it("should not have a reference when removing+destroying a container that has references", function() {
                        makeContainer({
                            referenceHolder: true,
                            items: {
                                xtype: 'container',
                                docked: 'top',
                                itemId: 'docked',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });    
                        var dock = ct.down('#docked');
                            
                        ct.remove(dock);
                        expect(ct.lookupReference('a')).toBeNull();
                    });
                    
                    xit("should not have a reference when only removing a container that has references", function() {
                        makeContainer({
                            referenceHolder: true,
                            dockedItems: {
                                xtype: 'container',
                                docked: 'top',
                                itemId: 'docked',
                                items: {
                                    xtype: 'component',
                                    reference: 'a'
                                }
                            }
                        });
                        
                        var dock = ct.down('#docked');
                            
                        var removed = ct.remove(dock, false);
                        expect(ct.lookupReference('a')).toBeNull();
                        removed.destroy();
                    });    
                });
            });
        });

        describe("setup", function() {
            it("should not create references on the rootInheritedState if not requested", function() {
                var vp = new Ext.viewport.Default({
                    referenceHolder: true
                });

                var temp = new Ext.container.Container({
                    items: {
                        xtype: 'component',
                        reference: 'a'
                    }
                });

                var c = temp.items.first();


                ct = new Ext.container.Container({
                    referenceHolder: true,
                    items: temp
                });

                expect(vp.lookupReference('a')).toBeNull();
                expect(ct.lookupReference('a')).toBe(c);

                vp.destroy();
            });
        });
    });

    describe("view controllers", function() {
        var Controller;
        beforeEach(function() {
            Controller = Ext.define('spec.TestController', {
                extend: 'Ext.app.ViewController',
                alias: 'controller.test'
            });
        });
        
        afterEach(function() {
            Controller = null;
            Ext.undefine('spec.TestController');
            Ext.Factory.controller.instance.clearCache();
        });
        
        it("should use a defined controller as a referenceHolder", function() {
            makeContainer({
                controller: 'test',
                items: {
                    xtype: 'component',
                    itemId: 'compA',
                    reference: 'a'
                }
            });       
            expect(ct.lookupReference('a')).toBe(ct.down('#compA'));
        });   
    });
    
    describe("defaultListenerScope", function() {
        describe("static", function() {
            it("should fire on a direct parent", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        xtype: 'container',
                        itemId: 'compA',
                        listeners: {
                            custom: 'callFn'
                        }
                    }
                });
                ct.callFn = jasmine.createSpy();
                ct.down('#compA').fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled();    
            });

            it("should fire on an indirect parent", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        xtype: 'container',
                        items: {
                            xtype: 'container',
                            itemId: 'compA',
                            listeners: {
                                custom: 'callFn'
                            }
                        }
                    }
                });
                ct.callFn = jasmine.createSpy();
                ct.down('#compA').fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled(); 
            });

            it("should fire children in the same tree", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        xtype: 'container',
                        itemId: 'compA',
                        listeners: {
                            custom: 'callFn'
                        },
                        items: {
                            xtype: 'container',
                            itemId: 'compB',
                            listeners: {
                                custom: 'callFn'
                            }
                        }
                    }
                });
                ct.callFn = jasmine.createSpy();
                ct.down('#compA').fireEvent('custom');
                ct.down('#compB').fireEvent('custom');
                expect(ct.callFn.callCount).toBe(2); 
            });

            it("should fire when the ref holder isn't at the root", function() {
                makeContainer({
                    items: {
                        defaultListenerScope: true,
                        xtype: 'container',
                        itemId: 'compA',
                        items: {
                            xtype: 'container',
                            itemId: 'compB',
                            listeners: {
                                custom: 'callFn'
                            }
                        }
                    }
                });
                var c = ct.down('#compA'); 
                c.callFn = jasmine.createSpy();
                ct.down('#compB').fireEvent('custom');
                expect(c.callFn).toHaveBeenCalled(); 
            });

            it("should only fire the event at the closest defaultListenerScope holder", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        defaultListenerScope: true,
                        xtype: 'container',
                        itemId: 'compA',
                        items: {
                            xtype: 'container',
                            itemId: 'compB',
                            listeners: {
                                custom: 'callFn'
                            }
                        }
                    }
                });
                var c = ct.down('#compA');
                ct.callFn = jasmine.createSpy();
                c.callFn = jasmine.createSpy();

                ct.down('#compB').fireEvent('custom');
                expect(c.callFn).toHaveBeenCalled();
                expect(ct.callFn).not.toHaveBeenCalled(); 
            });
        });
        
        describe("dynamic", function() {
            it("should fire on a direct parent", function() {
                makeContainer({
                    defaultListenerScope: true
                });

                var c = ct.add({
                    xtype: 'component',
                    listeners: {
                        custom: 'callFn'
                    }
                });

                ct.callFn = jasmine.createSpy();
                c.fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled();
            });

            it("should fire on an indirect parent", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        xtype: 'container'
                    }
                });

                var c = ct.items.first().add({
                    xtype: 'component',
                    listeners: {
                        custom: 'callFn'
                    }
                });

                ct.callFn = jasmine.createSpy();
                c.fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled();
            });

            it("should resolve a new method in a new hierarchy", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        xtype: 'component',
                        itemId: 'compA',
                        listeners: {
                            custom: 'callFn'
                        }
                    }
                });

                var other = new Ext.container.Container({
                    defaultListenerScope: true
                });

                var c = ct.down('#compA');

                ct.callFn = jasmine.createSpy();
                other.callFn = jasmine.createSpy();

                c.fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled();

                other.add(c);
                ct.callFn.reset();
                c.fireEvent('custom');

                expect(ct.callFn).not.toHaveBeenCalled();
                expect(other.callFn).toHaveBeenCalled();

                other.destroy();
            });

            it("should resolve a new method in the same hierarchy", function() {
                makeContainer({
                    defaultListenerScope: true,
                    items: {
                        defaultListenerScope: true,
                        xtype: 'container',
                        itemId: 'compA',
                        items: {
                            xtype: 'component',
                            itemId: 'compB',
                            listeners: {
                                custom: 'callFn'
                            }
                        }
                    }
                });

                var inner = ct.down('#compA'),
                    c = ct.down('#compB');

                ct.callFn = jasmine.createSpy();
                inner.callFn = jasmine.createSpy();

                c.fireEvent('custom');
                expect(inner.callFn).toHaveBeenCalled();
                expect(ct.callFn).not.toHaveBeenCalled();

                ct.add(c);
                inner.callFn.reset();

                c.fireEvent('custom');
                expect(ct.callFn).toHaveBeenCalled();
                expect(inner.callFn).not.toHaveBeenCalled();
            });
        });
    });

});