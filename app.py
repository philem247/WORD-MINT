from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from functools import wraps
import json

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

with open('data/words.json', 'r') as f:
    WORD_BANK = json.load(f)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    try:
        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })

        if auth_response.user:
            supabase.table('profiles').insert({
                'id': auth_response.user.id,
                'username': username
            }).execute()

            supabase.table('user_stats').insert({
                'user_id': auth_response.user.id
            }).execute()

            session['user'] = {
                'id': auth_response.user.id,
                'email': auth_response.user.email
            }

            return jsonify({'success': True, 'user': session['user']})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })

        if auth_response.user:
            session['user'] = {
                'id': auth_response.user.id,
                'email': auth_response.user.email
            }

            return jsonify({'success': True, 'user': session['user']})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    supabase.auth.sign_out()
    return jsonify({'success': True})

@app.route('/api/auth/reset', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')

    try:
        supabase.auth.reset_password_email(email)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/words/random', methods=['GET'])
def get_random_word():
    import random
    word = random.choice(WORD_BANK)
    return jsonify({'word': word})

@app.route('/api/game/save', methods=['POST'])
@login_required
def save_game():
    data = request.json
    user_id = session['user']['id']

    try:
        supabase.table('game_sessions').insert({
            'user_id': user_id,
            'score': data.get('score'),
            'words_completed': data.get('words_completed'),
            'accuracy': data.get('accuracy'),
            'duration_seconds': data.get('duration_seconds')
        }).execute()

        stats_response = supabase.table('user_stats').select('*').eq('user_id', user_id).maybe_single().execute()
        stats = stats_response.data

        new_best_score = max(stats.get('best_score', 0) if stats else 0, data.get('score'))
        new_best_streak = max(stats.get('best_streak', 0) if stats else 0, data.get('score'))
        new_total_games = (stats.get('total_games', 0) if stats else 0) + 1
        new_total_words = (stats.get('total_words', 0) if stats else 0) + data.get('words_completed')

        if stats:
            new_avg_accuracy = ((stats['average_accuracy'] * stats['total_games']) + data.get('accuracy')) / new_total_games
        else:
            new_avg_accuracy = data.get('accuracy')

        supabase.table('user_stats').upsert({
            'user_id': user_id,
            'total_games': new_total_games,
            'best_score': new_best_score,
            'best_streak': new_best_streak,
            'total_words': new_total_words,
            'average_accuracy': new_avg_accuracy
        }).execute()

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        response = supabase.table('user_stats').select(
            'user_id, best_score, best_streak, total_games, average_accuracy, profiles!inner(username)'
        ).order('best_score', desc=True).limit(10).execute()

        leaderboard = []
        for entry in response.data:
            leaderboard.append({
                'user_id': entry['user_id'],
                'username': entry['profiles']['username'],
                'best_score': entry['best_score'],
                'best_streak': entry['best_streak'],
                'total_games': entry['total_games'],
                'average_accuracy': entry['average_accuracy']
            })

        return jsonify(leaderboard)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    try:
        stats_response = supabase.table('user_stats').select('*').eq('user_id', user_id).maybe_single().execute()

        if stats_response.data:
            return jsonify(stats_response.data)
        else:
            return jsonify({'error': 'Stats not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
