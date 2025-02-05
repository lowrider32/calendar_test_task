OmniAuth.config.allowed_request_methods = [:post, :get]

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :entra_id,
    client_id: Rails.application.credentials.dig(:microsoft_graph, :client_id),
    client_secret: Rails.application.credentials.dig(:microsoft_graph, :client_secret),
    scope: 'openid email profile offline_access https://graph.microsoft.com/Calendars.ReadWrite'
end