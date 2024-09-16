const firebaseConfig = {
    apiKey: "AIzaSyCSFoTAOu__S29daond4WDDSaDgPFEuJDs",
    authDomain: "linkhub-cae84.firebaseapp.com",
    projectId: "linkhub-cae84",
    storageBucket: "linkhub-cae84.appspot.com",
    messagingSenderId: "564129773350",
    appId: "1:564129773350:web:700bec8d5b41518825f3e7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const profilePicture = document.getElementById('profile-picture');
const profileName = document.getElementById('profile-name');
const loginButton = document.getElementById('login-button');
const savesButton = document.getElementById('saves-button');
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

auth.onAuthStateChanged((user) => {
    if (user) {
        updateUIForLoggedInUser(user);
    } else {
        resetUIForAnonymousUser();
    }
});

loginButton.addEventListener('click', () => {
    if (auth.currentUser) {
        auth.signOut().then(() => {
            resetUIForAnonymousUser();
        }).catch((error) => {
            console.error('Error during logout:', error);
        });
    } else {
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user;
            updateUIForLoggedInUser(user);
        }).catch((error) => {
            console.error('Error during login:', error);
        });
    }
});

function updateUIForLoggedInUser(user) {
    profilePicture.src = user.photoURL;
    profileName.textContent = user.displayName;
    loginButton.textContent = 'Logout';
    savesButton.style.display = 'block';
    document.getElementById('rate').style.display = 'block';
}

function resetUIForAnonymousUser() {
    profilePicture.src = 'Assets/Images/Brand/logo_3.png';
    profileName.textContent = 'Anonymous';
    loginButton.textContent = 'Login';
    savesButton.style.display = 'none';
    document.getElementById('rate').style.display = 'none';
}

let currentPage = 1;
const pageSize = 5;
let totalPages = 1;
let filteredData = [...data];

const fuseOptions = {
    keys: ['name', 'info.sexuality', 'info.body', 'info.activity', 'info.kinks'],
    threshold: 0.4,
};

const fuse = new Fuse(data, fuseOptions);

function renderResults(results, page = 1) {
    const container = document.getElementById("resultsContainer");
    const pagination = document.getElementById("pagination");
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    container.innerHTML = '';
    totalPages = Math.ceil(results.length / pageSize);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

    paginatedResults.forEach(item => {
        const iconPrefix = item.info.source === 'reddit' ? 'https://preview.redd.it/' : 'https://pbs.twimg.com/profile_images/';
        const fullicon = iconPrefix + item.icon;
        const linkPrefix = item.info.source === 'reddit' ? 'u/' : '@';
        const fullUrl = item.info.source === 'reddit' ? `https://www.reddit.com/user/${item.link}` : `https://x.com/${item.link}`;

        const div = document.createElement("div");
        div.classList.add("col-md-4", "mb-4");
        div.innerHTML = `
            <div class="col-lg-4 col-sm-6">
                <div class="card shadow-4-hover">
                    <div class="card-body pb-5">
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <img alt="Profile Picture" class="avatar rounded-1" src="${fullicon}">
                            </div>
                            <div class="flex-1">
                                <a href="${fullUrl}" class="d-block font-semibold text-sm text-heading text-primary-hover">${item.name}</a>
                                <div class="text-xs text-muted line-clamp-1">${linkPrefix}${item.link}</div>
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-sm btn-neutral rounded-pill view-button" data-name="${item.name}">
                                    <i class="bi bi-folder2-open me-1"></i>
                                    <span>View</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    const viewButtons = document.querySelectorAll(".view-button");
    viewButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const profileName = event.target.getAttribute("data-name");
            openProfileModal(profileName);
        });
    });

    document.getElementById("currentPage").innerText = page;
    document.getElementById("totalPages").innerText = totalPages;
    prevButton.disabled = page === 1;
    nextButton.disabled = page === totalPages;
    pagination.style.display = "block";
}

function filterResults() {
    const searchTerm = document.getElementById("searchBar").value.toLowerCase();
    const sortOption = document.getElementById("sortOptions").value;
    const selectedSexuality = Array.from(document.querySelectorAll("input[name='sexuality']:checked")).map(checkbox => checkbox.value);
    const selectedBody = Array.from(document.querySelectorAll("input[name='body']:checked")).map(checkbox => checkbox.value);
    const selectedActivity = Array.from(document.querySelectorAll("input[name='activity']:checked")).map(checkbox => checkbox.value);
    const selectedKinks = Array.from(document.querySelectorAll("input[name='kinks']:checked")).map(checkbox => checkbox.value);
    filteredData = searchTerm ? fuse.search(searchTerm).map(result => result.item) : [...data];

    if (selectedSexuality.length > 0) {
        filteredData = filteredData.filter(item => selectedSexuality.includes(item.info.sexuality.toLowerCase()));
    }

    if (selectedBody.length > 0) {
        filteredData = filteredData.filter(item => selectedBody.includes(item.info.body.toLowerCase()));
    }

    if (selectedActivity.length > 0) {
        filteredData = filteredData.filter(item => selectedActivity.includes(item.info.activity.toLowerCase()));
    }

    if (selectedKinks.length > 0) {
        filteredData = filteredData.filter(item => item.info.kinks.some(kink => selectedKinks.includes(kink.toLowerCase())));
    }

    if (sortOption === "nameAsc") {
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "nameDesc") {
        filteredData.sort((a, b) => b.name.localeCompare(a.name));
    }

    currentPage = 1;
    renderResults(filteredData, currentPage);
}

document.getElementById("searchBar").addEventListener("input", filterResults);
document.getElementById("sortOptions").addEventListener("change", filterResults);
document.querySelectorAll("input[name='sexuality'], input[name='body'], input[name='activity'], input[name='kinks']").forEach(checkbox => {
    checkbox.addEventListener("change", filterResults);
});

document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchBar").value = '';
    document.getElementById("sortOptions").value = 'relevance';
    document.querySelectorAll("input[name='sexuality'], input[name='body'], input[name='activity'], input[name='kinks']").forEach(checkbox => {
        checkbox.checked = false;
    });

    filterResults();
});

function setupPagination() {
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderResults(filteredData, currentPage);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderResults(filteredData, currentPage);
        }
    });
}

function openProfileModal(profileName) {
    const profile = data.find(item => item.name === profileName);
    if (profile) {
        const iconPrefix = profile.info.source === 'reddit' ? 'https://preview.redd.it/' : 'https://pbs.twimg.com/profile_images/';
        const fullicon = iconPrefix + profile.icon;
        const linkPrefix = profile.info.source === 'reddit' ? 'u/' : '@';
        const fullUrl = profile.info.source === 'reddit' ? `https://www.reddit.com/user/${profile.link}` : `https://x.com/${profile.link}`;

        document.getElementById('linkBodyView').innerHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row g-0">
                        <div class="col">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <img alt="Profile Picture" class="avatar rounded-1" src="${fullicon}">
                                </div>
                                <div class="flex-1">
                                    <a href="${fullUrl}" class="d-block font-semibold text-sm text-heading text-primary-hover">${profile.name}</a>
                                    <div class="text-xs text-muted line-clamp-1">${linkPrefix}${profile.link}</div>
                                </div>
                                <div class="text-end">
                                    <a href="${fullUrl}" target="_blank" class="btn btn-sm btn-neutral rounded-pill">
                                        <i class="bi bi-caret-right me-1"></i>
                                        <span>Open</span>
                                    </a>
                                </div>
                            </div>
                            <hr class="my-7">
                            <div class="row justify-content-between align-items-center">
                                <div class="col-4">
                                    <span class="d-block h6 text-heading mb-0">${profile.info.sexuality}</span>
                                    <span class="d-block text-sm text-muted">Sexuality</span>
                                </div>
                                <div class="col-4">
                                    <span class="d-block h6 text-heading mb-0">${profile.info.body}</span>
                                    <span class="d-block text-sm text-muted">Body</span>
                                </div>
                                <div class="col-4">
                                    <span class="d-block h6 text-heading mb-0">${profile.info.race}</span>
                                    <span class="d-block text-sm text-muted">Race</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mb-3">
                <div class="card-body">
                    <span class="d-block h6 text-heading mb-0">Kinks</span>
                    <span class="d-block text-sm text-muted">${profile.info.kinks.length ? profile.info.kinks.join(', ') : 'N/A'}</span>
                </div>
            </div>
        `;

        const profileModal = new bootstrap.Offcanvas(document.getElementById("profileModal"));
        profileModal.show();
    }
}

function calculateAndDisplayRating(profile) {
    if (profile.ratings && Object.keys(profile.ratings).length > 0) {
        const totalRatings = Object.keys(profile.ratings).length;
        const averageRating = Object.values(profile.ratings).reduce((acc, rating) => acc + rating, 0) / totalRatings;
        document.getElementById('modalProfileRating').innerText = `Rating: ${averageRating.toFixed(1)} / 10`;
        document.getElementById('modalProfileRatings').innerText = `${totalRatings} Reviews`;
    } else {
        document.getElementById('modalProfileRating').innerText = 'Rating: N/A';
        document.getElementById('modalProfileRatings').innerText = 'No Reviews';
    }
}

filterResults();
setupPagination();