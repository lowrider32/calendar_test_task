class EventsController < ApplicationController
  protect_from_forgery with: :null_session
  
  def index
    render json: current_user.events
  end
  
  def create
    event = current_user.events.build(event_params)
    if event.save
      render json: event, status: :created
    else
      render json: event.errors, status: :unprocessable_entity
    end
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def update
    event = current_user.events.find(params[:id])
    if event.update(event_params)
      render json: event
    else
      render json: event.errors, status: :unprocessable_entity
    end
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    event = current_user.events.find(params[:id])
    ActiveRecord::Base.transaction do
      event.destroy
      if event.outlook_id.present? && !OutlookSyncService.new(event: event).delete_event
        raise ActiveRecord::Rollback
      end
    end
    head :no_content
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def sync_with_outlook
    unless current_user
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end

    event = current_user.events.find(params[:id])
    outlook_response = OutlookSyncService.new(event: event).sync_event

    render json: { status: :ok, outlook_response: outlook_response }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def event_params
    params.require(:event).permit(:title, :start, :end)
  end
end
  