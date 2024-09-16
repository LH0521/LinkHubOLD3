const firebaseConfig = {
    apiKey: "AIzaSyCSFoTAOu__S29daond4WDDSaDgPFEuJDs",
    authDomain: "linkhub-cae84.firebaseapp.com",
    projectId: "linkhub-cae84",
    storageBucket: "linkhub-cae84.appspot.com",
    messagingSenderId: "564129773350",
    appId: "1:564129773350:web:700bec8d5b41518825f3e7"
};

firebase.initializeApp(firebaseConfig);

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
}

function resetUIForAnonymousUser() {
    profilePicture.src = 'Assets/Images/Brand/logo_3.png';
    profileName.textContent = 'Anonymous';
    loginButton.textContent = 'Login';
    savesButton.style.display = 'none';
}