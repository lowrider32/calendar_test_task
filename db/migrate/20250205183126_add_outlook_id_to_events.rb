class AddOutlookIdToEvents < ActiveRecord::Migration[8.0]
  def change
    add_column :events, :outlook_id, :string
  end
end
