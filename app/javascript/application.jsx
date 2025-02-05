// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import React from 'react'
import ReactDOM from 'react-dom/client'
import CalendarApp from './components/CalendarApp'

document.addEventListener('turbo:load', () => {
  const container = document.getElementById('react-calendar')
  if (container) {
    const root = ReactDOM.createRoot(container)
    root.render(<CalendarApp />)
  }
})
