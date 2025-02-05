class User < ApplicationRecord
  validates :uid, presence: true, uniqueness: true
  validates :email, presence: true

  has_many :events
end
