const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

let spotifyToken = null;
let tokenExpiry = null;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-library-read',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];
  
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URI));
});


app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      }
    });

    if (response.status === 200) {
      spotifyToken = response.data.access_token;
      const expiresIn = response.data.expires_in;
      tokenExpiry = Date.now() + (expiresIn * 1000);
      
      res.redirect('/dashboard.html');
    } else {
      res.redirect('/#error=invalid_token');
    }
  } catch (error) {
    console.error('Error getting token:', error.message);
    res.redirect('/#error=invalid_token');
  }
});

app.get('/api/me', async (req, res) => {
  if (!spotifyToken || Date.now() > tokenExpiry) {
    return res.status(401).json({ error: 'Token expired or not available' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + spotifyToken }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.get('/api/top-tracks', async (req, res) => {
  if (!spotifyToken || Date.now() > tokenExpiry) {
    return res.status(401).json({ error: 'Token expired or not available' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10', {
      headers: { 'Authorization': 'Bearer ' + spotifyToken }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top tracks:', error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

app.get('/api/playlists', async (req, res) => {
  if (!spotifyToken || Date.now() > tokenExpiry) {
    return res.status(401).json({ error: 'Token expired or not available' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { 'Authorization': 'Bearer ' + spotifyToken }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

