const calendarFloatBtn = document.getElementById('calendar-float-btn');
const calendarModal = document.getElementById('calendar-modal');
const calendarModalClose = document.getElementById('calendar-modal-close');

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