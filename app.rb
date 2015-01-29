require 'sinatra'
require 'sinatra/reloader'
require 'sass'
require 'sass/plugin/rack'

configure do
  Sass::Plugin.options[:style] = :compressed
  use Sass::Plugin::Rack
end

get '/' do
    send_file "views/homepage.html"
end
