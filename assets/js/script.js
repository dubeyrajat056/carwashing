// Fade in animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInOnScroll = function() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    };
    
    // Check on load
    fadeInOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', fadeInOnScroll);
    
    // Testimonial slider functionality
    initTestimonialSlider();
    
    // Form validation
    initFormValidation();
    
    // Dashboard functionality
    initDashboard();
});

// Testimonial Slider
function initTestimonialSlider() {
    const testimonialWrapper = document.querySelector('.testimonial-wrapper');
    if (!testimonialWrapper) return;
    
    const testimonials = testimonialWrapper.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
    }
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 5000);
    
    // Show first testimonial initially
    showTestimonial(0);
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const inputs = this.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
                
                // Password confirmation validation
                if (input.type === 'password' && input.id === 'confirmPassword') {
                    const password = document.getElementById('password');
                    if (password && input.value !== password.value) {
                        isValid = false;
                        input.classList.add('is-invalid');
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields correctly.');
            } else {
                // Store user data in localStorage for demo purposes
                if (form.id === 'registrationForm') {
                    const userData = {
                        fullName: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        createdAt: new Date().toISOString()
                    };
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    alert('Registration successful! Redirecting to dashboard...');
                    window.location.href = 'dashboard.html';
                }
                
                if (form.id === 'loginForm') {
                    // For demo, just redirect to dashboard
                    window.location.href = 'dashboard.html';
                }
            }
        });
    });
}

// Password visibility toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.querySelector(`[onclick="togglePasswordVisibility('${inputId}')"] i`);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Dashboard functionality
function initDashboard() {
    // Check if user is logged in (for demo purposes)
    const currentUser = localStorage.getItem('currentUser');
    if (window.location.pathname.includes('dashboard.html') && !currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.fullName;
        }
    }
    
    // Service preference management
    const serviceForm = document.getElementById('servicePreferencesForm');
    if (serviceForm) {
        // Load saved preferences
        const savedPreferences = localStorage.getItem('servicePreferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            document.getElementById('carWashService').checked = preferences.carWash;
            document.getElementById('maidService').checked = preferences.maidService;
            document.getElementById('preferredSchedule').value = preferences.schedule;
            document.getElementById('specialInstructions').value = preferences.instructions || '';
        }
        
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const preferences = {
                carWash: document.getElementById('carWashService').checked,
                maidService: document.getElementById('maidService').checked,
                schedule: document.getElementById('preferredSchedule').value,
                instructions: document.getElementById('specialInstructions').value
            };
            
            localStorage.setItem('servicePreferences', JSON.stringify(preferences));
            
            // Show success message
            showNotification('Service preferences updated successfully!', 'success');
        });
    }
    
    // Booking functionality
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').min = today;
        
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const serviceType = document.getElementById('bookingServiceType').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const address = document.getElementById('bookingAddress').value;
            const notes = document.getElementById('bookingNotes').value;
            
            // Save booking (for demo)
            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const newBooking = {
                id: Date.now(),
                serviceType,
                date,
                time,
                address,
                notes,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };
            
            bookings.unshift(newBooking); // Add to beginning of array
            localStorage.setItem('userBookings', JSON.stringify(bookings));
            
            showNotification('Booking confirmed! We will contact you shortly.', 'success');
            bookingForm.reset();
            
            // Refresh bookings list
            loadBookings();
        });
    }
    
    // Load bookings
    loadBookings();
}

// Load user bookings
function loadBookings() {
    const bookingsContainer = document.getElementById('bookingsList');
    if (!bookingsContainer) return;
    
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-calendar-times text-muted fa-3x mb-3"></i>
                <p class="text-muted">No bookings yet</p>
                <button class="btn btn-primary" onclick="scrollToSection('book-service')">Book Your First Service</button>
            </div>
        `;
        return;
    }
    
    bookingsContainer.innerHTML = bookings.map(booking => `
        <div class="booking-item d-flex justify-content-between align-items-center p-3 border-bottom">
            <div class="flex-grow-1">
                <h6 class="mb-1">${booking.serviceType === 'car-wash' ? 'Car Wash & Detailing' : 'Home Maid Service'}</h6>
                <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>${new Date(booking.date).toLocaleDateString()} 
                    <i class="fas fa-clock ms-2 me-1"></i>${booking.time}
                </small>
                ${booking.address ? `<br><small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${booking.address}</small>` : ''}
            </div>
            <span class="badge bg-${booking.status === 'confirmed' ? 'success' : 'warning'}">${booking.status}</span>
        </div>
    `).join('');
}

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Logout functionality
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}