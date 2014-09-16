require 'dotenv';Dotenv.load
require 'spy_glass'

proxy = SpyGlass::Proxy.new ENV.fetch('HOST') do |config|
  config.content_type = 'application/json'
  config.define_parser { |body| JSON.parse(body) }
  config.define_generator { |body| JSON.pretty_generate(body) }

  config.cache = ActiveSupport::Cache::MemoryStore.new(expires_in: Integer(ENV['CACHE_TTL'] || 5.minutes))

  config.define_transformation do |collection|
    features = collection.map do |record|
      longitude = record['longitude'] || (record['point'] && record['point']['longitude'])
      latitude = record['latitude'] || (record['point'] && record['point']['latitude'])

      { 'type' => 'Feature',
        'properties' => record,
        'geometry' => {
          'type' => 'Point',
          'coordinates' => [
            longitude.to_f,
            latitude.to_f ] } }
    end

    { 'type' => 'FeatureCollection', 'features' => features }
  end
end

require 'sinatra'

get '/' do
  erb :index
end

get('*', provides: :json, &proxy)
