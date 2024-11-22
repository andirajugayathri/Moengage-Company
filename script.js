// Initialize users array from localStorage or create empty array
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentFilter = { search: '', category: 'all' };
const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
const modal = document.getElementById('savedFiltersModal');
const closeModal = document.querySelector('.close');
const savedFiltersBtn = document.getElementById('savedFiltersBtn');

// HTTP Status Codes
const httpStatuses = [
    { code: 100, message: "Continue" },
    { code: 200, message: "OK" },
    { code: 201, message: "Created" },
    { code: 204, message: "No Content" },
    { code: 301, message: "Moved Permanently" },
    { code: 302, message: "Found" },
    { code: 400, message: "Bad Request" },
    { code: 401, message: "Unauthorized" },
    { code: 403, message: "Forbidden" },
    { code: 404, message: "Not Found" },
    { code: 418, message: "I'm a teapot" },
    { code: 500, message: "Internal Server Error" },
    { code: 502, message: "Bad Gateway" },
    { code: 503, message: "Service Unavailable" }
];

// DOM Elements
const signupContainer = document.getElementById('signupContainer');
const signinContainer = document.getElementById('signinContainer');
const landingPage = document.getElementById('landingPage');
const switchToSignin = document.getElementById('switchToSignin');
const switchToSignup = document.getElementById('switchToSignup');

// Switch between forms
switchToSignin.addEventListener('click', (e) => {
    e.preventDefault();
    signupContainer.style.display = 'none';
    signinContainer.style.display = 'flex';
    document.getElementById('signupMessage').textContent = '';
    document.getElementById('signinMessage').textContent = '';
});

switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    signinContainer.style.display = 'none';
    signupContainer.style.display = 'flex';
    document.getElementById('signupMessage').textContent = '';
    document.getElementById('signinMessage').textContent = '';
});

// Sign Up Form Handler
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageElement = document.getElementById('signupMessage');

    // Validation
    if (password !== confirmPassword) {
        messageElement.className = 'error';
        messageElement.textContent = 'Passwords do not match!';
        return;
    }

    if (password.length < 6) {
        messageElement.className = 'error';
        messageElement.textContent = 'Password must be at least 6 characters long!';
        return;
    }

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        messageElement.className = 'error';
        messageElement.textContent = 'Email already exists!';
        return;
    }

    // Add new user
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    messageElement.className = 'success';
    messageElement.textContent = 'Account created successfully! Redirecting to sign in...';
    
    // Clear form
    e.target.reset();

    // Redirect to sign in
    setTimeout(() => {
        signupContainer.style.display = 'none';
        signinContainer.style.display = 'flex';
        messageElement.textContent = '';
    }, 2000);
});

// Sign In Form Handler
document.getElementById('signinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    const messageElement = document.getElementById('signinMessage');

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        messageElement.className = 'success';
        messageElement.textContent = 'Signed in successfully!';
        
        // Clear form
        e.target.reset();

        // Show landing page
        setTimeout(() => {
            signinContainer.style.display = 'none';
            landingPage.style.display = 'block';
            loadStatusCodes();
        }, 1000);
    } else {
        messageElement.className = 'error';
        messageElement.textContent = 'Invalid email or password!';
    }
});

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    landingPage.style.display = 'none';
    signinContainer.style.display = 'flex';
    document.getElementById('signinMessage').textContent = '';
});

// Load Status Codes

// Update loadStatusCodes function to include filtering
function loadStatusCodes(filter = currentFilter) {
    const statusGrid = document.getElementById('statusGrid');
    statusGrid.innerHTML = '';
    
    let filteredStatuses = httpStatuses;
    
    // Apply category filter
    if (filter.category !== 'all') {
        const categoryPrefix = filter.category.charAt(0);
        filteredStatuses = filteredStatuses.filter(status => 
            Math.floor(status.code / 100) === parseInt(categoryPrefix)
        );
    }
    
    // Apply search filter
    if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredStatuses = filteredStatuses.filter(status =>
            status.code.toString().includes(searchTerm) ||
            status.message.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update active filter display
    const activeFilterEl = document.getElementById('activeFilter');
    activeFilterEl.innerHTML = `Showing ${filteredStatuses.length} results ${filter.search ? `for "${filter.search}"` : ''}`;
    
    // Create and append status cards
    filteredStatuses.forEach(status => {
        const card = document.createElement('div');
        card.className = 'status-card';
        card.innerHTML = `
            <img src="https://http.dog/${status.code}.jpg" 
                 alt="HTTP ${status.code}"
                 onerror="this.src='https://via.placeholder.com/400x300?text=Status+${status.code}'">
            <div class="status-info">
                <div class="status-code">${status.code}</div>
                <div class="status-message">${status.message}</div>
            </div>
        `;
        statusGrid.appendChild(card);
    });
}

// Search and filter handlers
document.getElementById('searchInput').addEventListener('input', (e) => {
    currentFilter.search = e.target.value;
    loadStatusCodes(currentFilter);
});

document.getElementById('statusFilter').addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    loadStatusCodes(currentFilter);
});

// Save filter functionality
document.getElementById('saveFilterBtn').addEventListener('click', () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
        savedFilters.push({
            name: filterName,
            filter: { ...currentFilter }
        });
        localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
        alert('Filter saved successfully!');
    }
});

// Saved filters modal functionality
savedFiltersBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    displaySavedFilters();
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

function displaySavedFilters() {
    const savedFiltersList = document.getElementById('savedFiltersList');
    savedFiltersList.innerHTML = '';
    
    savedFilters.forEach((saved, index) => {
        const filterItem = document.createElement('div');
        filterItem.className = 'saved-filter-item';
        filterItem.innerHTML = `
            <div>
                <strong>${saved.name}</strong>
                <div>
                    ${saved.filter.category !== 'all' ? 
                        `<span class="filter-badge">Category: ${saved.filter.category}</span>` : ''}
                    ${saved.filter.search ? 
                        `<span class="filter-badge">Search: ${saved.filter.search}</span>` : ''}
                </div>
            </div>
            <div>
                <button onclick="applyFilter(${index})">Apply</button>
                <button onclick="deleteFilter(${index})" style="background-color: #dc3545;">Delete</button>
            </div>
        `;
        savedFiltersList.appendChild(filterItem);
    });
}

function applyFilter(index) {
    currentFilter = { ...savedFilters[index].filter };
    document.getElementById('searchInput').value = currentFilter.search;
    document.getElementById('statusFilter').value = currentFilter.category;
    loadStatusCodes(currentFilter);
    modal.style.display = 'none';
}

function deleteFilter(index) {
    if (confirm('Are you sure you want to delete this filter?')) {
        savedFilters.splice(index, 1);
        localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
        displaySavedFilters();
    }
}