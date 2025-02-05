class SessionsController < ApplicationController
  def create
    auth = request.env['omniauth.auth']

    user = User.find_or_create_by(uid: auth.uid) do |u|
      u.name  = auth.info.name
      u.email = auth.info.email
    end

    user.update(token: auth.credentials.token)
    session[:user_id] = user.id

    redirect_to root_path, notice: "Signed in successfully."
  end

  def destroy
    reset_session
    redirect_to root_path, notice: "Signed out successfully."
  end
end
