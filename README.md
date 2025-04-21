# Daily Journal & Learning Companion

A comprehensive web application for tracking your daily activities, goals, and learning progress. This application uses HTML, CSS, and vanilla JavaScript with localStorage for data persistence.

## Features

### 1. Daily Journal
- Write and save daily journal entries
- Each entry is date-stamped and editable
- Delete entries if needed
- Entries are stored locally for persistence

### 2. Spaced Repetition System
- Schedule reviews at intervals of 1, 7, 21, 50, and 120 days
- Visual reminders on the calendar for when reviews are due
- Color-coded reminders (yellow for 1 day overdue, red for 2+ days overdue)
- Automatic rescheduling of missed reviews

### 3. Goal Tracker
- Set daily goals inspired by the "1% better every day" philosophy
- Visual progress bar to track daily goal completion
- Mark tasks as completed and see your progress update in real-time
- View historical goal completion in the calendar

### 4. Lesson Content Management
- Add, edit, and delete lesson content
- Lessons are date-stamped and can be linked to the spaced repetition system
- Easily review lesson content on specific dates

### 5. Summary Statistics
- Weekly and monthly summaries of your activity
- Track spaced repetition progress, goal completion rates, and more
- Visual representation of your productivity

### 6. Interactive Calendar
- Colorful, interactive calendar where each day is clickable
- Color-coded indicators for journal entries, goals, lessons, and reviews
- Easily navigate between days, weeks, and months
- Highlights for current day, past days, and future days

## How to Use

1. **Setup:**
   - Simply open the `index.html` file in any modern web browser
   - No server or installation required
   - Works offline after initial load

2. **Daily Journal:**
   - Type your thoughts in the journal textarea
   - Click "Save Entry" to store your entry
   - View, edit, or delete past entries

3. **Goals:**
   - Add new goals in the "Daily Goals" section
   - Check off completed goals
   - Track your progress with the progress bar

4. **Lessons:**
   - Create new lessons with a title and content
   - Add lessons to the spaced repetition system by clicking the sync icon
   - Lessons will appear in the calendar on their scheduled review dates

5. **Calendar Navigation:**
   - Click on any day to view details for that day
   - Use the arrow buttons to navigate between months
   - Color indicators show at a glance what's scheduled for each day

6. **Spaced Repetition:**
   - Review items on their scheduled dates
   - Mark reviews as complete to reschedule them for the next interval
   - Reschedule reviews if needed

7. **Summaries:**
   - Switch between weekly and monthly views
   - See statistics about your productivity
   - Automatically updated at the end of each week and month

## Technical Details

- Built with vanilla JavaScript (no frameworks or libraries)
- Uses localStorage for data persistence
- Responsive design works on desktop and mobile devices
- Smooth animations enhance the user experience

## Browser Compatibility

Works best in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Data Privacy

All your data is stored locally in your browser's localStorage. Nothing is sent to any server, ensuring complete privacy. 