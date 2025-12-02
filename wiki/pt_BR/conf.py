# -*- coding: utf-8 -*-
#
# MagnusBilling documentation build configuration file

import sys
import os
import re

# -- General configuration ------------------------------------------------

needs_sphinx = '1.3'

# Sphinx extension module names and templates location
sys.path.append(os.path.abspath('../extensions'))

import sphinx_rtd_theme

extensions = [
    'gdscript', 
    'sphinx_tabs.tabs', 
    'sphinx.ext.imgmath', 
    'sphinx_rtd_theme',
    'sphinx.ext.autosectionlabel',
]
autosectionlabel_prefix_document = True

templates_path = ['_templates']

# You can specify multiple suffix as a list of string: ['.rst', '.md']
source_suffix = '.rst'
source_encoding = 'utf-8-sig'

# The master toctree document
master_doc = 'index'

# General information about the project
project = 'MagnusBilling Wiki'
copyright = '2005-2021, MagnusSolution'
author = 'Adilson Magnus and the MagnusBilling community'

# Version info for the project, acts as replacement for |version| and |release|
# The short X.Y version
version = 'source'
# The full version, including alpha/beta/rc tags
release = 'source'

language = 'en'

exclude_patterns = ['_build']

from gdscript import GDScriptLexer
from sphinx.highlighting import lexers
lexers['gdscript'] = GDScriptLexer()

# Pygments (syntax highlighting) style to use
pygments_style = 'sphinx'
highlight_language = 'gdscript'

# -- Options for HTML output ----------------------------------------------

# on_rtd is whether we are on readthedocs.org, this line of code grabbed from docs.readthedocs.org
on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

html_theme = "sphinx_rtd_theme"

# Theme options
html_theme_options = {
    # 'typekit_id': 'hiw1hhg',
    # 'analytics_id': '',
    # 'sticky_navigation': True  # Set to False to disable the sticky nav while scrolling.
    # 'logo_only': False,  # if we have a html_logo below, this shows /only/ the logo with no title text
    # 'collapse_navigation': False,  # Collapse navigation (False makes it tree-like)
    # 'display_version': True,  # Display the docs version
    # 'navigation_depth': 4,  # Depth of the headers shown in the navigation bar
}

# VCS options: https://docs.readthedocs.io/en/latest/vcs.html#github
html_context = {
    "display_github": True, # Integrate GitHub
    "github_user": "magnussolution", # Username
    "github_repo": "MagnusBilling Wiki", # Repo name
    "github_version": "master", # Version
    "conf_py_path": "/", # Path in the checkout to the docs root
}

html_logo = 'img/docs_logo.png'

# Output file base name for HTML help builder
htmlhelp_basename = 'MagnusBilling Wiki'

# -- Options for reStructuredText parser ----------------------------------

# Enable directives that insert the contents of external files
file_insertion_enabled = False

# -- Options for LaTeX output ---------------------------------------------

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
latex_documents = [
  (master_doc, 'MagnusBilling.tex', 'MagnusBilling Documentation',
   'Adilson Magnus and the MagnusBilling community', 'manual'),
]

# -- Options for linkcheck builder ----------------------------------------

# disable checking urls with about.html#this_part_of_page anchors
linkcheck_anchors = False

linkcheck_timeout = 10

# -- I18n settings --------------------------------------------------------

locale_dirs = ['../sphinx/po/']
gettext_compact = False
# Exclude class reference when marked with tag i18n.
if tags.has('i18n'):
    exclude_patterns = ['classes']
