// Optional: Only run slides if on pages that use them
if (document.querySelector('.carousel-inner')) {
  let slideIndex = 0; // Keeps track of the current slide index
  showSlides(slideIndex);

// Called when user clicks "next" or "prev" buttons
  function moveSlide(n) {
    showSlides(slideIndex += n);
  }

// Controls slide movement and updates carousel position
  function showSlides(n) {
    const slides = document.querySelectorAll(".event-slide");
    const totalSlides = slides.length;

// Loop back to first or last slide if out of bounds
    if (n >= totalSlides) slideIndex = 0;
    if (n < 0) slideIndex = totalSlides - 1;

// Shift carousel using transform (percentage-based)
    document.querySelector('.carousel-inner').style.transform =
      `translateX(${-slideIndex * 100}%)`;
  }
}
  

//  REGISTER FUNCTION
async function registerUser(event) {
  event.preventDefault();
// Get values from the registration form fields
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const universityId = document.getElementById("universityId").value.trim();
  const gender = document.getElementById("gender").value;

 // Get message containers
  const success = document.getElementById("successMessage");
  const exist = document.getElementById("existmessage");

// Check if passwords match
if (password !== confirmPassword) {
  success.style.display = "none";
  exist.innerText = "Passwords do not match.";
  exist.style.display = "block";
  return;
}

  try {
  // Send registration data to backend
    const response = await fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, phone, universityId, gender }),
    });

    const data = await response.json();

    if (response.status === 201) {
  // Success: show message and redirect to login after 2 seconds
      success.style.display = "block";
      exist.style.display = "none";
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
  // Failure: show error message from backend
      success.style.display = "none";
      exist.innerText = data.error || "Something went wrong.";
      exist.style.display = "block";

    }
  } catch (err) {
    console.error(" Registration error:", err);
    alert("Something went wrong. Try again later.");
  }
}

//  LOGIN FUNCTION

async function loginUser(event) {
  event.preventDefault(); // Prevent form default behavior (like refreshing the page)

// Get values entered by the user
  const usernameOrEmail = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

// Get elements for showing success or error messages
  const success = document.getElementById("successMessage");
  const error = document.getElementById("errorMessage");

  try {
 // Send login data to the backend API
    const response = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername: usernameOrEmail, password }),
    });

    const data = await response.json();

    if (response.status === 200) {
      success.style.display = "block";
      error.style.display = "none";
  // Store user info in localStorage for session
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
  // Redirect to profile page after 1.5 seconds
      setTimeout(() => window.location.href = "profile.html", 1500);
    } else {
  // Login failed, show error message
      success.style.display = "none";
      error.style.display = "block";
    }
  } catch (err) {
    console.error(" Login error:", err);
    alert("Something went wrong. Try again later.");
  }
}

//  Show/hide logout button if user is logged in
document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem("loggedInUser");
  const logoutBtn = document.getElementById("logoutBtn");
// If a user is logged in and logout button exists, show it and attach logout function
  if (user && logoutBtn) {
    logoutBtn.style.display = "inline-block";
    logoutBtn.addEventListener("click", () => {
      logoutUser();
    });
  }
});

// Clears user session and redirects to login page
function logoutUser() {
// Remove user from localStorage
  localStorage.removeItem("loggedInUser");

// Show logout confirmation popup
  const popup = document.getElementById("logoutPopup");
  popup.innerText = "You have been logged out.";
  popup.style.display = "block";

  // Trigger fade-in class
  popup.classList.add("show");
    
// Hide popup after 2 seconds and redirect
  setTimeout(() => {
    popup.classList.remove("show");
    popup.style.display = "none";

    //  Refresh or redirect after logout
    window.location.href = "login.html"; 
  }, 2000);
}

// When the DOM is fully loaded, load profile data and bookings
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const profileContent = document.querySelector(".profile-section");
  const warning = document.getElementById("loginWarning");

// If not logged in, show message and stop loading profile
  if (!user) {
    profileContent.innerHTML = `
      <div style="text-align: center; color: red; font-weight: bold; padding: 20px;">
         You need to be logged in to view your profile.
      </div>
    `;
    return;
  }
  
 // Display user info
  document.getElementById("profileUsername").innerText = user.username;
  document.getElementById("profileEmail").innerText = user.email;
  warning.style.display = "none";
  profileContent.style.display = "block";

  try {
 // Fetch user's bookings from backend
    const bookingsRes = await fetch(`http://127.0.0.1:5000/api/bookings/${user.email}`);
    const bookings = await bookingsRes.json();

// Fetch all events to match them with bookings
    const eventsRes = await fetch("http://127.0.0.1:5000/api/events");
    const allEvents = await eventsRes.json();

    const eventsList = document.getElementById("user-events-list");
    eventsList.innerHTML = "";

    if (bookings.length === 0) {
      eventsList.innerHTML = "<li>No bookings yet.</li>";
    } else {
      bookings.forEach(booking => {
        const li = document.createElement("li");

// Match booking with event data for date
        const bookingTitle = booking.event || booking.eventType || "";
        const matchedEvent = allEvents.find(ev => ev.title.trim().toLowerCase() === bookingTitle.trim().toLowerCase());
        

        const eventTitle = matchedEvent ? matchedEvent.title : booking.event || "Unnamed";
        const eventDate = matchedEvent && matchedEvent.date
          ? new Date(matchedEvent.date).toLocaleDateString()
          : "Unknown Date";

        li.textContent = `${eventTitle} - ${eventDate}`;

// Create cancel button
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "cancel-btn";
        cancelBtn.onclick = async () => {
          const confirmCancel = confirm(`Cancel booking for ${eventTitle}?`);
          if (!confirmCancel) return;

          try {
            const res = await fetch(`http://127.0.0.1:5000/api/bookings/${booking._id}`, {
              method: "DELETE"
            });

            if (res.ok) {
              li.remove();
              alert(" Booking cancelled.");
            } else {
              alert("Failed to cancel booking.");
            }
          } catch (err) {
            console.error("Cancel error:", err);
            alert("Something went wrong.");
          }
        };

        li.appendChild(cancelBtn);
        eventsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error(" Error fetching bookings or events:", err);
  }
});


//events page Javascript 

// Opens the booking popup and fills in user info
function openPopup(eventName) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    alert("Please log in first.");
    return;
  }
// Fill popup with event and user info
  document.getElementById("selected-event-name").innerText = eventName;
  document.getElementById("popup-username").innerText = user.username;
  document.getElementById("popup-email").innerText = user.email;
  document.getElementById("popup-form").style.display = "block";
}

// Closes the booking popup
function closePopup() {
  document.getElementById("popup-form").style.display = "none";
}

// Sends the booking data to the backend
async function submitBooking() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const eventName = document.getElementById("selected-event-name").innerText;
  try {
    const response = await fetch("http://127.0.0.1:5000/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        event: eventName
      })
    });

    const data = await response.json();
    if (response.status === 201) {
      alert(" Event booked successfully!");
      closePopup();
    } else {
      alert(data.error || " Booking failed.");
    }
  } catch (err) {
    console.error("Booking error:", err);
    alert(" Something went wrong.");
  }
}

// Track which event the user wants to cancel
let cancelEventId = null;
let cancelEventElement = null;

// This Shows the cancel modal and store event info
function showCancelModal(eventId, listItem) {
  cancelEventId = eventId;
  cancelEventElement = listItem;
  document.getElementById("cancelModal").style.display = "flex";
}

// This closes the cancel modal and resets tracking
function closeCancelModal() {
  cancelEventId = null;
  cancelEventElement = null;
  document.getElementById("cancelModal").style.display = "none";
}

//  Safer way: wait for DOM to load before binding click event
document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirmCancelBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!cancelEventId || !cancelEventElement) return;

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/bookings/${cancelEventId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          cancelEventElement.remove();
          alert(" Booking cancelled.");
        } else {
          alert("Failed to cancel booking.");
        }
      } catch (err) {
        console.error("Cancel error:", err);
        alert("Something went wrong.");
      }

      closeCancelModal();
    });
  }
});

// Shows the Create Event popup form
function openCreateEventPopup() {
  document.getElementById("create-event-popup").style.display = "flex";
}

// Hide the "Create Event" popup form
function closeCreateEvent() {
  document.getElementById("create-event-popup").style.display = "none";
}

// Handle submission of a new event
async function submitNewEvent() {
  const title = document.getElementById("event-name").value.trim();
  const date = document.getElementById("event-date").value;
  const description = document.getElementById("event-description").value.trim();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
// Make sure all fields are filled
  if (!title || !date || !description) {
    alert("Please fill in all fields.");
    return;
  }

  try {
  
  // Send event data to backend API to create event
    const response = await fetch("http://127.0.0.1:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date,
        description,
        createdBy: user.username
      })
    });

    const data = await response.json();

    if (response.status === 201) {
      alert(" Event created successfully!");
      closeCreateEvent();
    
    // Refresh events on Events page adding the new event which has been created in the user profile section.
      if (window.location.pathname.toLowerCase().includes("events.html")) {
      loadEvents(); // <- this should be your event rendering function
      }
    
      // Refresh carousel on homepage adding the new event which has been created in the user profile section.
      if (window.location.pathname.includes("index.html")) {
        loadCarousel(); // <- same idea, assuming you have a carousel refresh function
      }
    }
     else {
      alert(data.error || "Failed to create event.");
    }
  } catch (err) {
    console.error(" Create event error:", err);
    alert("Something went wrong.");
  }
}


// Load and display all events on the Events page

async function loadEvents() {
  try {

// Fetch all events from the backend
    const res = await fetch("http://127.0.0.1:5000/api/events");
    const data = await res.json();

    console.log(" Events fetched:", data); 

 // Find the container where events will be displayed
    const container = document.querySelector(".events-container");

 // If the container doesn't exist on the current page, exit
    if (!container) {
      console.error(" .events-container not found in HTML.");
      return;
    }

    container.innerHTML = ""; // Clear existing

// Loop through each event and create a card for it
    data.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Created by:</strong> ${event.createdBy || "Anonymous"}</p>
        <p>${event.description}</p>
        <button onclick="openPopup('${event.title}')">Book Now</button>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(" Error loading events:", err);
  }
}


// When the page finishes loading, check if it's the Events page and load events
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.toLowerCase();
  if (currentPage.includes("events.html")) {
    console.log(" Loading Events Page...");
    loadEvents();
  }
});

//  Refresh Events page and Home carousel after creating new event
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.toLowerCase();

// If on Events page, refresh the event cards
  if (currentPage.includes("events.html")) {
    console.log(" Reloading Events after DOM ready...");
    loadEvents();
  }

// If on the homepage (index.html), refresh the carousel
  if (currentPage.includes("index.html") && typeof loadCarousel === "function") {
    console.log(" Reloading carousel...");
    loadCarousel();
  }
});

// Load and display events in the homepage carousel
async function loadCarousel() {
  try {

// Fetch event data from backend
    const res = await fetch("http://127.0.0.1:5000/api/events");
    const events = await res.json();

// Get the carousel container element
    const carousel = document.querySelector(".carousel-inner");
    if (!carousel) return;

    carousel.innerHTML = ""; // Clear current slides


// Loop through each event and create a new slide
    events.forEach((event, index) => {
      const slide = document.createElement("div");
      slide.className = `event-slide${index === 0 ? ' active' : ''}`;
      slide.style = `
        min-width: 100%;
        padding: 20px;
        box-sizing: border-box;
        text-align: center;
      `;

  // Add event details to the slide
      slide.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p>${event.description || "No description provided."}</p>
        <button onclick="location.href='Events.html'">Book Now</button>
      `;

  // Append slide to the carousel
      carousel.appendChild(slide);
    });
  } catch (err) {
    console.error(" Failed to load carousel:", err);
  }
}
