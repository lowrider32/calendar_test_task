class HomeController < ApplicationController
  def index
    redirect_to('/signin') unless current_user
  end
end