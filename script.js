// Main Application Class
class JournalApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.calendar = new Calendar(this);
        this.journal = new Journal();
        this.goals = new Goals();
        this.lessons = new Lessons();
        this.spacedRepetition = new SpacedRepetition();
        this.summary = new Summary(this);
        this.scheduledTasks = new ScheduledTasks(this);
        this.userProfile = {
            name: localStorage.getItem('user-name') || 'Friend',
            streak: parseInt(localStorage.getItem('user-streak') || '0'),
            lastActive: localStorage.getItem('last-active-date') || new Date().toISOString().split('T')[0],
            theme: localStorage.getItem('theme') || 'light'
        };
        this.timerModule = null;

        this.init();
    }

    init() {
        // Set default date to today
        this.selectedDate = new Date();
        // Create calendar
        this.calendar = new Calendar(this);
        this.calendar.init();
        
        // Create journal
        this.journal = new Journal(this);
        this.journal.init();
        
        // Create lessons
        this.lessons = new Lessons(this);
        this.lessons.init();
        
        // Create goals
        this.goals = new Goals(this);
        this.goals.init();
        
        // Create scheduled tasks
        this.scheduledTasks = new ScheduledTasks(this);
        this.scheduledTasks.init();
        
        // Initialize timer module
        this.timerModule = new TimerModule(this);
        this.timerModule.init();

        // Initialize UI components
        this.initUserProfile();
        this.initThemeToggle();
        this.initCollapsibleSections();
        this.initIconNavigation();
        
        // Initialize day content
        this.updateDayContent(this.selectedDate);
        
        // Apply iOS specific fixes if needed
        this.applyMobileSpecificFixes();
        
        // Setup dark mode
        this.setupDarkMode();
    }
    
    initUserProfile() {
        // Display user greeting
        const greeting = this.getTimeBasedGreeting();
        document.getElementById('user-greeting').textContent = `${greeting}, ${this.userProfile.name}!`;
        
        // Display streak
        document.getElementById('streak-count').textContent = this.userProfile.streak;
    }
    
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }
    
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = this.userProfile.lastActive;
        
        // Convert dates to consistent format for comparison
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        
        const todayDate = new Date(today);
        todayDate.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last active was yesterday, increment streak
        if (lastActiveDate.getTime() === yesterday.getTime()) {
            this.userProfile.streak++;
        } 
        // If last active was before yesterday, reset streak
        else if (lastActiveDate < yesterday) {
            this.userProfile.streak = 1;
        }
        
        // Update last active date
        this.userProfile.lastActive = today;
        
        // Save to local storage
        localStorage.setItem('user-streak', this.userProfile.streak.toString());
        localStorage.setItem('last-active-date', today);
        
        // Update streak display
        document.getElementById('streak-count').textContent = this.userProfile.streak;
    }
    
    initThemeToggle() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        
        themeToggleBtn.addEventListener('click', () => {
            this.userProfile.theme = this.userProfile.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('theme', this.userProfile.theme);
        });
    }
    
    applyTheme() {
        if (this.userProfile.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-moon';
        }
    }

    initCollapsibleSections() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.collapsible-section');
                section.classList.toggle('collapsed');
                
                // Update the toggle button icon
                const toggleButton = header.querySelector('.toggle-section i');
                if (section.classList.contains('collapsed')) {
                    toggleButton.className = 'fas fa-chevron-down';
                } else {
                    toggleButton.className = 'fas fa-chevron-up';
                }
            });
        });
    }
    
    initIconNavigation() {
        // Select all section-icon-btn elements, including those in section-icons and section-icons-2
        const iconButtons = document.querySelectorAll('.section-icon-btn');
        
        // Don't set any section as active initially - hide all sections
        document.querySelectorAll('.right-panel > section.collapsible-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Add click event listeners to icon buttons
        iconButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionClass = button.dataset.section;
                if (!sectionClass) return; // Skip buttons without a section
                
                const selectedSection = document.querySelector(`.${sectionClass}`);
                
                // If the section is already visible, hide it and remove active class
                if (selectedSection && selectedSection.style.display === 'block') {
                    selectedSection.style.display = 'none';
                    button.classList.remove('active');
                } else {
                    // Hide all sections first
                    document.querySelectorAll('.right-panel > section.collapsible-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    // Remove active class from all buttons
                    iconButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Show the selected section and add active class to the button
                    if (selectedSection) {
                        selectedSection.style.display = 'block';
                        button.classList.add('active');
                        
                        // Make sure it's expanded
                        if (selectedSection.classList.contains('collapsed')) {
                            selectedSection.classList.remove('collapsed');
                            
                            // Update toggle button icon
                            const toggleButton = selectedSection.querySelector('.toggle-section i');
                            if (toggleButton) {
                                toggleButton.className = 'fas fa-chevron-up';
                            }
                        }
                    } else {
                        // Handle cases where the section doesn't exist yet
                        this.showToast(`Feature coming soon: ${button.dataset.tooltip || sectionClass}`, 'info');
                    }
                }
            });
        });
    }
    
    showSection(sectionClass) {
        const selectedSection = document.querySelector(`.${sectionClass}`);
        const button = document.querySelector(`.section-icon-btn[data-section="${sectionClass}"]`);
        
        // If section is already visible, toggle it off
        if (selectedSection && selectedSection.style.display === 'block') {
            selectedSection.style.display = 'none';
            if (button) button.classList.remove('active');
            return;
        }
        
        // Otherwise, hide all sections and show selected one
        document.querySelectorAll('.right-panel > section.collapsible-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.section-icon-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section and make button active
        if (selectedSection) {
            selectedSection.style.display = 'block';
            if (button) button.classList.add('active');
            
            // Make sure it's expanded
            if (selectedSection.classList.contains('collapsed')) {
                selectedSection.classList.remove('collapsed');
                
                // Update toggle button icon
                const toggleButton = selectedSection.querySelector('.toggle-section i');
                toggleButton.className = 'fas fa-chevron-up';
            }
        }
    }
    
    // Handle date selection from calendar
    selectDate(date) {
        // Update selected date
        this.selectedDate = date;
        
        // Highlight selected day in calendar
        this.calendar.highlightSelectedDay();
        
        // Update day content
        this.updateDayContent(date);
        
        // Show day details section - but only toggle if not already visible
        const dayDetailsSection = document.querySelector('.day-details-section');
        const dayDetailsButton = document.querySelector('.section-icon-btn[data-section="day-details-section"]');
        
        // Hide all sections first
        document.querySelectorAll('.right-panel > section.collapsible-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.section-icon-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show day details section and activate button
        if (dayDetailsSection) {
            dayDetailsSection.style.display = 'block';
            
            // Ensure it's expanded
            if (dayDetailsSection.classList.contains('collapsed')) {
                dayDetailsSection.classList.remove('collapsed');
                const toggleButton = dayDetailsSection.querySelector('.toggle-section i');
                if (toggleButton) toggleButton.className = 'fas fa-chevron-up';
            }
        }
        
        if (dayDetailsButton) {
            dayDetailsButton.classList.add('active');
        }
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = this.currentDate.toLocaleDateString('en-US', options);
    }

    switchTab(tab) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-summary`).classList.add('active');
    }

    updateDayContent(date) {
        const dayContent = document.getElementById('day-content');
        const selectedDayHeader = document.getElementById('selected-day-header');
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        selectedDayHeader.textContent = formattedDate;
        dayContent.innerHTML = '';

        // Add journal entries for this day
        const journalSection = this.createDayContentSection('Journal Entries');
        const journalEntries = this.journal.getEntriesForDate(date);
        
        if (journalEntries.length > 0) {
            journalEntries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                
                // Add creation time
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                journalSection.appendChild(entryDiv);
            });
        } else {
            journalSection.innerHTML += '<p>No journal entries for this day.</p>';
        }
        
        // Add goals for this day - SUMMARY ONLY
        const goalsSection = this.createDayContentSection('Daily Goals Summary');
        const dayGoals = this.goals.getGoalsForDate(date);
        
        if (dayGoals.length > 0) {
            // Add overall progress bar at the top
            const totalProgress = dayGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
            const progressPercentage = dayGoals.length > 0 ? Math.round(totalProgress / dayGoals.length) : 0;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <div class="progress-label">Day's Progress:</div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${progressPercentage === 100 ? 'rainbow-progress' : ''}" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-percentage">${progressPercentage}%</div>
            `;
            
            goalsSection.appendChild(progressContainer);
            
            // Add summary list of goals (without progress controls)
            const goalsList = document.createElement('div');
            goalsList.className = 'goals-list summary-list';
            
            dayGoals.forEach(goal => {
                const goalItem = document.createElement('div');
                goalItem.className = `goal-item-summary ${goal.completed ? 'goal-completed' : ''}`;
                
                goalItem.innerHTML = `
                    <div class="goal-text">
                        <i class="fas ${goal.completed ? 'fa-check-circle' : 'fa-circle'}"></i> 
                        ${goal.text} 
                        <span class="goal-progress-value">(${goal.progress || 0}%)</span>
                    </div>
                `;
                goalsList.appendChild(goalItem);
            });
            
            goalsSection.appendChild(goalsList);
        } else {
            goalsSection.innerHTML += '<p>No goals set for this day.</p>';
        }
        
        // Add lessons for this day - TITLE ONLY
        const lessonsSection = this.createDayContentSection('Lessons');
        const dayLessons = this.lessons.getLessonsForDate(date);
        
        if (dayLessons.length > 0) {
            const lessonList = document.createElement('div');
            lessonList.className = 'lesson-list-summary';
            
            dayLessons.forEach(lesson => {
                const lessonItem = document.createElement('div');
                lessonItem.className = 'lesson-item-summary';
                
                // Add creation time
                const lessonTime = new Date(lesson.date);
                const timeStr = lessonTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                lessonItem.innerHTML = `
                    <div class="lesson-title">
                        <i class="fas fa-graduation-cap"></i> ${lesson.title}
                    </div>
                    <div class="lesson-time">${timeStr}</div>
                `;
                lessonList.appendChild(lessonItem);
            });
            
            lessonsSection.appendChild(lessonList);
        } else {
            lessonsSection.innerHTML += '<p>No lessons for this day.</p>';
        }
        
        // Add scheduled tasks for this day
        const tasksSection = this.createDayContentSection('Scheduled Tasks');
        const dayTasks = this.scheduledTasks.getTasksForDate(date);
        
        if (dayTasks.length > 0) {
            const tasksList = document.createElement('div');
            tasksList.className = 'tasks-list-summary';
            
            dayTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item-summary';
                
                // For multi-day tasks, add a special class
                if (task.isMultiDay) {
                    taskItem.classList.add('multi-day-task');
                }
                
                if (task.isAllDay) {
                    taskItem.classList.add('all-day-task');
                }
                
                const startTime = task.isAllDay ? 'All day' : this.formatTime(task.startHour, task.startMinute);
                const endTime = task.isAllDay ? '' : ` - ${this.formatTime(task.endHour, task.endMinute)}`;
                
                let content = `
                    <div class="task-item-header">
                        <div class="task-item-title">
                            <i class="fas fa-clock"></i> ${task.name}
                        </div>
                        <div class="task-item-time">${startTime}${endTime}</div>
                    </div>
                `;
                
                // Add date range for multi-day tasks
                if (task.isMultiDay) {
                    const startDate = new Date(task.startDate).toLocaleDateString();
                    const endDate = new Date(task.endDate).toLocaleDateString();
                    content += `<div class="task-date-range">${startDate} - ${endDate}</div>`;
                }
                
                taskItem.innerHTML = content;
                tasksList.appendChild(taskItem);
            });
            
            tasksSection.appendChild(tasksList);
        } else {
            tasksSection.innerHTML += '<p>No tasks scheduled for this day.</p>';
        }
        
        // Add spaced repetition reminders for this day - ONLY IF THERE ARE REMINDERS
        const srReminders = this.spacedRepetition.getRemindersForDate(date);
        
        if (srReminders.length > 0) {
            const srSection = this.createDayContentSection('Spaced Repetition');
            
            srReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = `sr-item ${reminder.status}`;
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Original: ${new Date(reminder.originalDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="complete-sr" data-id="${reminder.id}"><i class="fas fa-check"></i></button>
                        <button class="reschedule-sr" data-id="${reminder.id}"><i class="fas fa-calendar-alt"></i></button>
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                srSection.appendChild(reminderDiv);
            });
            
            dayContent.appendChild(srSection);
        }
        
        dayContent.appendChild(journalSection);
        dayContent.appendChild(goalsSection);
        dayContent.appendChild(lessonsSection);
        dayContent.appendChild(tasksSection);
        
        // Set up event listeners for the day content
        this.setupDayContentListeners();
    }

    formatTime(hour, minute) {
        hour = parseInt(hour);
        minute = parseInt(minute);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    createDayContentSection(title) {
        const section = document.createElement('div');
        section.className = 'day-content-section fade-in';
        
        // Add appropriate icon based on section title
        let iconClass = 'fa-info-circle'; // Default icon
        
        if (title.includes('Journal')) {
            iconClass = 'fa-book';
        } else if (title.includes('Goals')) {
            iconClass = 'fa-bullseye';
        } else if (title.includes('Lesson')) {
            iconClass = 'fa-graduation-cap';
        } else if (title.includes('Repetition')) {
            iconClass = 'fa-sync-alt';
        } else if (title.includes('Summary')) {
            iconClass = 'fa-chart-bar';
        }
        
        section.innerHTML = `<h3><i class="fas ${iconClass}"></i> ${title}</h3>`;
        return section;
    }

    setupDayContentListeners() {
        // Journal actions
        document.querySelectorAll('.edit-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-journal').dataset.id;
                this.journal.editEntry(id);
            });
        });
        
        document.querySelectorAll('.delete-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-journal').dataset.id;
                this.journal.deleteEntry(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        // Goal actions
        document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.goals.toggleGoalCompletion(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.goal-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.goal-delete').dataset.id;
                this.goals.deleteGoal(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        // Use input event for the new text input
        document.querySelectorAll('.goal-progress-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                // Validate input: ensure it's a number between 0 and 100
                if (isNaN(progress)) {
                    progress = 0;
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                }
                
                // Update the input value to the validated progress
                e.target.value = progress;
                
                this.goals.updateGoalProgress(id, progress);
            });
            
            // Handle blur event to ensure the value is valid when user leaves the field
            input.addEventListener('blur', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                if (isNaN(progress)) {
                    progress = 0;
                    e.target.value = '0';
                }
                
                this.goals.updateGoalProgress(id, progress);
            });
        });
        
        // Lesson actions
        document.querySelectorAll('.edit-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                this.lessons.editLesson(id);
            });
        });
        
        document.querySelectorAll('.delete-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.lessons.deleteLesson(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.add-to-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.add-to-sr').dataset.id;
                const lesson = this.lessons.getLessonById(id);
                if (lesson) {
                    this.spacedRepetition.addLesson(lesson);
                    this.updateDayContent(this.selectedDate);
                    this.calendar.updateCalendar();
                }
            });
        });
        
        // SR actions
        document.querySelectorAll('.complete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.complete-sr').dataset.id;
                this.spacedRepetition.completeReminder(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.reschedule-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.reschedule-sr').dataset.id;
                this.spacedRepetition.rescheduleReminder(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.delete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm("Are you sure you want to delete this reminder?")) {
                    const id = e.target.closest('.delete-sr').dataset.id;
                    this.spacedRepetition.deleteReminder(id);
                    this.updateDayContent(this.selectedDate);
                    this.calendar.updateCalendar();
                }
            });
        });
        
        // Scheduled task actions
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-task').dataset.id;
                this.scheduledTasks.deleteTask(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
    }

    cleanup() {
        // ... existing code ...
        
        // Clean up timer module
        if (this.timerModule) {
            this.timerModule.cleanup();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    applyMobileSpecificFixes() {
        // Detect iOS device
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            // Add iOS specific class to body
            document.body.classList.add('ios-device');
            
            // Force redraw to fix potential layout issues
            document.body.style.webkitTransform = 'scale(1)';
            
            // Add event listeners for better handling of fixed elements
            document.addEventListener('touchmove', function(e) {
                // Allow scrolling even when touching "fixed" elements
                if (e.target.closest('.section') || 
                    e.target.closest('.calendar-section') || 
                    e.target.closest('.gamification-section')) {
                    e.stopPropagation();
                }
            }, { passive: true });
            
            // Fix for 100vh issue on iOS (viewport height calculation)
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                const setAppHeight = () => {
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                    appContainer.style.height = `calc(var(--vh, 1vh) * 100)`;
                    
                    // Check if in portrait or landscape mode
                    const isPortrait = window.innerHeight > window.innerWidth;
                    
                    // Add orientation class to body
                    if (isPortrait) {
                        document.body.classList.add('ios-portrait');
                        document.body.classList.remove('ios-landscape');
                    } else {
                        document.body.classList.add('ios-landscape');
                        document.body.classList.remove('ios-portrait');
                    }
                    
                    // Adjust panels based on orientation
                    this.adjustLayoutForOrientation(isPortrait);
                };
                
                // Set the height initially
                setAppHeight();
                
                // Handle resize and orientation change events
                window.addEventListener('resize', setAppHeight);
                window.addEventListener('orientationchange', () => {
                    // Small delay to ensure orientation has fully changed
                    setTimeout(setAppHeight, 100);
                });
            }
        }
        
        // Add general mobile detection
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-device');
            this.setupMobileNavigation();
        }
    }
    
    adjustLayoutForOrientation(isPortrait) {
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');
        const calendarSection = document.querySelector('.calendar-section');
        
        if (!leftPanel || !rightPanel || !calendarSection) return;
        
        if (isPortrait) {
            // Portrait mode: stack panels vertically
            leftPanel.style.position = 'relative';
            leftPanel.style.height = 'auto';
            leftPanel.style.maxHeight = '40vh';
            leftPanel.style.overflowY = 'auto';
            
            // Make calendar section collapse/expand on tap in portrait mode
            if (!calendarSection.hasAttribute('data-has-toggle')) {
                const calendarHeader = calendarSection.querySelector('h2') || calendarSection.querySelector('.section-header');
                if (calendarHeader) {
                    calendarHeader.style.cursor = 'pointer';
                    calendarHeader.addEventListener('click', () => {
                        calendarSection.classList.toggle('collapsed-mobile');
                        if (calendarSection.classList.contains('collapsed-mobile')) {
                            leftPanel.style.maxHeight = '70px';
                        } else {
                            leftPanel.style.maxHeight = '40vh';
                        }
                    });
                    calendarSection.setAttribute('data-has-toggle', 'true');
                }
            }
        } else {
            // Landscape mode: side-by-side panels with scrollable content
            leftPanel.style.position = 'sticky';
            leftPanel.style.top = '0';
            leftPanel.style.height = '100vh';
            leftPanel.style.maxHeight = 'none';
            
            // Remove collapsed state in landscape
            calendarSection.classList.remove('collapsed-mobile');
        }
    }
    
    setupMobileNavigation() {
        // Setup mobile navigation if not already done
        if (document.querySelector('.mobile-nav-bar')) return;
        
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;
        
        // Create mobile navigation bar
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav-bar';
        
        // Add calendar toggle button
        const calendarToggle = document.createElement('button');
        calendarToggle.className = 'mobile-nav-btn';
        calendarToggle.innerHTML = '<i class="fas fa-calendar"></i>';
        calendarToggle.addEventListener('click', () => {
            const leftPanel = document.querySelector('.left-panel');
            if (leftPanel) {
                leftPanel.classList.toggle('mobile-visible');
            }
        });
        
        // Add home/main content button
        const homeBtn = document.createElement('button');
        homeBtn.className = 'mobile-nav-btn active';
        homeBtn.innerHTML = '<i class="fas fa-home"></i>';
        homeBtn.addEventListener('click', () => {
            const btns = document.querySelectorAll('.mobile-nav-btn');
            btns.forEach(btn => btn.classList.remove('active'));
            homeBtn.classList.add('active');
            
            // Hide left panel if visible
            const leftPanel = document.querySelector('.left-panel');
            if (leftPanel) leftPanel.classList.remove('mobile-visible');
            
            // Show main content
            const rightPanel = document.querySelector('.right-panel');
            if (rightPanel) rightPanel.classList.add('mobile-visible');
        });
        
        mobileNav.appendChild(calendarToggle);
        mobileNav.appendChild(homeBtn);
        
        // Add to DOM
        document.body.appendChild(mobileNav);
    }

    setupDarkMode() {
        // Add dark mode styles
        document.body.classList.add('dark-mode');
        document.querySelector('#theme-toggle-btn i').className = 'fas fa-sun';
    }
}

// Journal Module with Time Support
class Journal {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('journal-entries')) || [];
    }

    init() {
        // Set current time as default
        this.initTimePicker();
        
        // Event listener for save button
        document.getElementById('save-journal').addEventListener('click', () => this.saveEntry());
        
        // Event listener for time-of-day selection
        const timeOfDaySelect = document.getElementById('journal-time-of-day');
        if (timeOfDaySelect) {
            timeOfDaySelect.addEventListener('change', () => {
                // Focus on content area after selecting time of day
                document.getElementById('journal-content').focus();
            });
        }
        
        // Setup initial display
        this.displayEntries();
    }
    
    initTimePicker() {
        const hourSelect = document.getElementById('journal-hour');
        const minuteSelect = document.getElementById('journal-minute');
        const ampmSelect = document.getElementById('journal-ampm');
        
        if (hourSelect && minuteSelect && ampmSelect) {
            // Populate hours (1-12)
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                hourSelect.appendChild(option);
            }
            
            // Populate minutes (00-59)
            for (let i = 0; i < 60; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i < 10 ? `0${i}` : i;
                minuteSelect.appendChild(option);
            }
            
            // Set current time as default
            this.setCurrentTimeAsDefault();
        }
    }
    
    setCurrentTimeAsDefault() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        const hourSelect = document.getElementById('journal-hour');
        const minuteSelect = document.getElementById('journal-minute');
        const ampmSelect = document.getElementById('journal-ampm');
        
        if (hourSelect && minuteSelect && ampmSelect) {
            hourSelect.value = hour12;
            minuteSelect.value = minutes;
            ampmSelect.value = ampm;
        }
    }
    
    saveEntry(isAutoSave = false) {
        const contentEl = document.getElementById('journal-content');
        const content = contentEl.value.trim();
        
        if (!content) return;
        
        // Get selected time
        const hourEl = document.getElementById('journal-hour');
        const minuteEl = document.getElementById('journal-minute');
        const ampmEl = document.getElementById('journal-ampm');
        const timeOfDayEl = document.getElementById('journal-time-of-day');
        
        let hour = new Date().getHours();
        let minute = new Date().getMinutes();
        
        // Convert 12-hour format to 24-hour if time picker is used
        if (hourEl && minuteEl && ampmEl) {
            let hour12 = parseInt(hourEl.value);
            const minute = parseInt(minuteEl.value);
            const ampm = ampmEl.value;
            
            // Convert to 24-hour format
            if (ampm === 'PM' && hour12 < 12) {
                hour = hour12 + 12;
            } else if (ampm === 'AM' && hour12 === 12) {
                hour = 0;
            } else {
                hour = hour12;
            }
            
            minute = minute;
        }
        
        const timeOfDay = timeOfDayEl ? timeOfDayEl.value : 'none';
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        // Create a date with the selected date and time
        const entryDate = new Date(selectedDate);
        entryDate.setHours(hour, minute, 0, 0);
        
        const entry = {
            id: Date.now().toString(),
            date: entryDate.toISOString(),
            content: content,
            timeOfDay: timeOfDay
        };
        
        this.entries.push(entry);
        this.saveToLocalStorage();
        
        // Always reset inputs after manual save
        contentEl.value = '';
        this.setCurrentTimeAsDefault();
        
        this.displayEntries();
        
        // Update day content if the entry is for the selected date
        const app = window.app;
        if (app) {
            app.updateDayContent(app.selectedDate);
            if (app.calendar) {
                app.calendar.updateCalendar();
            }
        }
    }

    displayEntries() {
        const journalHistory = document.getElementById('journal-history');
        if (!journalHistory) return;
        
        journalHistory.innerHTML = '';
        
        // Get selected date entries and sort by time (newest first)
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDateEntries = this.getEntriesForDate(selectedDate).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (selectedDateEntries.length === 0) {
            journalHistory.innerHTML = `<p>No journal entries for ${selectedDate.toLocaleDateString()}. Add one above!</p>`;
            return;
        }
        
        // Group entries by time of day
        const entriesByTimeOfDay = {
            morning: [],
            noon: [],
            afternoon: [],
            evening: [],
            none: []
        };
        
        selectedDateEntries.forEach(entry => {
            // Backward compatibility for entries without timeOfDay
            const timeOfDay = entry.timeOfDay || 'none';
            
            // Also determine timeOfDay from entry time if not explicitly set
            if (timeOfDay === 'none') {
                const entryDate = new Date(entry.date);
                const hour = entryDate.getHours();
                
                if (hour >= 5 && hour < 12) {
                    entriesByTimeOfDay.morning.push(entry);
                } else if (hour >= 12 && hour < 14) {
                    entriesByTimeOfDay.noon.push(entry);
                } else if (hour >= 14 && hour < 18) {
                    entriesByTimeOfDay.afternoon.push(entry);
                } else {
                    entriesByTimeOfDay.evening.push(entry);
                }
            } else {
                entriesByTimeOfDay[timeOfDay].push(entry);
            }
        });
        
        // Display entries by time of day
        const timeOfDayLabels = {
            morning: 'Morning (Sáng sớm)',
            noon: 'Noon (Buổi trưa)',
            afternoon: 'Afternoon (Buổi chiều)',
            evening: 'Evening (Buổi tối)'
        };
        
        // Create sections for each time of day
        Object.keys(timeOfDayLabels).forEach(timeOfDay => {
            const entries = entriesByTimeOfDay[timeOfDay];
            if (entries.length === 0) return;
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'journal-time-section';
            
            const sectionHeader = document.createElement('h3');
            sectionHeader.className = 'journal-time-header';
            sectionHeader.textContent = timeOfDayLabels[timeOfDay];
            sectionDiv.appendChild(sectionHeader);
            
            entries.forEach(entry => {
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                sectionDiv.appendChild(entryDiv);
            });
            
            journalHistory.appendChild(sectionDiv);
        });
        
        // Handle legacy entries with no time of day (if any left)
        const legacyEntries = entriesByTimeOfDay.none;
        if (legacyEntries.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'journal-time-section';
            
            const sectionHeader = document.createElement('h3');
            sectionHeader.className = 'journal-time-header';
            sectionHeader.textContent = 'Other Entries';
            sectionDiv.appendChild(sectionHeader);
            
            legacyEntries.forEach(entry => {
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                sectionDiv.appendChild(entryDiv);
            });
            
            journalHistory.appendChild(sectionDiv);
        }
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-journal').dataset.id;
                this.editEntry(id);
            });
        });
        
        document.querySelectorAll('.delete-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-journal').dataset.id;
                this.deleteEntry(id);
            });
        });
    }

    editEntry(id) {
        const entry = this.entries.find(entry => entry.id === id);
        
        if (entry) {
            const contentEl = document.getElementById('journal-content');
            const hourEl = document.getElementById('journal-hour');
            const minuteEl = document.getElementById('journal-minute');
            const ampmEl = document.getElementById('journal-ampm');
            const timeOfDayEl = document.getElementById('journal-time-of-day');
            
            contentEl.value = entry.content;
            
            const entryDate = new Date(entry.date);
            hourEl.value = entryDate.getHours().toString().padStart(2, '0');
            minuteEl.value = entryDate.getMinutes().toString().padStart(2, '0');
            
            // Set time of day if available
            if (timeOfDayEl && entry.timeOfDay) {
                timeOfDayEl.value = entry.timeOfDay;
            } else if (timeOfDayEl) {
                // Determine time of day from time if not explicitly set
                const hour = entryDate.getHours();
                if (hour >= 5 && hour < 12) {
                    timeOfDayEl.value = 'morning';
                } else if (hour >= 12 && hour < 14) {
                    timeOfDayEl.value = 'noon';
                } else if (hour >= 14 && hour < 18) {
                    timeOfDayEl.value = 'afternoon';
                } else {
                    timeOfDayEl.value = 'evening';
                }
            }
            
            // Focus on the content
            contentEl.focus();
            
            // Delete the old entry
            this.deleteEntry(id, true);
        }
    }

    deleteEntry(id, isAutoSave = false) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }
        
        const index = this.entries.findIndex(entry => entry.id === id);
        
        if (index !== -1) {
            this.entries.splice(index, 1);
            this.saveToLocalStorage();
            this.displayEntries();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
        
        if (!isAutoSave) {
            this.setCurrentTimeAsDefault();
        }
    }

    getEntriesForDate(date) {
        return this.entries.filter(entry => this.isSameDay(new Date(entry.date), date));
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    saveToLocalStorage() {
        localStorage.setItem('journal-entries', JSON.stringify(this.entries));
    }
}

// Goals Module
class Goals {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
    }

    init() {
        document.getElementById('add-goal').addEventListener('click', () => this.addGoal());
        document.getElementById('new-goal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });
        
        this.displayGoals();
        this.updateProgressBar();
    }

    addGoal() {
        const goalInput = document.getElementById('new-goal');
        const goalText = goalInput.value.trim();
        
        if (!goalText) return;
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        const goal = {
            id: Date.now().toString(),
            text: goalText,
            date: new Date(selectedDate).toISOString(),
            completed: false,
            progress: 0 // Add progress property for individual goal progress
        };
        
        this.goals.push(goal);
        this.saveToLocalStorage();
        
        goalInput.value = '';
        this.displayGoals();
        this.updateProgressBar();
        
        // Update day content and calendar
        const app = window.app;
        if (app && this.isSameDay(new Date(goal.date), app.selectedDate)) {
            app.updateDayContent(app.selectedDate);
        }
        
        if (app && app.calendar) {
            app.calendar.updateCalendar();
        }
    }

    displayGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';
        
        // Get goals for the selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDayGoals = this.goals.filter(goal => this.isSameDay(new Date(goal.date), selectedDate));
        
        if (selectedDayGoals.length === 0) {
            goalsList.innerHTML = `<p>No goals set for ${selectedDate.toLocaleDateString()}. Add one above!</p>`;
            return;
        }
        
        // Display selected day's goals
        selectedDayGoals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = `goal-item ${goal.completed ? 'goal-completed' : ''}`;
            goalItem.dataset.id = goal.id;
            
            // Add rainbow class when progress is 100%
            const progressBarClass = goal.progress === 100 ? 'rainbow-progress' : '';
            
            goalItem.innerHTML = `
                <input type="checkbox" class="goal-checkbox" data-id="${goal.id}" ${goal.completed ? 'checked' : ''}>
                <div class="goal-text">${goal.text}</div>
                <div class="goal-progress-container">
                    <div class="progress-bar-container goal-individual-progress">
                        <div class="progress-bar ${progressBarClass}" style="width: ${goal.progress || 0}%"></div>
                    </div>
                    <input type="text" class="goal-progress-input" data-id="${goal.id}" value="${goal.progress || 0}" min="0" max="100">
                    <button class="goal-progress-apply" data-id="${goal.id}">Apply</button>
                    <span class="goal-progress-value">${goal.progress || 0}%</span>
                </div>
                <button class="goal-delete" data-id="${goal.id}"><i class="fas fa-times"></i></button>
            `;
            
            goalsList.appendChild(goalItem);
        });
        
        // Add event listeners
        document.querySelectorAll('#goals-list .goal-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.toggleGoalCompletion(id);
            });
        });
        
        document.querySelectorAll('#goals-list .goal-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.goal-delete').dataset.id;
                this.deleteGoal(id);
            });
        });
        
        // Add event listener for progress input
        document.querySelectorAll('#goals-list .goal-progress-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                // Only validate the input, but don't update progress yet
                if (isNaN(progress)) {
                    progress = 0;
                    e.target.value = '0';
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                    e.target.value = progress;
                }
            });
        });
        
        // Add event listener for Apply button
        document.querySelectorAll('#goals-list .goal-progress-apply').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = e.target.parentNode.querySelector('.goal-progress-input');
                let progress = parseInt(input.value);
                
                if (isNaN(progress)) {
                    progress = 0;
                    input.value = '0';
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                }
                
                this.updateGoalProgress(id, progress);
                
                // Add visual feedback
                button.textContent = 'Done!';
                setTimeout(() => {
                    button.textContent = 'Apply';
                }, 1000);
            });
        });
    }

    updateGoalProgress(id, progress) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals[index].progress = progress;
            
            // If progress is 100%, also mark as completed
            if (progress === 100) {
                this.goals[index].completed = true;
            } else if (this.goals[index].completed) {
                // If progress is less than 100% but goal is marked completed, unmark it
                this.goals[index].completed = false;
            }
            
            // Update the UI directly without re-rendering everything
            const goalItem = document.querySelector(`.goal-item[data-id="${id}"]`);
            if (goalItem) {
                const progressBar = goalItem.querySelector('.progress-bar');
                const progressValue = goalItem.querySelector('.goal-progress-value');
                const checkbox = goalItem.querySelector('.goal-checkbox');
                
                // Update progress bar and text
                progressBar.style.width = `${progress}%`;
                progressValue.textContent = `${progress}%`;
                
                // Update checkbox state
                checkbox.checked = this.goals[index].completed;
                
                // Add/remove goal-completed class
                if (this.goals[index].completed) {
                    goalItem.classList.add('goal-completed');
                } else {
                    goalItem.classList.remove('goal-completed');
                }
                
                // Add/remove ultimate effects
                if (progress === 100) {
                    progressBar.classList.add('rainbow-progress');
                    progressBar.classList.add('ultimate');
                    
                    // Create flames container if it doesn't exist
                    let progressContainer = progressBar.parentNode;
                    if (!progressContainer.classList.contains('rainbow-progress-container')) {
                        progressContainer.classList.add('rainbow-progress-container');
                    }
                    
                    // Add flames element if it doesn't exist
                    if (!progressContainer.querySelector('.flames')) {
                        const flames = document.createElement('div');
                        flames.className = 'flames';
                        progressContainer.appendChild(flames);
                    }
                    
                    // Add pulse animation
                    progressBar.classList.add('pulse');
                    setTimeout(() => {
                        progressBar.classList.remove('pulse');
                    }, 500);
                } else {
                    progressBar.classList.remove('rainbow-progress');
                    progressBar.classList.remove('ultimate');
                    
                    // Remove flames element if it exists
                    const progressContainer = progressBar.parentNode;
                    const flames = progressContainer.querySelector('.flames');
                    if (flames) {
                        progressContainer.removeChild(flames);
                    }
                }
            }
            
            this.saveToLocalStorage();
            this.updateProgressBar();
        }
    }

    toggleGoalCompletion(id) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals[index].completed = !this.goals[index].completed;
            
            // Auto-set progress to 100% when completed, or to previous progress when uncompleted
            if (this.goals[index].completed) {
                this.goals[index].progress = 100;
            }
            
            this.saveToLocalStorage();
            
            // Update the specific goal item in the UI without re-rendering the whole list
            const goalItem = document.querySelector(`.goal-item[data-id="${id}"]`);
            if (goalItem) {
                const progressBar = goalItem.querySelector('.progress-bar');
                const progressValue = goalItem.querySelector('.goal-progress-value');
                const input = goalItem.querySelector('.goal-progress-input');
                
                if (this.goals[index].completed) {
                    progressBar.style.width = '100%';
                    progressBar.classList.add('rainbow-progress');
                    progressBar.classList.add('ultimate');
                    progressValue.textContent = '100%';
                    input.value = 100;
                    goalItem.classList.add('goal-completed');
                    
                    // Create flames container if it doesn't exist
                    let progressContainer = progressBar.parentNode;
                    if (!progressContainer.classList.contains('rainbow-progress-container')) {
                        progressContainer.classList.add('rainbow-progress-container');
                    }
                    
                    // Add flames element if it doesn't exist
                    if (!progressContainer.querySelector('.flames')) {
                        const flames = document.createElement('div');
                        flames.className = 'flames';
                        progressContainer.appendChild(flames);
                    }
                } else {
                    progressBar.style.width = '0%';
                    progressBar.classList.remove('rainbow-progress');
                    progressBar.classList.remove('ultimate');
                    progressValue.textContent = '0%';
                    input.value = 0;
                    goalItem.classList.remove('goal-completed');
                    
                    // Remove flames element if it exists
                    const progressContainer = progressBar.parentNode;
                    const flames = progressContainer.querySelector('.flames');
                    if (flames) {
                        progressContainer.removeChild(flames);
                    }
                }
            }
            
            this.updateProgressBar();
        }
    }

    deleteGoal(id) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals.splice(index, 1);
            this.saveToLocalStorage();
            this.displayGoals();
            this.updateProgressBar();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    updateProgressBar() {
        const progressBar = document.getElementById('goal-progress-bar');
        const progressPercentage = document.getElementById('goal-progress-percentage');
        
        if (!progressBar || !progressPercentage) return;
        
        // Get goals for the selected date
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDayGoals = this.getGoalsForDate(selectedDate);
        
        // Calculate overall progress
        if (selectedDayGoals.length === 0) {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            return;
        }
        
        const totalProgress = selectedDayGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
        const overallProgress = Math.round(totalProgress / selectedDayGoals.length);
        
        // Update the progress bar width and text
        progressBar.style.width = `${overallProgress}%`;
        progressPercentage.textContent = `${overallProgress}%`;
        
        // Apply rainbow gradient effect at 100%
        if (overallProgress === 100) {
            progressBar.classList.add('rainbow-progress');
            progressBar.classList.add('ultimate');
            
            // Make sure the container has the special class
            const progressContainer = progressBar.parentNode;
            if (!progressContainer.classList.contains('rainbow-progress-container')) {
                progressContainer.classList.add('rainbow-progress-container');
            }
            
            // Add flames element if it doesn't exist
            if (!progressContainer.querySelector('.flames')) {
                const flames = document.createElement('div');
                flames.className = 'flames';
                progressContainer.appendChild(flames);
            }
            
            // Add pulse animation
            progressBar.classList.add('pulse');
            setTimeout(() => {
                progressBar.classList.remove('pulse');
            }, 500);
        } else {
            progressBar.classList.remove('rainbow-progress');
            progressBar.classList.remove('ultimate');
            
            // Remove flames if progress is less than 100%
            const progressContainer = progressBar.parentNode;
            const flames = progressContainer.querySelector('.flames');
            if (flames) {
                progressContainer.removeChild(flames);
            }
            
            if (progressContainer.classList.contains('rainbow-progress-container')) {
                progressContainer.classList.remove('rainbow-progress-container');
            }
        }
    }

    getGoalsForDate(date) {
        return this.goals.filter(goal => this.isSameDay(new Date(goal.date), date));
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getCompletionRate(startDate, endDate) {
        const filteredGoals = this.goals.filter(goal => {
            const goalDate = new Date(goal.date);
            return goalDate >= startDate && goalDate <= endDate;
        });
        
        const totalGoals = filteredGoals.length;
        const completedGoals = filteredGoals.filter(goal => goal.completed).length;
        
        return {
            total: totalGoals,
            completed: completedGoals,
            percentage: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
        };
    }

    saveToLocalStorage() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
}

// Lessons Module
class Lessons {
    constructor() {
        this.lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        this.currentEditingId = null;
        this.currentEditingSubjectId = null;
    }
    
    init() {
        // Initialize lesson tabs
        const tabButtons = document.querySelectorAll('.lesson-tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                tabButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked tab
                button.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.lesson-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected tab content
                const tabId = button.dataset.tab;
                document.getElementById(tabId).classList.add('active');
                
                // If the subject management tab is selected, refresh subjects list
                if (tabId === 'subject-management') {
                    this.displaySubjects();
                } else if (tabId === 'lessons-by-subject') {
                    this.displaySubjectSelector();
                }
            });
        });
        
        // Event listener for save lesson
        document.getElementById('save-lesson').addEventListener('click', () => this.saveLesson());
        
        // Event listener for save subject
        document.getElementById('save-subject').addEventListener('click', () => this.saveSubject());
        
        // Initial displays
        this.populateSubjectDropdown();
        this.displayLessons();
        this.displaySubjects();
    }
    
    saveLesson() {
        const titleEl = document.getElementById('lesson-title');
        const contentEl = document.getElementById('lesson-content');
        const subjectEl = document.getElementById('lesson-subject');
        
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        const subjectId = subjectEl.value;
        
        if (!title || !content) {
            alert('Please enter both a title and content for your lesson.');
            return;
        }
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        const lesson = {
            id: this.currentEditingId || Date.now().toString(),
            title: title,
            content: content,
            date: selectedDate.toISOString(),
            subjectId: subjectId || null
        };
        
        // If editing, remove the old lesson
        if (this.currentEditingId) {
            const index = this.lessons.findIndex(l => l.id === this.currentEditingId);
            if (index !== -1) {
                this.lessons.splice(index, 1);
            }
            this.currentEditingId = null;
        }
        
        this.lessons.push(lesson);
        this.saveToLocalStorage();
        
        titleEl.value = '';
        contentEl.value = '';
        subjectEl.value = '';
        
        this.displayLessons();
        
        // Update day content and calendar
        const app = window.app;
        if (app) {
            app.updateDayContent(app.selectedDate);
            if (app.calendar) {
                app.calendar.updateCalendar();
            }
        }
    }
    
    saveSubject() {
        const nameEl = document.getElementById('subject-name');
        const descriptionEl = document.getElementById('subject-description');
        
        const name = nameEl.value.trim();
        const description = descriptionEl.value.trim();
        
        if (!name) {
            alert('Please enter a subject name.');
            return;
        }
        
        const subject = {
            id: this.currentEditingSubjectId || Date.now().toString(),
            name: name,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        // If editing, remove the old subject
        if (this.currentEditingSubjectId) {
            const index = this.subjects.findIndex(s => s.id === this.currentEditingSubjectId);
            if (index !== -1) {
                this.subjects.splice(index, 1);
            }
            this.currentEditingSubjectId = null;
        }
        
        this.subjects.push(subject);
        this.saveToLocalStorage();
        
        nameEl.value = '';
        descriptionEl.value = '';
        
        this.displaySubjects();
        this.populateSubjectDropdown();
    }
    
    displayLessons() {
        const lessonsList = document.getElementById('lessons-list');
        if (!lessonsList) return;
        
        lessonsList.innerHTML = '';
        
        // Sort lessons by date (newest first)
        const sortedLessons = [...this.lessons].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        if (sortedLessons.length === 0) {
            lessonsList.innerHTML = '<p>No lessons yet. Add one above!</p>';
            return;
        }
        
        // Display all lessons
        sortedLessons.forEach(lesson => {
            const lessonItem = document.createElement('div');
            lessonItem.className = 'lesson-item fade-in';
            
            const date = new Date(lesson.date);
            const dateStr = date.toLocaleDateString();
            
            // Get subject name if available
            let subjectHtml = '';
            if (lesson.subjectId) {
                const subject = this.subjects.find(s => s.id === lesson.subjectId);
                if (subject) {
                    subjectHtml = `<div class="lesson-subject">${subject.name}</div>`;
                }
            }
            
            lessonItem.innerHTML = `
                <div class="lesson-title">${lesson.title}</div>
                ${subjectHtml}
                <div class="lesson-date">${dateStr}</div>
                <div class="lesson-content">${this.truncateContent(lesson.content)}</div>
                <div class="lesson-actions">
                    <button class="edit-lesson" data-id="${lesson.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-lesson" data-id="${lesson.id}"><i class="fas fa-trash"></i></button>
                    <button class="add-to-sr" data-id="${lesson.id}"><i class="fas fa-sync-alt"></i></button>
                </div>
            `;
            
            lessonsList.appendChild(lessonItem);
        });
        
        // Add event listeners
        document.querySelectorAll('#lessons-list .edit-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                this.editLesson(id);
            });
        });
        
        document.querySelectorAll('#lessons-list .delete-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.deleteLesson(id);
            });
        });
        
        document.querySelectorAll('#lessons-list .add-to-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.add-to-sr').dataset.id;
                const lesson = this.getLessonById(id);
                if (lesson && window.app && window.app.spacedRepetition) {
                    window.app.spacedRepetition.addLesson(lesson);
                    
                    // Show feedback
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.style.color = 'green';
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        button.style.color = '';
                    }, 1500);
                }
            });
        });
    }
    
    displaySubjects() {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        subjectsList.innerHTML = '';
        
        if (this.subjects.length === 0) {
            subjectsList.innerHTML = '<p>No subjects yet. Add one above!</p>';
            return;
        }
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedSubjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-item';
            
            // Count lessons in this subject
            const lessonCount = this.lessons.filter(lesson => lesson.subjectId === subject.id).length;
            
            subjectItem.innerHTML = `
                <div class="subject-item-title">${subject.name}</div>
                ${subject.description ? `<div class="subject-item-description">${subject.description}</div>` : ''}
                <div class="subject-item-count">${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}</div>
                <div class="subject-item-actions">
                    <button class="edit-subject" data-id="${subject.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-subject" data-id="${subject.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            subjectsList.appendChild(subjectItem);
        });
        
        // Add event listeners
        document.querySelectorAll('#subjects-list .edit-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-subject').dataset.id;
                this.editSubject(id);
            });
        });
        
        document.querySelectorAll('#subjects-list .delete-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-subject').dataset.id;
                this.deleteSubject(id);
            });
        });
    }
    
    displaySubjectSelector() {
        const selector = document.getElementById('subject-selector');
        if (!selector) return;
        
        selector.innerHTML = '';
        
        if (this.subjects.length === 0) {
            selector.innerHTML = '<p>No subjects available. Please create subjects first.</p>';
            return;
        }
        
        // Add "All Lessons" option
        const allCard = document.createElement('div');
        allCard.className = 'subject-card active';
        allCard.dataset.id = 'all';
        allCard.textContent = 'All Lessons';
        allCard.addEventListener('click', () => this.displayLessonsBySubject('all'));
        selector.appendChild(allCard);
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedSubjects.forEach(subject => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.dataset.id = subject.id;
            subjectCard.textContent = subject.name;
            
            subjectCard.addEventListener('click', () => {
                // Remove active class from all cards
                document.querySelectorAll('.subject-card').forEach(card => {
                    card.classList.remove('active');
                });
                
                // Add active class to clicked card
                subjectCard.classList.add('active');
                
                // Display lessons for this subject
                this.displayLessonsBySubject(subject.id);
            });
            
            selector.appendChild(subjectCard);
        });
        
        // Display all lessons initially
        this.displayLessonsBySubject('all');
    }
    
    displayLessonsBySubject(subjectId) {
        const container = document.getElementById('subject-lessons');
        if (!container) return;
        
        container.innerHTML = '';
        
        let lessons;
        let headerText;
        
        if (subjectId === 'all') {
            // Show all lessons
            lessons = [...this.lessons];
            headerText = 'All Lessons';
        } else {
            // Show lessons for the selected subject
            lessons = this.lessons.filter(lesson => lesson.subjectId === subjectId);
            const subject = this.subjects.find(s => s.id === subjectId);
            headerText = subject ? subject.name : 'Unknown Subject';
        }
        
        // Sort lessons by date (newest first)
        lessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create header
        const header = document.createElement('div');
        header.className = 'subject-lessons-header';
        header.innerHTML = `
            <div class="subject-lessons-title">${headerText}</div>
            <div class="subject-lessons-count">${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}</div>
        `;
        container.appendChild(header);
        
        if (lessons.length === 0) {
            container.innerHTML += '<p>No lessons in this subject yet.</p>';
            return;
        }
        
        // Create lessons list
        const lessonsList = document.createElement('div');
        lessonsList.className = 'lessons-list';
        
        lessons.forEach(lesson => {
            const lessonItem = document.createElement('div');
            lessonItem.className = 'lesson-item';
            
            const date = new Date(lesson.date);
            const dateStr = date.toLocaleDateString();
            
            lessonItem.innerHTML = `
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-date">${dateStr}</div>
                <div class="lesson-content">${this.truncateContent(lesson.content)}</div>
                <div class="lesson-actions">
                    <button class="view-lesson" data-id="${lesson.id}"><i class="fas fa-eye"></i></button>
                    <button class="edit-lesson" data-id="${lesson.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-lesson" data-id="${lesson.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            lessonsList.appendChild(lessonItem);
        });
        
        container.appendChild(lessonsList);
        
        // Add event listeners
        document.querySelectorAll('#subject-lessons .view-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.view-lesson').dataset.id;
                this.viewLesson(id);
            });
        });
        
        document.querySelectorAll('#subject-lessons .edit-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                // Switch to edit tab
                document.querySelector('.lesson-tab-btn[data-tab="lesson-input"]').click();
                this.editLesson(id);
            });
        });
        
        document.querySelectorAll('#subject-lessons .delete-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.deleteLesson(id);
                // Refresh the current view
                this.displayLessonsBySubject(subjectId);
            });
        });
    }
    
    viewLesson(id) {
        const lesson = this.getLessonById(id);
        
        if (!lesson) return;
        
        // Create modal for viewing the lesson
        const modal = document.createElement('div');
        modal.className = 'lesson-modal';
        
        // Get subject name if available
        let subjectHtml = '';
        if (lesson.subjectId) {
            const subject = this.subjects.find(s => s.id === lesson.subjectId);
            if (subject) {
                subjectHtml = `<div class="lesson-modal-subject">${subject.name}</div>`;
            }
        }
        
        modal.innerHTML = `
            <div class="lesson-modal-content">
                <div class="lesson-modal-header">
                    <h2>${lesson.title}</h2>
                    ${subjectHtml}
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="lesson-modal-body">
                    <p class="lesson-modal-date">${new Date(lesson.date).toLocaleDateString()}</p>
                    <div class="lesson-modal-text">${lesson.content}</div>
                </div>
                <div class="lesson-modal-footer">
                    <button class="btn secondary-btn edit-btn" data-id="${lesson.id}">Edit</button>
                    <button class="btn secondary-btn close-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal, .close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.edit-btn').addEventListener('click', () => {
            modal.remove();
            // Switch to edit tab
            document.querySelector('.lesson-tab-btn[data-tab="lesson-input"]').click();
            this.editLesson(lesson.id);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    populateSubjectDropdown() {
        const dropdown = document.getElementById('lesson-subject');
        if (!dropdown) return;
        
        // Clear all options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        // Add options for each subject
        sortedSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            dropdown.appendChild(option);
        });
    }
    
    truncateContent(content) {
        const maxLength = 100;
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }
    
    editLesson(id) {
        const lesson = this.getLessonById(id);
        
        if (!lesson) return;
        
        const titleEl = document.getElementById('lesson-title');
        const contentEl = document.getElementById('lesson-content');
        const subjectEl = document.getElementById('lesson-subject');
        
        titleEl.value = lesson.title;
        contentEl.value = lesson.content;
        subjectEl.value = lesson.subjectId || '';
        
        // Save the current editing ID
        this.currentEditingId = lesson.id;
        
        // Focus the title field and scroll into view
        titleEl.scrollIntoView({ behavior: 'smooth' });
        titleEl.focus();
    }
    
    editSubject(id) {
        const subject = this.subjects.find(s => s.id === id);
        
        if (!subject) return;
        
        const nameEl = document.getElementById('subject-name');
        const descriptionEl = document.getElementById('subject-description');
        
        nameEl.value = subject.name;
        descriptionEl.value = subject.description || '';
        
        // Save the current editing ID
        this.currentEditingSubjectId = subject.id;
        
        // Focus the name field and scroll into view
        nameEl.scrollIntoView({ behavior: 'smooth' });
        nameEl.focus();
    }
    
    deleteLesson(id) {
        if (!confirm('Are you sure you want to delete this lesson? This will also remove any related spaced repetition reminders.')) {
            return;
        }
        
        const index = this.lessons.findIndex(lesson => lesson.id === id);
        
        if (index !== -1) {
            this.lessons.splice(index, 1);
            this.saveToLocalStorage();
            this.displayLessons();
            
            // Update subject lessons view if open
            if (document.getElementById('lessons-by-subject').classList.contains('active')) {
                const activeSubject = document.querySelector('.subject-card.active');
                if (activeSubject) {
                    this.displayLessonsBySubject(activeSubject.dataset.id);
                }
            }
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
                
                // Remove from spaced repetition if exists
                if (app.spacedRepetition) {
                    app.spacedRepetition.deleteRemindersByLessonId(id);
                }
            }
        }
    }
    
    deleteSubject(id) {
        // Count lessons in this subject
        const lessonCount = this.lessons.filter(lesson => lesson.subjectId === id).length;
        
        let confirmMessage = 'Are you sure you want to delete this subject?';
        if (lessonCount > 0) {
            confirmMessage += ` There are ${lessonCount} lesson(s) associated with this subject. The lessons will remain but will no longer be associated with any subject.`;
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        const index = this.subjects.findIndex(subject => subject.id === id);
        
        if (index !== -1) {
            this.subjects.splice(index, 1);
            
            // Update lessons to remove this subject
            this.lessons.forEach(lesson => {
                if (lesson.subjectId === id) {
                    lesson.subjectId = null;
                }
            });
            
            this.saveToLocalStorage();
            this.displaySubjects();
            this.populateSubjectDropdown();
            
            // Update lessons display
            this.displayLessons();
            
            // Refresh the subject selector if active
            if (document.getElementById('lessons-by-subject').classList.contains('active')) {
                this.displaySubjectSelector();
            }
        }
    }
    
    getLessonById(id) {
        return this.lessons.find(lesson => lesson.id === id);
    }
    
    getLessonsForDate(date) {
        return this.lessons.filter(lesson => this.isSameDay(new Date(lesson.date), date));
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('lessons', JSON.stringify(this.lessons));
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
    }
}

// Spaced Repetition Module
class SpacedRepetition {
    constructor() {
        this.reminders = JSON.parse(localStorage.getItem('sr-reminders')) || [];
        this.intervals = [1, 7, 21, 50, 120]; // Days for each review
    }

    init() {
        this.checkOverdueReminders();
        this.updateRemindersDisplay();
    }

    addLesson(lesson) {
        // Create first reminder for the next day
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const reminder = {
            id: Date.now().toString(),
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            originalDate: today.toISOString(),
            reviewDate: tomorrow.toISOString(),
            status: 'normal', // normal, warning, overdue
            stage: 0 // Current stage in the spaced repetition sequence
        };
        
        this.reminders.push(reminder);
        this.saveToLocalStorage();
        this.updateRemindersDisplay();
        
        // Update calendar
        const app = window.app;
        if (app && app.calendar) {
            app.calendar.updateCalendar();
        }
    }

    completeReminder(id) {
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            const reminder = this.reminders[index];
            // Move to next stage
            reminder.stage++;
            
            // If all stages are completed, remove the reminder
            if (reminder.stage >= this.intervals.length) {
                this.reminders.splice(index, 1);
            } else {
                // Schedule next review
                const nextReviewDate = new Date();
                nextReviewDate.setDate(nextReviewDate.getDate() + this.intervals[reminder.stage]);
                reminder.reviewDate = nextReviewDate.toISOString();
                reminder.status = 'normal';
            }
            
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    rescheduleReminder(id) {
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            // Reschedule to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.reminders[index].reviewDate = tomorrow.toISOString();
            this.reminders[index].status = 'normal';
            
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    removeRemindersByLessonId(lessonId) {
        // Filter out all reminders related to the deleted lesson
        this.reminders = this.reminders.filter(reminder => reminder.lessonId !== lessonId);
        this.saveToLocalStorage();
    }

    deleteReminder(id) {
        // Find and remove the reminder with the given id
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            this.reminders.splice(index, 1);
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    checkOverdueReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.reminders.forEach(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            
            const timeDiff = today - reviewDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 0) {
                if (daysDiff === 1) {
                    reminder.status = 'warning';
                } else if (daysDiff >= 2) {
                    reminder.status = 'overdue';
                    
                    // If overdue by 2 or more days, reschedule for the next stage
                    const nextReviewDate = new Date();
                    nextReviewDate.setDate(nextReviewDate.getDate() + this.intervals[reminder.stage]);
                    reminder.reviewDate = nextReviewDate.toISOString();
                }
            } else {
                reminder.status = 'normal';
            }
        });
        
        this.saveToLocalStorage();
    }

    updateRemindersDisplay() {
        const todayListEl = document.getElementById('sr-today-list');
        const upcomingListEl = document.getElementById('sr-upcoming-list');
        const todayCountEl = document.getElementById('sr-today-count');
        const upcomingCountEl = document.getElementById('sr-upcoming-count');
        
        todayListEl.innerHTML = '';
        upcomingListEl.innerHTML = '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter reminders for today and upcoming
        const todayReminders = this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return this.isSameDay(reviewDate, today) || reviewDate < today;
        });
        
        const upcomingReminders = this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate > today;
        }).sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
        
        // Update counts
        todayCountEl.textContent = todayReminders.length;
        upcomingCountEl.textContent = upcomingReminders.length;
        
        // Display reminders
        if (todayReminders.length === 0) {
            todayListEl.innerHTML = '<p>No reviews scheduled for today.</p>';
        } else {
            todayReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = `sr-item ${reminder.status}`;
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Original: ${new Date(reminder.originalDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="complete-sr" data-id="${reminder.id}"><i class="fas fa-check"></i></button>
                        <button class="reschedule-sr" data-id="${reminder.id}"><i class="fas fa-calendar-alt"></i></button>
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                todayListEl.appendChild(reminderDiv);
            });
        }
        
        if (upcomingReminders.length === 0) {
            upcomingListEl.innerHTML = '<p>No upcoming reviews scheduled.</p>';
        } else {
            // Show only first 5 upcoming reminders
            const displayReminders = upcomingReminders.slice(0, 5);
            
            displayReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = 'sr-item';
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Review: ${new Date(reminder.reviewDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                upcomingListEl.appendChild(reminderDiv);
            });
            
            if (upcomingReminders.length > 5) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'sr-more';
                moreDiv.textContent = `And ${upcomingReminders.length - 5} more...`;
                upcomingListEl.appendChild(moreDiv);
            }
        }
        
        // Add event listeners
        document.querySelectorAll('#sr-today-list .complete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.complete-sr').dataset.id;
                this.completeReminder(id);
            });
        });
        
        document.querySelectorAll('#sr-today-list .reschedule-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.reschedule-sr').dataset.id;
                this.rescheduleReminder(id);
            });
        });
        
        // Add event listener for delete buttons (both in today and upcoming lists)
        document.querySelectorAll('.delete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm("Are you sure you want to delete this reminder?")) {
                    const id = e.target.closest('.delete-sr').dataset.id;
                    this.deleteReminder(id);
                }
            });
        });
    }

    getRemindersForDate(date) {
        return this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            return this.isSameDay(reviewDate, date);
        });
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getReviewsStats(startDate, endDate) {
        const completedReviews = this.getCompletedReviewCount(startDate, endDate);
        const pendingReviews = this.getPendingReviewCount();
        const overdueReviews = this.getOverdueReviewCount();
        
        return {
            completed: completedReviews,
            pending: pendingReviews,
            overdue: overdueReviews
        };
    }

    getCompletedReviewCount(startDate, endDate) {
        // Estimation based on stage changes
        let completedCount = 0;
        
        this.reminders.forEach(reminder => {
            // Each stage change represents a completed review
            completedCount += reminder.stage;
        });
        
        return completedCount;
    }

    getPendingReviewCount() {
        return this.reminders.length;
    }

    getOverdueReviewCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate < today;
        }).length;
    }

    saveToLocalStorage() {
        localStorage.setItem('sr-reminders', JSON.stringify(this.reminders));
    }
}

// Calendar Module
class Calendar {
    constructor(app) {
        this.app = app;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    init() {
        document.getElementById('prev-month').addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());
        
        this.updateCalendar();
    }

    updateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarHeader = document.getElementById('calendar-header');
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Set calendar header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        calendarHeader.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Get first day of month and total days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Create calendar days
        let dayCount = 1;
        const today = new Date();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add cells for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            const currentDate = new Date(this.currentYear, this.currentMonth, i);
            
            // Determine day class
            let dayClass = 'calendar-day';
            if (this.isSameDay(currentDate, today)) {
                dayClass += ' current-day';
            } else if (currentDate < today) {
                dayClass += ' past-day';
            } else {
                dayClass += ' future-day';
            }
            
            // Check if this day is selected
            if (this.isSameDay(currentDate, this.app.selectedDate)) {
                dayClass += ' selected';
            }
            
            dayCell.className = dayClass;
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            dayCell.appendChild(dayNumber);
            
            // Add indicators
            const indicators = document.createElement('div');
            indicators.className = 'day-indicators';
            
            // Check if this day has journal entries
            if (this.app.journal.getEntriesForDate(currentDate).length > 0) {
                const journalIndicator = document.createElement('div');
                journalIndicator.className = 'day-indicator journal-indicator';
                indicators.appendChild(journalIndicator);
            }
            
            // Check if this day has goals
            if (this.app.goals.getGoalsForDate(currentDate).length > 0) {
                const goalIndicator = document.createElement('div');
                goalIndicator.className = 'day-indicator goal-indicator';
                indicators.appendChild(goalIndicator);
            }
            
            // Check if this day has lessons
            if (this.app.lessons.getLessonsForDate(currentDate).length > 0) {
                const lessonIndicator = document.createElement('div');
                lessonIndicator.className = 'day-indicator lesson-indicator';
                indicators.appendChild(lessonIndicator);
            }
            
            // Check if this day has SR reminders
            const srReminders = this.app.spacedRepetition.getRemindersForDate(currentDate);
            if (srReminders.length > 0) {
                // Check if any reminders are overdue
                const hasOverdue = srReminders.some(reminder => reminder.status === 'overdue');
                const hasWarning = srReminders.some(reminder => reminder.status === 'warning');
                
                const srIndicator = document.createElement('div');
                
                if (hasOverdue) {
                    srIndicator.className = 'day-indicator sr-overdue-indicator';
                } else if (hasWarning) {
                    srIndicator.className = 'day-indicator sr-indicator';
                } else {
                    srIndicator.className = 'day-indicator sr-indicator';
                }
                
                indicators.appendChild(srIndicator);
            }
            
            // Check if this day has scheduled tasks
            if (this.app.scheduledTasks) {
                const dayTasks = this.app.scheduledTasks.getTasksForDate(currentDate);
                if (dayTasks.length > 0) {
                    const taskIndicator = document.createElement('div');
                    taskIndicator.className = 'day-indicator task-indicator';
                    indicators.appendChild(taskIndicator);
                }
            }
            
            dayCell.appendChild(indicators);
            
            // Add click event
            dayCell.addEventListener('click', () => {
                this.app.selectDate(currentDate);
            });
            
            calendarGrid.appendChild(dayCell);
            dayCount++;
        }
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.updateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateCalendar();
    }

    highlightSelectedDay() {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selected class to the selected day
        const selectedDate = this.app.selectedDate;
        
        // Only highlight if the selected date is in the current month/year view
        if (selectedDate.getMonth() === this.currentMonth && selectedDate.getFullYear() === this.currentYear) {
            const selectedDay = selectedDate.getDate();
            
            // Get all non-empty day cells
            const dayCells = document.querySelectorAll('.calendar-day:not(.empty)');
            
            // Find the cell that corresponds to the selected day and add the 'selected' class
            dayCells.forEach(cell => {
                const dayNumber = parseInt(cell.querySelector('.day-number').textContent);
                if (dayNumber === selectedDay) {
                    cell.classList.add('selected');
                }
            });
        }
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// Summary Module
class Summary {
    constructor(app) {
        this.app = app;
    }

    init() {
        // Generate initial summaries
        this.generateWeeklySummary();
        this.generateMonthlySummary();
        
        // Setup weekly summary generation on Sunday or when the week changes
        this.setupSummaryGeneration();
    }

    setupSummaryGeneration() {
        // Get current day of week (0 = Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Store the current week and month for comparison
        this.currentWeek = this.getWeekNumber(today);
        this.currentMonth = today.getMonth();
        
        // Check daily if we need to generate new summaries
        setInterval(() => {
            const now = new Date();
            const nowWeek = this.getWeekNumber(now);
            const nowMonth = now.getMonth();
            
            // If week changed, generate weekly summary
            if (nowWeek !== this.currentWeek) {
                this.generateWeeklySummary();
                this.currentWeek = nowWeek;
            }
            
            // If month changed, generate monthly summary
            if (nowMonth !== this.currentMonth) {
                this.generateMonthlySummary();
                this.currentMonth = nowMonth;
            }
        }, 1000 * 60 * 60 * 6); // Check every 6 hours
    }

    generateWeeklySummary() {
        const summaryEl = document.getElementById('weekly-summary');
        
        // Get date range for this week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        
        const weekRange = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
        
        // Get spaced repetition stats
        const srStats = this.app.spacedRepetition.getReviewsStats(startOfWeek, endOfWeek);
        
        // Get goals stats
        const goalStats = this.app.goals.getCompletionRate(startOfWeek, endOfWeek);
        
        // Build summary HTML
        summaryEl.innerHTML = `
            <div class="summary-header">Week of ${weekRange}</div>
            
            <div class="summary-card">
                <h3>Spaced Repetition</h3>
                <div class="summary-stat">
                    <div class="summary-label">Reviews Completed</div>
                    <div class="summary-value">${srStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Pending Reviews</div>
                    <div class="summary-value">${srStats.pending}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Overdue Reviews</div>
                    <div class="summary-value">${srStats.overdue}</div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Goals Progress</h3>
                <div class="summary-stat">
                    <div class="summary-label">Total Goals</div>
                    <div class="summary-value">${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completed Goals</div>
                    <div class="summary-value">${goalStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completion Rate</div>
                    <div class="summary-value">${goalStats.percentage}%</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${goalStats.percentage}%"></div>
                </div>
            </div>
        `;
    }

    generateMonthlySummary() {
        const summaryEl = document.getElementById('monthly-summary');
        
        // Get date range for this month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[today.getMonth()];
        
        // Get spaced repetition stats
        const srStats = this.app.spacedRepetition.getReviewsStats(startOfMonth, endOfMonth);
        
        // Get goals stats
        const goalStats = this.app.goals.getCompletionRate(startOfMonth, endOfMonth);
        
        // Count journal entries this month
        const journalEntries = this.app.journal.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfMonth && entryDate <= endOfMonth;
        }).length;
        
        // Count lessons created this month
        const lessonsCreated = this.app.lessons.lessons.filter(lesson => {
            const lessonDate = new Date(lesson.date);
            return lessonDate >= startOfMonth && lessonDate <= endOfMonth;
        }).length;
        
        // Build summary HTML
        summaryEl.innerHTML = `
            <div class="summary-header">${monthName} ${today.getFullYear()}</div>
            
            <div class="summary-card">
                <h3>Month Overview</h3>
                <div class="summary-stat">
                    <div class="summary-label">Journal Entries</div>
                    <div class="summary-value">${journalEntries}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Goals Created</div>
                    <div class="summary-value">${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Lessons Created</div>
                    <div class="summary-value">${lessonsCreated}</div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Goals Progress</h3>
                <div class="summary-stat">
                    <div class="summary-label">Completed Goals</div>
                    <div class="summary-value">${goalStats.completed} / ${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completion Rate</div>
                    <div class="summary-value">${goalStats.percentage}%</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${goalStats.percentage}%"></div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Spaced Repetition</h3>
                <div class="summary-stat">
                    <div class="summary-label">Reviews Completed</div>
                    <div class="summary-value">${srStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Current Active Reviews</div>
                    <div class="summary-value">${srStats.pending}</div>
                </div>
            </div>
        `;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
}

// Scheduled Tasks Module
class ScheduledTasks {
    constructor(app) {
        this.app = app;
        this.tasks = JSON.parse(localStorage.getItem('scheduled-tasks') || '[]');
    }

    init() {
        // Set up event listeners
        const saveTaskBtn = document.getElementById('save-task-btn');
        if (saveTaskBtn) {
            saveTaskBtn.addEventListener('click', () => this.saveTask());
        }

        // Update task view for current date
        this.displayTasks(this.app.selectedDate);

        // Initialize time pickers with current hour/minute
        this.initTimePickers();
    }

    initTimePickers() {
        // Initialize start time pickers
        const startHourSelect = document.getElementById('task-start-hour');
        const startMinuteSelect = document.getElementById('task-start-minute');
        const startAmPmSelect = document.getElementById('task-start-ampm');

        // Initialize end time pickers
        const endHourSelect = document.getElementById('task-end-hour');
        const endMinuteSelect = document.getElementById('task-end-minute');
        const endAmPmSelect = document.getElementById('task-end-ampm');

        if (startHourSelect && endHourSelect) {
            // Populate hours (1-12)
            for (let i = 1; i <= 12; i++) {
                const hourOption = document.createElement('option');
                hourOption.value = i;
                hourOption.textContent = i;
                startHourSelect.appendChild(hourOption.cloneNode(true));
                endHourSelect.appendChild(hourOption);
            }

            // Populate minutes (00-59)
            for (let i = 0; i < 60; i++) {
                const minuteOption = document.createElement('option');
                minuteOption.value = i;
                minuteOption.textContent = i < 10 ? `0${i}` : i;
                startMinuteSelect.appendChild(minuteOption.cloneNode(true));
                endMinuteSelect.appendChild(minuteOption);
            }

            // Set default values to current time + 1 hour for end time
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Start time (current time)
            const startHour12 = currentHour % 12 || 12;
            const startAmPm = currentHour >= 12 ? 'PM' : 'AM';
            
            startHourSelect.value = startHour12;
            startMinuteSelect.value = currentMinute;
            startAmPmSelect.value = startAmPm;
            
            // End time (current time + 1 hour)
            const endDate = new Date(now);
            endDate.setHours(currentHour + 1);
            const endHour = endDate.getHours();
            const endHour12 = endHour % 12 || 12;
            const endAmPm = endHour >= 12 ? 'PM' : 'AM';
            
            endHourSelect.value = endHour12;
            endMinuteSelect.value = currentMinute;
            endAmPmSelect.value = endAmPm;
        }
    }

    saveTask() {
        const taskName = document.getElementById('task-name').value.trim();
        const taskDescription = document.getElementById('task-description').value.trim();
        const taskLink = document.getElementById('task-link').value.trim();
        
        // Get start time
        const startHour = parseInt(document.getElementById('task-start-hour').value);
        const startMinute = parseInt(document.getElementById('task-start-minute').value);
        const startAmPm = document.getElementById('task-start-ampm').value;
        
        // Get end time
        const endHour = parseInt(document.getElementById('task-end-hour').value);
        const endMinute = parseInt(document.getElementById('task-end-minute').value);
        const endAmPm = document.getElementById('task-end-ampm').value;
        
        if (!taskName) {
            alert('Task name is required');
            return;
        }
        
        // Convert to 24-hour format
        const startHour24 = startAmPm === 'PM' && startHour !== 12 ? startHour + 12 : 
                           (startAmPm === 'AM' && startHour === 12 ? 0 : startHour);
        
        const endHour24 = endAmPm === 'PM' && endHour !== 12 ? endHour + 12 : 
                         (endAmPm === 'AM' && endHour === 12 ? 0 : endHour);
        
        // Create date objects for start and end
        const selectedDate = this.app.selectedDate;
        const startDate = new Date(selectedDate);
        startDate.setHours(startHour24, startMinute, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(endHour24, endMinute, 0, 0);
        
        // Validate end time is after start time
        if (endDate <= startDate) {
            alert('End time must be after start time');
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            description: taskDescription,
            link: taskLink,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            date: selectedDate.toISOString().split('T')[0]
        };
        
        this.tasks.push(newTask);
        this.saveToLocalStorage();
        this.displayTasks(selectedDate);
        
        // Clear form
        document.getElementById('task-name').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-link').value = '';
        
        // Update day content and calendar
        if (this.app.updateDayContent) {
            this.app.updateDayContent(selectedDate);
        }
        if (this.app.calendar && this.app.calendar.renderCalendar) {
            this.app.calendar.renderCalendar();
        }
    }
    
    getTasksForDate(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this.tasks.filter(task => {
            const taskDate = new Date(task.startTime).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
    }
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToLocalStorage();
            this.displayTasks(this.app.selectedDate);
            
            // Update day content and calendar
            if (this.app.updateDayContent) {
                this.app.updateDayContent(this.app.selectedDate);
            }
            if (this.app.calendar && this.app.calendar.renderCalendar) {
                this.app.calendar.renderCalendar();
            }
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('scheduled-tasks', JSON.stringify(this.tasks));
    }
    
    displayTasks(date) {
        const tasksContainer = document.getElementById('schedule-view');
        if (!tasksContainer) return;
        
        // Clear container
        tasksContainer.innerHTML = '';
        
        // Get tasks for selected date
        const tasksForDate = this.getTasksForDate(date);
        
        if (tasksForDate.length === 0) {
            tasksContainer.innerHTML = '<p class="no-tasks">No scheduled tasks for this day. Add one above!</p>';
            return;
        }
        
        // Sort tasks by start time
        tasksForDate.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        // Create timeline view
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'schedule-timeline';
        
        // Add hour markers (6am to 10pm)
        for (let hour = 6; hour <= 22; hour++) {
            const hourMarker = document.createElement('div');
            hourMarker.className = 'hour-marker';
            hourMarker.dataset.hour = hour;
            
            const hourLabel = document.createElement('div');
            hourLabel.className = 'hour-label';
            hourLabel.textContent = this.formatHour(hour);
            
            hourMarker.appendChild(hourLabel);
            timelineContainer.appendChild(hourMarker);
        }
        
        // Add tasks to timeline
        tasksForDate.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.dataset.id = task.id;
            
            const startTime = new Date(task.startTime);
            const endTime = new Date(task.endTime);
            
            // Calculate position and height
            const startHour = startTime.getHours() + startTime.getMinutes() / 60;
            const endHour = endTime.getHours() + endTime.getMinutes() / 60;
            const duration = endHour - startHour;
            
            // Position relative to 6am (timeline start)
            const topPosition = Math.max(0, (startHour - 6) * 60); // 60px per hour
            const height = duration * 60; // 60px per hour
            
            taskEl.style.top = `${topPosition}px`;
            taskEl.style.height = `${height}px`;
            
            // Format times
            const startTimeStr = this.formatTime(startTime);
            const endTimeStr = this.formatTime(endTime);
            
            taskEl.innerHTML = `
                <div class="task-content">
                    <div class="task-time">${startTimeStr} - ${endTimeStr}</div>
                    <div class="task-name">${task.name}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    ${task.link ? `<a href="${task.link}" target="_blank" class="task-link">Open Link</a>` : ''}
                    <button class="task-delete" data-id="${task.id}"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            timelineContainer.appendChild(taskEl);
        });
        
        tasksContainer.appendChild(timelineContainer);
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = e.currentTarget.dataset.id;
                this.deleteTask(id);
            });
        });
    }
    
    formatTime(date) {
        if (typeof date === 'string') date = new Date(date);
        
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        
        return `${hours}:${minutesStr} ${ampm}`;
    }
    
    formatHour(hour24) {
        const hour12 = hour24 % 12 || 12;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12} ${ampm}`;
    }
}

// Timer Module
class TimerModule {
    constructor(app) {
        this.app = app;
        this.timers = {
            realTimeClock: null,
            countdown: {
                timer: null,
                isRunning: false,
                isPaused: false,
                initialTime: 0,
                remainingTime: 0,
                endTime: null
            },
            progress: {
                timer: null,
                isRunning: false,
                isPaused: false,
                duration: 0,
                elapsed: 0,
                startTime: null
            },
            cycle: {
                timer: null,
                isRunning: false,
                isPaused: false,
                currentPhase: 'work',
                workDuration: 25 * 60, // 25 minutes
                breakDuration: 5 * 60, // 5 minutes
                longBreakDuration: 15 * 60, // 15 minutes
                currentTime: 0,
                cycleCount: 0,
                totalCycles: 4
            }
        };

        // Bind methods
        this.startClock = this.startClock.bind(this);
        this.updateClock = this.updateClock.bind(this);
        this.startCountdown = this.startCountdown.bind(this);
        this.pauseCountdown = this.pauseCountdown.bind(this);
        this.resetCountdown = this.resetCountdown.bind(this);
        this.updateCountdown = this.updateCountdown.bind(this);
        this.startProgressTimer = this.startProgressTimer.bind(this);
        this.pauseProgressTimer = this.pauseProgressTimer.bind(this);
        this.resetProgressTimer = this.resetProgressTimer.bind(this);
        this.updateProgressTimer = this.updateProgressTimer.bind(this);
        this.startCycleTimer = this.startCycleTimer.bind(this);
        this.pauseCycleTimer = this.pauseCycleTimer.bind(this);
        this.resetCycleTimer = this.resetCycleTimer.bind(this);
        this.updateCycleTimer = this.updateCycleTimer.bind(this);
    }

    init() {
        // Initialize analog clock
        this.startClock();
        
        // Set event listeners for timers
        document.getElementById('start-countdown').addEventListener('click', this.startCountdown);
        document.getElementById('pause-countdown').addEventListener('click', this.pauseCountdown);
        document.getElementById('reset-countdown').addEventListener('click', this.resetCountdown);
        
        document.getElementById('start-progress').addEventListener('click', this.startProgressTimer);
        document.getElementById('pause-progress').addEventListener('click', this.pauseProgressTimer);
        document.getElementById('reset-progress').addEventListener('click', this.resetProgressTimer);
        
        document.getElementById('start-cycle').addEventListener('click', this.startCycleTimer);
        document.getElementById('pause-cycle').addEventListener('click', this.pauseCycleTimer);
        document.getElementById('reset-cycle').addEventListener('click', this.resetCycleTimer);
    }
    
    // Real-time Clock methods
    startClock() {
        this.updateClock();
        this.timers.realTimeClock = setInterval(this.updateClock, 1000);
    }
    
    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // Calculate more precise angles including milliseconds for smoother movement
        const hourDeg = (hours % 12) * 30 + minutes * 0.5 + seconds * 0.008; // Each hour is 30 degrees
        const minuteDeg = minutes * 6 + seconds * 0.1; // Each minute is 6 degrees
        const secondDeg = seconds * 6 + milliseconds * 0.006; // Each second is 6 degrees
        
        // Update analog clock hands with smooth animation
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');
        
        if (hourHand && minuteHand && secondHand) {
            // Apply transitions selectively for smoother animation
            hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
            minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
            
            // Special handling for second hand to create ticking effect
            secondHand.style.transition = seconds === 0 ? 'none' : 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
            secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
        }
        
        // Update digital display with AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert to 12-hour format
        
        const digitalTimeElement = document.getElementById('digital-time');
        if (digitalTimeElement) {
            digitalTimeElement.textContent = 
                `${hours12}:${this.formatTime(minutes)}:${this.formatTime(seconds)} ${ampm}`;
            
            // Add a pulse effect at the top of each minute
            if (seconds === 0 && milliseconds < 500) {
                digitalTimeElement.classList.add('pulse');
                setTimeout(() => {
                    digitalTimeElement.classList.remove('pulse');
                }, 700);
            }
        }
    }
    
    // Countdown Timer methods
    startCountdown() {
        if (this.timers.countdown.isRunning && !this.timers.countdown.isPaused) {
            return;
        }
        
        if (!this.timers.countdown.isRunning || (this.timers.countdown.isRunning && this.timers.countdown.isPaused)) {
            // If timer is not running or is paused
            if (!this.timers.countdown.isRunning) {
                // Get values from input fields
                const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
                const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
                const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
                
                // Calculate total seconds
                this.timers.countdown.initialTime = hours * 3600 + minutes * 60 + seconds;
                this.timers.countdown.remainingTime = this.timers.countdown.initialTime;
                
                if (this.timers.countdown.initialTime <= 0) {
                    return; // Don't start if no time is set
                }
            }
            
            this.timers.countdown.isRunning = true;
            this.timers.countdown.isPaused = false;
            this.timers.countdown.endTime = Date.now() + (this.timers.countdown.remainingTime * 1000);
            this.timers.countdown.timer = setInterval(this.updateCountdown, 100);
        }
    }
    
    pauseCountdown() {
        if (this.timers.countdown.isRunning && !this.timers.countdown.isPaused) {
            clearInterval(this.timers.countdown.timer);
            this.timers.countdown.isPaused = true;
        }
    }
    
    resetCountdown() {
        clearInterval(this.timers.countdown.timer);
        this.timers.countdown.isRunning = false;
        this.timers.countdown.isPaused = false;
        this.timers.countdown.remainingTime = this.timers.countdown.initialTime;
        
        // Update display
        const hours = Math.floor(this.timers.countdown.initialTime / 3600);
        const minutes = Math.floor((this.timers.countdown.initialTime % 3600) / 60);
        const seconds = this.timers.countdown.initialTime % 60;
        
        document.getElementById('countdown-display').textContent = 
            `${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
    }
    
    updateCountdown() {
        const now = Date.now();
        this.timers.countdown.remainingTime = Math.max(0, Math.ceil((this.timers.countdown.endTime - now) / 1000));
        
        // Update display
        const hours = Math.floor(this.timers.countdown.remainingTime / 3600);
        const minutes = Math.floor((this.timers.countdown.remainingTime % 3600) / 60);
        const seconds = this.timers.countdown.remainingTime % 60;
        
        document.getElementById('countdown-display').textContent = 
            `${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
        
        // If countdown reached zero
        if (this.timers.countdown.remainingTime <= 0) {
            clearInterval(this.timers.countdown.timer);
            this.timers.countdown.isRunning = false;
            this.notifyTimerEnd('countdown');
        }
    }
    
    // Progress Timer methods
    startProgressTimer() {
        if (this.timers.progress.isRunning && !this.timers.progress.isPaused) {
            return;
        }
        
        if (!this.timers.progress.isRunning || (this.timers.progress.isRunning && this.timers.progress.isPaused)) {
            // If timer is not running or is paused
            if (!this.timers.progress.isRunning) {
                // Get values from input fields
                const hours = parseInt(document.getElementById('progress-hours').value) || 0;
                const minutes = parseInt(document.getElementById('progress-minutes').value) || 0;
                const seconds = parseInt(document.getElementById('progress-seconds').value) || 0;
                
                // Calculate total seconds
                this.timers.progress.duration = hours * 3600 + minutes * 60 + seconds;
                this.timers.progress.elapsed = 0;
                
                if (this.timers.progress.duration <= 0) {
                    return; // Don't start if no time is set
                }
            }
            
            this.timers.progress.isRunning = true;
            this.timers.progress.isPaused = false;
            this.timers.progress.startTime = Date.now() - (this.timers.progress.elapsed * 1000);
            this.timers.progress.timer = setInterval(this.updateProgressTimer, 100);
        }
    }
    
    pauseProgressTimer() {
        if (this.timers.progress.isRunning && !this.timers.progress.isPaused) {
            clearInterval(this.timers.progress.timer);
            this.timers.progress.isPaused = true;
        }
    }
    
    resetProgressTimer() {
        clearInterval(this.timers.progress.timer);
        this.timers.progress.isRunning = false;
        this.timers.progress.isPaused = false;
        this.timers.progress.elapsed = 0;
        
        // Update display
        document.getElementById('progress-timer-display').textContent = "00:00:00";
        document.querySelector('.progress-timer-bar').style.width = "0%";
    }
    
    updateProgressTimer() {
        const now = Date.now();
        this.timers.progress.elapsed = Math.floor((now - this.timers.progress.startTime) / 1000);
        
        // Update display
        const hours = Math.floor(this.timers.progress.elapsed / 3600);
        const minutes = Math.floor((this.timers.progress.elapsed % 3600) / 60);
        const seconds = this.timers.progress.elapsed % 60;
        
        document.getElementById('progress-timer-display').textContent = 
            `${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
        
        // Update progress bar
        const percentage = Math.min(100, (this.timers.progress.elapsed / this.timers.progress.duration) * 100);
        document.querySelector('.progress-timer-bar').style.width = `${percentage}%`;
        
        // If timer reached the duration
        if (this.timers.progress.elapsed >= this.timers.progress.duration) {
            clearInterval(this.timers.progress.timer);
            document.querySelector('.progress-timer-bar').style.width = "100%";
            this.notifyTimerEnd('progress');
        }
    }
    
    // Cycle Timer (Pomodoro) methods
    startCycleTimer() {
        if (this.timers.cycle.isRunning && !this.timers.cycle.isPaused) {
            return;
        }
        
        if (!this.timers.cycle.isRunning || (this.timers.cycle.isRunning && this.timers.cycle.isPaused)) {
            // If timer is not running or is paused
            if (!this.timers.cycle.isRunning) {
                // Get values from input fields
                this.timers.cycle.workDuration = parseInt(document.getElementById('work-minutes').value) * 60 || 25 * 60;
                this.timers.cycle.breakDuration = parseInt(document.getElementById('break-minutes').value) * 60 || 5 * 60;
                this.timers.cycle.longBreakDuration = parseInt(document.getElementById('long-break-minutes').value) * 60 || 15 * 60;
                this.timers.cycle.totalCycles = parseInt(document.getElementById('cycle-count').value) || 4;
                
                this.timers.cycle.currentTime = this.timers.cycle.workDuration;
                this.timers.cycle.currentPhase = 'work';
                this.timers.cycle.cycleCount = 0;
                
                // Initialize cycle indicators
                const cycleContainer = document.querySelector('.cycle-progress');
                cycleContainer.innerHTML = '';
                
                for (let i = 0; i < this.timers.cycle.totalCycles; i++) {
                    const indicator = document.createElement('div');
                    indicator.className = 'cycle-indicator';
                    if (i === 0) indicator.classList.add('active');
                    cycleContainer.appendChild(indicator);
                }
                
                document.querySelector('.cycle-phase').textContent = 'Work';
            }
            
            this.timers.cycle.isRunning = true;
            this.timers.cycle.isPaused = false;
            this.timers.cycle.timer = setInterval(this.updateCycleTimer, 1000);
        }
    }
    
    pauseCycleTimer() {
        if (this.timers.cycle.isRunning && !this.timers.cycle.isPaused) {
            clearInterval(this.timers.cycle.timer);
            this.timers.cycle.isPaused = true;
        }
    }
    
    resetCycleTimer() {
        clearInterval(this.timers.cycle.timer);
        this.timers.cycle.isRunning = false;
        this.timers.cycle.isPaused = false;
        
        this.timers.cycle.currentTime = this.timers.cycle.workDuration;
        this.timers.cycle.currentPhase = 'work';
        this.timers.cycle.cycleCount = 0;
        
        // Reset display
        const minutes = Math.floor(this.timers.cycle.currentTime / 60);
        const seconds = this.timers.cycle.currentTime % 60;
        
        document.getElementById('cycle-timer-display').textContent = 
            `${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
        
        document.querySelector('.cycle-phase').textContent = 'Work';
        
        // Reset cycle indicators
        const indicators = document.querySelectorAll('.cycle-indicator');
        indicators.forEach((indicator, index) => {
            indicator.className = 'cycle-indicator';
            if (index === 0) indicator.classList.add('active');
        });
    }
    
    updateCycleTimer() {
        this.timers.cycle.currentTime--;
        
        // Update display
        const minutes = Math.floor(this.timers.cycle.currentTime / 60);
        const seconds = this.timers.cycle.currentTime % 60;
        
        document.getElementById('cycle-timer-display').textContent = 
            `${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
        
        // If current phase is completed
        if (this.timers.cycle.currentTime <= 0) {
            // Switch phases
            if (this.timers.cycle.currentPhase === 'work') {
                this.timers.cycle.cycleCount++;
                
                // Update cycle indicators
                const indicators = document.querySelectorAll('.cycle-indicator');
                if (indicators[this.timers.cycle.cycleCount - 1]) {
                    indicators[this.timers.cycle.cycleCount - 1].classList.add('completed');
                }
                
                if (this.timers.cycle.cycleCount < this.timers.cycle.totalCycles) {
                    // Regular break
                    this.timers.cycle.currentPhase = 'break';
                    this.timers.cycle.currentTime = this.timers.cycle.breakDuration;
                    document.querySelector('.cycle-phase').textContent = 'Break';
                    
                    // Highlight the next active cycle
                    if (indicators[this.timers.cycle.cycleCount]) {
                        indicators[this.timers.cycle.cycleCount].classList.add('active');
                    }
                } else {
                    // Long break after all cycles
                    this.timers.cycle.currentPhase = 'longBreak';
                    this.timers.cycle.currentTime = this.timers.cycle.longBreakDuration;
                    document.querySelector('.cycle-phase').textContent = 'Long Break';
                    this.notifyPhaseChange('All cycles completed! Time for a long break.');
                }
            } else if (this.timers.cycle.currentPhase === 'break') {
                // Start next work cycle
                this.timers.cycle.currentPhase = 'work';
                this.timers.cycle.currentTime = this.timers.cycle.workDuration;
                document.querySelector('.cycle-phase').textContent = 'Work';
            } else if (this.timers.cycle.currentPhase === 'longBreak') {
                // All done, reset everything
                clearInterval(this.timers.cycle.timer);
                this.timers.cycle.isRunning = false;
                this.notifyTimerEnd('cycle');
                this.resetCycleTimer();
                return;
            }
            
            this.notifyPhaseChange(`${this.timers.cycle.currentPhase.charAt(0).toUpperCase() + this.timers.cycle.currentPhase.slice(1)} phase started!`);
        }
    }
    
    // Helper methods
    formatTime(num) {
        return num.toString().padStart(2, '0');
    }
    
    notifyTimerEnd(timerType) {
        // Play sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play();
        
        // Show notification based on timer type
        let message = '';
        switch(timerType) {
            case 'countdown':
                message = 'Countdown timer has ended!';
                break;
            case 'progress':
                message = 'Progress timer has reached the target duration!';
                break;
            case 'cycle':
                message = 'All Pomodoro cycles completed!';
                break;
        }
        
        if (Notification.permission === 'granted') {
            new Notification('Timer Alert', { body: message });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Timer Alert', { body: message });
                }
            });
        }
        
        // Alert user on page
        this.app.showToast(message, 'timer');
    }
    
    notifyPhaseChange(message) {
        // Play a softer sound for phase changes
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.volume = 0.5;
        audio.play();
        
        // Alert user on page
        this.app.showToast(message, 'timer');
    }
    
    cleanup() {
        // Clear all intervals
        if (this.timers.realTimeClock) {
            clearInterval(this.timers.realTimeClock);
        }
        
        if (this.timers.countdown.timer) {
            clearInterval(this.timers.countdown.timer);
        }
        
        if (this.timers.progress.timer) {
            clearInterval(this.timers.progress.timer);
        }
        
        if (this.timers.cycle.timer) {
            clearInterval(this.timers.cycle.timer);
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JournalApp();
}); 