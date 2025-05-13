const groups = {
    "Scoobs": ["Izzy Fonseca", "Mya Morrison", "Ryan O'Loughlin", "Samuel Resue", "Iliana Rodriguez"],
    "Team Blue": ["Cassie Barrios", "Madeline Boyar", "Jabar Greenwood", "Jake Hopkins"],
    "Off Campus Crew": ["Tyler Benowitz", "Cassondra Blewett", "Olivia Bonelli", "Matthew Hernandez", "Justin Meza"],
    "The Jolly Ranchers": ["Nicholas Carbone", "Delaney Perlongo", "Morgan Richards", "Edward Sprague", "Evan Sullivan"]
};

const groupSelect      = document.getElementById("group-select");
const memberSelect     = document.getElementById("member-select");
const memberSection    = document.getElementById("member-section");
const pointsSection    = document.getElementById("points-section");
const inputsContainer  = document.getElementById("inputs-container");
const pointsForm       = document.getElementById("points-form");
const statusDiv        = document.getElementById("status");
const outputPre        = document.getElementById("output");
const submitBtn        = document.getElementById("submitBtn");

// Populate group dropdown
for (let group in groups) {
    let opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    groupSelect.appendChild(opt);
}

groupSelect.addEventListener('change', () => {
    const selectedGroup = groupSelect.value;
    memberSelect.innerHTML = '<option value="">--Choose your name--</option>';
    memberSection.style.display = selectedGroup ? 'block' : 'none';
    pointsSection.style.display = 'none';
    clearStatusAndOutput();

    if (selectedGroup) {
        groups[selectedGroup].forEach(name => {
            let opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            memberSelect.appendChild(opt);
        });
    }
});

// …[keep your existing consts at top]…

memberSelect.addEventListener('change', async () => {
    const selectedGroup = groupSelect.value;
    const currentUser   = memberSelect.value;
    inputsContainer.innerHTML = '';
    pointsSection.style.display = currentUser ? 'block' : 'none';
    clearStatusAndOutput();
  
    if (currentUser) {
      // ▶️ New: check if already submitted:
      try {
        const resp = await fetch(`/api/submitted?groupName=${encodeURIComponent(selectedGroup)}&fromMember=${encodeURIComponent(currentUser)}`);
        const { submitted } = await resp.json();
        if (submitted) {
          showStatus("You have already submitted your evaluation.", 'error');
          submitBtn.disabled = true;
          return;
        }
      } catch (e) {
        console.error(e);
        showStatus("Could not verify submission status.", 'error');
        submitBtn.disabled = true;
        return;
      }
  
      // If not submitted yet, generate inputs as before
      const others = groups[selectedGroup].filter(name => name !== currentUser);
      others.forEach(name => {
        let div = document.createElement("div");
        div.innerHTML = `
          <label>${name}: </label>
          <input type="number" name="${name}" min="0" max="100" required />
        `;
        inputsContainer.appendChild(div);
      });
      submitBtn.disabled = false;
    }
  });
  

/*memberSelect.addEventListener('change', () => {
    const selectedGroup = groupSelect.value;
    const currentUser   = memberSelect.value;
    // Clear only the inputs, not the entire form
    inputsContainer.innerHTML = '';
    pointsSection.style.display = currentUser ? 'block' : 'none';
    clearStatusAndOutput();

    if (currentUser) {
        const others = groups[selectedGroup].filter(name => name !== currentUser);
        others.forEach(name => {
            let div = document.createElement("div");
            div.innerHTML = `
                <label>${name}: </label>
                <input type="number" name="${name}" min="0" max="100" required />
            `;
            inputsContainer.appendChild(div);
        });
        submitBtn.disabled = false;
    }
});*/

pointsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const groupName  = groupSelect.value;
    const fromMember = memberSelect.value;
    const inputs     = inputsContainer.querySelectorAll('input');
    let total        = 0;
    let results      = [];

    inputs.forEach(input => {
        const pts = parseInt(input.value) || 0;
        total += pts;
        results.push({ name: input.name, points: pts });
    });

    if (total !== 100) {
        showStatus(`Total points must equal 100. You gave: ${total}`, 'error');
        return;
    }

    try {
        showStatus('Submitting...', '');
        const res = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName, fromMember, results })
        });
        if (!res.ok) throw new Error(await res.text());

        // Build output text
        let out = `Submitted:\nGroup: ${groupName}\nFrom: ${fromMember}\n`;
        out += results.map(r => `${r.name}: ${r.points}`).join('\n');

        outputPre.textContent = out;
        outputPre.style.display = 'block';

        showStatus('Successfully submitted.', 'success');
        submitBtn.disabled = true;
    } catch (err) {
        showStatus(`Error: ${err.message}`, 'error');
    }
});

function showStatus(msg, type) {
    statusDiv.textContent    = msg;
    statusDiv.className      = type === 'error' ? 'error' : (type === 'success' ? 'success' : '');
}

function clearStatusAndOutput() {
    statusDiv.textContent    = '';
    outputPre.textContent    = '';
    outputPre.style.display  = 'none';
}