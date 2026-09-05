const calendarFloatBtn = document.getElementById('calendar-float-btn');
const calendarModal = document.getElementById('calendar-modal');
const calendarModalClose = document.getElementById('calendar-modal-close');

const calendarToast = document.getElementById('calendar-toast');
const calendarToastClose = document.getElementById('calendar-toast-close');

const params = new URLSearchParams(window.location.search);

if (params.get('calendar') === 'connected') {
    calendarToast.classList.add('show');

    setTimeout(() => {
        calendarToast.classList.remove('show');
    }, 7000);

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}

calendarToastClose.addEventListener('click', () => {
    calendarToast.classList.remove('show');
});

const calendarConnectBtn = document.getElementById('calendar-connect-btn');

calendarConnectBtn.addEventListener('click', async () => {

    if (!getToken() || isTokenExpired()) {
        window.location.href = 'login.html';
        return;
    }

    // If calendar is connected, disconnect it
    if (calendarConnectBtn.dataset.connected === 'true') {

        const confirmed = confirm(
            'Are you sure you want to disconnect Google Calendar?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/calendar/disconnect`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to disconnect Google Calendar');
            }

            // Change button back to Connect state
            calendarConnectBtn.dataset.connected = 'false';

            calendarConnectBtn.innerHTML = `
                <span class="material-symbols-outlined">event_available</span>
                Connect Google Calendar
            `;

            calendarConnectBtn.classList.remove('btn-secondary');
            calendarConnectBtn.classList.add('btn-primary');

        } catch (error) {
            console.error('Calendar disconnection failed:', error);
        }

        return;
    }

    // Otherwise, connect Google Calendar
    try {
        const response = await fetch(`${BASE_URL}/api/calendar/connect`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to start Google Calendar connection');
        }

        const authUrl = await response.text();

        window.location.href = authUrl;

    } catch (error) {
        console.error('Calendar connection failed:', error);
    }
});

calendarFloatBtn.addEventListener('click', () => {
    calendarModal.classList.add('show');
});

calendarModalClose.addEventListener('click', () => {
    calendarModal.classList.remove('show');
});

calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) {
        calendarModal.classList.remove('show');
    }
});

async function updateCalendarButton() {

    if (!getToken() || isTokenExpired()) {
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();



        if (data.calenderConnected) {
            
            calendarConnectBtn.dataset.connected = 'true';

            calendarConnectBtn.innerHTML = `
                <span class="material-symbols-outlined">link_off</span>
                Disconnect Google Calendar
            `;

            calendarConnectBtn.classList.remove('btn-primary');
            calendarConnectBtn.classList.add('btn-secondary');
        }

    } catch (error) {
        console.error('Failed to load calendar status:', error);
    }
}

updateCalendarButton();