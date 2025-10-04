# WordMint - Python/Flask Version

A spelling game built with Python Flask and Supabase.

## Setup Instructions

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. The `.env` file is already configured with Supabase credentials

4. Run the application:
```bash
python app.py
```

5. Open your browser to: `http://localhost:5000`

## Project Structure

- `app.py` - Main Flask application with routes and API endpoints
- `templates/index.html` - HTML template
- `static/css/styles.css` - Styles
- `static/js/main.js` - Frontend JavaScript
- `static/*.mp3` - Audio files
- `data/words.json` - Word bank
- `requirements.txt` - Python dependencies

## Features

- User authentication (signup, login, password reset)
- Speech synthesis for word pronunciation
- Real-time leaderboard
- User statistics tracking
- Timer-based gameplay
- Streak tracking with confetti celebrations

## Deployment

For production, use Gunicorn:
```bash
gunicorn app:app --bind 0.0.0.0:5000
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset` - Password reset
- `GET /api/words/random` - Get random word
- `POST /api/game/save` - Save game session
- `GET /api/leaderboard` - Get top scores
- `GET /api/stats/<user_id>` - Get user statistics
