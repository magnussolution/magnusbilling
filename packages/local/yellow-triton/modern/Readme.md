This modern-specific directory can include any (if not all) of the following directories:  

* overrides: Any classes in this directory will be automatically required and included in the modern build.
In case any of these classes define an Ext JS override (using Ext.define with an "override" property),
that override will in fact only be included in the build if the target class specified
in the "override" property is also included.  

- sass: Any modern-specific style rules should reside in this package, following the same structure
as the directory in the package root (see package.json for more information).  

- src: The modern-specific classes of this package should reside in this directory.