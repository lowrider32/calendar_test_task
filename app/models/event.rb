class Event < ApplicationRecord
  validates :outlook_id, uniqueness: true, allow_nil: true
  validates :title, :start, :end, presence: true

  belongs_to :user
end