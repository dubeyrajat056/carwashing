// Fade in animation on scroll
document.addEventListener('DOMContentLoaded', function () {
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeInOnScroll = function () {
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
        form.addEventListener('submit', function (e) {
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

        serviceForm.addEventListener('submit', function (e) {
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

        bookingForm.addEventListener('submit', function (e) {
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
















// Compact Organic Vegetables Slider with Images
function initOrganicSlider() {
    const sliderContainer = document.querySelector('.organic-slider-container');
    const sliderDots = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    if (!sliderContainer) return;

    const vegetables = [
        {
            name: "Organic Tomatoes",
            image: "https://images.unsplash.com/photo-1546470427-e212b7d31065?w=200&h=200&fit=crop&crop=center",
            price: "$3.99",
            oldPrice: "$4.99",
            description: "Fresh, juicy organic tomatoes grown without pesticides",
            badge: "20% OFF"
        },
        {
            name: "Fresh Carrots",
            image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200&h=200&fit=crop&crop=center",
            price: "$2.49",
            oldPrice: "$2.99",
            description: "Sweet and crunchy organic carrots, rich in vitamins",
            badge: "Popular"
        },
        {
            name: "Green Broccoli",
            image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop&crop=center",
            price: "$4.29",
            oldPrice: "$4.99",
            description: "Nutrient-packed organic broccoli for healthy meals",
            badge: "NEW"
        },
        {
            name: "Bell Peppers",
            image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop&crop=center",
            price: "$3.79",
            oldPrice: "$4.29",
            description: "Colorful organic bell peppers, great for cooking",
            badge: "Fresh"
        },
        {
            name: "Spinach Leaves",
            image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop&crop=center",
            price: "$2.99",
            oldPrice: "$3.49",
            description: "Tender organic spinach leaves packed with iron",
            badge: "Healthy"
        },
        {
            name: "Organic Potatoes",
            image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop&crop=center",
            price: "$1.99",
            oldPrice: "$2.49",
            description: "Hearty organic potatoes perfect for any dish",
            badge: "Sale"
        },
        {
            name: "Fresh Cucumbers",
            image: "https://images.unsplash.com/photo-1547489435-59f276e52c5b?w=200&h=200&fit=crop&crop=center",
            price: "$1.49",
            oldPrice: "$1.99",
            description: "Crisp organic cucumbers great for salads",
            badge: "Best Value"
        },
        {
            name: "Sweet Corn",
            image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop&crop=center",
            price: "$2.79",
            oldPrice: "$3.29",
            description: "Sweet organic corn harvested at peak freshness",
            badge: "Seasonal"
        },
        {
            name: "Organic Lettuce",
            image: "https://images.unsplash.com/photo-1566389519-0092e01a4df0?w=200&h=200&fit=crop&crop=center",
            price: "$2.29",
            oldPrice: "$2.79",
            description: "Crisp organic lettuce for fresh salads",
            badge: "Fresh"
        },
        {
            name: "Zucchini",
            image: "https://images.unsplash.com/photo-1570194065650-2c0b36cc2c55?w=200&h=200&fit=crop&crop=center",
            price: "$2.99",
            oldPrice: "$3.49",
            description: "Fresh organic zucchini perfect for grilling",
            badge: "NEW"
        }
    ];

    let currentSlide = 0;
    const slidesToShow = 4;
    let autoSlideInterval;

    // Initialize slider
    function initSlider() {
        // Create vegetable cards
        sliderContainer.innerHTML = vegetables.map((veg, index) => `
            <div class="vegetable-card fade-in">
                ${veg.badge ? `<span class="organic-badge">${veg.badge}</span>` : ''}
                <div class="vegetable-image">
                    <img src="${veg.image}" alt="${veg.name}" loading="lazy">
                </div>
                <h4>${veg.name}</h4>
                <div class="price">
                    ${veg.price}
                    ${veg.oldPrice ? `<span>${veg.oldPrice}</span>` : ''}
                </div>
                <p class="description">${veg.description}</p>
                <button class="btn btn-success btn-sm" style="padding: 6px 12px; font-size: 0.8rem;">
                    <i class="fas fa-shopping-cart me-1"></i>Add to Cart
                </button>
            </div>
        `).join('');

        // Create dots
        const totalDots = Math.ceil(vegetables.length / slidesToShow);
        sliderDots.innerHTML = Array.from({ length: totalDots }, (_, i) =>
            `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`
        ).join('');

        // Add event listeners to dots
        document.querySelectorAll('.slider-dot').forEach(dot => {
            dot.addEventListener('click', function () {
                const slideIndex = parseInt(this.dataset.slide);
                goToSlide(slideIndex);
                resetAutoSlide();
            });
        });

        updateSlider();
        startAutoSlide();
    }

    function updateSlider() {
        const cardWidth = 220 + 20; // card width + gap
        const translateX = -currentSlide * cardWidth * slidesToShow;
        sliderContainer.style.transform = `translateX(${translateX}px)`;

        // Update dots
        document.querySelectorAll('.slider-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Update button states
        const totalSlides = Math.ceil(vegetables.length / slidesToShow);
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= totalSlides - 1;
    }

    function goToSlide(slideIndex) {
        const totalSlides = Math.ceil(vegetables.length / slidesToShow);
        currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
        updateSlider();
    }

    function nextSlide() {
        const totalSlides = Math.ceil(vegetables.length / slidesToShow);
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0; // Loop back to start
        }
        updateSlider();
    }

    function prevSlide() {
        const totalSlides = Math.ceil(vegetables.length / slidesToShow);
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides - 1; // Loop to end
        }
        updateSlider();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 3000); // Slide every 3 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Event listeners
    prevBtn.addEventListener('click', function () {
        prevSlide();
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', function () {
        nextSlide();
        resetAutoSlide();
    });

    // Pause auto slide on hover
    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    sliderContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoSlideInterval);
    });

    sliderContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoSlide();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Initialize
    initSlider();

    // Responsive adjustments
    function handleResize() {
        // Update based on screen size
        updateSlider();
    }

    window.addEventListener('resize', handleResize);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(autoSlideInterval);
    });
}