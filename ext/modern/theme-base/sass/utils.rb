module SenchaTouch
  module SassExtensions
    module Functions
      module Utils
        # Joins 2 file paths using the path separator
        def file_join(path1, path2)
          path1 = path1.value
          path2 = path2.value
          path = path1.empty? ? path2 : File.join(path1, path2)
          Sass::Script::String.new(path)
        end

        def file_exists(directory, path)
          result = false

          where_to_look = File.join(directory.value, path.value)

          if where_to_look && FileTest.exists?("#{where_to_look}")
            result = true
          end

          return Sass::Script::Bool.new(result)
        end
      end
    end
  end
end

module Sass::Script::Functions
  include SenchaTouch::SassExtensions::Functions::Utils
end