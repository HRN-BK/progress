// Simple app initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is ready!');
    
    // Initialize date display
    const currentDateElem = document.getElementById('current-date');
    if (currentDateElem) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElem.textContent = new Date().toLocaleDateString(undefined, options);
    }
    
    // Initialize user greeting
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        
        if (hour < 12) {
            greeting = 'Good morning';
        } else if (hour < 18) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }
        
        userGreeting.textContent = greeting + '!';
    }
    
    // Initialize calendar display
    const calendarHeader = document.getElementById('calendar-header');
    const calendarGrid = document.getElementById('calendar-grid');
    
    if (calendarHeader && calendarGrid) {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        
        // Set header
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarHeader.textContent = `${months[month]} ${year}`;
        
        // Clear grid
        calendarGrid.innerHTML = '';
        
        // Get first day of month and last day
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Fill in leading empty days
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Fill in days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElem = document.createElement('div');
            dayElem.className = 'calendar-day';
            dayElem.textContent = day;
            
            // Highlight today
            if (day === currentDate.getDate()) {
                dayElem.classList.add('today');
                dayElem.classList.add('selected');
            }
            
            // Add click handler
            dayElem.addEventListener('click', function() {
                // Remove selected class from previous selection
                const prevSelected = document.querySelector('.calendar-day.selected');
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                }
                
                // Add selected class to current selection
                this.classList.add('selected');
                
                // Update day details
                updateDayDetails(new Date(year, month, day));
            });
            
            calendarGrid.appendChild(dayElem);
        }
    }
    
    // Setup collapsible sections
    const toggleButtons = document.querySelectorAll('.toggle-section');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.collapsible-section');
            section.classList.toggle('collapsed');
            
            // Update icon
            const icon = this.querySelector('i');
            if (section.classList.contains('collapsed')) {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            } else {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        });
    });
    
    // Setup section icon navigation
    const sectionIcons = document.querySelectorAll('.section-icon-btn');
    sectionIcons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const section = document.querySelector(`.${sectionId}`);
            
            if (section) {
                // Uncollapse if collapsed
                if (section.classList.contains('collapsed')) {
                    section.classList.remove('collapsed');
                    const icon = section.querySelector('.toggle-section i');
                    if (icon) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    }
                }
                
                // Scroll to section
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Initialize journal functionality
    const saveJournalBtn = document.getElementById('save-journal');
    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', function() {
            const content = document.getElementById('journal-content').value.trim();
            if (content) {
                const hour = document.getElementById('journal-hour').value;
                const minute = document.getElementById('journal-minute').value;
                const timeOfDay = document.getElementById('journal-time-of-day').value;
                
                // Create entry
                const entryElem = document.createElement('div');
                entryElem.className = 'journal-entry';
                
                const header = document.createElement('div');
                header.className = 'journal-entry-header';
                
                const time = document.createElement('span');
                time.className = 'entry-time';
                time.textContent = `${hour}:${minute} (${timeOfDay})`;
                
                header.appendChild(time);
                entryElem.appendChild(header);
                
                const contentElem = document.createElement('div');
                contentElem.className = 'entry-content';
                contentElem.textContent = content;
                entryElem.appendChild(contentElem);
                
                // Add to journal history
                const journalHistory = document.getElementById('journal-history');
                journalHistory.insertBefore(entryElem, journalHistory.firstChild);
                
                // Clear input
                document.getElementById('journal-content').value = '';
            }
        });
    }
    
    // Initialize goals functionality
    const addGoalBtn = document.getElementById('add-goal');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function() {
            const goalText = document.getElementById('new-goal').value.trim();
            if (goalText) {
                addGoal(goalText);
                document.getElementById('new-goal').value = '';
            }
        });
    }
    
    // Add goal when Enter key is pressed
    const newGoalInput = document.getElementById('new-goal');
    if (newGoalInput) {
        newGoalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const goalText = this.value.trim();
                if (goalText) {
                    addGoal(goalText);
                    this.value = '';
                }
            }
        });
    }
    
    // Helper function to add a goal
    function addGoal(text) {
        const goalsList = document.getElementById('goals-list');
        
        // Create goal item
        const goalElem = document.createElement('div');
        goalElem.className = 'goal-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', updateGoalProgress);
        
        const goalText = document.createElement('span');
        goalText.className = 'goal-text';
        goalText.textContent = text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-goal';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', function() {
            goalElem.remove();
            updateGoalProgress();
        });
        
        goalElem.appendChild(checkbox);
        goalElem.appendChild(goalText);
        goalElem.appendChild(deleteBtn);
        
        // Add to goals list
        goalsList.appendChild(goalElem);
        
        // Update progress
        updateGoalProgress();
    }
    
    // Helper function to update goal progress
    function updateGoalProgress() {
        const goals = document.querySelectorAll('.goal-item');
        const completed = document.querySelectorAll('.goal-item input[type="checkbox"]:checked').length;
        
        const progressBar = document.getElementById('goal-progress-bar');
        const progressPercentage = document.getElementById('goal-progress-percentage');
        
        if (goals.length === 0) {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
        } else {
            const percentage = (completed / goals.length) * 100;
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${Math.round(percentage)}%`;
        }
    }
    
    // Helper function to update day details
    function updateDayDetails(date) {
        const dayContentElem = document.getElementById('day-content');
        const selectedDayHeader = document.getElementById('selected-day-header');
        
        if (dayContentElem && selectedDayHeader) {
            // Format date
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            selectedDayHeader.textContent = date.toLocaleDateString(undefined, options);
            
            // Simple content for now
            dayContentElem.innerHTML = `
                <div class="day-stats">
                    <div class="day-stat-item">
                        <i class="fas fa-info-circle"></i>
                        <span>Selected date: ${date.toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }
    }
    
    // Initialize day details for current date
    updateDayDetails(new Date());
    
    // Theme toggle functionality
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            const icon = this.querySelector('i');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }
}); 