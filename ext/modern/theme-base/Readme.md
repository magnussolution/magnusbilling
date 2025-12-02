#Ext JS Modern Toolkit Theming Guidelines

## Dynamic Variables

All variables should be defined using the `dynamic()` function.  This ensures
that the last variable declaration wins, and is valid throughout the entire
scope, allowing variables to derive from one another without concern for
ordering.

## File Naming

All Component variable and UI mixin declarations (all non-rule-generating
code) should be placed in the theme's `sass/var/` directory in a file matching
the Component's class path.  Since all var files are included in the build
regardless of whether or not the corresponding class is actually required
by the app, this allows variables to freely derive from any other variable.
Including mixins in the `sass/var/` directory ensures that a derived theme can
override those mixins before they are called by any code in the `sass/src/`
directory.

All rule-generating code, including calls to UI mixins, and rules not contained
inside the body of a mixin should be placed in the theme's `sass/src/`
directory in a file matching the Component's class path.  At build time,
src files are only included if the corresponding Component is required by
the app, thus ensuring that only the rules that the app actually needs are
included in the CSS output.

## Base Styles vs. Configurable Styles

Layout-specific styles, and styles related to core functionality of a
Component should always be placed in `theme-base/sass/src/` in a file
matching the Component's class path.  The properties set in these rules
should NOT be configurable using variables, as changing them would likely
break the functionality or layout of the Component. Some examples of 
CSS properties that should generally not be configurable are:

- `display`
- `visibility`
- `position`
- `overflow`
- `z-index`

Configurable styles not related to the core functionality or layout
of a component should always be controlled using variables. These
variables should be defined in a scss file matching the component's class
path in the `theme-neptune/sass/var` directory, and the rules that use
these variables should be contained in a UI mixin in the same file.
Examples of commonly configurable styles are:

- `background-color`
- `color`
- `padding`
- `border-radius`
- `font-size`

The neptune theme is the base for all other themes and should contain
the universe of possible theming capabilities supported by the framework
although it may not utilize them all itself.  Themes derived from `theme-neptune`
should avoid defining new UI mixins and creating their own CSS rules, but
should instead simply set the values of variables defined in `theme-neptune`.
When a new feature is needed by a derived theme it should be added to
`theme-neptune` with variables to tune its behavior rather than adding
the new feature only to the derived theme.

##Variable Naming Conventions

Component variables should always begin with an xtype, and end with the CSS
property name being styled, for example:

    $button-font-family: dynamic(helvetica);
    $button-color: dynamic(#fff);
    $button-background-color: dynamic(red);

If the component has various states such as hovered, focused, and pressed,
the name of the state should come immediately after the xtype, but before
the CSS property name:

    $button-hovered-background-color: dynamic(blue);

If the component has variables that control the styling of sub-elements,
the name of the sub-element being styled should be included after the xtype,
and state if present.  For example, when styling the button's "badge" element:

    $button-badge-color: dynamic(#fff);
    $button-hovered-badge-color: dynamic(green);

If however, the "state" refers to a sub-element's state, it should come after
that element's name.  For example, if a tab has a close icon that has a
separate hover state from the tab:

    $tab-close-icon-hovered-background-color: dynamic(red);

Components should have separate variables for border-width, border-color,
and border-style, and all three properties should accept either a single
value or a list of values so that 4 sides can be specified separately if
needed:

    // BAD
    $button-border: dynamic(1px solid green);

    // GOOD
    $button-border-color: dynamic(red yellow green blue);
    $button-border-width: dynamic(1px 3px);
    $button-border-style: dynamic(solid);
    
Variables should use the following names to indicate component state:

- "pressed" when the component is being pressed by the user or is in a pressed state
- "pressing" if the component has a "pressing" state that is separate from "pressed"
- "hovered" when the mouse pointer is over the element
- "focused" when the element has focus
- "disabled" when the component is disabled.

Since "focused" can sometimes be combined with other states components may
need to provide variables that indicate a combination of states,
for exmaple `$button-focused-pressed-border-color`

## Normal and Big Modes

Each theme has 2 modes of sizing - normal and big. Big mode increases
spacing and sizing to be more touch-screen friendly. Themes select whether
or not to use big mode by inspecting `Ext.platformTags` in the theme's
`overrides/init.js` and adding a CSS class name of `x-big` to the `<html>`
element on the page.  For example, the triton theme only enables big mode
when loaded on a phone and uses normal mode otherwise:

    Ext.theme.getDocCls = function() {
        return Ext.platformTags.phone ? 'x-big' : '';
    };
    
All variables that set properties affecting visual size of a component,
like `font-size`, `line-height`, and `padding` should have big counterparts.
Big variables always have the `-big` suffix appended to the end:

    $button-padding: dynamic(1rem);
    $button-padding-big: dynamic(1.2rem);
    
SASS rules target big mode using the `.x-big` selector:

    .#{$prefix}button {
        padding: $padding;
        
        .#{$prefix}big & {
            padding: $padding-big;
        }
    }

##Component UIs

Every component should have a UI mixin for generating multiple visual
renditions of that component.  The mixin should be named `[xtype]-ui`.
For example `button-ui` or `panel-ui`.  

UI mixins should have a parameter for each of the component's global variables,
and the parameter names should be the same as the global variable names with
the exception that the mixin parameters should not contain the xtype in their names.
For example, a global variable named `$button-border-radius`, would correspond
to a parameter of the `button-ui` mixin named `$border-radius`.

The parameters to the UI mixin should all default to null, and should not
produce any output if unspecified by the caller.  This means that when the
mixin is invoked it should produce a set of styling that represents a delta
from the default UI.  This minimizes the number of css rules required to
create new UIs since the mixin automatically eliminates any null values
from the output.

The styling for the default UI should be applied using CSS class names that
do not contain a UI name, for example `x-button`, not `x-button-default`. 
This is the key to minimizing the number of rules required to create additional
UIs, since all buttons will have the `x-button` class in addition to one
or more optional `x-button-[ui]` classes.  It allows the default UI to
serve as a base set of styles for all other UIs.

A typical UI mixin should look something like this:

    @mixin button-ui(
        $ui: null
        // $xtype is the only variable that does not default to null
        // since it is only used in selector names and does not affect
        // the output unless other non-null values are passed.  It is
        // typically only passed by mixins of subclasses (see section on
        // "Derived UIs" below)
        $xtype: button,
        $background-color: null,
        $border-radius: null
    ) {
        // returns '' if $ui is null, otherwise prefixes $ui with "-"
        // To generate default UI we will not pass the $ui parameter
        $ui-suffix: ui-suffix($ui);
        
        .#{$prefix}#{$xtype}#{$ui-suffix} {
            // Fashion compiler removes null values from output
            // If all values are null, the entire rule is eliminated.
            // This means there is usually no need to check == null
            background-color: $background-color;
            border-radius: $border-radius;
        }
    }

Since all UI mixin parameters default to null, the default UI invocation
must explicitly pass all the global variables for the component.  This
generates the set of base styling rules for the component that all other
UIs build upon.  Note that this invocation does not pass $ui so that the
base styles are applied to the base `x-button` class, not a UI-specific one:

    @include button-ui(
        $background-color: $button-background-color,
        $border-radius: $button-border-radius
    );

To generate additional UIs, invoke the mixin again, passing only the
parameters that are different from the default UI.  For example, the
following mixin call generates a UI named "action" that builds upon the
default UI by changing the background-color to red, but inherits all other
properties from the default UI via the cascade.  The output from this UI
invocation is very minimal - it only contains the rule or rules needed
to set the background-color, nothing else.

    @include button-ui(
        $ui: 'action',
        $background-color: red
    );
    
## Derived UIs

Every subclass of a Component that has a UI mixin should also have its
own UI mixin, along with a complete set of global variables for configuring
that mixin.  The sublcass mixin should inoke the superclass mixin passing
its own xtype as the `$xtype` parameter before adding any rules of its own.
Any subclass variables that are not intended to have different default
values from the superclass variables should default to `null`.
This ensures that they will inherit the proper values via the parent CSS
class rather than redefining a redundant value.  NOTE: you must define a
`classCls` equal to `x-[xtype]` on both Components in order for this pattern
to work (See section below on CSS class names).  An example of this pattern
is the grid `pagingtoolbar` component which extends `toolbar`:

    // theme-neptune/sass/var/grid/plugin/PagingToolbar.scss
    $pagingtoolbar-background-color: dynamic(null);

    @mixin pagingtoolbar-ui(
        $ui: null,
        $xtype: pagingtoolbar,
        $background-color: null,
        $prev-icon: null
    ) {
        $ui-suffix: ui-suffix($ui);
        
        // Call base toolbar mixin.
        // Only produces output for non-null parameters
        @include toolbar-ui(
            $ui: $ui,
            $xtype: $xtype,
            $background-color: $background-color
        );
        
        // paging toolbar specific styles
        .#{$prefix}#{$xtype}#{$ui-suffix} {
            .#{$prefix}icon-prev {
                @include icon($prev-icon);
            }
        }
    }
    
    // theme-neptune/sass/src/grid/plugin/PagingToolbar.scss
    @include pagingtoolbar-ui(
        $background-color: $pagingtoolbar-background-color;
    );

##Configuring Theme UIs in Derived Themes

In the classic toolkit additional UIs provided with a theme typically were
accompanied by a complete set of global variables for configuring that UI
in derived themes.  This resulted in massive amounts of duplication
(variable count = total component vars * number of UIs).  The modern
toolkit takes a simpler approach - additional UIs provided by a theme are
not configurable via global variables.  Instead, these UIs are wrapped in
a mixin of their own, which can be overridden by derived themes to change
the parameters:

    @mixin button-action-ui() {
        @include button-ui(
            $ui: 'action',
            $background-color: red
        );
    }

Themes should provide a single variable for each additional UI that
defaults to "true" but can be overridden to "false" in derived themes to
completely disable generation of the UI.  This variable should have the
same name as the corresponding mixin:

    @if $button-action-ui {
        @include button-action-ui;
    }

##Composable UIs

UIs should be composable where possible.  For example if 2 separate button
renditions are required, a red "action" button, and a rounded red "action"
button, simply create an "action" UI and "round" UI:

    // sass/var
    $button-action-ui: dynamic($enable-default-uis);
    $button-confirm-ui: dynamic($enable-default-uis);
    
    @mixin button-action-ui() {
        @include button-ui(
            $ui: 'action',
            $background-color: red
        );
    }

    @mixin button-round-ui() {
        @include button-ui(
            $ui: 'round',
            $border-radius: 10000px
        );
    }

    // sass/src
    @if $button-action-ui {
        @include button-action-ui
    }

    @if $button-round-ui {
        @include button-round-ui
    }

To compose UIs simply use any number of UI names, space separated, in
your component config:

    ui: 'action round'

Note, that if multiple UIs set the same properties, the winner is the last
one in the cascade, i.e. the one whose mixin was invoked last.  To avoid
confusion, composable UIs should typically strive to limit their area of
concern to separate aspects of styling (colors, sizing, border-radius, etc),
so that there is little ambiguity when combining them.

Using composable UIs ensures that the generated CSS code remains very DRY,
by avoiding unnecessary duplication of CSS rules.  In the example above,
we avoid duplication of the background-color rules for every UI that may
optionally need roundness, since any UI can be combined with the "round"
UI to add roundness.

##Size Optimizing Mixins

Some css properties (like border-width, border-color, and border-style)
can sometimes be collapsed in to a single property (border).  Themes
should use mixins that intelligently collapse these properties if possible
to optimize CSS file size.

Pass border variables to the `border` mixin to collapse them into a single
border declaration if possible.  If any values are `null` or if any values
are a list then it will output separate `border-width`, `border-color`, and
`border-style` properties, otherwise it will output a single `border` property.

    .x-foo {
        @include border($border-width, $border-style, $border-color);
    }

Likewise the `font` mixin should always be used for generating a font
declaration from variables, since it also collapses properties into a
single `font` property if possible

    .x-foo {
        @include font($font-weight, $font-size, $line-height, $font-family);
    }
    
Margin and padding should always be included using the `margin` and `padding`
mixins.  This allows themes to specify margin and padding variables as
a list that may include `null` values.  A `null` value means "do not set
the value", and in many cases is preferred over `0`.  For example:

    // sass
    $foo-padding: dynamic(1em, null);

    .x-foo {
        @include padding($foo-padding);
    }
    
    // css output:
    .x-foo {
        padding-top: 1em;
        padding-bottom: 1em;
    }

## CSS Class Names

It is important to maintain consistency in naming of CSS classes since they they play
a major role in adding semantics and structure to the DOM elements that are generated
by Components in the framework.  This consistency of naming serves two purposes:

1. It improves the readability and maintainability of SASS code, and reduces the chance for error.
2. For users who do not use the SASS API, it provides a clear and understandable dom structure
for styling.

### Main Element and UI CSS Classes

Each Component should have a class name of `x-[xtype]` on its main element.  For example,
a Text Field component should have a CSS class name of `x-textfield`.  There are two
possible ways for Components to set this main CSS class.  They can either set
`classCls` or `baseCls` on the body of their class definition (`classCls` is preferred).
Setting either of these will add the CSS class to the main element and use it as the prefix
for UI-specific class names that are also added to the main element.  `classCls` and `baseCls` only
differ in their inheritability.  `classCls` is inherited by subclasses and is additional to the
`classCls` of those subclasses, whereas `baseCls` is not.  Additionally, when using
`classCls` a UI-specific CSS class name will be added for each and every `classCls` in the
class hierarchy. For example, a `Ext.field.Password` component with a `ui` of `foo` would
have the following UI classes:

- `x-passwordfield-foo`
- `x-textfield-foo`
- `x-field-foo`

Using this pattern ensures that styling is correctly inherited through the class hierarchy
and allows Components to only provide styling for the functionality that they add.  For
odd edge cases where inheriting styling is not desired Components may set `classClsRoot:true`
to prevent inheritance of `classCls` from ancestors, but this should usually be avoided.

### Reference Element CSS Classes

Reference elements should follow the pattern `x-[referencePrefix]-el`.  For example
the `bodyElement` reference element of a form field should have the CSS class
`x-body-el` (for consistency element references should always have the `Element`
suffix on the JavaScript side).  The `-el` suffix on the CSS class name helps
to differentiate the reference element from a potential Component with an
xtype of the same name.

### CSS Classes for Component Configuration and State

CSS class names that reflect Component configuration should follow the
pattern `x-[configName]-[configValue]`, and should always be placed on the Component's
main element.  For example a form field with a `labelAlign: 'left'` config would result in
a CSS class name of `x-label-align-left` being added to the main element.

CSS class names for boolean configs should generally follow one of two patterns

1. Truthiness causes a new class to be added - for example a checkbox with a `checked` config
would have a `x-checked` CSS class when the value is true, but would not have the class
when false.

2. Falsiness causes a new class to be added.  This is sometimes useful when the default value
is true, and the component needs needs additional styling only in the falsy state.
For example, the List component has a `x-no-row-lines` CSS class when
`rowLines` is configured as `false`.

Likewise class names that reflect Component state should follow the pattern
`x-[state]`, and should always be placed on the Component's main element .
For example, a button that is in pressed state would have the class `x-pressed` on
its main element.

Setting Component state and configuration CSS classes on the main element, rather than on
a reference element allows the state or configuration to be scoped to the Component, even
if these classes only affect the styling of a child element or elements.  This also results
in a more stable dom structure as these class names do not change location even if the
internal dom structure is modified.

### CSS Selectors

Since reference, config, and state CSS classes do not contain xtype info in their name,
they must be used in combination with the Component's `classCls` or `baseCls` to avoid
colliding with other Components that may have the same config or state class name.  For
example to style the pressed state of a button's main element, one would use the following
selector:

    .x-button.x-pressed

UI mixins should use UI-specific CSS class names in combination with reference, config,
and state CSS classes.  For example if the `ui` of a button is `'foo'`, one would style
the pressed state as follows:

    .x-button-foo.x-pressed

### Child vs Descendant Selectors

When styling a component's inner elements descendant selectors such as `.x-foo .x-bar`
should be preferred over direct child selectors like `.x-foo > .x-bar`.  This allows for
much more flexibility in the markup and allows it to tolerate more change, such as the
insertion of a wrapping element in between `x-foo` and `x-bar` without potentially breaking
the styling.  The only exception to this rule is when there is the potential for nesting.
For example, a panel might use a selector such as `.x-panel > .x-body-el` in order to only
style its own body element, and not the body elements of other panels nested within it.
In some cases when there may be  a varying number of dom elements in between
the container element and it's child it may be necessary to add UI-specific
class names to the child element, but this should be treated as the exception,
not the rule.  An example of this is `Ext.Container`.  It adds a UI-specific
class for each `classCls` to its `innerElement` because there can be a varying
number of DOM ancestors in between the `innerElement` and the `element`
depending on whether or not the container has docked items.


