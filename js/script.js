// localStorage.removeItem('hasVisited'); // 🧪 comment this out when you go live

function openCurtains() {
  const forest = document.getElementById('forestContainer');
  const gradient = forest.querySelector('.forest-gradient');
  const titleBox = document.getElementById('titleBox');
  const elementsToReveal = document.querySelectorAll('.content-to-reveal');

  // show gradient
  gradient.style.opacity = '1';

  // fade out title box
  titleBox.classList.add('hidden');

  // start forest opening animation
  forest.classList.add('opening');
  document.querySelector('.forest').classList.add('opening');

  setTimeout(() => {
    forest.classList.add('forest-exit-active');

    // wait for opacity transition to finish
    forest.addEventListener('transitionend', () => {
      forest.classList.add('hidden');
      elementsToReveal.forEach(element => {
                element.classList.add('visible');
            });
    }, { once: true });
  }, 800);

  localStorage.setItem('hasVisited', 'true');
}


// remember if the user has already seen the opening animation
document.addEventListener('DOMContentLoaded', () => {
  const hasVisited = localStorage.getItem('hasVisited');
  const forest = document.getElementById('forestContainer');
  const elementsToReveal = document.querySelectorAll('.content-to-reveal');

  if (hasVisited) {
    forest.style.display = 'none';
    elementsToReveal.forEach(element => {
        // temporarily disable the transition so it appears instantly
        element.style.transition = 'none'; 
        element.classList.add('visible');
        
        // We force a "reflow" so the browser accepts the change, then restore transition
        // (This is a niche CSS trick, but useful if you want hover effects to work later)
        void element.offsetWidth; 
        element.style.transition = ''; 
    });
  } 
});


// NARRATIVES
let db = null; // Will hold the JSON data
let currentNarrative = 'chronological';
let currentItemId = 'circe';

// Helper function to trigger the narrative switch from a metadata click
function switchFromMeta(newNarrative) {
    // This is the functional link between the metadata click and the page reload
    changeNarrative(newNarrative);
}


// 1. Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    // Get URL params to see where we are (e.g., item.html?id=malleus&narrative=rooms)
    const params = new URLSearchParams(window.location.search);
    if(params.has('narrative')) currentNarrative = params.get('narrative');
    if(params.has('id')) currentItemId = params.get('id');

    // NOTE: Removed the line document.getElementById('narrative-select').value = currentNarrative; 
    // since the select box is no longer the main control.

    // Fetch Data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            db = data;
            loadItem(currentItemId);
        })
        .catch(err => console.error("Error loading data:", err));
});

// 2. Load Content for a Specific Item (MODIFIED SECTION)
function loadItem(id) {
    const item = db.items[id];
    if (!item) return;

    // Images
    document.getElementById('item-image-display').src = item.image;
    document.getElementById('item-image-display').alt = item.title;
    document.getElementById('modal-image-display').src = item.image;

    // Title & Room
    document.getElementById('item-title-display').innerText = item.title;
    document.getElementById('modal-title-display').innerText = item.title;
    // You can use this to display the currently selected narrative mode
    const narrativeName = currentNarrative === 'chronological' ? 'Chronological' : 'Thematic Rooms';
    document.getElementById('room-indicator').innerText = `Current Path: ${narrativeName} | Room: ${item.room}`;


    // Metadata Table (Dynamic Generation with Narrative Triggers)
    const tbody = document.getElementById('metadata-tbody');
    tbody.innerHTML = ''; // Clear existing
    
    item.metadata.forEach(entry => {
        let valueHtml = entry.value; // Default: just text

        // Check for Year/Date to enable Chronological switch
        if (entry.label.toLowerCase().includes("year") || entry.label.toLowerCase().includes("date")) {
            // Only make it a link if the current narrative is NOT chronological
            if (currentNarrative !== 'chronological') {
                valueHtml = `<a href="#" class="meta-link" onclick="switchFromMeta('chronological'); return false;">
                                ${entry.value} 
                                <span class="link-icon">↻</span>
                             </a>`;
            }
        }
        // Check for Room/Location to enable Thematic switch
        else if (entry.label.toLowerCase().includes("room") || entry.label.toLowerCase().includes("location")) {
            // Only make it a link if the current narrative is NOT rooms
            if (currentNarrative !== 'rooms') {
                valueHtml = `<a href="#" class="meta-link" onclick="switchFromMeta('rooms'); return false;">
                                ${entry.value}
                                <span class="link-icon">↹</span>
                             </a>`;
            }
        }

        let row = `<tr>
            <th>${entry.label}</th>
            <td>${valueHtml}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Default Text
    renderText('short');
    
    // Ensure navigation buttons reflect the current pathway
    updateNavigationButtons();
}


// 3. Handle Text Switching (Source 83: "Tell me more / less")
function renderText(type) {
    // ... (This function remains unchanged)
    const item = db.items[currentItemId];
    const textDisplay = document.getElementById('item-description-display');
    
    textDisplay.style.opacity = 0;
    setTimeout(() => {
        textDisplay.innerText = item.texts[type] || item.texts['short'];
        textDisplay.style.opacity = 1;
    }, 200);
}

// 4. Handle Navigation (Source 39: "Next / Previous buttons") - Renamed/Updated
function updateNavigationButtons() {
    // This function is called on load to ensure the buttons reflect the current state
    const timeline = db.narratives[currentNarrative];
    let index = timeline.indexOf(currentItemId);
    
    let nextId = timeline[(index + 1) % timeline.length]; // Loop to start
    let prevId = timeline[(index - 1 + timeline.length) % timeline.length]; // Loop to end
    
    // Assign new onclick functions to the buttons
    document.getElementById('btn-next').onclick = () => {
        window.location.href = `?id=${nextId}&narrative=${currentNarrative}`;
    };
    
    document.getElementById('btn-prev').onclick = () => {
        window.location.href = `?id=${prevId}&narrative=${currentNarrative}`;
    };
}

// 5. Switch Narrative (USED BY switchFromMeta)
function changeNarrative(newNarrative) {
    // Reload page with same item but new narrative context
    window.location.href = `?id=${currentItemId}&narrative=${newNarrative}`;
}