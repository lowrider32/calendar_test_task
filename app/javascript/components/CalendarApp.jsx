import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarApp = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    start: '',
    end: ''
  });

  const csrfToken = document.querySelector('[name="csrf-token"]')?.content;

  useEffect(() => {
    fetch('/events')
      .then((res) => res.json())
      .then((data) => {
        const parsedEvents = data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(parsedEvents);
      })
      .catch((err) => console.error('Error fetching events:', err));
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setFormValues({
      title: '',
      start: moment(start).format('YYYY-MM-DDTHH:mm'),
      end: moment(end).format('YYYY-MM-DDTHH:mm')
    });
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormValues({
      title: event.title,
      start: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end: moment(event.end).format('YYYY-MM-DDTHH:mm')
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const url = selectedEvent ? `/events/${selectedEvent.id}` : '/events';
    const method = selectedEvent ? 'PUT' : 'POST';

    const eventToSave = {
      ...formValues,
      start: new Date(formValues.start),
      end: new Date(formValues.end)
    };

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ event: eventToSave })
    })
      .then((res) => res.json())
      .then((event) => {
        const parsedEvent = {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        };
        if (selectedEvent) {
          setEvents((prev) => prev.map((e) => (e.id === parsedEvent.id ? parsedEvent : e)));
        } else {
          setEvents((prev) => [...prev, parsedEvent]);
        }
        handleClose();
      })
      .catch((err) => console.error('Error saving event:', err));
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    fetch(`/events/${selectedEvent.id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
        handleClose();
      })
      .catch((err) => console.error('Error deleting event:', err));
  };

  const handleSync = () => {
    if (!selectedEvent) return;
    fetch(`/events/${selectedEvent.id}/sync_with_outlook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Outlook sync response:', data);
        handleClose();
      })
      .catch((err) => {
        console.error('Error syncing event:', err);
        handleClose();
      });
  };

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent className="flex flex-col">
          <TextField
            label="Title"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Start"
            name="start"
            type="datetime-local"
            value={formValues.start}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="End"
            name="end"
            type="datetime-local"
            value={formValues.end}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <>
              <Button color="error" onClick={handleDelete}>
                Delete
              </Button>
              <Button onClick={handleSync}>Sync with Outlook</Button>
            </>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalendarApp;
