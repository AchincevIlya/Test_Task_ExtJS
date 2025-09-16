Ext.onReady(function() {
    // ===== Форма входа =====
    var loginForm = Ext.create('Ext.form.Panel', {
        title: 'Вход',
        bodyPadding: 10,
        width: 300,
        height: 200,
        renderTo: Ext.getBody(),
        defaultType: 'textfield',
        items: [
            {
                fieldLabel: 'Логин',
                name: 'username',
                allowBlank: false
            },
            {
                fieldLabel: 'Пароль',
                name: 'password',
                inputType: 'password',
                allowBlank: false
            }
        ],
        buttons: [
            {
                text: 'Вход',
                formBind: true,
                handler: function() {
                    var values = loginForm.getValues();
                    if (values.username === 'admin' && values.password === 'padmin') {
                        loginForm.hide();
                        createMainWindow();
                    } else {
                        Ext.Msg.alert('Ошибка', 'Неверный логин или пароль');
                    }
                }
            }
        ]
    });

    // ===== Store товаров =====
    var productsStore = Ext.create('Ext.data.Store', {
        fields: ['id', 'name', 'description', 'price', 'quantity'],
        data: [
            { id: 1, name: 'Телефон', description: 'Смартфон Samsung', price: 29999.99, quantity: 10 },
            { id: 2, name: 'Ноутбук', description: 'Игровой Lenovo', price: 75999.50, quantity: 5 },
            { id: 3, name: 'Клавиатура', description: 'Механическая', price: 4999.90, quantity: 0 },
            { id: 4, name: 'Мышь', description: 'Игровая Razer', price: 3999.00, quantity: 15 }
        ]
    });

    // ===== Открытие карточки товара =====
    function openProductCard(record) {
        var form = Ext.create('Ext.form.Panel', {
            bodyPadding: 10,
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                allowBlank: false,
                labelWidth: 80
            },
            items: [
                { fieldLabel: 'Имя', name: 'name', xtype: 'textfield', readOnly: true },
                { fieldLabel: 'Описание', name: 'description', xtype: 'textfield', readOnly: true },
                { 
                    fieldLabel: 'Цена', 
                    name: 'price', 
                    xtype: 'numberfield', 
                    minValue: 0,
                    decimalPrecision: 2 
                },
                { 
                    fieldLabel: 'Кол-во', 
                    name: 'quantity', 
                    xtype: 'numberfield', 
                    minValue: 0,
                    allowDecimals: false
                }
            ],
            buttons: [
                {
                    text: 'Отмена',
                    handler: function() {
                        win.close();
                    }
                },
                {
                    text: 'Сохранить',
                    handler: function() {
                        var values = form.getValues();
                        var modified = false;

                        // Проверяем изменения
                        ['price', 'quantity'].forEach(function(field) {
                            if (record.get(field) != values[field]) {
                                modified = true;
                                record.set(field, values[field]);
                            }
                        });

                        if (modified) {
                            Ext.Msg.alert('Изменения', 'Данные сохранены');
                        }
                        win.close();
                    }
                }
            ]
        });

        form.loadRecord(record);

        var win = Ext.create('Ext.window.Window', {
            title: 'Карточка товара',
            modal: true,
            layout: 'fit',
            width: 420,
            height: 280,
            items: [form]
        });

        win.show();
    }

    // ===== Создание вкладки "Товары" =====
    function createProductsTab(tabPanel) {
        // Поля для фильтрации
        var idFilter = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'ID',
            labelWidth: 30,
            width: 120
        });

        var descFilter = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Описание',
            labelWidth: 70,
            width: 200
        });

        // Функция фильтрации
        function applyFilters() {
            productsStore.clearFilter(true);
            var idVal = idFilter.getValue();
            var descVal = descFilter.getValue() ? descFilter.getValue().toLowerCase() : '';

            productsStore.filterBy(function(rec) {
                var matchId = true, matchDesc = true;
                if (idVal) matchId = (rec.get('id') == idVal);
                if (descVal) matchDesc = rec.get('description').toLowerCase().includes(descVal);
                return matchId && matchDesc;
            });
        }

        var productsGrid = Ext.create('Ext.grid.Panel', {
            title: 'Товары',
            closable: true,
            layout: 'fit',
            store: productsStore,
            tbar: [
                idFilter,
                descFilter,
                {
                    text: 'Применить фильтры',
                    handler: applyFilters
                },
                {
                    text: 'Сбросить фильтры',
                    handler: function() {
                        idFilter.reset();
                        descFilter.reset();
                        productsStore.clearFilter();
                    }
                }
            ],
            columns: [
                { text: 'ID', dataIndex: 'id', flex: 1 },
                { 
                    text: 'Имя', 
                    dataIndex: 'name', 
                    flex: 2,
                    renderer: function(value) {
                        return '<a href="#">' + value + '</a>';
                    }
                },
                { text: 'Описание', dataIndex: 'description', flex: 3 },
                { 
                    text: 'Цена', 
                    dataIndex: 'price', 
                    flex: 2,
                    renderer: Ext.util.Format.numberRenderer('0,0.00')
                },
                { 
                    text: 'Кол-во', 
                    dataIndex: 'quantity', 
                    flex: 1,
                    renderer: function(value) {
                        if (value === 0) {
                            return '<span style="color:red;">' + value + '</span>';
                        }
                        return value;
                    }
                }
            ],
            listeners: {
                cellclick: function(grid, td, cellIndex, record) {
                    var column = grid.getColumnManager().getColumns()[cellIndex];
                    if (column.dataIndex === 'name') {
                        openProductCard(record);
                    }
                }
            }
        });

        tabPanel.add(productsGrid);
        tabPanel.setActiveTab(productsGrid);
    }

    // ===== Главное окно =====
    function createMainWindow() {
        var mainWin = Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                {
                    region: 'north',
                    xtype: 'toolbar',
                    items: [
                        {
                            text: 'Товары',
                            handler: function() {
                                var tabPanel = mainWin.down('tabpanel');
                                createProductsTab(tabPanel);
                            }
                        },
                        '->',
                        {
                            text: 'Выход',
                            handler: function() {
                                mainWin.destroy();
                                loginForm.getForm().reset();
                                loginForm.show();
                            }
                        }
                    ]
                },
                {
                    region: 'center',
                    xtype: 'tabpanel',
                    itemId: 'mainTabs',
                    items: []
                }
            ]
        });
    }
});
