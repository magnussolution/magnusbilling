cur_dir = File.dirname(__FILE__)
require File.join(cur_dir, 'utils')
Compass::BrowserSupport.add_support('repeating-linear-gradient', 'webkit', 'moz', 'o', 'ms')
