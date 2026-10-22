const EXERCISES = window.EXERCISES || [
  { muscle: 'Chest', name: 'Barbell Bench Press', type: 'r', variations: ['Flat','Close Grip','Paused','Smith Machine'] },
  { muscle: 'Chest', name: 'Dumbbell Bench Press', type: 'r', variations: ['Flat','Neutral Grip','Single Arm'] },
  { muscle: 'Chest', name: 'Incline Dumbbell Press', type: 'r', variations: ['30°','45°','Neutral Grip'] },
  { muscle: 'Chest', name: 'Cable Fly', type: 'r', variations: ['Mid','High-to-Low','Low-to-High'] },
  { muscle: 'Chest', name: 'Push-Up', type: 'b', variations: ['Standard','Incline','Diamond'] },
  { muscle: 'Back', name: 'Lat Pulldown', type: 'r', variations: ['Wide Grip','Close Grip','Neutral Grip'] },
  { muscle: 'Back', name: 'Seated Cable Row', type: 'r', variations: ['Close Grip','Wide Grip','Single Arm'] },
  { muscle: 'Back', name: 'Chest-Supported Row', type: 'r', variations: ['Dumbbell','Machine','T-Bar'] },
  { muscle: 'Back', name: 'Pull-Up', type: 'b', variations: ['Pronated','Neutral','Assisted'] },
  { muscle: 'Shoulders', name: 'Dumbbell Shoulder Press', type: 'r', variations: ['Seated','Standing','Arnold'] },
  { muscle: 'Shoulders', name: 'Lateral Raise', type: 'r', variations: ['Dumbbell','Cable','Machine'] },
  { muscle: 'Shoulders', name: 'Face Pull', type: 'r', variations: ['Rope','Band'] },
  { muscle: 'Biceps', name: 'Dumbbell Curl', type: 'r', variations: ['Standing','Alternating','Incline'] },
  { muscle: 'Biceps', name: 'Hammer Curl', type: 'r', variations: ['Dumbbell','Rope Cable','Cross-Body'] },
  { muscle: 'Triceps', name: 'Rope Pushdown', type: 'r', variations: ['Standard','Single Arm'] },
  { muscle: 'Triceps', name: 'Overhead Triceps Extension', type: 'r', variations: ['Dumbbell','Cable','EZ Bar'] },
  { muscle: 'Legs', name: 'Goblet Squat', type: 'r', variations: ['Dumbbell','Kettlebell','Box'] },
  { muscle: 'Legs', name: 'Leg Press', type: 'r', variations: ['45°','Horizontal','Single Leg'] },
  { muscle: 'Legs', name: 'Leg Curl', type: 'r', variations: ['Lying','Seated'] },
  { muscle: 'Core', name: 'Plank', type: 't', variations: ['Standard','Side','Weighted'] },
  { muscle: 'Core', name: 'Dead Bug', type: 'b', variations: ['Standard','Weighted'] },
  { muscle: 'Cardio', name: 'Treadmill Walk', type: 'c', variations: ['Flat','Incline'] },
  { muscle: 'Cardio', name: 'Stationary Bike', type: 'c', variations: ['Steady','Intervals'] },
  { muscle: 'Mobility', name: 'Cat-Cow', type: 't', variations: ['Standard'] },
  { muscle: 'Mobility', name: 'Hip Flexor Stretch', type: 't', variations: ['Half Kneeling','Standing'] }
];

const MUSCLES = window.MUSCLES || ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Core','Cardio','Mobility'];

const storageKey = 'ironplan-state-v1';
const state = {
  tab: 'today',
  selectedGroups: ['Chest', 'Shoulders', 'Triceps'],
  plan: [],
  history: []
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    state.tab = saved.tab || 'today';
    state.selectedGroups = saved.selectedGroups && saved.selectedGroups.length ? saved.selectedGroups : ['Chest', 'Shoulders', 'Triceps'];
    state.plan = Array.isArray(saved.plan) ? saved.plan : [];
    state.history = Array.isArray(saved.history) ? saved.history : [];
  } catch (e) {
    state.tab = 'today';
    state.selectedGroups = ['Chest', 'Shoulders', 'Triceps'];
    state.plan = [];
    state.history = [];
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify({
    tab: state.tab,
    selectedGroups: state.selectedGroups,
    plan: state.plan,
    history: state.history
  }));
}

function pickRandomExercises(group, count = 2) {
  const matches = EXERCISES.filter(item => item.muscle === group);
  const shuffled = [...matches].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, matches.length));
}

function generateWorkout() {
  if (!state.selectedGroups.length) {
    alert('Select at least one muscle group.');
    return;
  }

  const picks = [];
  state.selectedGroups.forEach(group => {
    picks.push(...pickRandomExercises(group, 2));
  });

  state.plan = picks.map((exercise, index) => ({
    id: `${exercise.name}-${Date.now()}-${index}`,
    name: exercise.name,
    muscle: exercise.muscle,
    variation: exercise.variations[0] || 'Standard',
    type: exercise.type || 'r',
    sets: 3,
    reps: 10,
    note: ''
  }));

  state.tab = 'workout';
  saveState();
  render();
}

function saveWorkoutToHistory() {
  if (!state.plan.length) {
    alert('Create a workout first.');
    return;
  }
  state.history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    name: 'Workout',
    plan: JSON.parse(JSON.stringify(state.plan))
  });
  state.plan = [];
  saveState();
  state.tab = 'history';
  render();
}

function renderToday() {
  const card = document.createElement('div');
  card.className = 'app-shell';
  card.innerHTML = `
    <div class="card">
      <div class="topbar">
        <div class="tag">Today</div>
      </div>
      <div class="logo">Iron<span>Plan</span></div>
      <div class="muted">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
    </div>

    <div class="card stack">
      <div class="tag">Quick setup</div>
      <div class="row">
        ${MUSCLES.map(group => `
          <button type="button" class="chip ${state.selectedGroups.includes(group) ? 'active' : ''}" data-action="toggle-muscle" data-muscle="${group}">${group}</button>
        `).join('')}
      </div>
      <button type="button" class="btn" data-action="generate-workout">Generate workout</button>
    </div>

    <div class="card stack">
      <div class="tag">Current plan</div>
      ${state.plan.length ? `
        <div class="exercise-list">
          ${state.plan.map(item => `
            <div class="exercise-item">
              <div class="exercise-name">${item.name}</div>
              <div class="exercise-meta">${item.muscle} • ${item.variation}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty">No workout created yet.</div>'}
      <button type="button" class="btn secondary" data-action="go-workout">Open workout</button>
    </div>
  `;
  return card;
}

function renderWorkout() {
  const card = document.createElement('div');
  card.className = 'app-shell';

  if (!state.plan.length) {
    card.innerHTML = `
      <div class="card stack">
        <div class="tag">Workout</div>
        <div class="logo">Build your plan</div>
        <div class="muted">Choose muscle groups and generate a workout.</div>
        <div class="row">
          ${MUSCLES.map(group => `
            <button type="button" class="chip ${state.selectedGroups.includes(group) ? 'active' : ''}" data-action="toggle-muscle" data-muscle="${group}">${group}</button>
          `).join('')}
        </div>
        <button type="button" class="btn" data-action="generate-workout">Generate workout</button>
      </div>
    `;
    return card;
  }

  card.innerHTML = `
    <div class="card stack">
      <div class="topbar between">
        <div class="tag">Workout</div>
        <button type="button" class="btn secondary" data-action="save-workout">Save</button>
      </div>
      <div class="exercise-list">
        ${state.plan.map((item, index) => `
          <div class="exercise-item">
            <div class="exercise-name">${item.name}</div>
            <div class="exercise-meta">${item.muscle} • ${item.variation}</div>
            <div class="row" style="margin-top:8px;">
              <span class="mini">${item.type === 'r' ? 'Weight' : item.type === 'b' ? 'Bodyweight' : item.type === 't' ? 'Timed' : 'Cardio'}</span>
              <span class="mini">${item.sets} sets</span>
              <span class="mini">${item.reps} reps</span>
            </div>
            <div class="row" style="margin-top:10px;">
              <button type="button" class="btn secondary" data-action="move-up" data-index="${index}">↑</button>
              <button type="button" class="btn secondary" data-action="move-down" data-index="${index}">↓</button>
              <button type="button" class="btn danger" data-action="remove-exercise" data-index="${index}">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  return card;
}

function renderHistory() {
  const card = document.createElement('div');
  card.className = 'app-shell';

  if (!state.history.length) {
    card.innerHTML = `
      <div class="card">
        <div class="tag">History</div>
        <div class="empty">No workout history yet.</div>
      </div>
    `;
    return card;
  }

  card.innerHTML = `
    <div class="card stack">
      <div class="tag">History</div>
      ${state.history.map(workout => `
        <div class="exercise-item">
          <div class="exercise-name">${workout.name}</div>
          <div class="exercise-meta">${new Date(workout.date).toLocaleDateString()}</div>
          <div class="row" style="margin-top:8px;">
            ${workout.plan.map(item => `<span class="mini">${item.name}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return card;
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  let content;
  if (state.tab === 'today') content = renderToday();
  else if (state.tab === 'workout') content = renderWorkout();
  else content = renderHistory();

  app.appendChild(content);

  document.querySelectorAll('.nav-btn').forEach(button => {
    const isActive = button.dataset.tab === state.tab;
    button.classList.toggle('active', isActive);
  });
}

function toggleMuscle(group) {
  if (state.selectedGroups.includes(group)) {
    state.selectedGroups = state.selectedGroups.filter(item => item !== group);
  } else {
    state.selectedGroups = [...state.selectedGroups, group];
  }
  saveState();
  render();
}

function moveExercise(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= state.plan.length) return;
  const temp = state.plan[index];
  state.plan[index] = state.plan[nextIndex];
  state.plan[nextIndex] = temp;
  saveState();
  render();
}

function removeExercise(index) {
  state.plan.splice(index, 1);
  saveState();
  render();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'toggle-muscle') {
    toggleMuscle(target.dataset.muscle);
  }

  if (action === 'generate-workout') {
    generateWorkout();
  }

  if (action === 'go-workout') {
    state.tab = 'workout';
    saveState();
    render();
  }

  if (action === 'save-workout') {
    saveWorkoutToHistory();
  }

  if (action === 'move-up') {
    moveExercise(Number(target.dataset.index), -1);
  }

  if (action === 'move-down') {
    moveExercise(Number(target.dataset.index), 1);
  }

  if (action === 'remove-exercise') {
    removeExercise(Number(target.dataset.index));
  }
});

document.addEventListener('click', (event) => {
  const navButton = event.target.closest('.nav-btn');
  if (!navButton) return;
  state.tab = navButton.dataset.tab;
  saveState();
  render();
});

loadState();
render();
