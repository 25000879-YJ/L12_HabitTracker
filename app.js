const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const habits = [
  {
    id: 1,
    name: 'Drink water',
    description: 'Finish 8 glasses of water each day.',
    category: 'Health',
    streak: 0,
    done: false,
    todos: ['Fill water bottle', 'Track cups consumed'],
  },
  {
    id: 2,
    name: 'Read a book',
    description: 'Read at least 20 minutes per day.',
    category: 'Learning',
    streak: 0,
    done: false,
    todos: ['Pick a book', 'Read one chapter'],
  },
];
let nextHabitId = 3;

function getCategories() {
  const categories = habits.map((habit) => habit.category || 'Uncategorized');
  return [...new Set(categories)].sort();
}

app.get('/', (req, res) => {
  res.render('index', { habits });
});

app.get('/addinghabit', (req, res) => {
  res.render('addinghabit', { categories: getCategories() });
});

app.post('/addinghabit', (req, res) => {
  const { name, description, category, todos } = req.body;
  const todoList = todos
    ? todos.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    : [];

  habits.push({
    id: nextHabitId++,
    name: name?.trim() || 'Untitled habit',
    description: description?.trim() || '',
    category: category?.trim() || 'Uncategorized',
    streak: 0,
    done: false,
    todos: todoList,
  });

  res.redirect('/');
});

app.post('/toggle/:id', (req, res) => {
  const id = Number(req.params.id);
  const habit = habits.find((habit) => habit.id === id);

  if (habit) {
    if (!habit.done) {
      habit.streak += 1;
      habit.done = true;
    } else {
      habit.done = false;
    }
  }

  res.redirect(req.get('Referer') || '/');
});

app.post('/delete/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = habits.findIndex((habit) => habit.id === id);

  if (index !== -1) {
    habits.splice(index, 1);
  }

  res.redirect(req.get('Referer') || '/');
});

app.get('/filter', (req, res) => {
  const selectedCategory = req.query.category || '';
  const categories = getCategories();
  const filteredHabits = selectedCategory
    ? habits.filter((habit) => habit.category === selectedCategory)
    : habits;

  res.render('filter', { categories, selectedCategory, habits: filteredHabits });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Habit Tracker running at http://localhost:${PORT}`);
});
