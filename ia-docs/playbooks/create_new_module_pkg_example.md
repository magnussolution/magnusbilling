---
doc_id: MB-RAG-PLAYBOOK-CREATE-MODULE-PKG-EXAMPLE
version: 1.0
language: en
tags: [playbook, module, yii, extjs, database]
---

# How to Create a New Module (Example: pkg_example)

This guide shows the minimum path to add a new MagnusBilling module with a table related to `pkg_user`.

## Scope

- This is a documentation and guidance artifact for AI-assisted answers.
- It does not create or apply module files automatically.
- It does not execute SQL automatically.

## AI Answer Contract (when users ask how to create a module)

Always answer in this order:

1. Database step (table + FK).
2. Backend model/controller step.
3. Permission step.
4. Frontend model/store/view step.
5. Validation checklist.
6. Common mistakes.

If the user asks for implementation, ask confirmation before generating runtime files.

## 1) Create Database Table

Use the SQL in `script/pkg_example.sql`.

Table:

- `pkg_example`
- Fields: `id`, `id_user`, `name`, `date`
- FK: `id_user -> pkg_user.id`

## 2) Create Yii Model

Create `protected/models/Example.php`:

```php
<?php

class Example extends Model
{
    protected $_module = 'example';

    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    public function tableName()
    {
        return 'pkg_example';
    }

    public function primaryKey()
    {
        return 'id';
    }

    public function rules()
    {
        return [
            ['id_user, name', 'required'],
            ['id_user', 'numerical', 'integerOnly' => true],
            ['name', 'length', 'max' => 100],
            ['date', 'safe'],
        ];
    }

    public function relations()
    {
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }
}
```

## 3) Create Yii Controller

Create `protected/controllers/ExampleController.php`:

```php
<?php

class ExampleController extends Controller
{
    public $attributeOrder = 't.id';

    public function init()
    {
        $this->instanceModel = new Example;
        $this->abstractModel = Example::model();
        parent::init();
    }
}
```

This gives standard `read/save/destroy` behavior through the base controller lifecycle.

## 4) Add Permission Entry

Add module/action permissions for `example` in the permission config used by AccessManager.

## 5) Add ExtJS Model + Store

Create `app/model/Example.js` and `app/store/Example.js` mapping to endpoint:

- `index.php/example/read`
- `index.php/example/save`
- `index.php/example/destroy`

## 6) Add Frontend Grid (Complete, based on callerid)

This section is blueprint-only. It describes which files to create and how they should look.

Required frontend files:

- app/model/Example.js
- app/store/Example.js
- classic/src/view/example/Controller.js
- classic/src/view/example/Module.js
- classic/src/view/example/List.js
- classic/src/view/example/Form.js
- optional: classic/src/view/example/ImportCsv.js

### 6.1 Model blueprint

Define fields:

- id (int)
- id_user (int)
- name (string)
- date (date)
- idUserusername (string from join)

Proxy module must be `example`.

### 6.2 Store blueprint

Store name: `Example`.
Model: `MBilling.model.Example`.

### 6.3 List (grid) blueprint

Grid behavior aligned with callerid pattern:

- `extend: Ext.ux.grid.Panel`
- `alias: widget.examplelist`
- `store: 'Example'`
- `fieldSearch: 'name'`

Recommended columns:

1. `id` (hidden)
2. `idUserusername` with filter field `idUser.username`
3. `name`
4. `date` with renderer `Ext.util.Format.dateRenderer('Y-m-d H:i:s')`

Visibility rule example:

- hide username column for client profile (`App.user.isClient`)

### 6.4 Form blueprint

Form behavior aligned with callerid pattern:

- `extend: Ext.ux.form.Panel`
- `alias: widget.exampleform`
- `fieldsHideUpdateLot: ['id_user']`

Recommended fields:

1. `userlookup` for `id_user`
2. text field `name`
3. `datefield` for `date` with submit format `Y-m-d H:i:s`

### 6.5 Module + Controller blueprint

Module:

- `alias: widget.examplemodule`
- `controller: 'example'`

Controller:

- `extend: Ext.ux.app.ViewController`
- `alias: controller.example`

### 6.6 Application registration blueprint

Add to `classic/src/Application.js`:

- views: `example.Controller`, `example.Module`, `example.List`, `example.Form`
- stores: `Example`

Do not apply these registrations unless the user explicitly requests implementation.

## 7) Validation Checklist

1. Create one record with valid `id_user`.
2. Confirm FK blocks invalid `id_user`.
3. Confirm list/read returns JSON rows/count.
4. Confirm save and destroy return success/error correctly.
5. Confirm permission blocks unauthorized profiles.

## 8) Common Mistakes

- Forgetting `_module = 'example'` in model.
- Missing FK index on `id_user`.
- Frontend store URL not matching controller name.
- Not registering module permission, causing empty panel behavior.
