class OutlookSyncService
  GRAPH_API_BASE = "https://graph.microsoft.com/v1.0".freeze

  def initialize(event:)
    @event = event
  end

  def sync_event
    response = event.outlook_id.present? ? update_event! : create_event!
    response.success?
  end

  def delete_event
    raise "Missing outlook_id for deletion" if event.outlook_id.blank?
    response = connection.delete("me/events/#{event.outlook_id}", nil, headers)
    response.success?
  end

  private

  attr_reader :event

  def create_event!
    response = connection.post("me/events", payload.to_json, headers)
    event.update!(outlook_id: response.body['id'])
    response
  end

  def update_event!
    connection.patch("me/events/#{event.outlook_id}", payload.to_json, headers)
  end

  def payload
    {
      subject: event.title,
      start: {
        dateTime: event.start.to_time.utc.strftime("%Y-%m-%dT%H:%M:%S"),
        timeZone: "UTC"
      },
      end: {
        dateTime: event.end.to_time.utc.strftime("%Y-%m-%dT%H:%M:%S"),
        timeZone: "UTC"
      }
    }
  end

  def connection
    @connection ||= Faraday.new(url: GRAPH_API_BASE) do |conn|
      conn.request  :json
      conn.response :json, content_type: /\bjson$/
      conn.adapter  Faraday.default_adapter
    end
  end

  def headers
    {
      "Authorization" => "Bearer #{event.user.token}",
      "Content-Type"  => "application/json"
    }
  end
end
