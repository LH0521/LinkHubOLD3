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
    keys: ['name', 'details.sexuality', 'details.body', 'details.activity'],
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
        const div = document.createElement("div");
        div.classList.add("col-md-4", "mb-4");
        div.innerHTML = `
            <div class="card shadow-sm profile-item" data-name="${item.name}">
                <div class="card-body text-center">
                    <img src="${item.pfp}" class="img-thumbnail rounded-circle mb-3" style="width: 150px; height: 150px;">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text"><strong>Sexuality:</strong> ${item.details.sexuality}</p>
                    <p class="card-text"><strong>Body:</strong> ${item.details.body}</p>
                    <p class="card-text"><strong>Activity:</strong> ${item.details.activity}</p>
                    <button class="btn btn-primary view-details" data-name="${item.name}">View Details</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    const viewButtons = document.querySelectorAll(".view-details");
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
    filteredData = searchTerm ? fuse.search(searchTerm).map(result => result.item) : [...data];

    if (selectedSexuality.length > 0) {
        filteredData = filteredData.filter(item => selectedSexuality.includes(item.details.sexuality.toLowerCase()));
    }

    if (selectedBody.length > 0) {
        filteredData = filteredData.filter(item => selectedBody.includes(item.details.body.toLowerCase()));
    }

    if (selectedActivity.length > 0) {
        filteredData = filteredData.filter(item => selectedActivity.includes(item.details.activity.toLowerCase()));
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

document.querySelectorAll("input[name='sexuality'], input[name='body'], input[name='activity']").forEach(checkbox => {
    checkbox.addEventListener("change", filterResults);
});
document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchBar").value = '';
    document.getElementById("sortOptions").value = 'relevance';
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

document.getElementById('rate').addEventListener('input', async (event) => {
    const rating = parseInt(event.target.value);
    const profileName = document.getElementById('modalProfileName').innerText;
    const profile = data.find(item => item.name === profileName);

    const user = firebase.auth().currentUser;
    if (!user) return;
    const userId = user.uid;

    if (!profile.ratings) {
        profile.ratings = {};
    }

    profile.ratings[userId] = rating;
    await saveRatingToFirebase(profileName, profile.ratings);
    document.getElementById('modalProfileRate').innerText = `Your Rating: ${rating}`;
    calculateAndDisplayRating(profile);
});

async function saveRatingToFirebase(profileName, ratings) {
    try {
        await db.collection('profiles').doc(profileName).set({
            ratings: ratings
        }, { merge: true });
        console.log('Rating saved successfully');
    } catch (error) {
        console.error('Error saving rating to Firestore:', error);
    }
}

function openProfileModal(profileName) {
    const profile = data.find(item => item.name === profileName);
    const user = firebase.auth().currentUser;

    if (profile) {
        document.getElementById("modalProfileName").innerText = profile.name;
        document.getElementById("modalProfileSexuality").innerText = `Sexuality: ${profile.details.sexuality}`;
        document.getElementById("modalProfileBody").innerText = `Body: ${profile.details.body}`;
        document.getElementById("modalProfileActivity").innerText = `Activity: ${profile.details.activity}`;
        document.getElementById("modalProfileExperience").innerText = `Experience: ${profile.details.experience}`;
        document.getElementById("modalProfileRace").innerText = `Race: ${profile.details.race}`;
        document.getElementById("modalProfileSource").innerText = `Source: ${profile.details.source}`;
        document.getElementById("modalProfileKinks").innerText = `Kinks: ${profile.details.kinks.join(", ")}`;

        if (user) {
            const userId = user.uid;
            const userRating = profile.ratings ? profile.ratings[userId] : null;

            if (userRating) {
                document.getElementById('modalProfileRate').innerText = `Your Rating: ${userRating}`;
                document.getElementById('rate').value = userRating;
            } else {
                document.getElementById('modalProfileRate').innerText = 'Your Rating: None';
                document.getElementById('rate').value = 5;
            }

            document.getElementById('rate').style.display = 'block';
        } else {
            document.getElementById('modalProfileRate').innerText = 'Log in to rate this profile.';
            document.getElementById('rate').style.display = 'none';
        }

        calculateAndDisplayRating(profile);
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